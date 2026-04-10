import { NextResponse } from 'next/server';

import { getHttpErrorStatus } from '@/lib/http-error';
import { getPlanMatrix } from '@/lib/plans/service';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const matrix = await getPlanMatrix();

    return NextResponse.json({
      plans: matrix.plans.filter((plan) => plan.isActive && plan.isPublic),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao carregar o catalogo publico de planos.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
