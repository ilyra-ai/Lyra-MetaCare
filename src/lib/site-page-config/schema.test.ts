import { describe, expect, it } from 'vitest';

import {
  getDefaultPageConfig,
  mesclarComPadrao,
  parsePageConfig,
  validatePageConfig,
} from '@/lib/site-page-config/schema';

describe('mesclarComPadrao', () => {
  it('completa campos ausentes e mantém os existentes', () => {
    expect(
      mesclarComPadrao(
        { a: 1, b: { c: 2, d: 3 }, lista: [1, 2] },
        { b: { c: 9 }, lista: [5] }
      )
    ).toEqual({ a: 1, b: { c: 9, d: 3 }, lista: [5] });
  });

  it('usa o padrão quando o valor é nulo ou ausente', () => {
    expect(mesclarComPadrao({ a: 1 }, null)).toEqual({ a: 1 });
    expect(mesclarComPadrao({ a: 1 }, undefined)).toEqual({ a: 1 });
  });
});

describe('parsePageConfig', () => {
  it('configuração antiga sem um bloco novo não volta inteira ao padrão', () => {
    const antiga = getDefaultPageConfig('login') as unknown as Record<
      string,
      unknown
    >;
    (antiga.intro as Record<string, unknown>).title = 'Título do admin';
    delete antiga.sizing;
    const lida = parsePageConfig('login', antiga);
    expect(lida.intro.title).toBe('Título do admin');
    expect(lida.sizing).toEqual(getDefaultPageConfig('login').sizing);
  });
});

describe('destino dos botões da landing', () => {
  function comDestino(href: string) {
    const config = getDefaultPageConfig('landing');
    config.hero.primaryCtaHref = href;
    return validatePageConfig('landing', config).success;
  }

  it('aceita rota interna, âncora e https', () => {
    expect(comDestino('/login')).toBe(true);
    expect(comDestino('#planos')).toBe(true);
    expect(comDestino('https://exemplo.com.br/x?y=1')).toBe(true);
  });

  it('recusa javascript:, http e texto solto', () => {
    expect(comDestino('javascript:alert(1)')).toBe(false);
    expect(comDestino('http://exemplo.com')).toBe(false);
    expect(comDestino('login')).toBe(false);
    expect(comDestino('')).toBe(false);
  });
});
