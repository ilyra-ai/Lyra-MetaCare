import { NextResponse } from 'next/server';

import { generateLocalAssistantReply } from '@/lib/ai/chat-engine';
import { getAstrologicalContext } from '@/lib/astrology/engine';
import { getHttpErrorStatus } from '@/lib/http-error';
import { queryRows } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { consumeUsageQuota } from '@/lib/plans/service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const { query } = (await request.json()) as { query: string };
    if (!query?.trim()) {
      return NextResponse.json(
        { error: 'Pergunta obrigatória.' },
        { status: 400 }
      );
    }

    const [profile] = await queryRows<{
      first_name: string | null;
      goals: string | null;
      birth_date: string | null;
      birth_time: string | null;
      birth_location: string | null;
    }>(
      'SELECT first_name, goals, birth_date, birth_time, birth_location FROM profiles WHERE id = ? LIMIT 1',
      [session.user.id]
    );
    const [latestMetric] = await queryRows<{
      steps: number | null;
      sleep_duration_minutes: number | null;
      hrv_ms: number | null;
      readiness_score: number | null;
      blood_glucose_mgdl: number | null;
    }>(
      `
        SELECT steps, sleep_duration_minutes, hrv_ms, readiness_score, blood_glucose_mgdl
        FROM daily_metrics
        WHERE user_id = ?
        ORDER BY date DESC
        LIMIT 1
      `,
      [session.user.id]
    );

    const response = generateLocalAssistantReply(query, {
      profile: profile
        ? {
            first_name: profile.first_name,
            goals: profile.goals ? JSON.parse(profile.goals) : null,
          }
        : null,
      latestMetric: latestMetric ?? null,
      astrology: getAstrologicalContext(new Date(), profile ?? undefined),
    });

    await consumeUsageQuota({
      session,
      featureKey: 'ai_chat_messages',
    });

    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Falha no assistente local.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
