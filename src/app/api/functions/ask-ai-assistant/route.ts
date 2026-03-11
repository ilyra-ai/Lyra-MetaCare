import { NextResponse } from 'next/server';

import { generateLocalAssistantReply } from '@/lib/ai/chat-engine';
import { getAstrologicalContext } from '@/lib/astrology/engine';
import { queryRows } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const { query } = (await request.json()) as { query: string };
    if (!query?.trim()) {
      return NextResponse.json({ error: 'Pergunta obrigatória.' }, { status: 400 });
    }

    const [profile] = await queryRows<Array<{ first_name: string | null; goals: string | null }>>(
      'SELECT first_name, goals FROM profiles WHERE id = ? LIMIT 1',
      [session.user.id]
    );
    const [latestMetric] = await queryRows<
      Array<{
        steps: number | null;
        sleep_duration_minutes: number | null;
        hrv_ms: number | null;
        readiness_score: number | null;
        blood_glucose_mgdl: number | null;
      }>
    >(
      `
        SELECT steps, sleep_duration_minutes, hrv_ms, readiness_score, blood_glucose_mgdl
        FROM daily_metrics
        WHERE user_id = ?
        ORDER BY date DESC
        LIMIT 1
      `,
      [session.user.id]
    );

    return NextResponse.json({
      response: generateLocalAssistantReply(query, {
        profile: profile
          ? {
              first_name: profile.first_name,
              goals: profile.goals ? JSON.parse(profile.goals) : null
            }
          : null,
        latestMetric: latestMetric ?? null,
        astrology: getAstrologicalContext()
      })
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha no assistente local.' },
      { status: 500 }
    );
  }
}
