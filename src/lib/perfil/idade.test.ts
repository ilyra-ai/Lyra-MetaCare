import { describe, expect, it } from 'vitest';

import { idadeAtual } from './idade';

describe('idade de hoje (tarefa 58)', () => {
  const hoje = new Date('2026-10-17T12:00:00Z');

  it('a data de nascimento vence a idade gravada (que fica defasada)', () => {
    expect(idadeAtual('1982-09-23', 40, hoje)).toBe(44);
    expect(idadeAtual('1982-10-18', null, hoje)).toBe(43);
  });

  it('sem data, vale a idade informada; sem as duas, null', () => {
    expect(idadeAtual(null, 37, hoje)).toBe(37);
    expect(idadeAtual(null, null, hoje)).toBeNull();
    expect(idadeAtual('data-ruim', 0, hoje)).toBeNull();
  });
});
