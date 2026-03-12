import { queryRows } from '@/lib/mysql/pool';
import {
  buildAppSession,
  getServerSessionToken,
  verifySessionToken,
} from '@/lib/auth/session';
import { HttpError } from '@/lib/http-error';
import { AppSession } from '@/types/app-session';

interface ProfileRow {
  first_name: string | null;
  last_name: string | null;
}

export async function requireServerSession(): Promise<AppSession> {
  const session = await getServerSession();
  if (!session) {
    throw new HttpError('Usuário não autenticado.', 401);
  }
  return session;
}

export async function requireAdminSession(): Promise<AppSession> {
  const session = await requireServerSession();
  if (session.user.role !== 'admin') {
    throw new HttpError('Acesso restrito a administradores.', 403);
  }
  return session;
}

export async function getServerSession(): Promise<AppSession | null> {
  const token = await getServerSessionToken();
  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return null;
  }

  const profiles = await queryRows<ProfileRow>(
    'SELECT first_name, last_name FROM profiles WHERE id = ? LIMIT 1',
    [payload.sub]
  );

  return buildAppSession(token, payload, profiles[0]);
}
