#!/usr/bin/env node
/**
 * Upgrade controlado do MySQL do Docker Compose entre séries LTS.
 *
 * O MySQL só aceita upgrade "de uma série LTS ou Bugfix para a próxima série
 * LTS" (manual oficial, "Upgrade Paths"): um datadir 8.0 não pode ir direto
 * para 9.7 — o 9.7 recusa com MY-014060 sem tocar nos dados. Além disso, o
 * plugin mysql_native_password vem desabilitado no 8.4 e foi removido no 9.x:
 * usuários que ainda o usam perderiam o acesso (inclusive o root).
 *
 * Fluxo (idempotente):
 *   1. lê imagem-alvo, credenciais e volume do `docker compose config`;
 *   2. para o serviço e faz backup a frio do volume em um volume novo;
 *   3. descobre a versão do datadir subindo a imagem mais antiga da cadeia em
 *      um container descartável (sobe sem alterar um datadir dessa série; em
 *      datadir mais novo recusa o downgrade e informa a versão no log);
 *   4. migra para caching_sha2_password os usuários conhecidos ainda em
 *      mysql_native_password, na série atual;
 *   5. aplica um passo por série LTS até a imagem do compose;
 *   6. sobe o serviço do compose e valida versão e plugins.
 *
 * Uso:
 *   node scripts/mysql-upgrade.mjs
 *   node scripts/mysql-upgrade.mjs --restaurar <volume_de_backup>
 */
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const executar = promisify(execFile);

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Fonte única de configuração, também lida pelo Docker Compose.
const ARQUIVO_ENV = path.join(RAIZ, '.env.local');

const SERVICO = 'mysql';
const CONTAINER_TEMPORARIO = 'lyra-metacare-mysql-upgrade';

// Cadeia oficial de séries suportadas, da mais antiga para a mais nova. O
// último elemento precisa ser a imagem declarada no compose.yaml.
const CADEIA_LTS = [
  { serie: '8.0', imagem: 'mysql:8.0.45', versaoId: 80045 },
  { serie: '8.4', imagem: 'mysql:8.4.11', versaoId: 80411 },
  { serie: '9.7', imagem: 'mysql:9.7.2', versaoId: 90702 },
];

function log(mensagem) {
  process.stdout.write(`[mysql-upgrade] ${mensagem}\n`);
}

class ErroUpgrade extends Error {}

async function docker(
  args,
  { permitirFalha = false, timeout = 600_000, env } = {}
) {
  // Todo comando do Compose lê a configuração do .env.local.
  const argumentos =
    args[0] === 'compose'
      ? ['compose', '--env-file', ARQUIVO_ENV, ...args.slice(1)]
      : args;
  try {
    const { stdout, stderr } = await executar('docker', argumentos, {
      cwd: RAIZ,
      maxBuffer: 64 * 1024 * 1024,
      timeout,
      // Segredos entram por variável de ambiente herdada (`-e NOME` sem
      // valor), nunca nos argumentos visíveis no `ps` do host.
      env: env ? { ...process.env, ...env } : process.env,
    });
    return { codigo: 0, stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (error) {
    const resultado = {
      codigo: typeof error.code === 'number' ? error.code : 1,
      stdout: String(error.stdout ?? '').trim(),
      stderr: String(error.stderr ?? error.message ?? '').trim(),
    };
    if (permitirFalha) {
      return resultado;
    }
    throw new ErroUpgrade(
      `Comando falhou (exit ${resultado.codigo}): docker ${argumentos.join(' ')}\n${resultado.stderr}`
    );
  }
}

function versaoIdParaTexto(versaoId) {
  const major = Math.floor(versaoId / 10000);
  const minor = Math.floor((versaoId % 10000) / 100);
  const patch = versaoId % 100;
  return `${major}.${minor}.${patch}`;
}

function serieDaVersao(versaoId) {
  const major = Math.floor(versaoId / 10000);
  const minor = Math.floor((versaoId % 10000) / 100);
  return `${major}.${minor}`;
}

async function lerConfiguracaoCompose() {
  const { stdout } = await docker(['compose', 'config', '--format', 'json']);
  const config = JSON.parse(stdout);
  const servico = config.services?.[SERVICO];

  if (!servico) {
    throw new ErroUpgrade(
      `Serviço "${SERVICO}" não encontrado no compose.yaml.`
    );
  }

  const montagem = (servico.volumes ?? []).find(
    (volume) => volume.target === '/var/lib/mysql' && volume.type === 'volume'
  );
  if (!montagem) {
    throw new ErroUpgrade(
      'O serviço mysql não monta um volume nomeado em /var/lib/mysql.'
    );
  }

  const nomeVolume = config.volumes?.[montagem.source]?.name;
  if (!nomeVolume) {
    throw new ErroUpgrade(`Volume "${montagem.source}" sem nome resolvido.`);
  }

  const ambiente = servico.environment ?? {};
  const senhaRoot = ambiente.MYSQL_ROOT_PASSWORD;
  if (!senhaRoot) {
    throw new ErroUpgrade(
      'MYSQL_ROOT_PASSWORD não está definido para o serviço mysql.'
    );
  }

  const alvo = CADEIA_LTS.at(-1);
  if (servico.image !== alvo.imagem) {
    throw new ErroUpgrade(
      `A imagem do compose (${servico.image}) difere do alvo do upgrade (${alvo.imagem}). Atualize CADEIA_LTS junto com o compose.yaml.`
    );
  }

  return {
    nomeVolume,
    senhaRoot,
    usuarioApp: ambiente.MYSQL_USER,
    senhaApp: ambiente.MYSQL_PASSWORD,
  };
}

async function volumeExiste(nomeVolume) {
  const { codigo } = await docker(['volume', 'inspect', nomeVolume], {
    permitirFalha: true,
  });
  return codigo === 0;
}

async function garantirVolumeLivre(nomeVolume) {
  await docker(['compose', 'stop', SERVICO]);
  const { stdout } = await docker([
    'ps',
    '--filter',
    `volume=${nomeVolume}`,
    '--format',
    '{{.Names}}',
  ]);
  if (stdout) {
    throw new ErroUpgrade(
      `O volume ${nomeVolume} está em uso pelos containers: ${stdout.replace(/\n/g, ', ')}. Pare-os antes do upgrade.`
    );
  }
}

async function removerTemporario() {
  await docker(['rm', '-f', CONTAINER_TEMPORARIO], { permitirFalha: true });
}

// Cópia a frio, byte a byte, com a própria imagem do MySQL como ferramenta.
// Com `substituir`, o conteúdo do destino é trocado sem remover o volume (o
// container parado do compose mantém referência a ele, e o nome e os rótulos
// do compose precisam ser preservados).
async function copiarVolume(
  origem,
  destino,
  imagemFerramenta,
  { substituir = false } = {}
) {
  await docker(['volume', 'create', destino]);
  const comando = substituir
    ? 'find /destino -mindepth 1 -delete && cp -a /origem/. /destino/'
    : 'cp -a /origem/. /destino/';
  await docker([
    'run',
    '--rm',
    '--entrypoint',
    'sh',
    '-v',
    `${origem}:/origem:ro`,
    '-v',
    `${destino}:/destino`,
    imagemFerramenta,
    '-c',
    comando,
  ]);

  const tamanho = async (volume) =>
    (
      await docker([
        'run',
        '--rm',
        '--entrypoint',
        'sh',
        '-v',
        `${volume}:/v:ro`,
        imagemFerramenta,
        '-c',
        'du -sb /v | cut -f1; find /v -type f | wc -l',
      ])
    ).stdout;

  const [tamanhoOrigem, tamanhoDestino] = await Promise.all([
    tamanho(origem),
    tamanho(destino),
  ]);
  if (tamanhoOrigem !== tamanhoDestino) {
    throw new ErroUpgrade(
      `Cópia do volume divergente (origem ${tamanhoOrigem.replace('\n', ' bytes, ')} arquivos; destino ${tamanhoDestino.replace('\n', ' bytes, ')} arquivos).`
    );
  }
  return tamanhoOrigem.replace('\n', ' bytes, ') + ' arquivos';
}

async function logsTemporario() {
  const { stdout, stderr } = await docker(['logs', CONTAINER_TEMPORARIO], {
    permitirFalha: true,
  });
  return `${stdout}\n${stderr}`;
}

async function subirTemporario(nomeVolume, imagem, argumentosServidor = []) {
  await removerTemporario();
  await docker([
    'run',
    '-d',
    '--name',
    CONTAINER_TEMPORARIO,
    '-v',
    `${nomeVolume}:/var/lib/mysql`,
    imagem,
    ...argumentosServidor,
  ]);

  // Até 10 minutos: o upgrade do dicionário de dados pode ser demorado.
  for (let tentativa = 0; tentativa < 300; tentativa += 1) {
    const estado = await docker(
      ['inspect', CONTAINER_TEMPORARIO, '--format', '{{.State.Status}}'],
      { permitirFalha: true }
    );
    const logs = await logsTemporario();

    if (estado.stdout !== 'running') {
      return { pronto: false, logs };
    }
    if (/ready for connections\. Version: '[^']+'\s+socket/.test(logs)) {
      return { pronto: true, logs };
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const logs = await logsTemporario();
  throw new ErroUpgrade(
    `O MySQL ${imagem} não ficou pronto em 10 minutos.\n${logs.slice(-2000)}`
  );
}

async function pararTemporario() {
  // Desligamento limpo (mysqld grava tudo antes de sair).
  await docker(['stop', '--time', '180', CONTAINER_TEMPORARIO]);
  const { stdout } = await docker([
    'inspect',
    CONTAINER_TEMPORARIO,
    '--format',
    '{{.State.ExitCode}}',
  ]);
  await removerTemporario();
  if (stdout !== '0') {
    throw new ErroUpgrade(`O MySQL encerrou com exit ${stdout}.`);
  }
}

async function sqlComoRoot(senhaRoot, sql) {
  const { stdout } = await docker(
    [
      'exec',
      '-e',
      'MYSQL_PWD',
      CONTAINER_TEMPORARIO,
      'mysql',
      '-uroot',
      '--batch',
      '--skip-column-names',
      '-e',
      sql,
    ],
    { env: { MYSQL_PWD: senhaRoot } }
  );
  return stdout;
}

function literalSql(valor) {
  return `'${String(valor).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

async function descobrirVersaoDatadir(nomeVolume) {
  const maisAntiga = CADEIA_LTS[0];
  log(
    `Detectando a versão do datadir com ${maisAntiga.imagem} (não altera um datadir mais novo)...`
  );
  const { pronto, logs } = await subirTemporario(nomeVolume, maisAntiga.imagem);

  if (pronto) {
    const versao = /ready for connections\. Version: '(\d+)\.(\d+)\.(\d+)/.exec(
      logs
    );
    return {
      versaoId:
        Number(versao[1]) * 10000 + Number(versao[2]) * 100 + Number(versao[3]),
      servidorAtivo: true,
    };
  }

  await removerTemporario();
  // Ex.: "Cannot downgrade from 90702 to 80045" (MY-014061) ou
  // "Cannot upgrade from 80045 to 90702" (MY-014060).
  const recusa = /Cannot (?:downgrade|upgrade) from (\d+)/.exec(logs);
  if (!recusa) {
    throw new ErroUpgrade(
      `Não foi possível identificar a versão do datadir.\n${logs.slice(-2000)}`
    );
  }
  return { versaoId: Number(recusa[1]), servidorAtivo: false };
}

async function migrarUsuariosNativos(config, versaoId, servidorAtivo) {
  const serie = serieDaVersao(versaoId);
  const etapa = CADEIA_LTS.find((item) => item.serie === serie);
  if (!etapa) {
    throw new ErroUpgrade(
      `Série ${serie} fora da cadeia suportada (${CADEIA_LTS.map((item) => item.serie).join(' → ')}).`
    );
  }

  if (!servidorAtivo) {
    // No 8.4 o plugin nativo existe, mas vem desligado.
    const argumentos = serie === '8.4' ? ['--mysql-native-password=ON'] : [];
    const { pronto, logs } = await subirTemporario(
      config.nomeVolume,
      etapa.imagem,
      argumentos
    );
    if (!pronto) {
      throw new ErroUpgrade(
        `O MySQL ${etapa.imagem} não subiu sobre o datadir.\n${logs.slice(-2000)}`
      );
    }
  }

  const nativos = (
    await sqlComoRoot(
      config.senhaRoot,
      "SELECT CONCAT(user, '@', host) FROM mysql.user WHERE plugin = 'mysql_native_password' ORDER BY user, host"
    )
  )
    .split('\n')
    .filter(Boolean);

  const senhas = new Map([['root', config.senhaRoot]]);
  if (config.usuarioApp && config.senhaApp) {
    senhas.set(config.usuarioApp, config.senhaApp);
  }

  for (const conta of nativos) {
    const separador = conta.lastIndexOf('@');
    const usuario = conta.slice(0, separador);
    const host = conta.slice(separador + 1);
    const senha = senhas.get(usuario);
    if (!senha) {
      throw new ErroUpgrade(
        `O usuário ${conta} usa mysql_native_password e não há senha conhecida para migrá-lo. Migre-o manualmente para caching_sha2_password antes do upgrade.`
      );
    }
    await sqlComoRoot(
      config.senhaRoot,
      `ALTER USER ${literalSql(usuario)}@${literalSql(host)} IDENTIFIED WITH caching_sha2_password BY ${literalSql(senha)}`
    );
    log(`Usuário ${conta} migrado para caching_sha2_password.`);
  }

  if (nativos.length === 0) {
    log('Nenhum usuário em mysql_native_password.');
  }
  await pararTemporario();
}

async function aplicarPassos(config, versaoId) {
  const passos = CADEIA_LTS.filter((item) => item.versaoId > versaoId);
  for (const passo of passos) {
    log(`Upgrade do datadir para ${passo.imagem}...`);
    const { pronto, logs } = await subirTemporario(
      config.nomeVolume,
      passo.imagem
    );
    if (!pronto) {
      throw new ErroUpgrade(
        `O MySQL ${passo.imagem} recusou o datadir.\n${logs.slice(-2000)}`
      );
    }
    const conclusao = /Server upgrade from '(\d+)' to '(\d+)' completed/.exec(
      logs
    );
    log(
      conclusao
        ? `Upgrade concluído pelo servidor: ${versaoIdParaTexto(Number(conclusao[1]))} → ${versaoIdParaTexto(Number(conclusao[2]))}.`
        : `Servidor ${passo.serie} pronto sobre o datadir.`
    );
    await pararTemporario();
  }
}

// Versão do serviço do compose quando ele já está em execução e saudável;
// `null` quando não está (parado, inexistente ou ainda iniciando).
async function versaoDoServicoAtivo(config) {
  const { stdout } = await docker(
    ['compose', 'ps', '--format', '{{.Health}}', SERVICO],
    { permitirFalha: true }
  );
  if (stdout !== 'healthy') {
    return null;
  }
  const consulta = await docker(
    [
      'compose',
      'exec',
      '-T',
      '-e',
      'MYSQL_PWD',
      SERVICO,
      'mysql',
      '-uroot',
      '--batch',
      '--skip-column-names',
      '-e',
      'SELECT VERSION()',
    ],
    { permitirFalha: true, env: { MYSQL_PWD: config.senhaRoot } }
  );
  return consulta.codigo === 0 ? consulta.stdout : null;
}

async function validarServico(config) {
  const { stdout } = await docker(
    [
      'compose',
      'exec',
      '-T',
      '-e',
      'MYSQL_PWD',
      SERVICO,
      'mysql',
      '-uroot',
      '--batch',
      '--skip-column-names',
      '-e',
      "SELECT VERSION(); SELECT COUNT(*) FROM mysql.user WHERE plugin = 'mysql_native_password'",
    ],
    { env: { MYSQL_PWD: config.senhaRoot } }
  );
  const [versao, nativos] = stdout.split('\n');
  const alvo = CADEIA_LTS.at(-1);
  if (
    serieDaVersao(alvo.versaoId) !== versao.split('.').slice(0, 2).join('.')
  ) {
    throw new ErroUpgrade(`Versão final inesperada: ${versao}.`);
  }
  if (nativos !== '0') {
    throw new ErroUpgrade(
      `${nativos} usuário(s) ainda em mysql_native_password.`
    );
  }
  log(
    `Serviço ${SERVICO} saudável em MySQL ${versao}, sem usuários mysql_native_password.`
  );
}

async function subirServicoEValidar(config) {
  await docker(['compose', 'up', '-d', '--wait', SERVICO]);
  await validarServico(config);
}

async function upgrade() {
  const config = await lerConfiguracaoCompose();
  const alvo = CADEIA_LTS.at(-1);

  if (!(await volumeExiste(config.nomeVolume))) {
    log(
      `Volume ${config.nomeVolume} inexistente: instalação nova, o compose já cria o banco em ${alvo.imagem}.`
    );
    return;
  }

  // Caminho rápido e sem escrita: serviço já saudável na série-alvo.
  const versaoAtiva = await versaoDoServicoAtivo(config);
  if (
    versaoAtiva &&
    versaoAtiva.split('.').slice(0, 2).join('.') ===
      serieDaVersao(alvo.versaoId)
  ) {
    log(
      `O serviço ${SERVICO} já está em MySQL ${versaoAtiva}; nada a atualizar.`
    );
    await validarServico(config);
    return;
  }

  await garantirVolumeLivre(config.nomeVolume);
  await removerTemporario();

  const carimbo = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '');
  const volumeBackup = `${config.nomeVolume}_backup_${carimbo}`;
  log(`Backup a frio do volume ${config.nomeVolume} em ${volumeBackup}...`);
  const resumo = await copiarVolume(
    config.nomeVolume,
    volumeBackup,
    alvo.imagem
  );
  log(`Backup verificado (${resumo}).`);

  const { versaoId, servidorAtivo } = await descobrirVersaoDatadir(
    config.nomeVolume
  );
  log(`Datadir em MySQL ${versaoIdParaTexto(versaoId)}.`);

  if (versaoId > alvo.versaoId) {
    await removerTemporario();
    throw new ErroUpgrade(
      `O datadir (${versaoIdParaTexto(versaoId)}) é mais novo que o alvo (${alvo.imagem}); downgrade não é suportado.`
    );
  }

  if (serieDaVersao(versaoId) === serieDaVersao(alvo.versaoId)) {
    await removerTemporario();
    log('O datadir já está na série LTS alvo.');
  } else {
    await migrarUsuariosNativos(config, versaoId, servidorAtivo);
    await aplicarPassos(config, versaoId);
  }

  await subirServicoEValidar(config);
  log(
    `Concluído. Para desfazer: node scripts/mysql-upgrade.mjs --restaurar ${volumeBackup}`
  );
}

async function restaurar(volumeBackup) {
  const config = await lerConfiguracaoCompose();
  if (!(await volumeExiste(volumeBackup))) {
    throw new ErroUpgrade(`Volume de backup ${volumeBackup} não encontrado.`);
  }

  await garantirVolumeLivre(config.nomeVolume);
  await removerTemporario();

  // O estado atual também é preservado antes da restauração.
  const carimbo = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '');
  const volumeAtual = `${config.nomeVolume}_antes_restauracao_${carimbo}`;
  const ferramenta = CADEIA_LTS.at(-1).imagem;
  await copiarVolume(config.nomeVolume, volumeAtual, ferramenta);
  log(`Estado atual preservado em ${volumeAtual}.`);

  const resumo = await copiarVolume(
    volumeBackup,
    config.nomeVolume,
    ferramenta,
    {
      substituir: true,
    }
  );
  log(`Volume ${config.nomeVolume} restaurado de ${volumeBackup} (${resumo}).`);
  log(
    'Suba o banco com a imagem compatível com esse backup (o compose.yaml atual usa ' +
      `${CADEIA_LTS.at(-1).imagem}); para voltar ao MySQL atual, rode o upgrade novamente.`
  );
}

async function main() {
  if (!existsSync(ARQUIVO_ENV)) {
    throw new ErroUpgrade(
      `${ARQUIVO_ENV} não encontrado. Use o .env.local com as senhas atuais do seu banco (\`pnpm env:init\` só completa chaves ausentes).`
    );
  }
  const indice = process.argv.indexOf('--restaurar');
  if (indice !== -1) {
    const volumeBackup = process.argv[indice + 1];
    if (!volumeBackup) {
      throw new ErroUpgrade(
        'Informe o volume: --restaurar <volume_de_backup>.'
      );
    }
    await restaurar(volumeBackup);
    return;
  }
  await upgrade();
}

main().catch(async (error) => {
  await removerTemporario();
  process.stderr.write(
    `[mysql-upgrade] ERRO: ${error instanceof ErroUpgrade ? error.message : error.stack}\n`
  );
  process.exitCode = 1;
});
