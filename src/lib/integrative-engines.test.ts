import { describe, expect, it } from 'vitest';

import { getAstrologicalContext } from '@/lib/astrology/engine';
import { calculateDynamicDosha } from '@/lib/ayurveda/dosha-engine';
import { calculateChakraAlignment } from '@/lib/chakra/alignment-engine';
import { calculatePranicIndex } from '@/lib/prana/prana-engine';
import { calculateQuantumCoherence } from '@/lib/quantum/coherence-engine';
import { calculateKoshas } from '@/lib/vedanta/kosha-engine';

// Os motores integrativos (prana, chakras, doshas, coerência e koshas) são
// heurísticos: os testes verificam as propriedades que a interface promete —
// escalas, coerência entre índice e nível, resposta a dados melhores e
// tolerância a dados ausentes — e não números mágicos.

const OTIMO = {
  spo2_average: 98,
  respiratory_rate: 12,
  meditation_minutes: 25,
  dietary_fiber_grams: 35,
  water_liters: 2.8,
  hydration_ml_per_kg: 38,
  blood_glucose_mgdl: 86,
  body_temperature_celsius: 36.6,
  eating_window_hours: 9,
  mood_score: 9,
  cognitive_test_score: 92,
  reaction_time_pvt_ms: 230,
  hrv_ms: 75,
  resting_heart_rate: 52,
  steps: 11000,
  active_minutes: 60,
  vo2_max: 50,
  weight_kg: 68,
  sedentary_hours: 5,
  deep_sleep_minutes: 110,
  rem_sleep_minutes: 110,
  sleep_duration_minutes: 480,
  sleep_regularity_index: 90,
  stress_score: 15,
  hrv_stress_index: 10,
};

const RUIM: typeof OTIMO = {
  spo2_average: 89,
  respiratory_rate: 24,
  meditation_minutes: 0,
  dietary_fiber_grams: 4,
  water_liters: 0.6,
  hydration_ml_per_kg: 10,
  blood_glucose_mgdl: 190,
  body_temperature_celsius: 38.2,
  eating_window_hours: 17,
  mood_score: 2,
  cognitive_test_score: 35,
  reaction_time_pvt_ms: 520,
  hrv_ms: 14,
  resting_heart_rate: 96,
  steps: 900,
  active_minutes: 0,
  vo2_max: 18,
  weight_kg: 68,
  sedentary_hours: 15,
  deep_sleep_minutes: 15,
  rem_sleep_minutes: 20,
  sleep_duration_minutes: 250,
  sleep_regularity_index: 30,
  stress_score: 92,
  hrv_stress_index: 90,
};

const AUSENTE = Object.fromEntries(
  Object.keys(OTIMO).map((chave) => [chave, null])
) as { [K in keyof typeof OTIMO]: null };

const LUA_CRESCENTE = {
  ...getAstrologicalContext(new Date('2026-10-06T12:00:00Z')),
  moonPhase: 0.3,
};
const LUA_MINGUANTE = { ...LUA_CRESCENTE, moonPhase: 0.8 };

function naEscala(valor: number) {
  expect(Number.isFinite(valor)).toBe(true);
  expect(valor).toBeGreaterThanOrEqual(0);
  expect(valor).toBeLessThanOrEqual(100);
}

describe('índice pránico', () => {
  it('fica em 0–100, com nível coerente com o índice', () => {
    for (const metricas of [OTIMO, RUIM, AUSENTE]) {
      const resultado = calculatePranicIndex(metricas);
      naEscala(resultado.index);
      resultado.vayus.forEach((vayu) => naEscala(vayu.score));
      const esperado =
        resultado.index <= 30
          ? 'desvitalizado'
          : resultado.index <= 55
            ? 'em recuperação'
            : resultado.index <= 80
              ? 'vital'
              : 'radiante';
      expect(resultado.level).toBe(esperado);
    }
  });

  it('dados melhores elevam o índice', () => {
    expect(calculatePranicIndex(OTIMO).index).toBeGreaterThan(
      calculatePranicIndex(RUIM).index
    );
  });

  it('a Lua crescente soma até 5 pontos; a minguante não', () => {
    const base = calculatePranicIndex(RUIM).index;
    expect(calculatePranicIndex(RUIM, LUA_CRESCENTE).index).toBe(
      Math.min(100, base + 5)
    );
    expect(calculatePranicIndex(RUIM, LUA_MINGUANTE).index).toBe(base);
    expect(calculatePranicIndex(RUIM, LUA_MINGUANTE).lunarInfluence).toMatch(
      /Minguante/
    );
    expect(calculatePranicIndex(RUIM).lunarInfluence).toBeNull();
  });

  it('recomenda o Vayu mais fraco', () => {
    const resultado = calculatePranicIndex(RUIM);
    const maisFraco = [...resultado.vayus].sort((a, b) => a.score - b.score)[0];
    expect(resultado.recommendation).toContain(maisFraco.label);
  });
});

describe('alinhamento dos chakras', () => {
  it('avalia os 7 chakras em 0–100 com status válido', () => {
    for (const metricas of [OTIMO, RUIM, AUSENTE]) {
      const resultado = calculateChakraAlignment(metricas);
      expect(resultado.chakras).toHaveLength(7);
      naEscala(resultado.overallScore);
      for (const chakra of resultado.chakras) {
        naEscala(chakra.score);
        expect([
          'bloqueado',
          'subativo',
          'equilibrado',
          'hiperativo',
        ]).toContain(chakra.status);
      }
    }
  });

  it('dados melhores elevam o alinhamento geral', () => {
    expect(calculateChakraAlignment(OTIMO).overallScore).toBeGreaterThan(
      calculateChakraAlignment(RUIM).overallScore
    );
  });
});

describe('doshas dinâmicos', () => {
  it('percentuais somam 100 e o dominante é o de maior escore', () => {
    for (const metricas of [OTIMO, RUIM, AUSENTE]) {
      const resultado = calculateDynamicDosha(metricas);
      const { vata, pitta, kapha } = resultado.percentages;
      expect(vata + pitta + kapha).toBe(100);
      [vata, pitta, kapha].forEach((parcela) =>
        expect(Number.isInteger(parcela)).toBe(true)
      );
      Object.values(resultado.scores).forEach(naEscala);
      const maior = (
        Object.entries(resultado.scores) as [
          'vata' | 'pitta' | 'kapha',
          number,
        ][]
      ).sort((a, b) => b[1] - a[1])[0][0];
      expect(resultado.scores[resultado.dominant]).toBe(
        resultado.scores[maior]
      );
    }
  });

  it('febre, glicose alta e estresse elevam Pitta', () => {
    const calmo = calculateDynamicDosha({
      ...AUSENTE,
      body_temperature_celsius: 36.4,
      stress_score: 15,
      blood_glucose_mgdl: 85,
    });
    const inflamado = calculateDynamicDosha({
      ...AUSENTE,
      body_temperature_celsius: 38.3,
      stress_score: 90,
      blood_glucose_mgdl: 180,
    });
    expect(inflamado.scores.pitta).toBeGreaterThan(calmo.scores.pitta);
  });

  it('só traz influência astrológica quando há contexto', () => {
    expect(calculateDynamicDosha(OTIMO).astroInfluence).toBeNull();
    expect(calculateDynamicDosha(OTIMO, LUA_CRESCENTE).astroInfluence).toEqual(
      expect.any(String)
    );
  });
});

describe('coerência quântica', () => {
  it('fica em 0–100, com componentes na mesma escala e nível coerente', () => {
    for (const metricas of [OTIMO, RUIM, AUSENTE]) {
      const resultado = calculateQuantumCoherence(metricas, LUA_CRESCENTE);
      naEscala(resultado.index);
      Object.values(resultado.components).forEach(naEscala);
      expect([
        'dissonância',
        'transição',
        'harmonia',
        'coerência plena',
      ]).toContain(resultado.level);
    }
  });

  it('dados melhores elevam a coerência', () => {
    expect(calculateQuantumCoherence(OTIMO).index).toBeGreaterThan(
      calculateQuantumCoherence(RUIM).index
    );
  });
});

describe('koshas', () => {
  it('avalia as 5 camadas em 0–100', () => {
    for (const metricas of [OTIMO, RUIM, AUSENTE]) {
      const resultado = calculateKoshas(metricas, LUA_CRESCENTE);
      expect(resultado.koshas.map((kosha) => kosha.name)).toEqual([
        'Annamaya',
        'Pranamaya',
        'Manomaya',
        'Vijnanamaya',
        'Anandamaya',
      ]);
      resultado.koshas.forEach((kosha) => naEscala(kosha.score));
      naEscala(resultado.overallScore);
    }
  });

  it('dados melhores elevam o escore geral; ausência fica no neutro', () => {
    const otimo = calculateKoshas(OTIMO).overallScore;
    const ruim = calculateKoshas(RUIM).overallScore;
    const ausente = calculateKoshas(AUSENTE).overallScore;
    expect(otimo).toBeGreaterThan(ausente);
    expect(ausente).toBeGreaterThan(ruim);
  });
});
