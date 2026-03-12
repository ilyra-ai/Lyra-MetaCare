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

export async function signSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
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

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
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
