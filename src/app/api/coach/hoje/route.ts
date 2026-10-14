import { NextResponse } from 'next/server';

import { obterBriefingDoDia } from '@/lib/coach/servico';
import { respostaDeErro } from '@/lib/http/api';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { requireFeatureEnabled } from '@/lib/plans/service';

export const runtime = 'nodejs';

/**
 * "Seu dia" de hoje (coach diário). Gera na primeira leitura do dia e refaz
 * quando o check-in, a pulseira ou a cidade mudaram desde a última geração.
 */
export async function GET() {
  try {
    const session = await requireServerSession();
    await requireFeatureEnabled(session, 'ai_tips_feed');
    const estado = await obterBriefingDoDia(session.user.id);
    return NextResponse.json(estado, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao preparar o seu dia.');
  }
}
