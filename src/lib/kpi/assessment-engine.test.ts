import { describe, expect, it } from 'vitest';

import {
  calculateAdherenceScore,
  calculateWHO5Score,
  classifyNPS,
  type UserStreak,
} from './assessment-engine';

describe('WHO-5', () => {
  it('converte o escore bruto (0–25) em percentual (0–100)', () => {
    expect(calculateWHO5Score([0, 0, 0, 0, 0])).toMatchObject({
      rawScore: 0,
      percentageScore: 0,
    });
    expect(calculateWHO5Score([5, 5, 5, 5, 5])).toMatchObject({
      rawScore: 25,
      percentageScore: 100,
    });
    expect(calculateWHO5Score([4, 3, 5, 2, 4]).percentageScore).toBe(72);
  });

  it('classifica nas faixas do instrumento (bruto < 13 indica bem-estar baixo)', () => {
    // 12 → crítico; 13 → alerta; 17 → alerta; 18 → bom; 22 → bom; 23 → excelente
    expect(calculateWHO5Score([3, 3, 3, 3, 0]).status).toBe('crítico');
    expect(calculateWHO5Score([3, 3, 3, 3, 1]).status).toBe('alerta');
    expect(calculateWHO5Score([4, 4, 3, 3, 3]).status).toBe('alerta');
    expect(calculateWHO5Score([4, 4, 4, 3, 3]).status).toBe('bom');
    expect(calculateWHO5Score([5, 5, 4, 4, 4]).status).toBe('bom');
    expect(calculateWHO5Score([5, 5, 5, 4, 4]).status).toBe('excelente');
  });

  it('recusa quantidade ou valores fora da escala', () => {
    expect(() => calculateWHO5Score([1, 2, 3, 4])).toThrow(/5 respostas/);
    expect(() => calculateWHO5Score([1, 2, 3, 4, 6])).toThrow(/0 a 5/);
    expect(() => calculateWHO5Score([1, 2, 3, 4, -1])).toThrow(/0 a 5/);
    expect(() => calculateWHO5Score([1, 2, 3, 4, 2.5])).toThrow(/0 a 5/);
    expect(() => calculateWHO5Score([1, 2, 3, 4, Number.NaN])).toThrow(/0 a 5/);
  });
});

describe('NPS', () => {
  it('classifica detratores (0–6), neutros (7–8) e promotores (9–10)', () => {
    expect([0, 6].map(classifyNPS)).toEqual(['detrator', 'detrator']);
    expect([7, 8].map(classifyNPS)).toEqual(['neutro', 'neutro']);
    expect([9, 10].map(classifyNPS)).toEqual(['promotor', 'promotor']);
  });

  it('recusa notas fora da escala ou fracionárias', () => {
    for (const nota of [-1, 11, 6.5, Number.NaN]) {
      expect(() => classifyNPS(nota)).toThrow(/inteiro de 0 a 10/);
    }
  });
});

describe('aderência por streaks', () => {
  const streak = (tipo: string, atual: number): UserStreak => ({
    user_id: 'u',
    streak_type: tipo,
    current_streak: atual,
    longest_streak: atual,
    last_activity_date: '2026-10-06',
  });

  it('sem streaks a aderência é zero', () => {
    expect(calculateAdherenceScore([])).toEqual({ score: 0, level: 'baixa' });
  });

  it('30 dias ou mais em todos os tipos é aderência máxima', () => {
    expect(
      calculateAdherenceScore([
        streak('daily_metrics', 30),
        streak('sleep_hygiene', 31),
        streak('movement', 30),
        streak('meditation', 45),
        streak('hydration', 30),
      ])
    ).toEqual({ score: 100, level: 'consistente' });
  });

  it('sequências ainda não iniciadas contam como zero no máximo', () => {
    // Só meditação (1,5) e hidratação (1,0) completas: 2,5 × 30 de 7 × 30.
    expect(
      calculateAdherenceScore([
        streak('meditation', 45),
        streak('hydration', 30),
      ])
    ).toEqual({ score: 36, level: 'média' });
  });

  it('pondera os tipos de streak', () => {
    // daily_metrics pesa 2,0; hidratação 1,0: 15 dias na métrica diária vale
    // mais que 15 dias de hidratação.
    const metrica = calculateAdherenceScore([
      streak('daily_metrics', 15),
      streak('hydration', 0),
    ]);
    const hidratacao = calculateAdherenceScore([
      streak('daily_metrics', 0),
      streak('hydration', 15),
    ]);
    expect(metrica.score).toBeGreaterThan(hidratacao.score);
    // (15·2) / (30 · (2 + 1,5 + 1,5 + 1 + 1)) = 14,3 %
    expect(metrica.score).toBe(14);
  });

  it('classifica nas faixas baixa < 30 ≤ média < 60 ≤ alta < 85 ≤ consistente', () => {
    // As cinco sequências com n dias: aderência = n / 30.
    const todas = (n: number) =>
      calculateAdherenceScore(
        [
          'daily_metrics',
          'sleep_hygiene',
          'movement',
          'meditation',
          'hydration',
        ].map((tipo) => streak(tipo, n))
      );
    expect(todas(8).level).toBe('baixa');
    expect(todas(9).level).toBe('média');
    expect(todas(18).level).toBe('alta');
    expect(todas(26).level).toBe('consistente');
    // Tipos desconhecidos não contam.
    expect(calculateAdherenceScore([streak('x', 30)]).score).toBe(0);
  });
});
