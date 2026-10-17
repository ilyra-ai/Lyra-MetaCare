type NumericLike = number | null | undefined;

export interface MetricSnapshot {
  [key: string]: string | number | null | undefined;
}

interface AIConfigSnapshot {
  weight_hrv: number;
  weight_sleep: number;
  weight_activity: number;
  weight_nutrition: number;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

// Métrica ausente (null, undefined, texto vazio ou não numérico) fica null e
// recebe a pontuação neutra (50). Antes, `Number(valor ?? null)` convertia a
// ausência em 0 e a tratava como o pior resultado possível.
function metricValue(value: string | number | null | undefined): NumericLike {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function scoreRange(
  value: NumericLike,
  optimalMin: number,
  optimalMax: number,
  hardMin: number,
  hardMax: number
) {
  if (value === null || value === undefined) {
    return 50;
  }
  if (value >= optimalMin && value <= optimalMax) {
    return 100;
  }
  if (value < optimalMin) {
    return clamp(((value - hardMin) / (optimalMin - hardMin)) * 100);
  }
  return clamp(((hardMax - value) / (hardMax - optimalMax)) * 100);
}

function scoreMaximum(
  value: NumericLike,
  optimalMax: number,
  hardMin: number,
  hardMax: number
) {
  if (value === null || value === undefined) {
    return 50;
  }
  if (value <= optimalMax) {
    return 100;
  }
  return clamp(((hardMax - value) / (hardMax - optimalMax)) * 100);
}

function normalizeConfig(config?: Partial<AIConfigSnapshot>): AIConfigSnapshot {
  return {
    weight_hrv: Number(config?.weight_hrv ?? 30),
    weight_sleep: Number(config?.weight_sleep ?? 30),
    weight_activity: Number(config?.weight_activity ?? 25),
    weight_nutrition: Number(config?.weight_nutrition ?? 15),
  };
}

/** Métricas que entram no escore de longevidade. */
export const METRICAS_DO_ESCORE = [
  'hrv_ms',
  'sleep_duration_minutes',
  'deep_sleep_minutes',
  'resting_heart_rate',
  'active_minutes',
  'steps',
  'vo2_max',
  'sedentary_hours',
  'protein_g_per_kg',
  'water_liters',
  'blood_glucose_mgdl',
  'sodium_potassium_ratio',
  'stress_score',
] as const;

/**
 * Mínimo de métricas medidas para exibir o escore de longevidade: com menos,
 * o resultado seria quase todo feito de valores neutros (50) e não diria nada
 * sobre a pessoa.
 */
export const COBERTURA_MINIMA_DO_ESCORE = 3;

/** Resposta de `POST /api/functions/calculate-longevity-score`. */
export interface EscoresDoDia {
  data: string;
  /** Prontidão gravada no registro do dia (null sem sinais suficientes). */
  readinessScore: number | null;
  recoveryScore: number | null;
  /** 0 a 10; null sem registro ou com menos de 3 métricas do escore. */
  longevityScore: number | null;
  cobertura: number;
  totalDeMetricas: number;
}

/** Quais métricas do escore foram de fato medidas no registro. */
export function metricasMedidas(metrics: MetricSnapshot | null) {
  if (!metrics) return [];
  return METRICAS_DO_ESCORE.filter(
    (coluna) => metricValue(metrics[coluna]) !== null
  );
}

export function calculateLongevityScores(
  metrics: MetricSnapshot | null,
  config?: Partial<AIConfigSnapshot>
) {
  if (!metrics) {
    return {
      longevityScore: 5,
      readinessScore: 50,
    };
  }

  const weights = normalizeConfig(config);

  const valor = (coluna: string) => metricValue(metrics[coluna]);
  const hrvScore = scoreRange(valor('hrv_ms'), 45, 90, 15, 120);

  const recoveryBlock =
    hrvScore * 0.45 +
    scoreRange(valor('sleep_duration_minutes'), 420, 540, 240, 660) * 0.3 +
    scoreRange(valor('deep_sleep_minutes'), 90, 160, 20, 220) * 0.15 +
    scoreMaximum(valor('resting_heart_rate'), 62, 40, 95) * 0.1;

  const activityBlock =
    scoreRange(valor('active_minutes'), 35, 90, 0, 180) * 0.35 +
    scoreRange(valor('steps'), 7000, 14000, 0, 22000) * 0.35 +
    scoreRange(valor('vo2_max'), 35, 60, 15, 70) * 0.15 +
    scoreMaximum(valor('sedentary_hours'), 8, 0, 16) * 0.15;

  const nutritionBlock =
    scoreRange(valor('protein_g_per_kg'), 1.2, 2.0, 0.2, 3.0) * 0.35 +
    scoreRange(valor('water_liters'), 2.0, 3.5, 0.5, 5.0) * 0.25 +
    scoreMaximum(valor('blood_glucose_mgdl'), 99, 60, 220) * 0.25 +
    scoreMaximum(valor('sodium_potassium_ratio'), 2.0, 0.2, 6.0) * 0.15;

  // Pesos 0,5 + 0,3 + 0,2 + 0,1 somam 1,1: a soma é normalizada para que o
  // resultado fique na escala 0–100 (antes, valores ótimos passavam de 100 e
  // eram cortados, e a ausência total de dados dava 55 em vez do neutro 50).
  const readinessScore = clamp(
    (recoveryBlock * 0.5 +
      activityBlock * 0.3 +
      nutritionBlock * 0.2 +
      scoreMaximum(valor('stress_score'), 35, 0, 100) * 0.1) /
      1.1
  );

  const totalWeight =
    weights.weight_sleep +
    weights.weight_hrv +
    weights.weight_activity +
    weights.weight_nutrition;
  // Pesos configurados pelo administrador são proporções: a soma não precisa
  // ser exatamente 100.
  const weightedComposite =
    totalWeight > 0
      ? (recoveryBlock * weights.weight_sleep +
          hrvScore * weights.weight_hrv +
          activityBlock * weights.weight_activity +
          nutritionBlock * weights.weight_nutrition) /
        totalWeight
      : 50;

  return {
    longevityScore: Number((clamp(weightedComposite) / 10).toFixed(1)),
    readinessScore: Number(readinessScore.toFixed(0)),
  };
}
