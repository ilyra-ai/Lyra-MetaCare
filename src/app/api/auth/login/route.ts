import { NextResponse } from 'next/server';

import { verifyPassword } from '@/lib/auth/password';
import {
  buildAppSession,
  setSessionCookie,
  signSessionToken,
} from '@/lib/auth/session';
import { queryRows } from '@/lib/mysql/pool';

export const runtime = 'nodejs';

interface LoginPayload {
  email: string;
  password: string;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginPayload;
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password?.trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Credenciais obrigatórias.' },
        { status: 400 }
      );
    }

    const users = await queryRows<UserRow[]>(
      `
        SELECT
          u.id,
          u.email,
          u.password_hash,
          p.role,
          p.first_name,
          p.last_name
        FROM users u
        INNER JOIN profiles p ON p.id = u.id
        WHERE u.email = ?
        LIMIT 1
      `,
      [email]
    );

    const user = users[0];
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    const validPassword = await verifyPassword(password, user.password_hash);
    if (!validPassword) {
      return NextResponse.json({ error: 'Senha inválida.' }, { status: 401 });
    }

    const token = await signSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      session: buildAppSession(
        token,
        { sub: user.id, email: user.email, role: user.role },
        user
      ),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha no login.' },
      { status: 500 }
    );
  }
}
