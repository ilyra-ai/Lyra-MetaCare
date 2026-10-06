import { NextRequest } from 'next/server';

import { signSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';

import type { UsuarioDeTeste } from './fixtures';

/**
 * Chamada direta às Route Handlers reais (mesmo código servido pelo Next.js),
 * contra o banco de teste. O único substituto é o armazenamento de cookies do
 * `next/headers`, que fora do servidor é este Map (ver setup-env.ts).
 */
export const cookieJar = new Map<string, string>();

type Handler<P> = (
  request: NextRequest,
  context: { params: Promise<P> }
) => Promise<Response>;

export interface Chamada<P> {
  method?: string;
  path?: string;
  body?: unknown;
  /** Corpo bruto (ex.: JSON malformado ou multipart). */
  rawBody?: BodyInit;
  headers?: Record<string, string>;
  params?: P;
  usuario?: UsuarioDeTeste | null;
}

export async function entrarComo(usuario: UsuarioDeTeste | null) {
  cookieJar.clear();
  if (usuario) {
    cookieJar.set(
      SESSION_COOKIE_NAME,
      await signSessionToken({
        sub: usuario.id,
        email: usuario.email,
        role: usuario.role,
      })
    );
  }
}

export async function chamar<P = Record<string, never>>(
  handler: Handler<P>,
  chamada: Chamada<P> = {}
) {
  if (chamada.usuario !== undefined) {
    await entrarComo(chamada.usuario);
  }
  const headers = new Headers(chamada.headers);
  let body: BodyInit | undefined = chamada.rawBody;
  if (body === undefined && chamada.body !== undefined) {
    body = JSON.stringify(chamada.body);
    headers.set('content-type', 'application/json');
  }
  const request = new NextRequest(
    new URL(chamada.path ?? '/api/teste', 'http://127.0.0.1:3000'),
    { method: chamada.method ?? 'GET', headers, body }
  );
  const resposta = await handler(request, {
    params: Promise.resolve((chamada.params ?? {}) as P),
  });
  const texto = await resposta.text();
  let json: unknown = null;
  try {
    json = texto ? JSON.parse(texto) : null;
  } catch {
    json = null;
  }
  return { status: resposta.status, headers: resposta.headers, json, texto };
}
