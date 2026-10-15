import { NextResponse } from 'next/server';

import { lerJson, respostaDeErro } from '@/lib/http/api';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { reflexaoSchema } from '@/lib/reflexao/esquema';
import {
  apagarReflexao,
  lerEstadoDaReflexao,
  salvarReflexao,
} from '@/lib/reflexao/servico';

export const runtime = 'nodejs';

const SEM_CACHE = { 'Cache-Control': 'private, no-store' };

function dataDaBusca(request: Request) {
  return new URL(request.url).searchParams.get('data') ?? undefined;
}

/** Reflexão da noite de hoje (ou de ontem, com `?data=`) do próprio titular. */
export async function GET(request: Request) {
  try {
    const session = await requireServerSession();
    const estado = await lerEstadoDaReflexao(
      session.user.id,
      dataDaBusca(request)
    );
    return NextResponse.json(estado, { headers: SEM_CACHE });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao ler a sua reflexão.');
  }
}

/** Grava ou substitui a reflexão (notas de 1 a 5 e uma frase opcional). */
export async function PUT(request: Request) {
  try {
    const session = await requireServerSession();
    const entrada = await lerJson(request, reflexaoSchema);
    const estado = await salvarReflexao(session.user.id, entrada);
    return NextResponse.json(estado, { headers: SEM_CACHE });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao gravar a sua reflexão.');
  }
}

/** Apaga a reflexão de hoje (ou de ontem, com `?data=`). */
export async function DELETE(request: Request) {
  try {
    const session = await requireServerSession();
    const estado = await apagarReflexao(session.user.id, dataDaBusca(request));
    return NextResponse.json(estado, { headers: SEM_CACHE });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao apagar a sua reflexão.');
  }
}
