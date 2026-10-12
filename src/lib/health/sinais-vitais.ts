/**
 * Sinais vitais do dia usados pelo painel e pelo plano de IA. Vêm do que foi
 * gravado no banco (registro do dia e pulseira) e, enquanto a pulseira está
 * conectada, das leituras ao vivo por Bluetooth.
 *
 * A integração nativa com Apple Saúde (HealthKit) e Health Connect foi
 * desativada (tarefa 39): ela só funciona dentro de um app de celular, que o
 * projeto não tem.
 */
export interface HealthDataMetrics {
  heartRate: number | null;
  hrv_ms?: number | null;
  sleepDurationMinutes: number | null;
  bloodGlucoseMgDl: number | null;
  weightKg: number | null;
  moodScore: number | null;
}

/** Colunas de `daily_metrics` lidas para montar os sinais do dia. */
export const COLUNAS_DOS_SINAIS_DO_DIA =
  'date, resting_heart_rate, hrv_ms, sleep_duration_minutes, blood_glucose_mgdl, weight_kg, mood_score';

export interface RegistroDosSinaisDoDia {
  date: string;
  resting_heart_rate: number | string | null;
  hrv_ms: number | string | null;
  sleep_duration_minutes: number | string | null;
  blood_glucose_mgdl: number | string | null;
  weight_kg: number | string | null;
  mood_score: number | string | null;
}

// O MySQL devolve DECIMAL como texto; valores vazios ou inválidos viram null.
function numeroOuNulo(valor: number | string | null): number | null {
  if (valor === null) return null;
  const numero = typeof valor === 'number' ? valor : Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

/** Converte o registro gravado do dia nos sinais usados pelo app. */
export function sinaisDoRegistro(
  registro: RegistroDosSinaisDoDia | null
): HealthDataMetrics | null {
  if (!registro) return null;
  return {
    heartRate: numeroOuNulo(registro.resting_heart_rate),
    hrv_ms: numeroOuNulo(registro.hrv_ms),
    sleepDurationMinutes: numeroOuNulo(registro.sleep_duration_minutes),
    bloodGlucoseMgDl: numeroOuNulo(registro.blood_glucose_mgdl),
    weightKg: numeroOuNulo(registro.weight_kg),
    moodScore: numeroOuNulo(registro.mood_score),
  };
}

/**
 * Combina os sinais gravados com as leituras ao vivo da pulseira: a
 * frequência cardíaca e a VFC ao vivo prevalecem enquanto existem.
 */
export function combinarSinais(
  gravados: HealthDataMetrics | null,
  aoVivo: { heartRate: number | null; hrv: number | null }
): HealthDataMetrics | null {
  if (aoVivo.heartRate === null && aoVivo.hrv === null) {
    return gravados;
  }
  const base: HealthDataMetrics = gravados ?? {
    heartRate: null,
    hrv_ms: null,
    sleepDurationMinutes: null,
    bloodGlucoseMgDl: null,
    weightKg: null,
    moodScore: null,
  };
  return {
    ...base,
    heartRate: aoVivo.heartRate ?? base.heartRate,
    hrv_ms: aoVivo.hrv ?? base.hrv_ms ?? null,
  };
}
