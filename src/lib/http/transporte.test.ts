import { afterEach, describe, expect, it, vi } from 'vitest';

import { buscarJson } from './transporte';

function responder(corpo: BodyInit | null, init: ResponseInit) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(corpo, init))
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('transporte HTTP do cliente (tarefa 58)', () => {
  it('JSON com sucesso', async () => {
    responder(JSON.stringify({ data: [1], error: null }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
    expect(await buscarJson('/api/x')).toEqual({
      ok: true,
      status: 200,
      corpo: { data: [1], error: null },
    });
  });

  it('erro HTTP usa a mensagem do corpo e mantém o corpo', async () => {
    responder(JSON.stringify({ error: { message: 'Sem permissão.' } }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
    const resposta = await buscarJson('/api/x');
    expect(resposta.ok).toBe(false);
    if (resposta.ok) return;
    expect(resposta.falha).toEqual({
      message: 'Sem permissão.',
      status: 403,
      motivo: 'http',
    });
  });

  it('página HTML de erro do proxy não vira "Unexpected token"', async () => {
    responder('<html>502 Bad Gateway</html>', {
      status: 502,
      headers: { 'content-type': 'text/html' },
    });
    const resposta = await buscarJson('/api/x');
    expect(resposta.ok).toBe(false);
    if (resposta.ok) return;
    expect(resposta.falha.motivo).toBe('resposta-invalida');
    expect(resposta.falha.message).toMatch(/HTTP 502/);
  });

  it('queda de rede volta como falha, sem lançar', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      })
    );
    const resposta = await buscarJson('/api/x');
    expect(resposta.ok).toBe(false);
    if (resposta.ok) return;
    expect(resposta.falha.motivo).toBe('rede');
    expect(resposta.falha.message).toMatch(/conexão/);
  });

  it('cancelamento é identificado', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new DOMException('aborted', 'AbortError');
      })
    );
    const resposta = await buscarJson('/api/x');
    expect(resposta.ok).toBe(false);
    if (resposta.ok) return;
    expect(resposta.falha.motivo).toBe('cancelada');
  });
});
