import { randomBytes } from 'node:crypto';

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { hashPassword, verifyPassword } from '@/lib/auth/password';
import {
  buildAppSession,
  setSessionCookie,
  signSessionToken,
} from '@/lib/auth/session';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { queryRows } from '@/lib/mysql/pool';

export const runtime = 'nodejs';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Credenciais obrigatórias.')
    .max(255),
  // Mesma normalização do cadastro (a senha é gravada sem espaços nas pontas).
  password: z.string().trim().min(1, 'Credenciais obrigatórias.').max(200),
  // "Lembrar-me": true mantém a sessão por 7 dias; false cria uma sessão que
  // termina ao fechar o navegador.
  remember: z.boolean().optional(),
});

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
}

// Hash bcrypt (mesmo custo do cadastro) de uma senha aleatória descartada,
// gerado uma vez por processo: comparado quando o e-mail não existe, para que
// o tempo de resposta não revele quais e-mails têm conta.
let hashDeReferencia: Promise<string> | null = null;
function obterHashDeReferencia() {
  hashDeReferencia ??= hashPassword(randomBytes(32).toString('base64url'));
  return hashDeReferencia;
}

const CREDENCIAIS_INVALIDAS = 'E-mail ou senha inválidos.';

export async function POST(request: Request) {
  try {
    const payload = await lerJson(request, loginSchema);

    const users = await queryRows<UserRow>(
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
      [payload.email]
    );

    const user = users[0];
    // E-mail inexistente e senha errada respondem igual (401, mesma
    // mensagem e mesmo custo): antes, 404 "Usuário não encontrado" permitia
    // descobrir quais e-mails têm conta.
    const validPassword = await verifyPassword(
      payload.password,
      user?.password_hash ?? (await obterHashDeReferencia())
    );
    if (!user || !validPassword) {
      return NextResponse.json(
        { error: CREDENCIAIS_INVALIDAS },
        { status: 401 }
      );
    }

    const sessionOptions = { persistent: payload.remember === true };
    const token = await signSessionToken(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      sessionOptions
    );
    await setSessionCookie(token, sessionOptions);

    return NextResponse.json({
      session: buildAppSession(
        token,
        { sub: user.id, email: user.email, role: user.role },
        user
      ),
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha no login.');
  }
}
