import { NextResponse } from 'next/server';
import { z } from 'zod';

import { HttpError } from '@/lib/http-error';
import { respostaDeErro } from '@/lib/http/api';
import { excluirConta } from '@/lib/lgpd/conta';
import { requireAdminSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

const userIdSchema = z.uuid('Identificador de usuário inválido.');

/**
 * Exclusão de conta pelo administrador (pedido do titular por outro canal,
 * por exemplo). Usa o mesmo serviço da exclusão feita pela própria pessoa:
 * apaga a conta inteira e mantém só os registros fiscais, desvinculados.
 * Antes, o painel removia a conta pela API de dados, sem as verificações da
 * exclusão (assinatura paga renovável, último administrador) e sem apagar as
 * imagens enviadas.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const adminSession = await requireAdminSession();
    const userId = userIdSchema.parse((await params).userId);

    if (userId === adminSession.user.id) {
      throw new HttpError(
        'Para excluir a própria conta, use a opção na página do perfil.',
        400
      );
    }

    await excluirConta(userId);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao excluir a conta do usuário.');
  }
}
