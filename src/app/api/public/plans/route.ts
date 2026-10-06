import { NextResponse } from 'next/server';

import { respostaDeErro } from '@/lib/http/api';
import { getPlanMatrix } from '@/lib/plans/service';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const matrix = await getPlanMatrix();
    return NextResponse.json({
      plans: matrix.plans.filter((plan) => plan.isActive && plan.isPublic),
    });
  } catch (error) {
    return respostaDeErro(
      error,
      'Falha ao carregar o catálogo público de planos.'
    );
  }
}
