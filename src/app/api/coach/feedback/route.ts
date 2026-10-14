import { NextResponse } from 'next/server';
import { z } from 'zod';

import { registrarFeedback } from '@/lib/coach/servico';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { dataDoRegistroSchema } from '@/lib/metricas/registro-do-dia';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

const feedbackSchema = z.object({
  data: dataDoRegistroSchema,
  util: z.boolean(),
});

/** "Isso te ajudou?" do briefing do dia. */
export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const { data, util } = await lerJson(request, feedbackSchema);
    await registrarFeedback(session.user.id, data, util);
    return NextResponse.json({ feedback: util ? 1 : -1 });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao registrar a sua avaliação.');
  }
}
