import { NUMERIC_METRIC_COLUMNS } from '@/lib/mysql/table-config';

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
  return clamp(((hardMax - value) / (hardMax - optimalMax)) * 100, 0, hardMax);
}

function normalizeConfig(config?: Partial<AIConfigSnapshot>): AIConfigSnapshot {
  return {
    weight_hrv: Number(config?.weight_hrv ?? 30),
    weight_sleep: Number(config?.weight_sleep ?? 30),
    weight_activity: Number(config?.weight_activity ?? 25),
    weight_nutrition: Number(config?.weight_nutrition ?? 15),
  };
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

  const recoveryBlock =
    scoreRange(Number(metrics.hrv_ms ?? null), 45, 90, 15, 120) * 0.45 +
    scoreRange(
      Number(metrics.sleep_duration_minutes ?? null),
      420,
      540,
      240,
      660
    ) *
      0.3 +
    scoreRange(Number(metrics.deep_sleep_minutes ?? null), 90, 160, 20, 220) *
      0.15 +
    scoreMaximum(Number(metrics.resting_heart_rate ?? null), 62, 40, 95) * 0.1;

  const activityBlock =
    scoreRange(Number(metrics.active_minutes ?? null), 35, 90, 0, 180) * 0.35 +
    scoreRange(Number(metrics.steps ?? null), 7000, 14000, 0, 22000) * 0.35 +
    scoreRange(Number(metrics.vo2_max ?? null), 35, 60, 15, 70) * 0.15 +
    scoreMaximum(Number(metrics.sedentary_hours ?? null), 8, 0, 16) * 0.15;

  const nutritionBlock =
    scoreRange(Number(metrics.protein_g_per_kg ?? null), 1.2, 2.0, 0.2, 3.0) *
      0.35 +
    scoreRange(Number(metrics.water_liters ?? null), 2.0, 3.5, 0.5, 5.0) *
      0.25 +
    scoreMaximum(Number(metrics.blood_glucose_mgdl ?? null), 99, 60, 220) *
      0.25 +
    scoreMaximum(
      Number(metrics.sodium_potassium_ratio ?? null),
      2.0,
      0.2,
      6.0
    ) *
      0.15;

  const readinessScore = clamp(
    recoveryBlock * 0.5 +
      activityBlock * 0.3 +
      nutritionBlock * 0.2 +
      scoreMaximum(Number(metrics.stress_score ?? null), 35, 0, 100) * 0.1
  );

  const weightedComposite =
    recoveryBlock * (weights.weight_sleep / 100) +
    scoreRange(Number(metrics.hrv_ms ?? null), 45, 90, 15, 120) *
      (weights.weight_hrv / 100) +
    activityBlock * (weights.weight_activity / 100) +
    nutritionBlock * (weights.weight_nutrition / 100);

  return {
    longevityScore: Number((clamp(weightedComposite) / 10).toFixed(1)),
    readinessScore: Number(readinessScore.toFixed(0)),
  };
}

export function extractMetricCompleteness(metrics: MetricSnapshot[]) {
  return NUMERIC_METRIC_COLUMNS.map((metricName) => {
    const values = metrics
      .map((entry) => Number(entry[metricName as keyof MetricSnapshot]))
      .filter((value) => Number.isFinite(value));

    const fillRate =
      metrics.length === 0 ? 0 : (values.length / metrics.length) * 100;

    return {
      metric_name: metricName,
      fill_rate: fillRate,
      avg_value: values.length
        ? values.reduce((sum, value) => sum + value, 0) / values.length
        : null,
      min_value: values.length ? Math.min(...values) : null,
      max_value: values.length ? Math.max(...values) : null,
    };
  });
}
