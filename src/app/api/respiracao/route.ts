import { NextResponse } from 'next/server';

import { lerJson, respostaDeErro } from '@/lib/http/api';
import { requireServerSession } from '@/lib/mysql/server-auth';
import {
  lerResumoDaRespiracao,
  registrarSessaoDeRespiracao,
} from '@/lib/respiracao/servico';
import { sessaoDeRespiracaoSchema } from '@/lib/respiracao/tecnicas';

export const runtime = 'nodejs';

const SEM_CACHE = { 'Cache-Control': 'private, no-store' };

/** Sessões de hoje, minutos de meditação do dia e a técnica recomendada agora. */
export async function GET() {
  try {
    const session = await requireServerSession();
    const resumo = await lerResumoDaRespiracao(session.user.id);
    return NextResponse.json(resumo, { headers: SEM_CACHE });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao ler as suas respirações de hoje.');
  }
}

/** Registra uma sessão concluída e soma os minutos à meditação do dia. */
export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const sessao = await lerJson(request, sessaoDeRespiracaoSchema);
    const resumo = await registrarSessaoDeRespiracao(session.user.id, sessao);
    return NextResponse.json(resumo, { status: 201, headers: SEM_CACHE });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao registrar a sua respiração.');
  }
}
