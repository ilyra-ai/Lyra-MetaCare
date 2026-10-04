import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

import { AppSession } from '@/types/app-session';

export const SESSION_COOKIE_NAME = 'lyra_metacare_session';

interface SessionPayload extends JWTPayload {
  sub: string;
  email: string;
  role: string;
}

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('Variável de ambiente obrigatória ausente: AUTH_SECRET');
  }
  return new TextEncoder().encode(secret);
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
  try {
    const { payload } = await jwtVerify(token, getSecret());
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

export function buildAppSession(
  token: string,
  payload: SessionPayload,
  profile?: {
    first_name?: string | null;
    last_name?: string | null;
  }
): AppSession {
  const firstName = profile?.first_name ?? null;
  const lastName = profile?.last_name ?? null;

  return {
    access_token: token,
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
