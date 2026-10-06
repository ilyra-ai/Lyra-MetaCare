import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createStripeCheckoutUrl } from '@/lib/billing/service';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { PLAN_KEYS } from '@/types/subscription';

export const runtime = 'nodejs';

const checkoutPayloadSchema = z.object({
  planKey: z.enum(PLAN_KEYS),
  billingInterval: z.enum(['monthly', 'annual']),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireServerSession();
    const payload = await lerJson(request, checkoutPayloadSchema);
    const url = await createStripeCheckoutUrl({
      session,
      planKey: payload.planKey,
      billingInterval: payload.billingInterval,
      origin: request.nextUrl.origin,
    });

    return NextResponse.json({ url });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao criar a sessão de checkout.');
  }
}
