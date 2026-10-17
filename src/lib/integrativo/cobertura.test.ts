import { describe, expect, it } from 'vitest';

import { resumoDoGrafico } from '@/lib/graficos/resumo';

import {
  avaliarCobertura,
  minimoDeSinais,
  SINAIS_DA_COERENCIA,
  sinaisQueFaltam,
} from './cobertura';

describe('cobertura dos índices integrativos (tarefa 57)', () => {
  it('mínimo de 3 sinais ou 30% do motor', () => {
    expect(minimoDeSinais(11)).toBe(4);
    expect(minimoDeSinais(5)).toBe(3);
    expect(minimoDeSinais(19)).toBe(6);
  });

  it('sem registro, nenhum sinal medido e índice insuficiente', () => {
    const cobertura = avaliarCobertura(null, SINAIS_DA_COERENCIA);
    expect(cobertura.medidos).toEqual([]);
    expect(cobertura.suficiente).toBe(false);
  });

  it('zero é medida; null, undefined e NaN não são', () => {
    const cobertura = avaliarCobertura(
      {
        hrv_ms: 48,
        meditation_minutes: 0,
        stress_score: Number.NaN,
        mood_score: undefined,
        sleep_duration_minutes: 420,
        resting_heart_rate: 60,
      },
      SINAIS_DA_COERENCIA
    );
    expect(cobertura.medidos).toEqual([
      'hrv_ms',
      'resting_heart_rate',
      'sleep_duration_minutes',
      'meditation_minutes',
    ]);
    expect(cobertura.suficiente).toBe(true);
    expect(sinaisQueFaltam(cobertura, 2)).toBe(
      'sono profundo, sono REM e mais 5'
    );
  });

  it('resumo do gráfico com faixa, último valor e lacunas', () => {
    expect(
      resumoDoGrafico('Prontidão', [
        {
          nome: 'Prontidão',
          valores: [null, 62, 70.5, null, 66],
          unidade: '/100',
        },
      ])
    ).toBe(
      'Prontidão. Prontidão: de 62/100 a 70,5/100, último 66/100; 2 de 5 dias sem dado.'
    );
  });
});
