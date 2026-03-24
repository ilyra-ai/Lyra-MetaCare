import { NextResponse } from 'next/server';

import {
  extractMetricCompleteness,
  MetricSnapshot,
} from '@/lib/ai/score-engine';
import { getHttpErrorStatus } from '@/lib/http-error';
import { NUMERIC_METRIC_COLUMNS } from '@/lib/mysql/table-config';
import { queryRows } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await requireServerSession();
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Acesso restrito a administradores.' },
        },
        { status: 403 }
      );
    }

    const columns = NUMERIC_METRIC_COLUMNS.join(', ');
    const metrics = await queryRows<MetricSnapshot>(
      `SELECT ${columns} FROM daily_metrics`
    );
    return NextResponse.json({
      data: extractMetricCompleteness(metrics),
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Falha no RPC analítico.',
        },
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
