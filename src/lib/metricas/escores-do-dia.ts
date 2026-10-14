import {
  calcularProntidao,
  type SinaisDaProntidao,
} from '@/lib/coach/prontidao';
import { executeStatement, queryRows } from '@/lib/mysql/pool';

/**
 * Prontidão e recuperação do dia gravadas no servidor (tarefa 43), com a
 * mesma regra do coach diário (`src/lib/coach/prontidao.ts`): só sinais
 * medidos entram, VFC e FC de repouso comparadas à média pessoal dos 7 dias
 * anteriores, e sem dados suficientes o valor fica NULL.
 *
 * - `readiness_score`: prontidão com sinais do corpo e do check-in (sono, VFC,
 *   FC de repouso, energia, estresse e humor);
 * - `recovery_score`: só os sinais fisiológicos (sono, VFC e FC de repouso).
 *
 * Antes nenhum fluxo gravava essas colunas: o gráfico semanal, o painel e o
 * chat mostravam sempre vazio ou zero.
 */

interface LinhaDosSinais extends SinaisDaProntidao {
  date: string;
}

const COLUNAS = [
  'sleep_duration_minutes',
  'hrv_ms',
  'resting_heart_rate',
  'energy_level',
  'mood_score',
  'stress_score',
] as const;

function numero(valor: unknown) {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function diasAntes(data: string, dias: number) {
  const instante = new Date(`${data}T12:00:00Z`);
  instante.setUTCDate(instante.getUTCDate() - dias);
  return instante.toISOString().slice(0, 10);
}

export function escoresDoDia(
  hoje: SinaisDaProntidao,
  historico: SinaisDaProntidao[]
) {
  const prontidao = calcularProntidao(hoje, historico);
  const recuperacao = calcularProntidao(
    {
      sleep_duration_minutes: hoje.sleep_duration_minutes,
      hrv_ms: hoje.hrv_ms,
      resting_heart_rate: hoje.resting_heart_rate,
      energy_level: null,
      mood_score: null,
      stress_score: null,
    },
    historico
  );
  return { readiness: prontidao.valor, recovery: recuperacao.valor };
}

/**
 * Recalcula a prontidão e a recuperação de `data` e dos dias seguintes já
 * registrados (até 7 dias depois), porque a linha de base deles inclui o dia
 * alterado.
 */
export async function recalcularEscoresDesde(userId: string, data: string) {
  const linhas = (
    await queryRows<Record<string, unknown>>(
      `SELECT date, ${COLUNAS.join(', ')}
         FROM daily_metrics
        WHERE user_id = ? AND date BETWEEN ? AND ?
        ORDER BY date ASC`,
      [userId, diasAntes(data, 7), diasAntes(data, -7)]
    )
  ).map((linha): LinhaDosSinais => ({
    date: String(linha.date).slice(0, 10),
    sleep_duration_minutes: numero(linha.sleep_duration_minutes),
    hrv_ms: numero(linha.hrv_ms),
    resting_heart_rate: numero(linha.resting_heart_rate),
    energy_level: numero(linha.energy_level),
    mood_score: numero(linha.mood_score),
    stress_score: numero(linha.stress_score),
  }));

  for (const dia of linhas.filter((linha) => linha.date >= data)) {
    const historico = linhas.filter(
      (linha) => linha.date < dia.date && linha.date >= diasAntes(dia.date, 7)
    );
    const { readiness, recovery } = escoresDoDia(dia, historico);
    await executeStatement(
      `UPDATE daily_metrics
          SET readiness_score = ?, recovery_score = ?
        WHERE user_id = ? AND date = ?`,
      [readiness, recovery, userId, dia.date]
    );
  }
}
