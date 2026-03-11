import { NextResponse } from 'next/server';

import { calculateLongevityScores } from '@/lib/ai/score-engine';
import { queryRows } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const session = await requireServerSession();
    const [metric] = await queryRows<Record<string, unknown>[]>(
      'SELECT * FROM daily_metrics WHERE user_id = ? ORDER BY date DESC LIMIT 1',
      [session.user.id]
    );
    const [config] = await queryRows<Record<string, unknown>[]>(
      'SELECT weight_hrv, weight_sleep, weight_activity, weight_nutrition FROM ai_config LIMIT 1'
    );

    return NextResponse.json(calculateLongevityScores(metric ?? null, config ?? undefined));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha no cálculo local.' },
      { status: 500 }
    );
  }
}
