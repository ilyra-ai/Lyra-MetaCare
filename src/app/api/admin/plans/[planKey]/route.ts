import { NextResponse } from 'next/server';
import { z } from 'zod';

import { lerJson, respostaDeErro } from '@/lib/http/api';
import { requireAdminSession } from '@/lib/mysql/server-auth';
import { updatePlanMatrixByKey } from '@/lib/plans/service';
import { PLAN_FEATURE_KEYS, PLAN_KEYS } from '@/types/subscription';

export const runtime = 'nodejs';

// O segmento dinâmico só é aceito se for uma das chaves de plano conhecidas.
const planKeySchema = z.enum(PLAN_KEYS);

const textoOpcional = z
  .string()
  .trim()
  .max(255)
  .nullable()
  .transform((valor) => (valor ? valor : null));

// As cores entram em `linear-gradient(...)` na landing e no painel: só
// hexadecimal, para não permitir injeção de CSS.
const corSchema = z
  .string()
  .trim()
  .regex(/^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Use uma cor hexadecimal.');

const planMatrixUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  tagline: z.string().trim().max(255),
  description: z.string().trim().max(2000),
  monthlyPrice: z.number().finite().min(0).max(1_000_000),
  annualPrice: z.number().finite().min(0).max(10_000_000),
  currencyCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, 'Use o código ISO 4217 de 3 letras.'),
  highlightText: textoOpcional,
  accentFrom: corSchema,
  accentTo: corSchema,
  isActive: z.boolean(),
  isPublic: z.boolean(),
  externalProductId: textoOpcional,
  externalMonthlyPriceId: textoOpcional,
  externalAnnualPriceId: textoOpcional,
  features: z
    .array(
      z.object({
        key: z.enum(PLAN_FEATURE_KEYS),
        enabled: z.boolean(),
        quotaValue: z.number().int().min(0).max(1_000_000).nullable(),
        resetInterval: z.enum(['monthly', 'concurrent', 'rolling']).nullable(),
      })
    )
    .max(PLAN_FEATURE_KEYS.length),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ planKey: string }> }
) {
  try {
    await requireAdminSession();
    const planKey = planKeySchema.parse((await params).planKey);
    const payload = await lerJson(request, planMatrixUpdateSchema);
    const matrix = await updatePlanMatrixByKey(planKey, payload);
    return NextResponse.json(matrix);
  } catch (error) {
    return respostaDeErro(error, 'Falha ao atualizar o plano.');
  }
}
