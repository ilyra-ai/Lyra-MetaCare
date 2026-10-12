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
import { registrarConsentimentos } from '@/lib/lgpd/conta';
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
  // LGPD: a conta só nasce com o aceite dos termos de uso e da política de
  // privacidade, registrado (versão e data) em consent_records.
  acceptTerms: z.literal(true, {
    error: 'Aceite os termos de uso e a política de privacidade.',
  }),
});

export async function POST(request: Request) {
  try {
    const payload = await lerJson(request, registerSchema);
    // Contas em massa e enumeração de e-mails pelo 409: teto por IP.
    await exigirDentroDoLimite(LIMITE_CADASTRO_POR_IP, ipDoCliente(request));
    const passwordHash = await hashPassword(payload.password);
    const userId = crypto.randomUUID();

    // O cadastro público sempre cria um usuário comum. Administradores só
    // nascem pelo bootstrap do `.env.local` (`pnpm db:migrate`) ou pela ação
    // de outro administrador. Antes, o primeiro cadastro de um banco vazio
    // virava administrador: com o bootstrap desativado em produção, qualquer
    // visitante que se cadastrasse primeiro ganharia acesso total.
    // E-mail repetido → 409; numa corrida entre dois cadastros iguais, o
    // índice UNIQUE de `users.email` recusa o segundo (ER_DUP_ENTRY, também
    // convertido em 409 por `respostaDeErro`).
    const role = await withTransaction(async (connection) => {
      const [existentes] = await connection.query<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        [payload.email]
      );
      if (existentes.length > 0) {
        return null;
      }
      const papel = 'patient' as const;

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
      await registrarConsentimentos({
        userId,
        tipos: ['terms_of_use', 'privacy_policy'],
        userAgent: request.headers.get('user-agent'),
        connection,
      });
      return papel;
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Já existe uma conta com este e-mail.' },
        { status: 409 }
      );
    }

    await ensureUserSubscription(userId, 'free', 'auth_register');

    const token = await signSessionToken({
      sub: userId,
      email: payload.email,
      role,
    });
    await setSessionCookie(token);

    const session = buildAppSession(
      { sub: userId, email: payload.email, role },
      {
        first_name: payload.firstName,
        last_name: payload.lastName,
        // Conta nova: o app abre direto no onboarding.
        onboarding_completed: false,
      }
    );

    return NextResponse.json({ session });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao criar a conta.');
  }
}
