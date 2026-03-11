import { NextResponse } from 'next/server';

import { generateLocalWellnessPlan } from '@/lib/ai/plan-engine';
import { executeStatement, queryRows } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const payload = await request.json();
    const plan = generateLocalWellnessPlan(payload);
    const planId = crypto.randomUUID();

    await executeStatement(
      `
        INSERT INTO ai_plans (id, user_id, plan_data)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          plan_data = VALUES(plan_data),
          updated_at = CURRENT_TIMESTAMP
      `,
      [planId, session.user.id, JSON.stringify(plan)]
    );

    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao gerar plano local.' },
      { status: 500 }
    );
  }
}
