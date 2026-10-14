import { describe, expect, it } from 'vitest';

import { calcularSequencia } from '@/lib/kpi/streak-repository';

import { statusDaMeta, valorAtualDaMeta } from './catalogo';

const HOJE = '2026-10-14';

describe('valor atual das metas automáticas', () => {
  it('média dos dias com registro nos últimos 7 dias, na unidade da meta', () => {
    const resultado = valorAtualDaMeta(
      'sono',
      [
        { date: '2026-10-14', valor: 480 },
        { date: '2026-10-12', valor: 420 },
        { date: '2026-10-11', valor: null },
        // Fora da janela de 7 dias (8 dias atrás).
        { date: '2026-10-06', valor: 60 },
      ],
      HOJE
    );
    expect(resultado).toEqual({ valor: 7.5, dias: 2 });
  });

  it('peso usa o registro mais recente dos últimos 30 dias', () => {
    expect(
      valorAtualDaMeta(
        'peso',
        [
          { date: '2026-09-20', valor: 82 },
          { date: '2026-10-10', valor: 79.4 },
          { date: '2026-09-01', valor: 90 },
        ],
        HOJE
      )
    ).toEqual({ valor: 79.4, dias: 2 });
  });

  it('sem registro na janela não há valor', () => {
    expect(valorAtualDaMeta('passos', [], HOJE)).toEqual({
      valor: null,
      dias: 0,
    });
  });
});

describe('status das metas', () => {
  const base = { alvo: 10, prazo: null, hoje: HOJE } as const;
  it('respeita a direção do alvo', () => {
    expect(statusDaMeta({ ...base, atual: 10, direcao: 'up' })).toBe(
      'completed'
    );
    expect(statusDaMeta({ ...base, atual: 9, direcao: 'up' })).toBe(
      'in_progress'
    );
    expect(statusDaMeta({ ...base, atual: 9, direcao: 'down' })).toBe(
      'completed'
    );
  });

  it('prazo vencido sem o alvo vira atraso; o próprio dia do prazo ainda vale', () => {
    expect(
      statusDaMeta({ ...base, atual: 2, direcao: 'up', prazo: '2026-10-13' })
    ).toBe('missed');
    expect(
      statusDaMeta({ ...base, atual: 2, direcao: 'up', prazo: HOJE })
    ).toBe('in_progress');
    expect(
      statusDaMeta({ ...base, atual: null, direcao: 'up', prazo: null })
    ).toBe('in_progress');
  });
});

describe('sequências', () => {
  it('conta a sequência que termina hoje ou ontem e a mais longa', () => {
    const dias = new Set([
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
      '2026-10-12',
      '2026-10-13',
    ]);
    // Hoje ainda sem registro: a sequência de ontem continua valendo.
    expect(calcularSequencia(dias, HOJE)).toEqual({
      atual: 2,
      maisLonga: 4,
      ultimo: '2026-10-13',
    });
    expect(calcularSequencia(new Set([...dias, HOJE]), HOJE).atual).toBe(3);
    // Sem ontem nem hoje, a sequência atual zera.
    expect(calcularSequencia(dias, '2026-10-16').atual).toBe(0);
    expect(calcularSequencia(new Set(), HOJE)).toEqual({
      atual: 0,
      maisLonga: 0,
      ultimo: null,
    });
  });

  it('atravessa a virada de mês', () => {
    expect(
      calcularSequencia(new Set(['2026-09-30', '2026-10-01']), '2026-10-01')
    ).toMatchObject({ atual: 2, maisLonga: 2 });
  });
});
