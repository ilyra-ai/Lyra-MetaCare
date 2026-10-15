import { describe, expect, it } from 'vitest';

import {
  LIMITE_DA_FRASE,
  reflexaoSchema,
  semCaracteresDeControle,
} from './esquema';

describe('schema da reflexão da noite', () => {
  it('aceita notas inteiras de 1 a 5 e frase opcional', () => {
    expect(
      reflexaoSchema.parse({ emocional: 1, corpo: 5, espiritual: 3 })
    ).toEqual({ emocional: 1, corpo: 5, espiritual: 3 });
    expect(
      reflexaoSchema.parse({
        emocional: 4,
        corpo: 4,
        espiritual: 4,
        frase: null,
      }).frase
    ).toBeNull();
  });

  it('limpa a frase: pontas, controles e vazio viram null', () => {
    expect(
      reflexaoSchema.parse({
        emocional: 3,
        corpo: 3,
        espiritual: 3,
        frase: '\t Gratidão\u0000 pelo dia\n',
      }).frase
    ).toBe('Gratidão pelo dia');
    expect(
      reflexaoSchema.parse({
        emocional: 3,
        corpo: 3,
        espiritual: 3,
        frase: ' \u0001 ',
      }).frase
    ).toBeNull();
  });

  it('mantém quebras de linha e o limite conta depois da limpeza', () => {
    expect(semCaracteresDeControle('linha 1\nlinha 2\u007f')).toBe(
      'linha 1\nlinha 2'
    );
    const noLimite = `  ${'a'.repeat(LIMITE_DA_FRASE)}  `;
    expect(
      reflexaoSchema.parse({
        emocional: 3,
        corpo: 3,
        espiritual: 3,
        frase: noLimite,
      }).frase
    ).toHaveLength(LIMITE_DA_FRASE);
  });

  it('recusa notas fora da faixa, fracionárias, data malformada e campos extras', () => {
    for (const entrada of [
      { emocional: 0, corpo: 3, espiritual: 3 },
      { emocional: 3, corpo: 6, espiritual: 3 },
      { emocional: 3, corpo: 3, espiritual: 3.5 },
      { emocional: 3, corpo: 3, espiritual: 3, data: '15/10/2026' },
      { emocional: 3, corpo: 3, espiritual: 3, extra: true },
      {
        emocional: 3,
        corpo: 3,
        espiritual: 3,
        frase: 'a'.repeat(LIMITE_DA_FRASE + 1),
      },
    ]) {
      expect(reflexaoSchema.safeParse(entrada).success).toBe(false);
    }
  });
});
