import { randomUUID } from 'node:crypto';

import { executeStatement, queryRows } from '@/lib/mysql/pool';

import { recalcularEscoresDesde } from './escores-do-dia';

import {
  CAMPOS_DO_REGISTRO,
  NOMES_DOS_CAMPOS,
  type RegistroDoDia,
  type SessaoDoSensor,
} from './registro-do-dia';

/** Colunas devolvidas depois de gravar (o que o check-in mostra). */
const COLUNAS_DO_REGISTRO = [
  'date',
  ...NOMES_DOS_CAMPOS.map((campo) => CAMPOS_DO_REGISTRO[campo].coluna),
  'resting_heart_rate_min',
  'resting_heart_rate_max',
  'sensor_heart_rate_avg',
  'sensor_minutes',
  'hrv_ms',
  'readiness_score',
  'recovery_score',
  'metrics_updated_at',
];

export type LinhaDoRegistro = Record<string, string | number | null>;

export async function lerRegistroDoDia(
  userId: string,
  data: string
): Promise<LinhaDoRegistro | null> {
  const [linha] = await queryRows<LinhaDoRegistro>(
    `SELECT ${COLUNAS_DO_REGISTRO.join(', ')}
       FROM daily_metrics
      WHERE user_id = ? AND date = ?
      LIMIT 1`,
    [userId, data]
  );
  return linha ?? null;
}

/**
 * Check-in do dia: grava só os campos informados (os demais ficam como
 * estavam) e cria a linha do dia se ainda não existir.
 */
export async function gravarRegistroDoDia(
  userId: string,
  registro: RegistroDoDia
): Promise<LinhaDoRegistro | null> {
  const informados = NOMES_DOS_CAMPOS.filter(
    (campo) => registro.valores[campo] !== undefined
  );
  const colunas = informados.map((campo) => CAMPOS_DO_REGISTRO[campo].coluna);
  const valores = informados.map((campo) => registro.valores[campo] as number);

  await executeStatement(
    `INSERT INTO daily_metrics (id, user_id, date, ${colunas.join(', ')}, metrics_updated_at)
     VALUES (?, ?, ?, ${colunas.map(() => '?').join(', ')}, UTC_TIMESTAMP())
     AS novo
     ON DUPLICATE KEY UPDATE
       ${colunas.map((coluna) => `${coluna} = novo.${coluna}`).join(',\n       ')},
       metrics_updated_at = novo.metrics_updated_at`,
    [randomUUID(), userId, registro.data, ...valores]
  );
  await recalcularEscoresDesde(userId, registro.data);

  return lerRegistroDoDia(userId, registro.data);
}

/**
 * Sessão da pulseira: soma ao que já existe no dia sem apagar nada. Mínima e
 * máxima viram o extremo do dia, a média é ponderada pelos minutos de cada
 * sessão, a FC de repouso é a menor estimativa do dia (ou o valor do
 * check-in, se for menor) e a VFC fica com a da sessão mais recente que a
 * mediu.
 */
export async function gravarSessaoDoSensor(
  userId: string,
  sessao: SessaoDoSensor
): Promise<LinhaDoRegistro | null> {
  const repouso =
    sessao.fcRepousoEstimada === null
      ? null
      : Math.round(sessao.fcRepousoEstimada);
  await executeStatement(
    `INSERT INTO daily_metrics (
        id, user_id, date, resting_heart_rate_min, resting_heart_rate_max,
        sensor_heart_rate_avg, sensor_minutes, resting_heart_rate, hrv_ms,
        metrics_updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())
      AS novo
      ON DUPLICATE KEY UPDATE
        resting_heart_rate_min = LEAST(
          COALESCE(daily_metrics.resting_heart_rate_min, novo.resting_heart_rate_min),
          novo.resting_heart_rate_min
        ),
        resting_heart_rate_max = GREATEST(
          COALESCE(daily_metrics.resting_heart_rate_max, novo.resting_heart_rate_max),
          novo.resting_heart_rate_max
        ),
        sensor_heart_rate_avg = ROUND(
          (
            COALESCE(daily_metrics.sensor_heart_rate_avg, 0) * COALESCE(daily_metrics.sensor_minutes, 0)
            + novo.sensor_heart_rate_avg * novo.sensor_minutes
          ) / (COALESCE(daily_metrics.sensor_minutes, 0) + novo.sensor_minutes),
          1
        ),
        sensor_minutes = COALESCE(daily_metrics.sensor_minutes, 0) + novo.sensor_minutes,
        resting_heart_rate = CASE
          WHEN novo.resting_heart_rate IS NULL THEN daily_metrics.resting_heart_rate
          WHEN daily_metrics.resting_heart_rate IS NULL THEN novo.resting_heart_rate
          ELSE LEAST(daily_metrics.resting_heart_rate, novo.resting_heart_rate)
        END,
        hrv_ms = COALESCE(novo.hrv_ms, daily_metrics.hrv_ms),
        metrics_updated_at = novo.metrics_updated_at`,
    [
      randomUUID(),
      userId,
      sessao.data,
      Math.round(sessao.fcMinima),
      Math.round(sessao.fcMaxima),
      Math.round(sessao.fcMedia * 10) / 10,
      Math.round(sessao.minutos * 10) / 10,
      repouso,
      sessao.rmssd === null ? null : Math.round(sessao.rmssd * 10) / 10,
    ]
  );
  await recalcularEscoresDesde(userId, sessao.data);

  return lerRegistroDoDia(userId, sessao.data);
}
