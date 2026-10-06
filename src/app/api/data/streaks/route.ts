import { NextResponse } from 'next/server';
import { z } from 'zod';

import { lerJson, respostaDeErro } from '@/lib/http/api';
import { calculateAdherenceScore } from '@/lib/kpi/assessment-engine';
import { getUserStreaks, updateUserStreak } from '@/lib/kpi/streak-repository';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

const atividadesSchema = z.object({
  activityTypes: z
    .array(
      z
        .string()
        .trim()
        .regex(/^[a-z0-9_]{1,50}$/, 'Tipo de atividade inválido.')
    )
    .min(1, 'Nenhuma atividade reportada para o streak.')
    .max(20),
});

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

export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const userId = session.user.id;
    const { activityTypes } = await lerJson(request, atividadesSchema);

    const today = new Date();

    // Atualiza o streak para cada tipo de atividade detectada hoje (tipos
    // repetidos contam uma vez).
    for (const type of new Set(activityTypes)) {
      await updateUserStreak(userId, type, today);
    }

    const updatedStreaks = await getUserStreaks(userId);
    const adherence = calculateAdherenceScore(updatedStreaks);

    return NextResponse.json({
      success: true,
      streaks: updatedStreaks,
      adherence,
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao computar consistência diária.');
  }
}
