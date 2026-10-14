import { describe, expect, it } from 'vitest';

import { metricasMedidas } from '@/lib/ai/score-engine';
import type { SinaisDaProntidao } from '@/lib/coach/prontidao';

import { escoresDoDia } from './escores-do-dia';

const VAZIO: SinaisDaProntidao = {
  sleep_duration_minutes: null,
  hrv_ms: null,
  resting_heart_rate: null,
  energy_level: null,
  mood_score: null,
  stress_score: null,
};

describe('escores do dia gravados', () => {
  it('sem sinais suficientes ficam nulos', () => {
    expect(escoresDoDia(VAZIO, [])).toEqual({
      readiness: null,
      recovery: null,
    });
    expect(escoresDoDia({ ...VAZIO, energy_level: 4 }, [])).toEqual({
      readiness: null,
      recovery: null,
    });
  });

  it('recuperação usa só os sinais fisiológicos; prontidão, também o check-in', () => {
    const dia = { ...VAZIO, energy_level: 5, mood_score: 5, stress_score: 0 };
    // Só sinais subjetivos: há prontidão, mas não há recuperação.
    expect(escoresDoDia(dia, [])).toEqual({ readiness: 100, recovery: null });

    const completo = {
      ...dia,
      sleep_duration_minutes: 480,
      hrv_ms: 30,
      resting_heart_rate: 60,
    };
    const historico = Array.from({ length: 4 }, () => ({
      ...VAZIO,
      hrv_ms: 30,
      resting_heart_rate: 60,
    }));
    // Sono 100, VFC e FC na média pessoal (85 cada):
    // (100×0,30 + 85×0,25 + 85×0,15) / 0,70 = 91,4.
    expect(escoresDoDia(completo, historico).recovery).toBe(91);
    expect(escoresDoDia(completo, historico).readiness).toBe(94);
  });

  it('cobertura do escore de longevidade conta só o que foi medido', () => {
    expect(metricasMedidas(null)).toEqual([]);
    expect(
      metricasMedidas({
        steps: 4200,
        hrv_ms: null,
        water_liters: '',
        vo2_max: 41,
      })
    ).toEqual(['steps', 'vo2_max']);
  });
});
