import { randomUUID } from 'node:crypto';

import { limiteDeFrequencia } from '@/lib/health/limite-de-frequencia';
import { atualizarMetasESequencias } from '@/lib/metas/servico';
import { criarNotificacao } from '@/lib/notificacoes/servico';
import { executeStatement, queryRows } from '@/lib/mysql/pool';

import { recalcularEscoresDesde } from './escores-do-dia';

/**
 * O que a IA faz sozinha depois de cada gravação: prontidão e recuperação do
 * dia (e dos 7 seguintes), metas automáticas, prazos e sequências.
 */
async function depoisDeGravar(userId: string, data: string) {
  await recalcularEscoresDesde(userId, data);
  await atualizarMetasESequencias(userId);
}

/**
 * Sessão da pulseira com frequência máxima no limite pessoal (90% da FC
 * máxima estimada pela idade) vira aviso no sino, um por dia.
 */
async function avisarFrequenciaAlta(userId: string, sessao: SessaoDoSensor) {
  // Idade de hoje pela data de nascimento (tarefa 58): a coluna `age` só
  // vale sem data de nascimento, porque fica defasada a cada aniversário.
  const [perfil] = await queryRows<{ age: number | null }>(
    `SELECT COALESCE(TIMESTAMPDIFF(YEAR, birth_date, CURDATE()), age) AS age
       FROM profiles WHERE id = ? LIMIT 1`,
    [userId]
  );
  const limite = limiteDeFrequencia(perfil?.age ?? null);
  if (limite === null || sessao.fcMaxima < limite) return;
  await criarNotificacao({
    userId,
    tipo: 'coach_alerta',
    titulo: `Frequência cardíaca chegou a ${Math.round(sessao.fcMaxima)} bpm`,
    corpo: `Acima de ${limite} bpm, 90% da sua frequência máxima estimada. Se não estava treinando, observe como se sente e, se houver sintomas, procure orientação.`,
    link: '/monitoring',
    chave: `fc-alta:${sessao.data}`,
  });
}

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
  await depoisDeGravar(userId, registro.data);

  return lerRegistroDoDia(userId, registro.data);
}

/**
 * Minutos de uma prática guiada (respiração) somados à meditação do dia, sem
 * passar do máximo aceito no check-in (`CAMPOS_DO_REGISTRO.meditacao`). Cria
 * a linha do dia se ainda não existir e recalcula escores, metas e sequências
 * como qualquer outra gravação.
 */
export async function somarMinutosDeMeditacao(
  userId: string,
  data: string,
  minutos: number
): Promise<LinhaDoRegistro | null> {
  const maximo = CAMPOS_DO_REGISTRO.meditacao.maximo;
  await executeStatement(
    `INSERT INTO daily_metrics (id, user_id, date, meditation_minutes, metrics_updated_at)
     VALUES (?, ?, ?, LEAST(?, ?), UTC_TIMESTAMP())
     AS novo
     ON DUPLICATE KEY UPDATE
       meditation_minutes = LEAST(
         COALESCE(daily_metrics.meditation_minutes, 0) + novo.meditation_minutes,
         ?
       ),
       metrics_updated_at = novo.metrics_updated_at`,
    [randomUUID(), userId, data, minutos, maximo, maximo]
  );
  await depoisDeGravar(userId, data);
  return lerRegistroDoDia(userId, data);
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
  await depoisDeGravar(userId, sessao.data);
  await avisarFrequenciaAlta(userId, sessao);

  return lerRegistroDoDia(userId, sessao.data);
}
