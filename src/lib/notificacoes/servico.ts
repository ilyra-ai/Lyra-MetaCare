import { randomUUID } from 'node:crypto';

import { executeStatement, queryRows } from '@/lib/mysql/pool';

/**
 * Notificações do sino, gravadas no servidor (tarefa 42). A rotina diária do
 * coach cria "Seu dia está pronto" e os alertas do dia; `chave` evita
 * duplicar a mesma notificação (índice único por pessoa e chave).
 */

export const TIPOS_DE_NOTIFICACAO = ['coach_dia', 'coach_alerta'] as const;
export type TipoDeNotificacao = (typeof TIPOS_DE_NOTIFICACAO)[number];

export interface NovaNotificacao {
  userId: string;
  tipo: TipoDeNotificacao;
  titulo: string;
  corpo: string;
  link: string | null;
  chave: string;
}

export interface Notificacao {
  id: string;
  tipo: TipoDeNotificacao;
  titulo: string;
  corpo: string;
  link: string | null;
  criadaEm: string;
  lida: boolean;
}

/** Dias que as notificações ficam guardadas. */
export const RETENCAO_DAS_NOTIFICACOES_DIAS = 90;

function limitar(texto: string, maximo: number) {
  return texto.length <= maximo ? texto : `${texto.slice(0, maximo - 1)}…`;
}

/** Cria a notificação; `false` quando a mesma chave já existia. */
export async function criarNotificacao(nova: NovaNotificacao) {
  const resultado = await executeStatement(
    `INSERT IGNORE INTO user_notifications
       (id, user_id, kind, title, body, link, dedupe_key)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      nova.userId,
      nova.tipo,
      limitar(nova.titulo, 160),
      limitar(nova.corpo, 500),
      nova.link,
      limitar(nova.chave, 120),
    ]
  );
  return resultado.affectedRows === 1;
}

interface LinhaDaNotificacao {
  id: string;
  kind: string;
  title: string;
  body: string;
  link: string | null;
  created_at: string;
  read_at: string | null;
}

export async function listarNotificacoes(
  userId: string,
  limite = 30
): Promise<{ notificacoes: Notificacao[]; naoLidas: number }> {
  const linhas = await queryRows<LinhaDaNotificacao>(
    `SELECT id, kind, title, body, link, created_at, read_at
       FROM user_notifications
      WHERE user_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT ?`,
    [userId, limite]
  );
  const [contagem] = await queryRows<{ total: number }>(
    `SELECT COUNT(*) AS total FROM user_notifications
      WHERE user_id = ? AND read_at IS NULL`,
    [userId]
  );
  return {
    notificacoes: linhas
      .filter(
        (linha): linha is LinhaDaNotificacao & { kind: TipoDeNotificacao } =>
          (TIPOS_DE_NOTIFICACAO as readonly string[]).includes(linha.kind)
      )
      .map((linha) => ({
        id: linha.id,
        tipo: linha.kind,
        titulo: linha.title,
        corpo: linha.body,
        link: linha.link,
        // O MySQL guarda em UTC (sem fuso no texto): vira ISO 8601 com Z.
        criadaEm: `${String(linha.created_at).replace(' ', 'T')}Z`,
        lida: linha.read_at !== null,
      })),
    naoLidas: Number(contagem?.total ?? 0),
  };
}

/** Marca como lidas as notificações informadas (ou todas, sem ids). */
export async function marcarComoLidas(userId: string, ids: string[] | null) {
  if (ids !== null && ids.length === 0) return 0;
  const resultado =
    ids === null
      ? await executeStatement(
          `UPDATE user_notifications SET read_at = UTC_TIMESTAMP()
            WHERE user_id = ? AND read_at IS NULL`,
          [userId]
        )
      : await executeStatement(
          `UPDATE user_notifications SET read_at = UTC_TIMESTAMP()
            WHERE user_id = ? AND read_at IS NULL
              AND id IN (${ids.map(() => '?').join(', ')})`,
          [userId, ...ids]
        );
  return resultado.affectedRows;
}

/** Apaga as notificações mais antigas que a retenção. */
export async function apagarNotificacoesAntigas() {
  const resultado = await executeStatement(
    `DELETE FROM user_notifications
      WHERE created_at < UTC_TIMESTAMP() - INTERVAL ? DAY`,
    [RETENCAO_DAS_NOTIFICACOES_DIAS]
  );
  return resultado.affectedRows;
}
