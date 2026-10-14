import {
  CRITERIOS_DAS_SEQUENCIAS,
  type TipoDeSequencia,
} from '@/lib/metas/catalogo';
import { executeStatement, queryRows } from '@/lib/mysql/pool';

import type { UserStreak } from './assessment-engine';

/**
 * Sequências (streaks) derivadas do registro do dia, nunca declaradas pelo
 * navegador (tarefa 43). Antes a rota aceitava qualquer "atividade" enviada
 * pelo cliente e nenhuma tela a chamava: a tabela ficava vazia.
 *
 * Recalculadas a cada check-in, sessão da pulseira ou abertura da página de
 * metas, sobre os últimos 400 dias.
 */

export { CRITERIOS_DAS_SEQUENCIAS, type TipoDeSequencia };

interface LinhaDoDia {
  date: string;
  sleep_duration_minutes: number | null;
  steps: number | null;
  active_minutes: number | null;
  meditation_minutes: number | null;
  water_liters: number | null;
}

function maiorQue(valor: unknown, limite: number) {
  const n = Number(valor);
  return (
    valor !== null && valor !== undefined && Number.isFinite(n) && n >= limite
  );
}

const CUMPRE: Record<TipoDeSequencia, (dia: LinhaDoDia) => boolean> = {
  daily_metrics: () => true,
  sleep_hygiene: (d) => maiorQue(d.sleep_duration_minutes, 420),
  movement: (d) => maiorQue(d.steps, 7000) || maiorQue(d.active_minutes, 30),
  meditation: (d) => maiorQue(d.meditation_minutes, 1),
  hydration: (d) => maiorQue(d.water_liters, 2),
};

function diaAnterior(data: string) {
  const instante = new Date(`${data}T12:00:00Z`);
  instante.setUTCDate(instante.getUTCDate() - 1);
  return instante.toISOString().slice(0, 10);
}

/**
 * Sequência atual (terminando hoje, ou ontem se hoje ainda não foi
 * cumprido), a mais longa da janela e o último dia cumprido.
 */
export function calcularSequencia(dias: ReadonlySet<string>, hoje: string) {
  const ordenados = [...dias].filter((d) => d <= hoje).sort();
  if (ordenados.length === 0) {
    return { atual: 0, maisLonga: 0, ultimo: null as string | null };
  }

  let maisLonga = 1;
  let corrida = 1;
  for (let i = 1; i < ordenados.length; i++) {
    corrida = diaAnterior(ordenados[i]) === ordenados[i - 1] ? corrida + 1 : 1;
    maisLonga = Math.max(maisLonga, corrida);
  }

  let cursor = dias.has(hoje) ? hoje : diaAnterior(hoje);
  let atual = 0;
  while (dias.has(cursor)) {
    atual += 1;
    cursor = diaAnterior(cursor);
  }

  return { atual, maisLonga, ultimo: ordenados[ordenados.length - 1] };
}

export async function recalcularSequencias(userId: string, hoje: string) {
  const linhas = await queryRows<LinhaDoDia>(
    `SELECT date, sleep_duration_minutes, steps, active_minutes,
            meditation_minutes, water_liters
       FROM daily_metrics
      WHERE user_id = ? AND date BETWEEN ? - INTERVAL 400 DAY AND ?`,
    [userId, hoje, hoje]
  );

  for (const tipo of Object.keys(CUMPRE) as TipoDeSequencia[]) {
    const dias = new Set(
      linhas
        .filter((linha) => CUMPRE[tipo](linha))
        .map((linha) => String(linha.date).slice(0, 10))
    );
    const { atual, maisLonga, ultimo } = calcularSequencia(dias, hoje);
    if (!ultimo) {
      await executeStatement(
        'DELETE FROM user_streaks WHERE user_id = ? AND streak_type = ?',
        [userId, tipo]
      );
      continue;
    }
    await executeStatement(
      `INSERT INTO user_streaks
         (id, user_id, streak_type, current_streak, longest_streak,
          last_activity_date, created_at, updated_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())
       AS novo
       ON DUPLICATE KEY UPDATE
         current_streak = novo.current_streak,
         longest_streak = novo.longest_streak,
         last_activity_date = novo.last_activity_date,
         updated_at = novo.updated_at`,
      [userId, tipo, atual, maisLonga, ultimo]
    );
  }
}

export async function getUserStreaks(userId: string): Promise<UserStreak[]> {
  return queryRows<UserStreak>(
    `SELECT * FROM user_streaks WHERE user_id = ?
      ORDER BY FIELD(streak_type, 'daily_metrics', 'sleep_hygiene',
                     'movement', 'meditation', 'hydration')`,
    [userId]
  );
}
