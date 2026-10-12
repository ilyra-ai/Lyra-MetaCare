import { NextResponse } from 'next/server';
import { z } from 'zod';

import { confirmarSenhaAtual } from '@/lib/auth/confirmar-senha';
import { clearSessionCookie } from '@/lib/auth/session';
import { HttpError } from '@/lib/http-error';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { excluirConta } from '@/lib/lgpd/conta';
import { FRASE_DE_EXCLUSAO } from '@/lib/lgpd/documentos';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

const exclusaoSchema = z.object({
  currentPassword: z
    .string()
    .trim()
    .min(1, 'Informe a senha atual para confirmar a exclusão.')
    .max(200),
  confirmation: z.string().trim().max(60),
});

/**
 * Exclusão da própria conta (LGPD, art. 18, VI). Exige a senha atual e a
 * frase de confirmação digitada. Apaga todos os dados pessoais; ficam só os
 * registros fiscais obrigatórios, desvinculados da conta.
 */
export async function DELETE(request: Request) {
  try {
    const session = await requireServerSession();
    const payload = await lerJson(request, exclusaoSchema);

    if (payload.confirmation.toUpperCase() !== FRASE_DE_EXCLUSAO) {
      throw new HttpError(
        `Digite "${FRASE_DE_EXCLUSAO}" para confirmar a exclusão.`,
        400
      );
    }

    await confirmarSenhaAtual({
      userId: session.user.id,
      email: session.user.email,
      senha: payload.currentPassword,
    });

    await excluirConta(session.user.id);
    await clearSessionCookie();

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao excluir a conta.');
  }
}
