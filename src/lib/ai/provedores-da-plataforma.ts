import { randomUUID } from 'node:crypto';

import type { PoolConnection } from 'mysql2/promise';

import { HttpError } from '@/lib/http-error';
import { queryRows, withTransaction } from '@/lib/mysql/pool';
import { cifrar, decifrar } from '@/lib/security/cifra';

import { type ConexaoDeIa, normalizarBaseUrl } from './cliente-de-ia';
import {
  presetPorId,
  type TipoDeProvedor,
  urlEhLocal,
} from './provedores-catalogo';

/**
 * Provedores e modelos de IA da plataforma (tarefa 54): vários provedores ao
 * mesmo tempo (locais e em nuvem), vários modelos por provedor e a ordem de
 * uso com até 5 posições, que pode incluir o motor da Lyra. Tabelas
 * `ai_provider_connections` e `ai_model_chain` (migração 027). As chaves de
 * API ficam cifradas no banco e só são decifradas no servidor, no momento da
 * chamada; a tela recebe apenas os 4 últimos caracteres.
 */

const FINALIDADE_DA_CHAVE = 'ai-provider-api-key';

/** Quantidade de posições na ordem de uso. */
export const POSICOES_DA_ORDEM = 5;

export type TipoGenerativo = Exclude<TipoDeProvedor, 'lyra_local'>;

export interface ProvedorConfigurado {
  id: string;
  preset: string;
  tipo: TipoGenerativo;
  baseUrl: string | null;
  chave: string | null;
  /** Últimos 4 caracteres da chave salva, para conferência. */
  finalDaChave: string | null;
  /** Há chave salva, mas o AUTH_SECRET mudou e ela não pode ser lida. */
  chaveIlegivel: boolean;
  /** Modelos escolhidos neste provedor. */
  modelos: string[];
  tempoMaximoSegundos: number;
  temperatura: number;
  atualizadoEm: string;
}

/** O que a tela de administração recebe: nunca a chave. */
export type ProvedorPublico = Omit<ProvedorConfigurado, 'chave'> & {
  temChave: boolean;
  local: boolean;
};

/** Uma posição da ordem de uso: o motor da Lyra ou um modelo. */
export type EloDaOrdem =
  { tipo: 'lyra' } | { tipo: 'modelo'; preset: string; modelo: string };

export interface ConfiguracaoDeIa {
  provedores: ProvedorConfigurado[];
  ordem: EloDaOrdem[];
  atualizadoEm: string;
}

export interface ConfiguracaoPublica {
  provedores: ProvedorPublico[];
  ordem: EloDaOrdem[];
  atualizadoEm: string;
}

interface LinhaDoProvedor {
  id: string;
  preset: string;
  provider_type: string;
  base_url: string | null;
  api_key_ciphertext: string | null;
  api_key_last4: string | null;
  models: string | unknown[];
  timeout_seconds: number;
  temperature: string | number;
  updated_at: string | Date;
}

interface LinhaDaOrdem {
  position: number;
  connection_id: string | null;
  model: string | null;
  updated_at: string | Date;
}

function iso(valor: string | Date) {
  return valor instanceof Date
    ? valor.toISOString()
    : `${String(valor).replace(' ', 'T')}Z`;
}

function listaDeModelos(valor: string | unknown[]): string[] {
  const lista =
    typeof valor === 'string' ? (JSON.parse(valor) as unknown) : valor;
  return Array.isArray(lista)
    ? lista.filter((m): m is string => typeof m === 'string' && m.length > 0)
    : [];
}

function tipoGenerativo(valor: string): TipoGenerativo | null {
  return valor === 'openai_compativel' ||
    valor === 'gemini' ||
    valor === 'anthropic'
    ? valor
    : null;
}

/** Local: os dados não saem da máquina ou da rede onde a Lyra roda. */
export function provedorEhLocal(provedor: {
  tipo: TipoGenerativo;
  baseUrl: string | null;
}) {
  return provedor.tipo === 'openai_compativel' && urlEhLocal(provedor.baseUrl);
}

export async function lerConfiguracaoDeIa(): Promise<ConfiguracaoDeIa> {
  const [linhas, linhasDaOrdem] = await Promise.all([
    queryRows<LinhaDoProvedor>(
      `SELECT id, preset, provider_type, base_url, api_key_ciphertext,
              api_key_last4, models, timeout_seconds, temperature, updated_at
         FROM ai_provider_connections
        ORDER BY preset`
    ),
    queryRows<LinhaDaOrdem>(
      `SELECT position, connection_id, model, updated_at
         FROM ai_model_chain ORDER BY position`
    ),
  ]);

  const provedores: ProvedorConfigurado[] = [];
  for (const linha of linhas) {
    const tipo = tipoGenerativo(linha.provider_type);
    if (!tipo) continue;
    const chave = linha.api_key_ciphertext
      ? decifrar(linha.api_key_ciphertext, FINALIDADE_DA_CHAVE)
      : null;
    provedores.push({
      id: linha.id,
      preset: linha.preset,
      tipo,
      baseUrl: linha.base_url,
      chave,
      finalDaChave: linha.api_key_last4,
      chaveIlegivel: Boolean(linha.api_key_ciphertext) && chave === null,
      modelos: listaDeModelos(linha.models),
      tempoMaximoSegundos: Number(linha.timeout_seconds),
      temperatura: Number(linha.temperature),
      atualizadoEm: iso(linha.updated_at),
    });
  }

  const porId = new Map(provedores.map((p) => [p.id, p]));
  const ordem: EloDaOrdem[] = [];
  for (const linha of linhasDaOrdem) {
    if (linha.connection_id === null) {
      ordem.push({ tipo: 'lyra' });
      continue;
    }
    const provedor = porId.get(linha.connection_id);
    if (provedor && linha.model) {
      ordem.push({
        tipo: 'modelo',
        preset: provedor.preset,
        modelo: linha.model,
      });
    }
  }
  // Sem ordem gravada (banco novo), só o motor da Lyra.
  if (ordem.length === 0) ordem.push({ tipo: 'lyra' });

  const datas = [
    ...provedores.map((p) => p.atualizadoEm),
    ...linhasDaOrdem.map((l) => iso(l.updated_at)),
  ].sort();
  return {
    provedores,
    ordem,
    atualizadoEm: datas.at(-1) ?? new Date(0).toISOString(),
  };
}

export function configuracaoPublica(
  configuracao: ConfiguracaoDeIa
): ConfiguracaoPublica {
  return {
    provedores: configuracao.provedores.map(({ chave, ...resto }) => ({
      ...resto,
      temChave: Boolean(chave),
      local: provedorEhLocal(resto),
    })),
    ordem: configuracao.ordem,
    atualizadoEm: configuracao.atualizadoEm,
  };
}

/** Nome legível do provedor (do catálogo). */
export function nomeDoProvedor(preset: string) {
  return presetPorId(preset)?.nome ?? preset;
}

/**
 * Conexão pronta para gerar texto com um modelo do provedor, ou `null` quando
 * o provedor está incompleto (sem URL ou sem a chave exigida).
 */
export function conexaoDoModelo(
  provedor: ProvedorConfigurado,
  modelo: string
): ConexaoDeIa | null {
  if (!modelo.trim()) return null;
  if (provedor.tipo === 'openai_compativel' && !provedor.baseUrl) return null;
  if (
    (provedor.tipo === 'gemini' || provedor.tipo === 'anthropic') &&
    !provedor.chave
  ) {
    return null;
  }
  if (presetPorId(provedor.preset)?.exigeChave && !provedor.chave) return null;
  return {
    tipo: provedor.tipo,
    baseUrl: provedor.baseUrl,
    modelo,
    chave: provedor.chave,
    tempoMaximoSegundos: provedor.tempoMaximoSegundos,
    temperatura: provedor.temperatura,
  };
}

export interface AlteracaoDoProvedor {
  preset: string;
  baseUrl: string | null;
  /** `undefined` mantém a chave salva; `null` apaga; texto troca. */
  chave?: string | null;
  modelos: string[];
  tempoMaximoSegundos: number;
  temperatura: number;
}

export interface AlteracaoDaConfiguracao {
  provedores: AlteracaoDoProvedor[];
  ordem: EloDaOrdem[];
}

function validarProvedor(
  alteracao: AlteracaoDoProvedor,
  atual: ProvedorConfigurado | undefined
) {
  const preset = presetPorId(alteracao.preset);
  if (!preset || preset.tipo === 'lyra_local') {
    throw new HttpError(`Provedor desconhecido: ${alteracao.preset}.`, 400);
  }
  const tipo = preset.tipo;
  let baseUrl: string | null = null;
  if (tipo === 'openai_compativel') {
    if (!alteracao.baseUrl?.trim()) {
      throw new HttpError(
        `Informe a URL base do servidor de IA (${preset.nome}).`,
        400
      );
    }
    try {
      baseUrl = normalizarBaseUrl(alteracao.baseUrl);
    } catch (erro) {
      throw new HttpError(
        `${preset.nome}: ${erro instanceof Error ? erro.message : 'URL base inválida.'}`,
        400
      );
    }
  }
  const modelos = [
    ...new Set(alteracao.modelos.map((m) => m.trim()).filter(Boolean)),
  ];
  if (modelos.length === 0) {
    throw new HttpError(`Escolha ao menos um modelo de ${preset.nome}.`, 400);
  }
  let chave =
    alteracao.chave === undefined ? (atual?.chave ?? null) : alteracao.chave;
  if (typeof chave === 'string') chave = chave.trim() || null;
  const exigeChave =
    tipo === 'gemini' || tipo === 'anthropic' || preset.exigeChave;
  if (exigeChave && !chave) {
    throw new HttpError(
      atual?.chaveIlegivel && alteracao.chave === undefined
        ? `${preset.nome}: a chave salva não pode mais ser lida (o AUTH_SECRET mudou); informe a chave de novo.`
        : `${preset.nome} exige uma chave de API.`,
      400
    );
  }
  return {
    preset: preset.id,
    tipo,
    baseUrl,
    chave,
    modelos,
    tempoMaximoSegundos: alteracao.tempoMaximoSegundos,
    temperatura: alteracao.temperatura,
  };
}

/**
 * Valida e grava, em uma transação, os provedores escolhidos e a ordem de
 * uso. Provedores que saíram da lista são apagados (com a chave); a ordem só
 * aceita o motor da Lyra (uma vez) e modelos escolhidos nos provedores.
 */
export async function salvarConfiguracaoDeIa(
  alteracao: AlteracaoDaConfiguracao,
  adminId: string
): Promise<ConfiguracaoDeIa> {
  const atual = await lerConfiguracaoDeIa();
  const atualPorPreset = new Map(atual.provedores.map((p) => [p.preset, p]));

  const presets = alteracao.provedores.map((p) => p.preset);
  if (new Set(presets).size !== presets.length) {
    throw new HttpError('Cada provedor pode aparecer uma só vez.', 400);
  }
  const validados = alteracao.provedores.map((p) =>
    validarProvedor(p, atualPorPreset.get(p.preset))
  );
  const validadoPorPreset = new Map(validados.map((p) => [p.preset, p]));

  if (alteracao.ordem.length === 0) {
    throw new HttpError('Escolha ao menos o 1º modelo da ordem de uso.', 400);
  }
  if (alteracao.ordem.length > POSICOES_DA_ORDEM) {
    throw new HttpError(
      `A ordem de uso tem no máximo ${POSICOES_DA_ORDEM} posições.`,
      400
    );
  }
  const vistos = new Set<string>();
  for (const elo of alteracao.ordem) {
    const chave = elo.tipo === 'lyra' ? 'lyra' : `${elo.preset}|${elo.modelo}`;
    if (vistos.has(chave)) {
      throw new HttpError('A ordem de uso repete o mesmo modelo.', 400);
    }
    vistos.add(chave);
    if (elo.tipo === 'modelo') {
      const provedor = validadoPorPreset.get(elo.preset);
      if (!provedor || !provedor.modelos.includes(elo.modelo)) {
        throw new HttpError(
          `O modelo ${elo.modelo} (${nomeDoProvedor(elo.preset)}) não está entre os modelos escolhidos.`,
          400
        );
      }
    }
  }

  await withTransaction(async (conexao: PoolConnection) => {
    // A ordem referencia os provedores: sai primeiro.
    await conexao.execute('DELETE FROM ai_model_chain');
    const manter = validados.map((p) => p.preset);
    if (manter.length > 0) {
      await conexao.query(
        'DELETE FROM ai_provider_connections WHERE preset NOT IN (?)',
        [manter]
      );
    } else {
      await conexao.execute('DELETE FROM ai_provider_connections');
    }

    const idPorPreset = new Map<string, string>();
    for (const provedor of validados) {
      const existente = atualPorPreset.get(provedor.preset);
      const id = existente?.id ?? randomUUID();
      idPorPreset.set(provedor.preset, id);
      const valores = [
        provedor.tipo,
        provedor.baseUrl,
        provedor.chave ? cifrar(provedor.chave, FINALIDADE_DA_CHAVE) : null,
        provedor.chave ? provedor.chave.slice(-4) : null,
        JSON.stringify(provedor.modelos),
        provedor.tempoMaximoSegundos,
        provedor.temperatura,
        adminId,
      ];
      if (existente) {
        await conexao.execute(
          `UPDATE ai_provider_connections
              SET provider_type = ?, base_url = ?, api_key_ciphertext = ?,
                  api_key_last4 = ?, models = ?, timeout_seconds = ?,
                  temperature = ?, updated_by = ?, updated_at = UTC_TIMESTAMP()
            WHERE id = ?`,
          [...valores, id]
        );
      } else {
        await conexao.execute(
          `INSERT INTO ai_provider_connections (
             provider_type, base_url, api_key_ciphertext, api_key_last4,
             models, timeout_seconds, temperature, updated_by, id, preset,
             created_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
          [...valores, id, provedor.preset]
        );
      }
    }

    for (const [indice, elo] of alteracao.ordem.entries()) {
      // A validação acima garante que o provedor de cada modelo foi gravado.
      const conexaoId =
        elo.tipo === 'lyra' ? null : (idPorPreset.get(elo.preset) ?? null);
      await conexao.execute(
        `INSERT INTO ai_model_chain (position, connection_id, model, updated_by, updated_at)
         VALUES (?, ?, ?, ?, UTC_TIMESTAMP())`,
        [
          indice + 1,
          conexaoId,
          elo.tipo === 'lyra' ? null : elo.modelo,
          adminId,
        ]
      );
    }
  });

  return lerConfiguracaoDeIa();
}
