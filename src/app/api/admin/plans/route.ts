import { NextResponse } from 'next/server';

import { respostaDeErro } from '@/lib/http/api';
import { requireAdminSession } from '@/lib/mysql/server-auth';
import { getPlanMatrix } from '@/lib/plans/service';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdminSession();
    const matrix = await getPlanMatrix();
    return NextResponse.json(matrix);
  } catch (error) {
    return respostaDeErro(error, 'Falha ao carregar os planos.');
  }
}
