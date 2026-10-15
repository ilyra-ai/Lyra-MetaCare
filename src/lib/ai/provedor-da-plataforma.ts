import { HttpError } from '@/lib/http-error';
import { executeStatement, queryRows } from '@/lib/mysql/pool';
import { cifrar, decifrar } from '@/lib/security/cifra';

import { type ConexaoDeIa, normalizarBaseUrl } from './cliente-de-ia';
import {
  presetPorId,
  type TipoDeProvedor,
  TIPOS_DE_PROVEDOR,
  urlEhLocal,
} from './provedores-catalogo';

/**
 * Provedor de IA da plataforma (tabela `ai_provider_settings`, linha única),
 * escolhido pelo administrador. A chave de API fica cifrada no banco e só é
 * decifrada no servidor, no momento da chamada.
 */

const FINALIDADE_DA_CHAVE = 'ai-provider-api-key';

interface LinhaDoProvedor {
  provider_type: string;
  preset: string | null;
  base_url: string | null;
  model: string | null;
  api_key_ciphertext: string | null;
  api_key_last4: string | null;
  timeout_seconds: number;
  temperature: string | number;
  updated_at: string | Date;
}

export interface ProvedorDaPlataforma {
  tipo: TipoDeProvedor;
  preset: string | null;
  baseUrl: string | null;
  modelo: string | null;
  chave: string | null;
  /** Últimos 4 caracteres da chave salva, para conferência. */
  finalDaChave: string | null;
  /** Há chave salva, mas o AUTH_SECRET mudou e ela não pode ser lida. */
  chaveIlegivel: boolean;
  tempoMaximoSegundos: number;
  temperatura: number;
  atualizadoEm: string;
}

/** O que a tela de administração recebe: nunca a chave. */
export type ProvedorPublico = Omit<ProvedorDaPlataforma, 'chave'> & {
  temChave: boolean;
  local: boolean;
};

function tipoValido(valor: string): TipoDeProvedor {
  return (TIPOS_DE_PROVEDOR as readonly string[]).includes(valor)
    ? (valor as TipoDeProvedor)
    : 'lyra_local';
}

function iso(valor: string | Date) {
  return valor instanceof Date
    ? valor.toISOString()
    : `${String(valor).replace(' ', 'T')}Z`;
}

const PADRAO: ProvedorDaPlataforma = {
  tipo: 'lyra_local',
  preset: 'lyra',
  baseUrl: null,
  modelo: null,
  chave: null,
  finalDaChave: null,
  chaveIlegivel: false,
  tempoMaximoSegundos: 90,
  temperatura: 0.7,
  atualizadoEm: new Date(0).toISOString(),
};

export async function lerProvedorDaPlataforma(): Promise<ProvedorDaPlataforma> {
  const [linha] = await queryRows<LinhaDoProvedor>(
    `SELECT provider_type, preset, base_url, model, api_key_ciphertext,
            api_key_last4, timeout_seconds, temperature, updated_at
       FROM ai_provider_settings WHERE id = 1 LIMIT 1`
  );
  if (!linha) return PADRAO;
  const chave = linha.api_key_ciphertext
    ? decifrar(linha.api_key_ciphertext, FINALIDADE_DA_CHAVE)
    : null;
  return {
    tipo: tipoValido(linha.provider_type),
    preset: linha.preset,
    baseUrl: linha.base_url,
    modelo: linha.model,
    chave,
    finalDaChave: linha.api_key_last4,
    chaveIlegivel: Boolean(linha.api_key_ciphertext) && chave === null,
    tempoMaximoSegundos: Number(linha.timeout_seconds),
    temperatura: Number(linha.temperature),
    atualizadoEm: iso(linha.updated_at),
  };
}

export function provedorPublico(
  provedor: ProvedorDaPlataforma
): ProvedorPublico {
  const { chave, ...resto } = provedor;
  return {
    ...resto,
    temChave: Boolean(chave),
    // Local: os dados não saem da máquina ou da rede onde a Lyra roda.
    local:
      provedor.tipo === 'lyra_local' ||
      (provedor.tipo === 'openai_compativel' && urlEhLocal(provedor.baseUrl)),
  };
}

/**
 * Conexão pronta para gerar texto, ou `null` quando o provedor é só o motor
 * da Lyra ou está incompleto (sem modelo, sem URL ou sem a chave exigida).
 */
export function conexaoDoProvedor(
  provedor: ProvedorDaPlataforma
): ConexaoDeIa | null {
  if (provedor.tipo === 'lyra_local' || !provedor.modelo) return null;
  if (provedor.tipo === 'openai_compativel' && !provedor.baseUrl) return null;
  if (
    (provedor.tipo === 'gemini' || provedor.tipo === 'anthropic') &&
    !provedor.chave
  ) {
    return null;
  }
  const preset = presetPorId(provedor.preset);
  if (preset?.exigeChave && !provedor.chave) return null;
  return {
    tipo: provedor.tipo,
    baseUrl: provedor.baseUrl,
    modelo: provedor.modelo,
    chave: provedor.chave,
    tempoMaximoSegundos: provedor.tempoMaximoSegundos,
    temperatura: provedor.temperatura,
  };
}

/** Identifica a configuração (sem a chave) para refazer o dia quando muda. */
export function assinaturaDoProvedor(provedor: ProvedorDaPlataforma) {
  return conexaoDoProvedor(provedor)
    ? [
        provedor.tipo,
        provedor.baseUrl ?? '',
        provedor.modelo ?? '',
        provedor.atualizadoEm,
      ].join('|')
    : 'lyra_local';
}

export interface AlteracaoDoProvedor {
  tipo: TipoDeProvedor;
  preset: string | null;
  baseUrl: string | null;
  modelo: string | null;
  /** `undefined` mantém a chave salva; `null` apaga; texto troca. */
  chave?: string | null;
  tempoMaximoSegundos: number;
  temperatura: number;
}

/** Valida e grava a escolha do administrador. */
export async function salvarProvedorDaPlataforma(
  alteracao: AlteracaoDoProvedor,
  adminId: string
): Promise<ProvedorDaPlataforma> {
  const preset = presetPorId(alteracao.preset);
  if (alteracao.preset && !preset) {
    throw new HttpError('Provedor desconhecido.', 400);
  }
  if (preset && preset.tipo !== alteracao.tipo) {
    throw new HttpError('O tipo não corresponde ao provedor escolhido.', 400);
  }
  let baseUrl: string | null = null;
  if (alteracao.tipo === 'openai_compativel') {
    if (!alteracao.baseUrl?.trim()) {
      throw new HttpError('Informe a URL base do servidor de IA.', 400);
    }
    try {
      baseUrl = normalizarBaseUrl(alteracao.baseUrl);
    } catch (erro) {
      throw new HttpError(
        erro instanceof Error ? erro.message : 'URL base inválida.',
        400
      );
    }
  }
  const modelo =
    alteracao.tipo === 'lyra_local' ? null : alteracao.modelo?.trim() || null;
  if (alteracao.tipo !== 'lyra_local' && !modelo) {
    throw new HttpError('Escolha ou informe o modelo.', 400);
  }

  const atual = await lerProvedorDaPlataforma();
  let chave = alteracao.chave === undefined ? atual.chave : alteracao.chave;
  if (alteracao.tipo === 'lyra_local') chave = null;
  if (typeof chave === 'string') chave = chave.trim() || null;
  const exigeChave =
    alteracao.tipo === 'gemini' ||
    alteracao.tipo === 'anthropic' ||
    Boolean(preset?.exigeChave);
  if (exigeChave && !chave) {
    throw new HttpError(
      atual.chaveIlegivel
        ? 'A chave salva não pode mais ser lida (o AUTH_SECRET mudou): informe a chave de novo.'
        : 'Este provedor exige uma chave de API.',
      400
    );
  }

  await executeStatement(
    `UPDATE ai_provider_settings
        SET provider_type = ?, preset = ?, base_url = ?, model = ?,
            api_key_ciphertext = ?, api_key_last4 = ?, timeout_seconds = ?,
            temperature = ?, updated_by = ?, updated_at = UTC_TIMESTAMP()
      WHERE id = 1`,
    [
      alteracao.tipo,
      alteracao.preset,
      baseUrl,
      modelo,
      chave ? cifrar(chave, FINALIDADE_DA_CHAVE) : null,
      chave ? chave.slice(-4) : null,
      alteracao.tempoMaximoSegundos,
      alteracao.temperatura,
      adminId,
    ]
  );
  return lerProvedorDaPlataforma();
}
