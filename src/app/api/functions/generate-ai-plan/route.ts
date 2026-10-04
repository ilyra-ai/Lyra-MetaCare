import { NextResponse } from 'next/server';

import { generateLocalWellnessPlan } from '@/lib/ai/plan-engine';
import { getAstrologicalContext } from '@/lib/astrology/engine';
import { getHttpErrorStatus } from '@/lib/http-error';
import { queryRows, withTransaction } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { consumeUsageQuota } from '@/lib/plans/service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const payload = await request.json();
    const [profile] = await queryRows<{
      goals: string | null;
      birth_date: string | null;
      birth_time: string | null;
      birth_location: string | null;
    }>(
      `
        SELECT goals, birth_date, birth_time, birth_location
        FROM profiles
        WHERE id = ?
        LIMIT 1
      `,
      [session.user.id]
    );
    const [latestMetrics] = await queryRows<{
      hrv_ms: number | null;
      sleep_duration_minutes: number | null;
      steps: number | null;
      blood_glucose_mgdl: number | null;
      weight_kg: number | null;
    }>(
      `
        SELECT hrv_ms, sleep_duration_minutes, steps, blood_glucose_mgdl, weight_kg
        FROM daily_metrics
        WHERE user_id = ?
        ORDER BY date DESC
        LIMIT 1
      `,
      [session.user.id]
    );

    const liveMetrics = (payload?.metrics ?? {}) as Partial<{
      hrv_ms: number | null;
      sleep_duration_minutes: number | null;
      steps: number | null;
      blood_glucose_mgdl: number | null;
      weight_kg: number | null;
    }>;

    const plan = generateLocalWellnessPlan({
      metrics: {
        hrv_ms: liveMetrics.hrv_ms ?? latestMetrics?.hrv_ms ?? null,
        sleep_duration_minutes:
          liveMetrics.sleep_duration_minutes ??
          latestMetrics?.sleep_duration_minutes ??
          null,
        steps: liveMetrics.steps ?? latestMetrics?.steps ?? null,
        blood_glucose_mgdl:
          liveMetrics.blood_glucose_mgdl ??
          latestMetrics?.blood_glucose_mgdl ??
          null,
        weight_kg: liveMetrics.weight_kg ?? latestMetrics?.weight_kg ?? null,
      },
      astrology: getAstrologicalContext(new Date(), profile ?? undefined),
      goals: profile?.goals ? JSON.parse(profile.goals) : [],
    });
    const planId = crypto.randomUUID();

    await withTransaction(async (connection) => {
      await consumeUsageQuota({
        session,
        featureKey: 'ai_plan_generations',
        connection,
      });

      await connection.execute(
        `
          INSERT INTO ai_plans (id, user_id, plan_data)
          VALUES (?, ?, ?) AS novo
          ON DUPLICATE KEY UPDATE
            plan_data = novo.plan_data,
            updated_at = CURRENT_TIMESTAMP
        `,
        [planId, session.user.id, JSON.stringify(plan)]
      );
    });

    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao gerar plano local.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
