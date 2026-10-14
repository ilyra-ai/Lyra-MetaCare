import { describe, expect, it } from 'vitest';

import {
  areasQuePedemAtencao,
  escolherDica,
  normalizarCategoria,
  type SinaisDaDica,
} from './dica-do-dia';

const VAZIO: SinaisDaDica = {
  sleep_duration_minutes: null,
  water_liters: null,
  steps: null,
  active_minutes: null,
  stress_score: null,
  protein_grams: null,
};

const DICAS = [
  { id: 'a', title: 'Sono profundo', detail: '...', category: 'Sono' },
  { id: 'b', title: 'Proteína', detail: '...', category: 'Nutrição' },
  { id: 'c', title: 'Água', detail: '...', category: 'Hidratação' },
];

describe('dica do dia', () => {
  it('ausência de dado não é problema: sem sinais, nenhuma área', () => {
    expect(areasQuePedemAtencao(null)).toEqual([]);
    expect(areasQuePedemAtencao(VAZIO)).toEqual([]);
  });

  it('escolhe a categoria da área mais urgente, com o motivo', () => {
    const escolha = escolherDica(
      DICAS,
      { ...VAZIO, sleep_duration_minutes: 330, water_liters: 0.8 },
      '2026-10-14'
    );
    expect(escolha?.dica.id).toBe('a');
    expect(escolha?.motivo).toBe(
      'Você dormiu 5h30, abaixo das 7 h recomendadas.'
    );
    // Sem dica de sono cadastrada, vale a próxima área (hidratação).
    expect(
      escolherDica(
        DICAS.filter((d) => d.id !== 'a'),
        { ...VAZIO, sleep_duration_minutes: 330, water_liters: 0.8 },
        '2026-10-14'
      )?.dica.id
    ).toBe('c');
  });

  it('sem área em atenção, roda por dia de forma estável', () => {
    const hoje = escolherDica(DICAS, null, '2026-10-14');
    expect(escolherDica(DICAS, null, '2026-10-14')).toEqual(hoje);
    expect(escolherDica(DICAS, null, '2026-10-15')?.dica.id).not.toBe(
      hoje?.dica.id
    );
    expect(hoje?.motivo).toBeNull();
    expect(escolherDica([], null, '2026-10-14')).toBeNull();
  });

  it('normaliza acentos e caixa das categorias', () => {
    expect(normalizarCategoria(' Hidratação ')).toBe('hidratacao');
    expect(normalizarCategoria(null)).toBe('');
  });
});
