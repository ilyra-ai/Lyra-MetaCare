import { NextResponse } from 'next/server';
import { z } from 'zod';

import { gerarPlanoDaPessoa, gravarPlano } from '@/lib/ai/plano-do-dia';
import { lerJsonOpcional, respostaDeErro } from '@/lib/http/api';
import { withTransaction } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { consumeUsageQuota } from '@/lib/plans/service';

export const runtime = 'nodejs';

// O plano usa só dados do servidor (registro do dia, perfil e céu); o corpo,
// quando enviado, precisa ser um objeto vazio.
const pedidoSchema = z.object({}).strict();

/**
 * Geração manual do plano ("Gerar"/"Regenerar"), que consome a cota do
 * plano. A atualização diária automática é feita por `GET /api/plano`.
 */
export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    // Só valida (o corpo não traz dados: o plano usa os do servidor).
    await lerJsonOpcional(request, pedidoSchema);

    const plano = await gerarPlanoDaPessoa(session.user.id, 'manual');
    await withTransaction(async (connection) => {
      await consumeUsageQuota({
        session,
        featureKey: 'ai_plan_generations',
        connection,
      });
      await gravarPlano(session.user.id, plano, connection);
    });

    return NextResponse.json(plano);
  } catch (error) {
    return respostaDeErro(error, 'Falha ao gerar o plano local.');
  }
}
