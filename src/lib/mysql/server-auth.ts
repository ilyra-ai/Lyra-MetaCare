import { queryRows } from '@/lib/mysql/pool';
import {
  buildAppSession,
  getServerSessionToken,
  verifySessionToken,
} from '@/lib/auth/session';
import { AppSession } from '@/types/app-session';

interface ProfileRow {
  first_name: string | null;
  last_name: string | null;
}

export async function requireServerSession(): Promise<AppSession> {
  const session = await getServerSession();
  if (!session) {
    throw new Error('Usuário não autenticado.');
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
