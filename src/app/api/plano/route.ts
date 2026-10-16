import { NextResponse } from 'next/server';

import { obterPlanoAtualizado } from '@/lib/ai/plano-do-dia';
import { respostaDeErro } from '@/lib/http/api';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { requireFeatureEnabled } from '@/lib/plans/service';

export const runtime = 'nodejs';

/**
 * Plano de IA do dia, sempre pronto: criado sozinho na primeira leitura
 * (`primeiro: true`) e refeito quando é de outro dia ou quando o registro do
 * dia mudou, sem consumir a cota de gerações manuais.
 */
export async function GET() {
  try {
    const session = await requireServerSession();
    await requireFeatureEnabled(session, 'ai_plan_generations');
    const resultado = await obterPlanoAtualizado(session.user.id);
    return NextResponse.json(resultado, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao carregar o plano.');
  }
}
