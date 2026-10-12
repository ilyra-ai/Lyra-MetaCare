import { NextRequest } from 'next/server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { SESSION_COOKIE_NAME, signSessionToken } from '@/lib/auth/session';
import { config, proxy } from './proxy';

const ORIGEM = 'http://localhost:3100';

beforeAll(() => {
  vi.stubEnv('AUTH_SECRET', 'segredo-de-teste-com-mais-de-32-bytes-0123456789');
});

afterAll(() => {
  vi.unstubAllEnvs();
});

async function requisicao(caminho: string, papel?: 'admin' | 'patient') {
  const headers = new Headers();
  if (papel) {
    const token = await signSessionToken({
      sub: `usuario-${papel}`,
      email: `${papel}@teste.lyra.local`,
      role: papel,
    });
    headers.set('cookie', `${SESSION_COOKIE_NAME}=${token}`);
  }
  return new NextRequest(`${ORIGEM}${caminho}`, { headers });
}

describe('proxy · área administrativa', () => {
  it('cobre /admin e as subrotas no matcher', () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining(['/admin', '/admin/:path*', '/api/:path*'])
    );
  });

  it('manda visitante sem sessão para o login', async () => {
    const resposta = await proxy(await requisicao('/admin/users'));
    expect(resposta.status).toBe(307);
    expect(resposta.headers.get('location')).toBe(`${ORIGEM}/login`);
  });

  it('trata token adulterado como sem sessão', async () => {
    const valida = await requisicao('/admin/plans', 'admin');
    const cookie = valida.headers.get('cookie') ?? '';
    const adulterada = new NextRequest(`${ORIGEM}/admin/plans`, {
      headers: { cookie: `${cookie.slice(0, -4)}AAAA` },
    });
    const resposta = await proxy(adulterada);
    expect(resposta.headers.get('location')).toBe(`${ORIGEM}/login`);
  });

  it('devolve o usuário comum ao próprio painel, sem entregar a tela', async () => {
    for (const caminho of ['/admin', '/admin/users', '/admin/puck']) {
      const resposta = await proxy(await requisicao(caminho, 'patient'));
      expect(resposta.status).toBe(307);
      expect(resposta.headers.get('location')).toBe(`${ORIGEM}/`);
    }
  });

  it('deixa o administrador seguir', async () => {
    const resposta = await proxy(await requisicao('/admin/users', 'admin'));
    expect(resposta.headers.get('location')).toBeNull();
    expect(resposta.headers.get('x-middleware-next')).toBe('1');
  });

  it('mantém a proteção CSRF nas rotas de API', async () => {
    const resposta = await proxy(
      new NextRequest(`${ORIGEM}/api/data/goals`, {
        method: 'POST',
        headers: { origin: 'https://ataque.example' },
      })
    );
    expect(resposta.status).toBe(403);
  });
});
