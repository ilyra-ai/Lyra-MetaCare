import { describe, expect, it } from 'vitest';

import { buscarCidades, cidadePorId, normalizarNome } from './cidades';

describe('base de cidades (GeoNames)', () => {
  it('normaliza acentos e pontuação', () => {
    expect(normalizarNome('  São-João d’El Rei ')).toBe('sao joao d el rei');
  });

  it('encontra sem acento, com a mais populosa primeiro', () => {
    const [primeira] = buscarCidades('sao paulo');
    expect(primeira).toMatchObject({
      nome: 'São Paulo',
      pais: 'BR',
      estado: 'São Paulo',
      fuso: 'America/Sao_Paulo',
      rotulo: 'São Paulo, São Paulo, Brasil',
    });
    expect(primeira.latitude).toBeCloseTo(-23.5475, 3);
    expect(primeira.longitude).toBeCloseTo(-46.6361, 3);
  });

  it('filtra por UF depois da vírgula', () => {
    const resultado = buscarCidades('campinas, sp');
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado.every((cidade) => cidade.estado === 'São Paulo')).toBe(
      true
    );
    expect(resultado[0].nome).toBe('Campinas');
  });

  it('traduz o Distrito Federal e inclui municípios pequenos do Brasil', () => {
    expect(buscarCidades('brasilia')[0]).toMatchObject({
      estado: 'Distrito Federal',
      fuso: 'America/Sao_Paulo',
    });
    // Município entre 1.000 e 5.000 habitantes (vem de cities1000).
    expect(buscarCidades('zabele, pb')[0]).toMatchObject({
      nome: 'Zabelê',
      estado: 'Paraíba',
    });
  });

  it('cidades de outros países com nome em português', () => {
    const [lisboa] = buscarCidades('lisboa');
    expect(lisboa?.rotulo).toMatch(/Portugal$/);
    expect(lisboa?.fuso).toBe('Europe/Lisbon');
    expect(cidadePorId(lisboa.id)).toEqual(lisboa);
  });

  it('termo curto ou id inexistente não retornam nada', () => {
    expect(buscarCidades('s')).toEqual([]);
    expect(cidadePorId(-1)).toBeNull();
  });
});
