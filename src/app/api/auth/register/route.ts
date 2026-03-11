import { NextResponse } from 'next/server';

import { hashPassword } from '@/lib/auth/password';
import { buildAppSession, setSessionCookie, signSessionToken } from '@/lib/auth/session';
import { mysqlPool, queryRows, withTransaction } from '@/lib/mysql/pool';

export const runtime = 'nodejs';

interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterPayload;
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password?.trim();

    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: 'Email válido e senha com pelo menos 8 caracteres são obrigatórios.' },
        { status: 400 }
      );
    }

    const existing = await queryRows<Array<{ id: string }>>('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Já existe uma conta com este email.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();
    const totalUsers = await queryRows<Array<{ total: number }>>('SELECT COUNT(*) AS total FROM users');
    const role = Number(totalUsers[0]?.total ?? 0) === 0 ? 'admin' : 'patient';

    await withTransaction(async (connection) => {
      await connection.execute(
        `
          INSERT INTO users (id, email, password_hash)
          VALUES (?, ?, ?)
        `,
        [userId, email, passwordHash]
      );

      await connection.execute(
        `
          INSERT INTO profiles (
            id,
            first_name,
            last_name,
            email,
            onboarding_completed,
            role
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [userId, payload.firstName ?? null, payload.lastName ?? null, email, false, role]
      );
    });

    const token = await signSessionToken({
      sub: userId,
      email,
      role
    });
    await setSessionCookie(token);

    const session = buildAppSession(token, { sub: userId, email, role }, {
      first_name: payload.firstName ?? null,
      last_name: payload.lastName ?? null
    });

    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao criar conta.' },
      { status: 500 }
    );
  }
}
