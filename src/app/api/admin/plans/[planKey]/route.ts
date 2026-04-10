import { NextResponse } from 'next/server';

import { getHttpErrorStatus } from '@/lib/http-error';
import { requireAdminSession } from '@/lib/mysql/server-auth';
import { updatePlanMatrixByKey } from '@/lib/plans/service';
import { PlanKey, PlanMatrixUpdateInput } from '@/types/subscription';

export const runtime = 'nodejs';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ planKey: PlanKey }> }
) {
  try {
    await requireAdminSession();
    const { planKey } = await params;
    const payload = (await request.json()) as PlanMatrixUpdateInput;
    const matrix = await updatePlanMatrixByKey(planKey, payload);
    return NextResponse.json(matrix);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao atualizar o plano.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
