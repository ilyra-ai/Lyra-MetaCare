import { describe, expect, it } from 'vitest';

import { NUMERIC_METRIC_COLUMNS } from '@/lib/mysql/table-config';

import {
  calculateLongevityScores,
  extractMetricCompleteness,
  type MetricSnapshot,
} from './score-engine';

// Dia com todas as métricas dentro das faixas ótimas do motor.
const DIA_OTIMO: MetricSnapshot = {
  hrv_ms: 70,
  sleep_duration_minutes: 480,
  deep_sleep_minutes: 120,
  resting_heart_rate: 55,
  active_minutes: 60,
  steps: 10000,
  vo2_max: 48,
  sedentary_hours: 6,
  protein_g_per_kg: 1.6,
  water_liters: 2.5,
  blood_glucose_mgdl: 88,
  sodium_potassium_ratio: 1.2,
  stress_score: 20,
};

// Dia com todas as métricas nos limites ruins.
const DIA_RUIM: MetricSnapshot = {
  hrv_ms: 15,
  sleep_duration_minutes: 240,
  deep_sleep_minutes: 20,
  resting_heart_rate: 95,
  active_minutes: 0,
  steps: 0,
  vo2_max: 15,
  sedentary_hours: 16,
  protein_g_per_kg: 0.2,
  water_liters: 0.5,
  blood_glucose_mgdl: 220,
  sodium_potassium_ratio: 6,
  stress_score: 100,
};

describe('calculateLongevityScores', () => {
  it('dia ótimo atinge o topo das duas escalas', () => {
    expect(calculateLongevityScores(DIA_OTIMO)).toEqual({
      longevityScore: 10,
      readinessScore: 100,
    });
  });

  it('dia nos limites ruins vai ao piso das duas escalas', () => {
    expect(calculateLongevityScores(DIA_RUIM)).toEqual({
      longevityScore: 0,
      readinessScore: 0,
    });
  });

  it('métricas ausentes são neutras, coerente com a ausência de registro', () => {
    const semRegistro = calculateLongevityScores(null);
    expect(semRegistro).toEqual({ longevityScore: 5, readinessScore: 50 });
    expect(calculateLongevityScores({})).toEqual(semRegistro);
    expect(
      calculateLongevityScores({ hrv_ms: null, steps: undefined, vo2_max: '' })
    ).toEqual(semRegistro);
  });

  it('melhorar uma métrica nunca piora o resultado', () => {
    const base = { ...DIA_RUIM };
    let anterior = calculateLongevityScores(base);
    for (const [coluna, valor] of Object.entries(DIA_OTIMO)) {
      base[coluna] = valor;
      const atual = calculateLongevityScores(base);
      expect(atual.longevityScore).toBeGreaterThanOrEqual(
        anterior.longevityScore
      );
      expect(atual.readinessScore).toBeGreaterThanOrEqual(
        anterior.readinessScore
      );
      anterior = atual;
    }
  });

  it('valores fora de faixa ficam limitados a 0–10 e 0–100', () => {
    const extremo = calculateLongevityScores({
      hrv_ms: 5000,
      steps: -10,
      resting_heart_rate: 300,
      blood_glucose_mgdl: 1000,
    });
    expect(extremo.longevityScore).toBeGreaterThanOrEqual(0);
    expect(extremo.longevityScore).toBeLessThanOrEqual(10);
    expect(extremo.readinessScore).toBeGreaterThanOrEqual(0);
    expect(extremo.readinessScore).toBeLessThanOrEqual(100);
  });

  it('os pesos da configuração são proporções', () => {
    // Somente HRV ótima; o resto ausente (neutro 50).
    const soHrv: MetricSnapshot = { hrv_ms: 70 };
    const pesoTotalEmHrv = calculateLongevityScores(soHrv, {
      weight_hrv: 1,
      weight_sleep: 0,
      weight_activity: 0,
      weight_nutrition: 0,
    });
    expect(pesoTotalEmHrv.longevityScore).toBe(10);

    // Mesma proporção em outra escala dá o mesmo resultado.
    const proporcional = calculateLongevityScores(DIA_OTIMO, {
      weight_hrv: 60,
      weight_sleep: 60,
      weight_activity: 50,
      weight_nutrition: 30,
    });
    expect(proporcional).toEqual(calculateLongevityScores(DIA_OTIMO));
  });
});

describe('extractMetricCompleteness', () => {
  it('não conta nulos como preenchidos', () => {
    const resultado = extractMetricCompleteness([
      { hrv_ms: 50 },
      { hrv_ms: null },
      { hrv_ms: 70 },
      {},
    ]);
    const hrv = resultado.find((linha) => linha.metric_name === 'hrv_ms');
    expect(hrv).toEqual({
      metric_name: 'hrv_ms',
      fill_rate: 50,
      avg_value: 60,
      min_value: 50,
      max_value: 70,
    });
  });

  it('cobre todas as colunas numéricas e lida com lista vazia', () => {
    const resultado = extractMetricCompleteness([]);
    expect(resultado.map((linha) => linha.metric_name)).toEqual(
      NUMERIC_METRIC_COLUMNS
    );
    expect(resultado.every((linha) => linha.fill_rate === 0)).toBe(true);
    expect(resultado.every((linha) => linha.avg_value === null)).toBe(true);
  });
});
