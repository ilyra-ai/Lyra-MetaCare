/**
 * Leitura e composição de arquivos `.env` dos scripts do projeto (fonte única
 * de configuração: `.env.local`, documentado em `.env.example`).
 */
import { randomBytes } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

/**
 * Segredos gerados por `pnpm env:init`, com a quantidade de bytes aleatórios.
 * O valor é codificado em base64url (A-Z, a-z, 0-9, "-" e "_"): sem `$`,
 * aspas, `#` ou espaços, ele é seguro no dotenv do Next.js (que expande `$`),
 * na interpolação do Docker Compose e no shell.
 */
export const SEGREDOS_GERADOS = {
  MYSQL_PASSWORD: 32,
  MYSQL_ROOT_PASSWORD: 32,
  AUTH_SECRET: 48,
  ADMIN_BOOTSTRAP_PASSWORD: 24,
};

// HS256 exige chave de pelo menos 256 bits (RFC 7518, seção 3.2).
export const TAMANHO_MINIMO_AUTH_SECRET = 32;

export function gerarSegredo(bytes) {
  return randomBytes(bytes).toString('base64url');
}

function removerAspas(valor) {
  if (
    valor.length >= 2 &&
    ((valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'")))
  ) {
    return valor.slice(1, -1);
  }
  return valor;
}

export function parseEnvContents(contents) {
  const entries = {};

  for (const rawLine of contents.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    entries[key] = removerAspas(line.slice(separatorIndex + 1).trim());
  }

  return entries;
}

/**
 * Carrega um arquivo `.env` da raiz do projeto em `process.env` sem
 * sobrescrever variáveis já definidas no ambiente.
 */
export async function loadEnvFile(projectRoot, fileName) {
  const filePath = path.join(projectRoot, fileName);
  try {
    await access(filePath);
  } catch {
    return;
  }

  const values = parseEnvContents(await readFile(filePath, 'utf8'));
  for (const [key, value] of Object.entries(values)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

/**
 * Completa o conteúdo de um `.env.local` a partir do `.env.example`, sem
 * alterar nenhum valor existente:
 * - chaves ausentes são acrescentadas com o valor do exemplo ou, se forem
 *   segredos, com um valor gerado;
 * - segredos presentes porém vazios são preenchidos no próprio lugar;
 * - um AUTH_SECRET existente mais curto que o mínimo é reportado como erro
 *   (nunca é trocado em silêncio).
 *
 * @param {string | null} conteudoAtual conteúdo atual (null se o arquivo não existe)
 * @param {string} conteudoExemplo conteúdo do `.env.example`
 * @param {(chave: string, bytes: number) => string} gerador gerador de segredos
 */
export function completarEnv(
  conteudoAtual,
  conteudoExemplo,
  gerador = (_, bytes) => gerarSegredo(bytes)
) {
  const exemplo = parseEnvContents(conteudoExemplo);
  const linhas = conteudoAtual === null ? [] : conteudoAtual.split(/\r?\n/u);
  if (linhas.length > 0 && linhas.at(-1) === '') {
    linhas.pop();
  }

  const atuais = parseEnvContents(conteudoAtual ?? '');
  const adicionadas = [];
  const preenchidas = [];
  const erros = [];

  // Segredos existentes, porém vazios: preenche na mesma linha.
  for (let indice = 0; indice < linhas.length; indice += 1) {
    const linha = linhas[indice].trim();
    const separador = linha.indexOf('=');
    if (linha.startsWith('#') || separador <= 0) {
      continue;
    }
    const chave = linha.slice(0, separador).trim();
    const bytes = SEGREDOS_GERADOS[chave];
    if (bytes && removerAspas(linha.slice(separador + 1).trim()) === '') {
      linhas[indice] = `${chave}=${gerador(chave, bytes)}`;
      preenchidas.push(chave);
    }
  }

  const novas = [];
  for (const [chave, valorExemplo] of Object.entries(exemplo)) {
    if (Object.hasOwn(atuais, chave)) {
      continue;
    }
    const bytes = SEGREDOS_GERADOS[chave];
    novas.push(`${chave}=${bytes ? gerador(chave, bytes) : valorExemplo}`);
    adicionadas.push(chave);
  }

  if (novas.length > 0) {
    if (conteudoAtual === null) {
      linhas.push(
        '# Configuração local da Lyra MetaCare (gerada por `pnpm env:init`).',
        '# Contém segredos: não versione nem compartilhe este arquivo.',
        '# Documentação de cada variável: .env.example'
      );
    } else {
      linhas.push(
        '',
        `# Adicionadas por \`pnpm env:init\` em ${new Date().toISOString()}`
      );
    }
    linhas.push(...novas);
  }

  const authSecret = atuais.AUTH_SECRET;
  if (
    authSecret &&
    Buffer.byteLength(authSecret, 'utf8') < TAMANHO_MINIMO_AUTH_SECRET
  ) {
    erros.push(
      `AUTH_SECRET tem ${Buffer.byteLength(authSecret, 'utf8')} bytes; o mínimo para HS256 é ${TAMANHO_MINIMO_AUTH_SECRET}. Apague o valor da linha AUTH_SECRET no .env.local e rode \`pnpm env:init\` para gerar um novo (as sessões abertas serão encerradas).`
    );
  }

  return {
    conteudo: `${linhas.join('\n')}\n`,
    adicionadas,
    preenchidas,
    erros,
  };
}
