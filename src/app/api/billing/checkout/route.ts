import { NextRequest, NextResponse } from 'next/server';

import { createStripeCheckoutUrl } from '@/lib/billing/service';
import { getHttpErrorStatus } from '@/lib/http-error';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { PlanKey } from '@/types/subscription';

export const runtime = 'nodejs';

interface CheckoutPayload {
  planKey: PlanKey;
  billingInterval: 'monthly' | 'annual';
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireServerSession();
    const payload = (await request.json()) as CheckoutPayload;
    const url = await createStripeCheckoutUrl({
      session,
      planKey: payload.planKey,
      billingInterval: payload.billingInterval,
      origin: request.nextUrl.origin,
    });

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao criar a sessão de checkout.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
