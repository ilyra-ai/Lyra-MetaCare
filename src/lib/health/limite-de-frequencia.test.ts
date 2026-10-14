import { describe, expect, it } from 'vitest';

import { limiteDeFrequencia } from './limite-de-frequencia';

describe('limite pessoal de frequência cardíaca', () => {
  it('90% da FC máxima de Tanaka (208 − 0,7 × idade)', () => {
    expect(limiteDeFrequencia(40)).toBe(162);
    expect(limiteDeFrequencia(20)).toBe(175);
    expect(limiteDeFrequencia(70)).toBe(143);
  });

  it('sem idade plausível não há limite', () => {
    expect(limiteDeFrequencia(null)).toBeNull();
    expect(limiteDeFrequencia(5)).toBeNull();
    expect(limiteDeFrequencia(150)).toBeNull();
  });
});
