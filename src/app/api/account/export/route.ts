import { NextResponse } from 'next/server';

import { respostaDeErro } from '@/lib/http/api';
import { exportarDadosDoTitular } from '@/lib/lgpd/conta';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

/**
 * Portabilidade e acesso (LGPD, art. 18, II e V): todos os dados da própria
 * conta em JSON, num arquivo para download. Nunca inclui a senha (hash).
 */
export async function GET() {
  try {
    const session = await requireServerSession();
    const dados = await exportarDadosDoTitular(session.user.id);
    const data = new Date().toISOString().slice(0, 10);

    return new NextResponse(JSON.stringify(dados, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="lyra-meus-dados-${data}.json"`,
        // Dado pessoal: nunca em cache compartilhado nem do navegador.
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao exportar os dados da conta.');
  }
}
