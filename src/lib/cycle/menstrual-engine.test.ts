import { describe, it, expect } from 'vitest';

import { calculateMenstrualCycle } from './menstrual-engine';

describe('calculateMenstrualCycle', () => {
  // Datas de referência construídas em horário LOCAL (new Date(ano, mês0, dia))
  // para casar com o parseISO local usado pelo engine. Junho = mês índice 5.
  it('identifica a fase menstrual no início do ciclo', () => {
    const ref = new Date(2026, 5, 3);
    const result = calculateMenstrualCycle(ref, {
      lastMenstrualPeriod: '2026-06-01',
      cycleLength: 28,
      periodLength: 5,
    });
    expect(result.trackable).toBe(true);
    expect(result.cycleDay).toBe(3);
    expect(result.phase).toBe('menstrual');
    expect(result.daysUntilNextPeriod).toBe(26);
    expect(result.nextPeriodDate).toBe('2026-06-29');
  });

  it('identifica a fase folicular após a menstruação', () => {
    const ref = new Date(2026, 5, 9); // dia 9
    const result = calculateMenstrualCycle(ref, {
      lastMenstrualPeriod: '2026-06-01',
      cycleLength: 28,
      periodLength: 5,
    });
    expect(result.cycleDay).toBe(9);
    expect(result.phase).toBe('folicular');
  });

  it('identifica a fase ovulatória e marca janela fértil', () => {
    const ref = new Date(2026, 5, 15); // dia 15, ovulação ~14
    const result = calculateMenstrualCycle(ref, {
      lastMenstrualPeriod: '2026-06-01',
      cycleLength: 28,
      periodLength: 5,
    });
    expect(result.cycleDay).toBe(15);
    expect(result.phase).toBe('ovulatoria');
    expect(result.isFertileToday).toBe(true);
    expect(result.ovulationDay).toBe(14);
  });

  it('identifica a fase lútea no fim do ciclo', () => {
    const ref = new Date(2026, 5, 24); // dia 24
    const result = calculateMenstrualCycle(ref, {
      lastMenstrualPeriod: '2026-06-01',
      cycleLength: 28,
      periodLength: 5,
    });
    expect(result.cycleDay).toBe(24);
    expect(result.phase).toBe('lutea');
  });

  it('normaliza ciclos longos (data antiga) via módulo', () => {
    const ref = new Date(2026, 5, 30); // 60 dias após
    const result = calculateMenstrualCycle(ref, {
      lastMenstrualPeriod: '2026-05-01',
      cycleLength: 30,
      periodLength: 5,
    });
    expect(result.cycleDay).toBeGreaterThanOrEqual(1);
    expect(result.cycleDay).toBeLessThanOrEqual(30);
    expect(result.trackable).toBe(true);
  });

  it('trata menopausa sem cálculo de fase, com orientação própria', () => {
    const ref = new Date(2026, 5, 15);
    const result = calculateMenstrualCycle(ref, {
      lastMenstrualPeriod: null,
      lifeStage: 'menopausa',
    });
    expect(result.trackable).toBe(false);
    expect(result.lifeStage).toBe('menopausa');
    expect(result.phase).toBeNull();
    expect(result.note).toContain('menopausa');
  });

  it('pede configuração quando falta a data da última menstruação', () => {
    const ref = new Date(2026, 5, 15);
    const result = calculateMenstrualCycle(ref, {
      lastMenstrualPeriod: null,
    });
    expect(result.trackable).toBe(false);
    expect(result.lifeStage).toBe('sem_ciclo');
    expect(result.note).toContain('última menstruação');
  });
});
