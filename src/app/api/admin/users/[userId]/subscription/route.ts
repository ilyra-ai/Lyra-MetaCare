import { NextResponse } from 'next/server';
import { z } from 'zod';

import { lerJson, respostaDeErro } from '@/lib/http/api';
import { requireAdminSession } from '@/lib/mysql/server-auth';
import {
  assignPlanToUserByAdmin,
  getUserSubscriptionAssignment,
} from '@/lib/plans/service';
import { PLAN_KEYS } from '@/types/subscription';

export const runtime = 'nodejs';

const userIdSchema = z.uuid('Identificador de usuário inválido.');

const updateSchema = z.object({
  planKey: z.enum(PLAN_KEYS),
  billingInterval: z.enum(['monthly', 'annual']).default('monthly'),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdminSession();
    const userId = userIdSchema.parse((await params).userId);
    const assignment = await getUserSubscriptionAssignment(userId);
    return NextResponse.json(assignment);
  } catch (error) {
    return respostaDeErro(error, 'Falha ao carregar a assinatura do usuário.');
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const adminSession = await requireAdminSession();
    const userId = userIdSchema.parse((await params).userId);
    const payload = await lerJson(request, updateSchema);

    const assignment = await assignPlanToUserByAdmin({
      targetUserId: userId,
      actorUserId: adminSession.user.id,
      planKey: payload.planKey,
      billingInterval: payload.billingInterval,
    });

    return NextResponse.json(assignment);
  } catch (error) {
    return respostaDeErro(error, 'Falha ao atualizar a assinatura do usuário.');
  }
}
