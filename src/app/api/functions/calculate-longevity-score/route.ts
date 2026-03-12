import { NextResponse } from 'next/server';

import {
  calculateLongevityScores,
  MetricSnapshot,
} from '@/lib/ai/score-engine';
import { getHttpErrorStatus } from '@/lib/http-error';
import { queryRows } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const session = await requireServerSession();
    const [metric] = await queryRows<MetricSnapshot>(
      'SELECT * FROM daily_metrics WHERE user_id = ? ORDER BY date DESC LIMIT 1',
      [session.user.id]
    );
    const [config] = await queryRows<{
      weight_hrv: number;
      weight_sleep: number;
      weight_activity: number;
      weight_nutrition: number;
    }>(
      'SELECT weight_hrv, weight_sleep, weight_activity, weight_nutrition FROM ai_config LIMIT 1'
    );

    return NextResponse.json(
      calculateLongevityScores(metric ?? null, config ?? undefined)
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Falha no cálculo local.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
