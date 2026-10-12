import { describe, expect, it } from 'vitest';

import {
  dataDoRegistroValida,
  registroDoDiaSchema,
  sessaoDoSensorSchema,
} from './registro-do-dia';

const agora = new Date('2026-10-12T15:00:00Z');

describe('data do registro', () => {
  it.each([
    ['2026-10-12', true],
    ['2026-10-13', true],
    ['2026-10-05', true],
    ['2026-10-04', false],
    ['2026-10-14', false],
    ['2026-02-30', false],
    ['12/10/2026', false],
  ])('%s → %s', (data, esperado) => {
    expect(dataDoRegistroValida(data, agora)).toBe(esperado);
  });
});

describe('registro do dia', () => {
  const hoje = new Date().toISOString().slice(0, 10);

  it('aceita decimais onde cabem e recusa onde não cabem', () => {
    expect(
      registroDoDiaSchema.safeParse({
        data: hoje,
        valores: { peso: 70.5, agua: 2.25 },
      }).success
    ).toBe(true);
    const peso = registroDoDiaSchema.safeParse({
      data: hoje,
      valores: { peso: 70.55 },
    });
    expect(peso.success).toBe(false);
    expect(peso.error?.issues[0]?.message).toBe(
      'Peso: use no máximo 1 casa decimal.'
    );
  });

  it('mensagens de faixa em português', () => {
    const resultado = registroDoDiaSchema.safeParse({
      data: hoje,
      valores: { glicemia: 5 },
    });
    expect(resultado.error?.issues[0]?.message).toBe(
      'Glicemia: o mínimo é 20 mg/dL.'
    );
  });
});

describe('sessão da pulseira', () => {
  const hoje = new Date().toISOString().slice(0, 10);
  const base = {
    data: hoje,
    minutos: 5,
    amostras: 300,
    fcMinima: 60,
    fcMaxima: 90,
    fcMedia: 70,
    fcRepousoEstimada: 62,
    rmssd: 40,
  };

  it('aceita sessão coerente', () => {
    expect(sessaoDoSensorSchema.safeParse(base).success).toBe(true);
  });

  it('recusa repouso fora da faixa da sessão e campos extras', () => {
    expect(
      sessaoDoSensorSchema.safeParse({ ...base, fcRepousoEstimada: 50 }).success
    ).toBe(false);
    expect(
      sessaoDoSensorSchema.safeParse({ ...base, passos: 100 }).success
    ).toBe(false);
  });
});
