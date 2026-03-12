import { NextRequest, NextResponse } from 'next/server';

import { getHttpErrorStatus } from '@/lib/http-error';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { getAccountBillingContext } from '@/lib/billing/service';

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
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao carregar o contexto de billing.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
