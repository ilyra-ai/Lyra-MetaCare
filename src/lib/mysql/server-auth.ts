import { queryRows } from '@/lib/mysql/pool';
import {
  buildAppSession,
  getServerSessionToken,
  verifySessionToken,
} from '@/lib/auth/session';
import { HttpError } from '@/lib/http-error';
import { AppSession } from '@/types/app-session';

interface ProfileRow {
  email: string;
  role: string;
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

  // O papel e o e-mail valem pelo banco, não pelo token: um administrador
  // rebaixado perde o acesso na próxima requisição (antes mantinha o papel
  // `admin` até o JWT expirar, em até 7 dias) e uma conta removida deixa de
  // ter sessão válida.
  const profiles = await queryRows<ProfileRow>(
    `
      SELECT u.email, p.role, p.first_name, p.last_name
      FROM users u
      INNER JOIN profiles p ON p.id = u.id
      WHERE u.id = ?
      LIMIT 1
    `,
    [payload.sub]
  );
  const profile = profiles[0];
  if (!profile) {
    return null;
  }

  return buildAppSession(
    { sub: payload.sub, email: profile.email, role: profile.role },
    profile
  );
}
