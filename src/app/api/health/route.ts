import { NextResponse } from 'next/server';

import { getHealthReport } from '@/lib/health/service';

export const runtime = 'nodejs';
// Sempre avaliado no momento da requisição (nunca pré-renderizado no build).
export const dynamic = 'force-dynamic';

export async function GET() {
  const report = await getHealthReport();

  return NextResponse.json(report, {
    status: report.status === 'ok' ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
