import { NextResponse } from 'next/server';

import { getHttpErrorStatus } from '@/lib/http-error';
import { requireAdminSession } from '@/lib/mysql/server-auth';
import { getPlanMatrix } from '@/lib/plans/service';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdminSession();
    const matrix = await getPlanMatrix();
    return NextResponse.json(matrix);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao carregar os planos.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
