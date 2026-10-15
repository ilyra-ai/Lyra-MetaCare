import { NextResponse } from 'next/server';

import {
  apagarAssinatura,
  criarAssinatura,
  lerAssinatura,
  origemPublica,
} from '@/lib/calendario/servico';
import { respostaDeErro } from '@/lib/http/api';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

const SEM_CACHE = { 'Cache-Control': 'private, no-store' };

function contexto(request: Request) {
  const url = new URL(request.url);
  return {
    origem: origemPublica(url.origin),
    lembretes: url.searchParams.get('lembretes') !== 'nao',
  };
}

/** Link de assinatura da agenda da própria pessoa (se houver). */
export async function GET(request: Request) {
  try {
    const session = await requireServerSession();
    const { origem, lembretes } = contexto(request);
    const estado = await lerAssinatura(session.user.id, origem, lembretes);
    return NextResponse.json(estado, { headers: SEM_CACHE });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao ler o link da agenda.');
  }
}

/** Cria o link ou troca o anterior (que para de funcionar na hora). */
export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const { origem, lembretes } = contexto(request);
    const estado = await criarAssinatura(session.user.id, origem, lembretes);
    return NextResponse.json(estado, { status: 201, headers: SEM_CACHE });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao criar o link da agenda.');
  }
}

/** Desativa o link: o app de calendário deixa de receber as janelas. */
export async function DELETE(request: Request) {
  try {
    const session = await requireServerSession();
    const { origem } = contexto(request);
    const estado = await apagarAssinatura(session.user.id, origem);
    return NextResponse.json(estado, { headers: SEM_CACHE });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao desativar o link da agenda.');
  }
}
