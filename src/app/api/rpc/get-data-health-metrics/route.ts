import { NextResponse } from 'next/server';

import {
  extractMetricCompleteness,
  MetricSnapshot,
} from '@/lib/ai/score-engine';
import { respostaDeErroDados } from '@/lib/http/api';
import { queryRows } from '@/lib/mysql/pool';
import { requireAdminSession } from '@/lib/mysql/server-auth';
import { NUMERIC_METRIC_COLUMNS } from '@/lib/mysql/table-config';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdminSession();
    const columns = NUMERIC_METRIC_COLUMNS.join(', ');
    const metrics = await queryRows<MetricSnapshot>(
      `SELECT ${columns} FROM daily_metrics`
    );
    return NextResponse.json({
      data: extractMetricCompleteness(metrics),
      error: null,
    });
  } catch (error) {
    return respostaDeErroDados(error, 'Falha no RPC analítico.');
  }
}
