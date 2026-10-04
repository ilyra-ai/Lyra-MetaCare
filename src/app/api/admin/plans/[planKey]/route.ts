import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getHttpErrorStatus } from '@/lib/http-error';
import { requireAdminSession } from '@/lib/mysql/server-auth';
import { updatePlanMatrixByKey } from '@/lib/plans/service';
import { PLAN_KEYS, PlanMatrixUpdateInput } from '@/types/subscription';

export const runtime = 'nodejs';

// O segmento dinâmico chega como string qualquer; ele só é aceito se for uma
// das chaves de plano conhecidas (ZodError → HTTP 400).
const planKeySchema = z.enum(PLAN_KEYS);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ planKey: string }> }
) {
  try {
    await requireAdminSession();
    const planKey = planKeySchema.parse((await params).planKey);
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
