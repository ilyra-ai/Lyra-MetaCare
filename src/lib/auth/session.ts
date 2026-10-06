import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

import { AppSession } from '@/types/app-session';

export const SESSION_COOKIE_NAME = 'lyra_metacare_session';

interface SessionPayload extends JWTPayload {
  sub: string;
  email: string;
  role: string;
}

// HS256 exige chave de pelo menos 256 bits (RFC 7518, seção 3.2).
export const AUTH_SECRET_MIN_BYTES = 32;

export function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('Variável de ambiente obrigatória ausente: AUTH_SECRET');
  }
  const encoded = new TextEncoder().encode(secret);
  if (encoded.byteLength < AUTH_SECRET_MIN_BYTES) {
    throw new Error(
      `AUTH_SECRET muito curto (${encoded.byteLength} bytes; mínimo ${AUTH_SECRET_MIN_BYTES}). Gere um novo com \`pnpm env:init\`.`
    );
  }
  return encoded;
}

// Sessão persistente ("Lembrar-me" marcado ou cadastro): 7 dias.
// Sessão de navegador ("Lembrar-me" desmarcado): o cookie não recebe maxAge e
// some ao fechar o navegador; o token expira em 12 horas como teto de
// segurança caso o navegador restaure a sessão.
const PERSISTENT_SESSION_SECONDS = 60 * 60 * 24 * 7;
const BROWSER_SESSION_TOKEN_TTL = '12h';

export interface SessionOptions {
  persistent: boolean;
}

export async function signSessionToken(
  payload: SessionPayload,
  options: SessionOptions = { persistent: true }
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(
      options.persistent
        ? `${PERSISTENT_SESSION_SECONDS}s`
        : BROWSER_SESSION_TOKEN_TTL
    )
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  // Fora do try: erro de configuração (AUTH_SECRET ausente ou fraco) deve
  // aparecer, e não virar "sessão inválida" em silêncio.
  const secret = getSecret();
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      role: String(payload.role),
    };
  } catch {
    return null;
  }
}

export async function getServerSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function setSessionCookie(
  token: string,
  options: SessionOptions = { persistent: true }
) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(options.persistent ? { maxAge: PERSISTENT_SESSION_SECONDS } : {}),
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  });
}

/**
 * Sessão exposta ao cliente e às rotas. O JWT não faz parte dela: ele vive
 * só no cookie `httpOnly`, fora do alcance de JavaScript (antes ia também no
 * corpo de `/api/auth/session`, o que anulava a proteção do `httpOnly` diante
 * de um XSS).
 */
export function buildAppSession(
  payload: SessionPayload,
  profile?: {
    first_name?: string | null;
    last_name?: string | null;
  }
): AppSession {
  const firstName = profile?.first_name ?? null;
  const lastName = profile?.last_name ?? null;

  return {
    user: {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: [firstName, lastName].filter(Boolean).join(' ') || null,
      },
    },
  };
}
