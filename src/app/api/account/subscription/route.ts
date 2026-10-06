import { NextResponse } from 'next/server';

import { respostaDeErro } from '@/lib/http/api';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { getAccountSubscriptionSummary } from '@/lib/plans/service';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await requireServerSession();
    const summary = await getAccountSubscriptionSummary(
      session.user.id,
      session.user.role
    );

    return NextResponse.json(summary);
  } catch (error) {
    return respostaDeErro(error, 'Falha ao carregar a assinatura.');
  }
}
