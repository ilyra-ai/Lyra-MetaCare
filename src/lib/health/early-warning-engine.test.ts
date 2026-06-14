import { describe, it, expect } from 'vitest';

import {
  evaluateEarlyWarning,
  type EarlyWarningMetric,
} from './early-warning-engine';

const stableBaseline: EarlyWarningMetric[] = Array.from({ length: 7 }, () => ({
  hrv_ms: 60,
  resting_heart_rate: 55,
  body_temperature_celsius: 36.5,
  spo2_average: 97,
  respiratory_rate: 14,
  sleep_duration_minutes: 460,
}));

describe('evaluateEarlyWarning', () => {
  it('não emite sinais sem linha de base suficiente', () => {
    const result = evaluateEarlyWarning(
      { hrv_ms: 30, resting_heart_rate: 70 },
      [{ hrv_ms: 60 }]
    );
    expect(result.hasBaseline).toBe(false);
    expect(result.signals).toHaveLength(0);
    expect(result.overall).toBe('estavel');
  });

  it('mantém estável quando hoje está alinhado à linha de base', () => {
    const result = evaluateEarlyWarning(
      {
        hrv_ms: 59,
        resting_heart_rate: 55,
        body_temperature_celsius: 36.5,
        spo2_average: 97,
        respiratory_rate: 14,
        sleep_duration_minutes: 455,
      },
      stableBaseline
    );
    expect(result.overall).toBe('estavel');
    expect(result.signals).toHaveLength(0);
  });

  it('detecta possível resposta imunológica precoce (FC↑ + HRV↓ + temp↑)', () => {
    const result = evaluateEarlyWarning(
      {
        hrv_ms: 44,
        resting_heart_rate: 62,
        body_temperature_celsius: 37.1,
        spo2_average: 96,
        respiratory_rate: 15,
        sleep_duration_minutes: 450,
      },
      stableBaseline
    );
    const signal = result.signals.find((s) => s.key === 'immune_response');
    expect(signal).toBeDefined();
    expect(signal?.action).toBe('desacelere');
    expect(signal?.contributors.length).toBeGreaterThanOrEqual(2);
    expect(result.overall).toBe('atencao');
  });

  it('detecta queda de oxigenação com recomendação de procurar orientação', () => {
    const result = evaluateEarlyWarning(
      {
        hrv_ms: 58,
        resting_heart_rate: 56,
        body_temperature_celsius: 36.5,
        spo2_average: 91,
        respiratory_rate: 15,
        sleep_duration_minutes: 455,
      },
      stableBaseline
    );
    const signal = result.signals.find((s) => s.key === 'respiratory');
    expect(signal).toBeDefined();
    expect(signal?.action).toBe('procure_orientacao');
    expect(signal?.severity).toBe('alerta');
  });

  it('detecta privação aguda de sono', () => {
    const result = evaluateEarlyWarning(
      {
        hrv_ms: 58,
        resting_heart_rate: 56,
        body_temperature_celsius: 36.5,
        spo2_average: 97,
        respiratory_rate: 14,
        sleep_duration_minutes: 280,
      },
      stableBaseline
    );
    const signal = result.signals.find((s) => s.key === 'sleep_debt');
    expect(signal).toBeDefined();
    expect(signal?.action).toBe('recupere_sono');
  });
});
