import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { z } from 'zod';

import { hashPassword } from '@/lib/auth/password';
import {
  buildAppSession,
  setSessionCookie,
  signSessionToken,
} from '@/lib/auth/session';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { withTransaction } from '@/lib/mysql/pool';
import { ensureUserSubscription } from '@/lib/plans/service';
import {
  LIMITE_CADASTRO_POR_IP,
  exigirDentroDoLimite,
  ipDoCliente,
} from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

const nomeOpcional = z
  .string()
  .trim()
  .max(120)
  .optional()
  .transform((valor) => (valor ? valor : null));

const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Informe um e-mail válido.').max(255)),
  password: z
    .string()
    .trim()
    .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
    .max(200, 'A senha pode ter no máximo 200 caracteres.'),
  firstName: nomeOpcional,
  lastName: nomeOpcional,
});

export async function POST(request: Request) {
  try {
    const payload = await lerJson(request, registerSchema);
    // Contas em massa e enumeração de e-mails pelo 409: teto por IP.
    await exigirDentroDoLimite(LIMITE_CADASTRO_POR_IP, ipDoCliente(request));
    const passwordHash = await hashPassword(payload.password);
    const userId = crypto.randomUUID();

    // Contagem e inserção na mesma transação, com bloqueio da tabela de
    // usuários: dois cadastros simultâneos num banco vazio não viram dois
    // administradores. E-mail repetido (inclusive em corrida) → 409.
    const role = await withTransaction(async (connection) => {
      const [existentes] = await connection.query<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        [payload.email]
      );
      if (existentes.length > 0) {
        return null;
      }
      const [contagem] = await connection.query<RowDataPacket[]>(
        'SELECT COUNT(*) AS total FROM users FOR UPDATE'
      );
      const papel = Number(contagem[0]?.total ?? 0) === 0 ? 'admin' : 'patient';

      await connection.execute(
        'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
        [userId, payload.email, passwordHash]
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
        [
          userId,
          payload.firstName,
          payload.lastName,
          payload.email,
          false,
          papel,
        ]
      );
      return papel;
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Já existe uma conta com este e-mail.' },
        { status: 409 }
      );
    }

    await ensureUserSubscription(
      userId,
      role === 'admin' ? 'care' : 'free',
      'auth_register'
    );

    const token = await signSessionToken({
      sub: userId,
      email: payload.email,
      role,
    });
    await setSessionCookie(token);

    const session = buildAppSession(
      { sub: userId, email: payload.email, role },
      { first_name: payload.firstName, last_name: payload.lastName }
    );

    return NextResponse.json({ session });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao criar a conta.');
  }
}
