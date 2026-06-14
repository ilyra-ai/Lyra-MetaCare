import { describe, it, expect } from 'vitest';

import { calculateBiologicalAge } from './biological-age-engine';

describe('calculateBiologicalAge', () => {
  it('retorna idade biológica próxima da cronológica e confiança baixa sem biomarcadores', () => {
    const result = calculateBiologicalAge({ chronologicalAge: 40 });
    expect(result.chronologicalAge).toBe(40);
    expect(result.biologicalAge).toBe(40);
    expect(result.ageDelta).toBe(0);
    expect(result.confidence).toBe('baixa');
    expect(result.availableMarkers).toBe(0);
  });

  it('rejuvenesce um perfil metabolicamente saudável (delta negativo)', () => {
    const result = calculateBiologicalAge({
      chronologicalAge: 45,
      hrv_ms: 80,
      vo2_max: 52,
      resting_heart_rate: 52,
      sleep_duration_minutes: 480,
      sleep_efficiency: 93,
      blood_glucose_mgdl: 85,
      spo2_average: 97,
      active_minutes: 60,
      bmi: 22,
    });
    expect(result.ageDelta).toBeLessThan(0);
    expect(result.biologicalAge).toBeLessThan(45);
    expect(result.paceOfAging).toBeLessThan(1);
    expect(result.vitalityScore).toBeGreaterThan(60);
    expect(result.confidence).toBe('alta');
  });

  it('envelhece um perfil debilitado (delta positivo)', () => {
    const result = calculateBiologicalAge({
      chronologicalAge: 45,
      hrv_ms: 18,
      vo2_max: 24,
      resting_heart_rate: 84,
      sleep_duration_minutes: 320,
      sleep_efficiency: 68,
      blood_glucose_mgdl: 145,
      spo2_average: 91,
      active_minutes: 4,
      bmi: 33,
    });
    expect(result.ageDelta).toBeGreaterThan(0);
    expect(result.biologicalAge).toBeGreaterThan(45);
    expect(result.paceOfAging).toBeGreaterThan(1);
    expect(result.vitalityScore).toBeLessThan(45);
  });

  it('mantém a idade biológica dentro de limites plausíveis', () => {
    const result = calculateBiologicalAge({
      chronologicalAge: 30,
      hrv_ms: 5,
      vo2_max: 10,
      resting_heart_rate: 120,
      sleep_duration_minutes: 120,
      blood_glucose_mgdl: 260,
      bmi: 45,
    });
    expect(result.biologicalAge).toBeLessThanOrEqual(50);
    expect(result.biologicalAge).toBeGreaterThanOrEqual(15);
  });

  it('ordena os drivers do mais protetor ao mais prejudicial', () => {
    const result = calculateBiologicalAge({
      chronologicalAge: 50,
      hrv_ms: 80,
      resting_heart_rate: 88,
    });
    expect(result.drivers[0].impactYears).toBeLessThanOrEqual(
      result.drivers[result.drivers.length - 1].impactYears
    );
  });
});
