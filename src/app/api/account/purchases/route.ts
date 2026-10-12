import { NextResponse } from 'next/server';

import { respostaDeErro } from '@/lib/http/api';
import { listarComprasDoTitular } from '@/lib/lgpd/conta';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

/** Histórico de compras: só as faturas pagas da própria conta. */
export async function GET() {
  try {
    const session = await requireServerSession();
    const compras = await listarComprasDoTitular(session.user.id);
    return NextResponse.json(
      { compras },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return respostaDeErro(error, 'Falha ao carregar o histórico de compras.');
  }
}
