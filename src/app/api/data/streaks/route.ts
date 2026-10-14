import { NextResponse } from 'next/server';

import { respostaDeErro } from '@/lib/http/api';
import { calculateAdherenceScore } from '@/lib/kpi/assessment-engine';
import { getUserStreaks } from '@/lib/kpi/streak-repository';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

/**
 * Sequências e aderência da própria pessoa. As sequências são calculadas
 * pelo servidor a partir do registro do dia (check-in e pulseira) e em
 * `POST /api/metas/sincronizar`; o navegador não as declara.
 */
export async function GET() {
  try {
    const session = await requireServerSession();
    const streaks = await getUserStreaks(session.user.id);
    const adherence = calculateAdherenceScore(streaks);

    return NextResponse.json({ success: true, streaks, adherence });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao buscar consistência.');
  }
}
