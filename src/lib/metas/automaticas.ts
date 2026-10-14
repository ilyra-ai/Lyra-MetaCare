import { executeStatement, queryRows } from '@/lib/mysql/pool';

import {
  diasAntes,
  ehChaveDaMetrica,
  METRICAS_DAS_METAS,
  statusDaMeta,
  valorAtualDaMeta,
} from './catalogo';

/**
 * Metas automáticas (tarefa 43): o progresso vem do registro do dia, sem
 * digitação. Recalculadas no servidor a cada check-in, sessão da pulseira,
 * abertura da página de metas e na rotina diária (prazos vencidos).
 */

interface LinhaDaMeta {
  id: string;
  metric_key: string | null;
  metric_direction: string | null;
  target_value: number | string | null;
  current_value: number | string;
  deadline: string | null;
  status: string;
}

function numero(valor: unknown) {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

/**
 * Recalcula as metas automáticas da pessoa e o prazo das manuais.
 * Devolve quantas metas mudaram de valor ou de status.
 */
export async function recalcularMetas(userId: string, hoje: string) {
  const metas = await queryRows<LinhaDaMeta>(
    `SELECT id, metric_key, metric_direction, target_value, current_value,
            deadline, status
       FROM goals WHERE user_id = ?`,
    [userId]
  );
  if (metas.length === 0) return 0;

  const chaves = [
    ...new Set(metas.map((m) => m.metric_key).filter(ehChaveDaMetrica)),
  ];
  const colunas = [...new Set(chaves.map((c) => METRICAS_DAS_METAS[c].coluna))];
  const linhas = colunas.length
    ? await queryRows<Record<string, unknown>>(
        `SELECT date, ${colunas.join(', ')} FROM daily_metrics
          WHERE user_id = ? AND date BETWEEN ? AND ?`,
        [userId, diasAntes(hoje, 29), hoje]
      )
    : [];

  let alteradas = 0;
  for (const meta of metas) {
    const prazo = meta.deadline ? String(meta.deadline).slice(0, 10) : null;
    const alvo = numero(meta.target_value);
    const direcao = meta.metric_direction === 'down' ? 'down' : 'up';

    if (ehChaveDaMetrica(meta.metric_key)) {
      const coluna = METRICAS_DAS_METAS[meta.metric_key].coluna;
      const { valor, dias } = valorAtualDaMeta(
        meta.metric_key,
        linhas.map((l) => ({
          date: String(l.date).slice(0, 10),
          valor: numero(l[coluna]),
        })),
        hoje
      );
      const status = statusDaMeta({ atual: valor, alvo, direcao, prazo, hoje });
      // current_value é NOT NULL: sem registro na janela fica 0 e
      // auto_sample_days = 0 diz à tela que não há dados.
      const atual = valor ?? 0;
      if (atual !== numero(meta.current_value) || status !== meta.status) {
        alteradas += 1;
      }
      await executeStatement(
        `UPDATE goals
            SET current_value = ?, status = ?, auto_sample_days = ?,
                auto_updated_at = UTC_TIMESTAMP()
          WHERE id = ? AND user_id = ?`,
        [atual, status, dias, meta.id, userId]
      );
      continue;
    }

    // Meta manual: o prazo vencido sem o alvo vira "Em atraso"; prazo
    // estendido devolve a meta ao andamento.
    if (meta.status === 'completed') continue;
    const status = statusDaMeta({
      atual: numero(meta.current_value),
      alvo,
      direcao,
      prazo,
      hoje,
    });
    if (status !== meta.status) {
      await executeStatement(
        'UPDATE goals SET status = ? WHERE id = ? AND user_id = ?',
        [status, meta.id, userId]
      );
      alteradas += 1;
    }
  }
  return alteradas;
}
