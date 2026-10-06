import { NextResponse } from 'next/server';
import { z } from 'zod';

import { generateLocalWellnessPlan } from '@/lib/ai/plan-engine';
import { getAstrologicalContext } from '@/lib/astrology/engine';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { listaDeTextos } from '@/lib/json-values';
import { queryRows, withTransaction } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { consumeUsageQuota } from '@/lib/plans/service';

export const runtime = 'nodejs';

// Leituras ao vivo do dispositivo (opcionais); fora das faixas fisiológicas
// plausíveis são recusadas em vez de distorcer o plano.
const leitura = (minimo: number, maximo: number) =>
  z.number().finite().min(minimo).max(maximo).nullable().optional();

const pedidoSchema = z.object({
  metrics: z
    .object({
      hrv_ms: leitura(0, 400),
      sleep_duration_minutes: leitura(0, 1440),
      steps: leitura(0, 200_000),
      blood_glucose_mgdl: leitura(10, 1000),
      weight_kg: leitura(1, 700),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const payload = await lerJson(request, pedidoSchema);
    const [profile] = await queryRows<{
      goals: unknown;
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

    const liveMetrics = payload.metrics ?? {};

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
      goals: listaDeTextos(profile?.goals),
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
    return respostaDeErro(error, 'Falha ao gerar o plano local.');
  }
}
