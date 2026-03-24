import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createStripeCheckoutUrl } from '@/lib/billing/service';
import { getHttpErrorStatus, HttpError } from '@/lib/http-error';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { PLAN_KEYS } from '@/types/subscription';

export const runtime = 'nodejs';

const checkoutPayloadSchema = z.object({
  planKey: z.enum(PLAN_KEYS),
  billingInterval: z.enum(['monthly', 'annual']),
});

function parseCheckoutPayload(payload: unknown) {
  const result = checkoutPayloadSchema.safeParse(payload);

  if (result.success) {
    return result.data;
  }

  const issues = result.error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'payload';
      return `${path}: ${issue.message}`;
    })
    .join('; ');

  throw new HttpError(
    `Payload inválido para criação do checkout. ${issues}`,
    400
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireServerSession();
    const rawPayload = await request.json().catch(() => {
      throw new HttpError('Corpo JSON inválido para criação do checkout.', 400);
    });
    const payload = parseCheckoutPayload(rawPayload);
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
