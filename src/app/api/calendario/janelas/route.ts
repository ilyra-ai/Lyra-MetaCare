import { NextResponse } from 'next/server';

import { janelasDeHoje } from '@/lib/calendario/servico';
import { respostaDeErro } from '@/lib/http/api';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

/** Janelas de hoje (as mesmas do arquivo .ics e do link de assinatura). */
export async function GET() {
  try {
    const session = await requireServerSession();
    const janelas = await janelasDeHoje(session.user.id);
    return NextResponse.json(janelas, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao calcular as janelas de hoje.');
  }
}
