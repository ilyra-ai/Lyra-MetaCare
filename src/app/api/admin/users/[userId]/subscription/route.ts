import { NextResponse } from 'next/server';

import { getHttpErrorStatus } from '@/lib/http-error';
import { requireAdminSession } from '@/lib/mysql/server-auth';
import {
  assignPlanToUserByAdmin,
  getUserSubscriptionAssignment,
} from '@/lib/plans/service';
import { PlanKey } from '@/types/subscription';

export const runtime = 'nodejs';

interface UpdateUserSubscriptionPayload {
  planKey: PlanKey;
  billingInterval?: 'monthly' | 'annual';
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdminSession();
    const { userId } = await params;
    const assignment = await getUserSubscriptionAssignment(userId);
    return NextResponse.json(assignment);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao carregar a assinatura do usuário.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const adminSession = await requireAdminSession();
    const { userId } = await params;
    const payload = (await request.json()) as UpdateUserSubscriptionPayload;

    const assignment = await assignPlanToUserByAdmin({
      targetUserId: userId,
      actorUserId: adminSession.user.id,
      planKey: payload.planKey,
      billingInterval: payload.billingInterval ?? 'monthly',
    });

    return NextResponse.json(assignment);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao atualizar a assinatura do usuário.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
