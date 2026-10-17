import { NextResponse } from 'next/server';

import { getServerSession } from '@/lib/mysql/server-auth';
import { registrarErroInterno } from '@/lib/observability/log-seguro';

export const runtime = 'nodejs';

/**
 * Sessão atual. Uma falha do banco responde 503 com corpo JSON (tarefa 58):
 * antes virava 500 sem corpo, e o app tratava a pessoa logada como
 * visitante, mostrando a landing.
 */
export async function GET() {
  try {
    const session = await getServerSession();
    return NextResponse.json({ session });
  } catch (error) {
    registrarErroInterno('auth/session', error);
    return NextResponse.json(
      {
        error:
          'Não foi possível confirmar a sessão agora. Tente de novo em instantes.',
      },
      { status: 503, headers: { 'Retry-After': '5' } }
    );
  }
}
