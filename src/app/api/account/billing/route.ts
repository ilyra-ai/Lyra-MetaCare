import { NextRequest, NextResponse } from 'next/server';

import { getAccountBillingContext } from '@/lib/billing/service';
import { respostaDeErro } from '@/lib/http/api';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const session = await requireServerSession();
    const context = await getAccountBillingContext({
      session,
      origin: request.nextUrl.origin,
    });

    return NextResponse.json(context);
  } catch (error) {
    return respostaDeErro(error, 'Falha ao carregar o contexto de billing.');
  }
}
