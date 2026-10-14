import { NextResponse } from 'next/server';
import { z } from 'zod';

import { lerJson, respostaDeErro } from '@/lib/http/api';
import { requireServerSession } from '@/lib/mysql/server-auth';
import {
  listarNotificacoes,
  marcarComoLidas,
} from '@/lib/notificacoes/servico';

export const runtime = 'nodejs';

/** Notificações do sino do próprio titular (as 30 mais recentes). */
export async function GET() {
  try {
    const session = await requireServerSession();
    const resultado = await listarNotificacoes(session.user.id);
    return NextResponse.json(resultado, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao carregar as notificações.');
  }
}

const leituraSchema = z.union([
  z.object({ todas: z.literal(true) }),
  z.object({ ids: z.array(z.uuid()).min(1).max(100) }),
]);

/** Marca como lidas as notificações informadas, ou todas. */
export async function PATCH(request: Request) {
  try {
    const session = await requireServerSession();
    const corpo = await lerJson(request, leituraSchema);
    const marcadas = await marcarComoLidas(
      session.user.id,
      'ids' in corpo ? corpo.ids : null
    );
    return NextResponse.json({ marcadas });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao atualizar as notificações.');
  }
}
