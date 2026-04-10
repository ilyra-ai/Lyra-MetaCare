import { NextRequest, NextResponse } from 'next/server';

import { createStripePortalUrl } from '@/lib/billing/service';
import { getHttpErrorStatus } from '@/lib/http-error';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await requireServerSession();
    const url = await createStripePortalUrl({
      session,
      origin: request.nextUrl.origin,
    });

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao criar a sessão do portal de cobrança.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
