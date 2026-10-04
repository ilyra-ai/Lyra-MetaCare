import { NextResponse } from 'next/server';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { getHttpErrorStatus } from '@/lib/http-error';
import { getUserStreaks, updateUserStreak } from '@/lib/kpi/streak-repository';
import { calculateAdherenceScore } from '@/lib/kpi/assessment-engine';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await requireServerSession();
    const streaks = await getUserStreaks(session.user.id);
    const adherence = calculateAdherenceScore(streaks);

    return NextResponse.json({ success: true, streaks, adherence });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao buscar consistência.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const userId = session.user.id;
    const body = await request.json();
    const { activityTypes } = body as { activityTypes: string[] };

    if (!Array.isArray(activityTypes) || activityTypes.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma atividade reportada para o streak.' },
        { status: 400 }
      );
    }

    const today = new Date();

    // Atualiza o streak para cada tipo de atividade detectada hoje
    for (const type of activityTypes) {
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
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao computar consistência diária.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
