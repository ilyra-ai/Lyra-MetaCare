import { NextResponse } from 'next/server';

import { dicaDoDia } from '@/lib/ai/dica-do-dia';
import { respostaDeErro } from '@/lib/http/api';
import { hojeDaPessoa } from '@/lib/metas/servico';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { requireFeatureEnabled } from '@/lib/plans/service';

export const runtime = 'nodejs';

/**
 * Dica do dia escolhida pelos sinais registrados hoje (sono, estresse,
 * movimento, água, proteína); sem sinal que aponte uma área, roda por dia.
 * `dica` é null quando não há nenhuma dica ativa cadastrada.
 */
export async function GET() {
  try {
    const session = await requireServerSession();
    await requireFeatureEnabled(session, 'ai_tips_feed');
    const hoje = await hojeDaPessoa(session.user.id);
    const escolha = await dicaDoDia(session.user.id, hoje);
    return NextResponse.json(
      { dica: escolha?.dica ?? null, motivo: escolha?.motivo ?? null },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    return respostaDeErro(error, 'Falha ao escolher a dica do dia.');
  }
}
