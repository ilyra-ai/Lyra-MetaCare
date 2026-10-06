import { describe, expect, it } from 'vitest';

import { type DadosDaRequisicao, requisicaoDeMesmaOrigem } from './csrf';

const base: DadosDaRequisicao = {
  metodo: 'POST',
  caminho: '/api/data/goals',
  origemDaAplicacao: 'http://localhost:3000',
  origemConfigurada: 'https://app.lyra.example',
  secFetchSite: null,
  origin: null,
};

describe('requisicaoDeMesmaOrigem', () => {
  it('libera leituras de qualquer origem', () => {
    expect(
      requisicaoDeMesmaOrigem({
        ...base,
        metodo: 'GET',
        secFetchSite: 'cross-site',
      })
    ).toBe(true);
  });

  it('recusa escrita cross-site e same-site (subdomínio)', () => {
    for (const metodo of ['POST', 'PUT', 'PATCH', 'DELETE', 'post']) {
      expect(
        requisicaoDeMesmaOrigem({ ...base, metodo, secFetchSite: 'cross-site' })
      ).toBe(false);
    }
    expect(
      requisicaoDeMesmaOrigem({ ...base, secFetchSite: 'same-site' })
    ).toBe(false);
  });

  it('aceita escrita da própria origem', () => {
    expect(
      requisicaoDeMesmaOrigem({ ...base, secFetchSite: 'same-origin' })
    ).toBe(true);
  });

  it('usa o Origin quando o navegador não envia Sec-Fetch-Site', () => {
    expect(
      requisicaoDeMesmaOrigem({ ...base, origin: 'http://localhost:3000' })
    ).toBe(true);
    expect(
      requisicaoDeMesmaOrigem({ ...base, origin: 'https://app.lyra.example' })
    ).toBe(true);
    expect(
      requisicaoDeMesmaOrigem({ ...base, origin: 'https://evil.example' })
    ).toBe(false);
    expect(requisicaoDeMesmaOrigem({ ...base, origin: 'null' })).toBe(false);
  });

  it('deixa o webhook da Stripe e clientes fora do navegador seguirem para a autenticação da rota', () => {
    expect(
      requisicaoDeMesmaOrigem({
        ...base,
        caminho: '/api/webhooks/stripe',
        secFetchSite: 'cross-site',
      })
    ).toBe(true);
    expect(requisicaoDeMesmaOrigem(base)).toBe(true);
  });
});
