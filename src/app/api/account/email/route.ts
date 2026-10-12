import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { z } from 'zod';

import { confirmarSenhaAtual } from '@/lib/auth/confirmar-senha';
import {
  getServerSessionToken,
  sessaoEhPersistente,
  setSessionCookie,
  signSessionToken,
} from '@/lib/auth/session';
import { HttpError } from '@/lib/http-error';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { withTransaction } from '@/lib/mysql/pool';
import {
  getServerSession,
  requireServerSession,
} from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

// Mesma normalização do cadastro e do login (minúsculas, sem espaços).
const trocaDeEmailSchema = z.object({
  newEmail: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Informe um e-mail válido.').max(255)),
  currentPassword: z
    .string()
    .trim()
    .min(1, 'Informe a senha atual para confirmar a troca.')
    .max(200),
});

const EMAIL_EM_USO = 'Este e-mail já está em uso por outra conta.';

function chaveDuplicada(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'ER_DUP_ENTRY'
  );
}

/**
 * Troca o e-mail de login da própria conta.
 *
 * - Exige a senha atual (falhas contam no limite do login da conta).
 * - `users.email` e `profiles.email` mudam na mesma transação; os dois têm
 *   índice único, então um e-mail de outra conta é recusado pelo banco
 *   mesmo numa corrida entre duas trocas simultâneas (409).
 * - O token de sessão é reemitido com o novo e-mail, mantendo o tipo de
 *   sessão (persistente ou de navegador).
 */
export async function PATCH(request: Request) {
  try {
    const session = await requireServerSession();
    const payload = await lerJson(request, trocaDeEmailSchema);

    if (payload.newEmail === session.user.email) {
      throw new HttpError('Informe um e-mail diferente do atual.', 400);
    }

    await confirmarSenhaAtual({
      userId: session.user.id,
      email: session.user.email,
      senha: payload.currentPassword,
    });

    await withTransaction(async (connection) => {
      const [ocupado] = await connection.query<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1',
        [payload.newEmail, session.user.id]
      );
      if (ocupado.length > 0) {
        throw new HttpError(EMAIL_EM_USO, 409);
      }

      await connection.execute('UPDATE users SET email = ? WHERE id = ?', [
        payload.newEmail,
        session.user.id,
      ]);
      await connection.execute('UPDATE profiles SET email = ? WHERE id = ?', [
        payload.newEmail,
        session.user.id,
      ]);
    });

    const tokenAtual = await getServerSessionToken();
    const opcoes = {
      persistent: tokenAtual ? sessaoEhPersistente(tokenAtual) : true,
    };
    const novoToken = await signSessionToken(
      {
        sub: session.user.id,
        email: payload.newEmail,
        role: session.user.role,
      },
      opcoes
    );
    await setSessionCookie(novoToken, opcoes);

    return NextResponse.json({ session: await getServerSession() });
  } catch (error) {
    // Corrida entre duas trocas para o mesmo e-mail: o índice único decide.
    if (chaveDuplicada(error)) {
      return NextResponse.json({ error: EMAIL_EM_USO }, { status: 409 });
    }
    return respostaDeErro(error, 'Falha ao trocar o e-mail da conta.');
  }
}
