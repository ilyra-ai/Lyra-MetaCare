import { NextResponse } from 'next/server';

import { HttpError } from '@/lib/http-error';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { gravarRegistroDoDia, lerRegistroDoDia } from '@/lib/metricas/gravacao';
import {
  dataDoRegistroValida,
  registroDoDiaSchema,
} from '@/lib/metricas/registro-do-dia';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

/** Registro do dia do próprio titular (`?data=AAAA-MM-DD`). */
export async function GET(request: Request) {
  try {
    const session = await requireServerSession();
    const data = new URL(request.url).searchParams.get('data') ?? '';
    if (!dataDoRegistroValida(data)) {
      throw new HttpError(
        'Data do registro inválida: use o dia de hoje ou um dos últimos 7 dias.',
        400
      );
    }
    const registro = await lerRegistroDoDia(session.user.id, data);
    return NextResponse.json({ registro });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao ler o registro do dia.');
  }
}

/**
 * Check-in do dia: grava, com validação de faixa, só as métricas informadas.
 * É a única via de escrita das métricas do dia (a API genérica de dados não
 * grava em `daily_metrics`).
 */
export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const registro = await lerJson(request, registroDoDiaSchema);
    const salvo = await gravarRegistroDoDia(session.user.id, registro);
    return NextResponse.json({ registro: salvo });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao gravar o registro do dia.');
  }
}
