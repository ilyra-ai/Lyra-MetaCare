import { createHash } from 'node:crypto';

import type { RowDataPacket } from 'mysql2/promise';

import { HttpError } from '@/lib/http-error';
import { executeStatement, queryRows, withTransaction } from '@/lib/mysql/pool';

/**
 * Limite de tentativas com janela fixa, persistido no MySQL
 * (`rate_limit_buckets`, migration 012) para valer entre processos e
 * reinícios do servidor.
 *
 * A chave gravada é o SHA-256 de "<escopo>:<valor>": e-mails e IPs não ficam
 * em texto no banco.
 */

export interface RegraDeLimite {
  /** Identifica a regra (ex.: `login-conta`). */
  escopo: string;
  /** Máximo de ocorrências na janela. */
  limite: number;
  janelaSegundos: number;
}

export interface EstadoDoLimite {
  ocorrencias: number;
  excedido: boolean;
  /** Segundos até a janela atual terminar. */
  segundosRestantes: number;
}

interface LinhaDoBalde extends RowDataPacket {
  hits: number;
  restante: number;
}

function chaveDoBalde(regra: RegraDeLimite, valor: string) {
  return createHash('sha256').update(`${regra.escopo}:${valor}`).digest('hex');
}

/**
 * `incluiAtual`: o estado já conta a requisição em andamento (registro), e
 * ela só passa se não ultrapassar o limite; numa consulta, a próxima
 * ocorrência já não cabe quando o limite foi atingido.
 */
function estado(
  regra: RegraDeLimite,
  linha: LinhaDoBalde | undefined,
  incluiAtual: boolean
): EstadoDoLimite {
  const ocorrencias = linha ? Number(linha.hits) : 0;
  return {
    ocorrencias,
    excedido: incluiAtual
      ? ocorrencias > regra.limite
      : ocorrencias >= regra.limite,
    segundosRestantes: linha ? Math.max(1, Number(linha.restante)) : 0,
  };
}

const CONSULTA_ESTADO = `
  SELECT
    hits,
    TIMESTAMPDIFF(
      SECOND,
      UTC_TIMESTAMP(),
      window_started_at + INTERVAL ? SECOND
    ) AS restante
  FROM rate_limit_buckets
  WHERE bucket_key = ?
    AND window_started_at > UTC_TIMESTAMP() - INTERVAL ? SECOND
`;

/**
 * Registra uma ocorrência e devolve o estado da janela. A atualização e a
 * leitura acontecem na mesma transação (a linha fica bloqueada pelo upsert),
 * então requisições simultâneas contam corretamente.
 */
export async function registrarOcorrencia(
  regra: RegraDeLimite,
  valor: string
): Promise<EstadoDoLimite> {
  const chave = chaveDoBalde(regra, valor);
  const janela = regra.janelaSegundos;
  return withTransaction(async (conexao) => {
    // `hits` é avaliado antes de `window_started_at` ser reiniciado (o MySQL
    // aplica as atribuições do ON DUPLICATE KEY UPDATE da esquerda para a
    // direita).
    await conexao.execute(
      `
        INSERT INTO rate_limit_buckets (bucket_key, window_started_at, hits)
        VALUES (?, UTC_TIMESTAMP(), 1)
        ON DUPLICATE KEY UPDATE
          hits = IF(
            window_started_at <= UTC_TIMESTAMP() - INTERVAL ? SECOND,
            1,
            hits + 1
          ),
          window_started_at = IF(
            window_started_at <= UTC_TIMESTAMP() - INTERVAL ? SECOND,
            UTC_TIMESTAMP(),
            window_started_at
          )
      `,
      [chave, janela, janela]
    );
    const [linhas] = await conexao.execute<LinhaDoBalde[]>(CONSULTA_ESTADO, [
      janela,
      chave,
      janela,
    ]);
    return estado(regra, linhas[0], true);
  });
}

/** Estado atual da janela, sem registrar ocorrência. */
export async function consultarLimite(
  regra: RegraDeLimite,
  valor: string
): Promise<EstadoDoLimite> {
  const janela = regra.janelaSegundos;
  const linhas = await queryRows<LinhaDoBalde>(CONSULTA_ESTADO, [
    janela,
    chaveDoBalde(regra, valor),
    janela,
  ]);
  return estado(regra, linhas[0], false);
}

/** Zera a janela (ex.: login correto zera as falhas da conta). */
export async function zerarLimite(regra: RegraDeLimite, valor: string) {
  await executeStatement(
    'DELETE FROM rate_limit_buckets WHERE bucket_key = ?',
    [chaveDoBalde(regra, valor)]
  );
}

/**
 * Remove janelas vencidas há mais de um dia. Chamado por
 * `exigirDentroDoLimite`; o índice em `window_started_at` e o LIMIT mantêm o
 * custo baixo.
 */
export async function limparJanelasVencidas() {
  await executeStatement(
    `
      DELETE FROM rate_limit_buckets
      WHERE window_started_at < UTC_TIMESTAMP() - INTERVAL 1 DAY
      LIMIT 500
    `
  );
}

export function erroDeLimiteExcedido(estadoAtual: EstadoDoLimite) {
  const minutos = Math.max(1, Math.ceil(estadoAtual.segundosRestantes / 60));
  return new HttpError(
    `Muitas tentativas. Tente novamente em ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}.`,
    429,
    { 'Retry-After': String(Math.max(1, estadoAtual.segundosRestantes)) }
  );
}

/** Registra a ocorrência e responde 429 quando a janela estoura. */
export async function exigirDentroDoLimite(
  regra: RegraDeLimite,
  valor: string
) {
  await limparJanelasVencidas();
  const estadoAtual = await registrarOcorrencia(regra, valor);
  if (estadoAtual.excedido) {
    throw erroDeLimiteExcedido(estadoAtual);
  }
}

/** Responde 429 quando a janela já atingiu o limite, sem registrar. */
export async function exigirLimiteDisponivel(
  regra: RegraDeLimite,
  valor: string
) {
  const estadoAtual = await consultarLimite(regra, valor);
  if (estadoAtual.excedido) {
    throw erroDeLimiteExcedido(estadoAtual);
  }
}

/**
 * IP do cliente informado pelo proxy reverso (primeiro endereço de
 * `X-Forwarded-For`, depois `X-Real-IP`). Sem proxy reverso confiável à frente
 * da aplicação esse cabeçalho pode ser forjado; por isso os limites por IP
 * complementam, e não substituem, os limites por conta.
 */
export function ipDoCliente(request: Request) {
  const encaminhado = request.headers.get('x-forwarded-for');
  const primeiro = encaminhado?.split(',')[0]?.trim();
  return (
    primeiro ||
    request.headers.get('x-real-ip')?.trim() ||
    'desconhecido'
  ).slice(0, 64);
}

// Regras das rotas de autenticação.
export const LIMITE_LOGIN_POR_CONTA: RegraDeLimite = {
  // Falhas de senha por e-mail: não depende de cabeçalho forjável.
  escopo: 'login-conta',
  limite: 10,
  janelaSegundos: 15 * 60,
};

export const LIMITE_LOGIN_POR_IP: RegraDeLimite = {
  escopo: 'login-ip',
  limite: 50,
  janelaSegundos: 15 * 60,
};

export const LIMITE_CADASTRO_POR_IP: RegraDeLimite = {
  escopo: 'cadastro-ip',
  limite: 10,
  janelaSegundos: 60 * 60,
};
