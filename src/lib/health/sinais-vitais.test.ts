import { describe, expect, it } from 'vitest';

import { combinarSinais, sinaisDoRegistro } from './sinais-vitais';

describe('sinais do dia', () => {
  it('converte o registro gravado (DECIMAL chega como texto)', () => {
    expect(
      sinaisDoRegistro({
        date: '2026-10-12',
        resting_heart_rate: 58,
        hrv_ms: '62.50',
        sleep_duration_minutes: 431,
        blood_glucose_mgdl: null,
        weight_kg: '71.30',
        mood_score: 7,
      })
    ).toEqual({
      heartRate: 58,
      hrv_ms: 62.5,
      sleepDurationMinutes: 431,
      bloodGlucoseMgDl: null,
      weightKg: 71.3,
      moodScore: 7,
    });
  });

  it('sem registro no dia não inventa sinais', () => {
    expect(sinaisDoRegistro(null)).toBeNull();
    expect(combinarSinais(null, { heartRate: null, hrv: null })).toBeNull();
  });

  it('a leitura ao vivo da pulseira prevalece sobre a gravada', () => {
    const gravados = sinaisDoRegistro({
      date: '2026-10-12',
      resting_heart_rate: 58,
      hrv_ms: 60,
      sleep_duration_minutes: 420,
      blood_glucose_mgdl: 92,
      weight_kg: 70,
      mood_score: 8,
    });
    expect(combinarSinais(gravados, { heartRate: 74, hrv: 41 })).toEqual({
      heartRate: 74,
      hrv_ms: 41,
      sleepDurationMinutes: 420,
      bloodGlucoseMgDl: 92,
      weightKg: 70,
      moodScore: 8,
    });
    expect(combinarSinais(null, { heartRate: 80, hrv: null })).toEqual({
      heartRate: 80,
      hrv_ms: null,
      sleepDurationMinutes: null,
      bloodGlucoseMgDl: null,
      weightKg: null,
      moodScore: null,
    });
  });
});
