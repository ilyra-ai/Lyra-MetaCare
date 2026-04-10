import { NextRequest, NextResponse } from 'next/server';

import { processStripeWebhook } from '@/lib/billing/service';
import { getHttpErrorStatus } from '@/lib/http-error';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');
    const result = await processStripeWebhook({ payload, signature });

    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao processar o webhook Stripe.',
      },
      { status: getHttpErrorStatus(error, 400) }
    );
  }
}
