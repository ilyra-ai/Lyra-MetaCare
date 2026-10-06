import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { processStripeWebhook } from '@/lib/billing/service';
import { mensagemDeErro, statusDeErro } from '@/lib/http/api';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');
    const result = await processStripeWebhook({ payload, signature });

    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    // Assinatura inválida: 400 (a Stripe não deve reenviar). Falha interna
    // (ex.: banco fora do ar): 5xx, para que a Stripe reenvie o evento; antes
    // toda falha virava 400 e o evento se perdia.
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      return NextResponse.json(
        { error: 'Assinatura do webhook inválida.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: mensagemDeErro(error, 'Falha ao processar o webhook Stripe.'),
      },
      { status: statusDeErro(error) }
    );
  }
}
