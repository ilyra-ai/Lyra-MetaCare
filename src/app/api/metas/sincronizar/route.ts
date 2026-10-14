import { NextResponse } from 'next/server';

import { respostaDeErro } from '@/lib/http/api';
import { calculateAdherenceScore } from '@/lib/kpi/assessment-engine';
import {
  CRITERIOS_DAS_SEQUENCIAS,
  getUserStreaks,
} from '@/lib/kpi/streak-repository';
import { atualizarMetasESequencias } from '@/lib/metas/servico';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { requireFeatureEnabled } from '@/lib/plans/service';

export const runtime = 'nodejs';

/**
 * Recalcula as metas automáticas, os prazos e as sequências da pessoa com o
 * registro do dia, e devolve as sequências com a aderência. Chamada ao abrir
 * a página de metas (as gravações de métricas já recalculam sozinhas).
 */
export async function POST() {
  try {
    const session = await requireServerSession();
    await requireFeatureEnabled(session, 'goal_progress_tracking');
    const { hoje, metasAlteradas } = await atualizarMetasESequencias(
      session.user.id
    );
    const sequencias = await getUserStreaks(session.user.id);
    return NextResponse.json(
      {
        hoje,
        metasAlteradas,
        sequencias: sequencias.map((s) => ({
          tipo: s.streak_type,
          atual: Number(s.current_streak),
          maisLonga: Number(s.longest_streak),
          ultimoDia: String(s.last_activity_date).slice(0, 10),
          ...(s.streak_type in CRITERIOS_DAS_SEQUENCIAS
            ? CRITERIOS_DAS_SEQUENCIAS[
                s.streak_type as keyof typeof CRITERIOS_DAS_SEQUENCIAS
              ]
            : { rotulo: s.streak_type, regra: '' }),
        })),
        aderencia: calculateAdherenceScore(sequencias),
      },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    return respostaDeErro(error, 'Falha ao atualizar metas e sequências.');
  }
}
