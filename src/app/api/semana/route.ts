import { NextResponse } from 'next/server';

import { respostaDeErro } from '@/lib/http/api';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { lerSemana } from '@/lib/semana/servico';

export const runtime = 'nodejs';

/** Retrospectiva dos últimos 7 dias da própria pessoa. */
export async function GET() {
  try {
    const session = await requireServerSession();
    const semana = await lerSemana(session.user.id);
    return NextResponse.json(semana, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao montar a sua semana.');
  }
}
