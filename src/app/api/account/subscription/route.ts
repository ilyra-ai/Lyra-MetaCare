import { NextResponse } from 'next/server';

import { getHttpErrorStatus } from '@/lib/http-error';
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
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao carregar a assinatura.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
