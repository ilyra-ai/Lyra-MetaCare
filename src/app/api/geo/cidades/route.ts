import { NextResponse } from 'next/server';

import { buscarCidades } from '@/lib/geo/cidades';
import { respostaDeErro } from '@/lib/http/api';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

/**
 * Busca de cidades na base local (GeoNames) para o local de nascimento e de
 * moradia: `?q=campinas` ou `?q=campinas, sp`. Nenhum serviço externo é
 * consultado.
 */
export async function GET(request: Request) {
  try {
    await requireServerSession();
    const termo = (new URL(request.url).searchParams.get('q') ?? '')
      .trim()
      .slice(0, 80);
    const cidades = buscarCidades(termo).map((cidade) => ({
      id: cidade.id,
      rotulo: cidade.rotulo,
      nome: cidade.nome,
      estado: cidade.estado,
      pais: cidade.pais,
      fuso: cidade.fuso,
    }));
    return NextResponse.json({ cidades });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao buscar cidades.');
  }
}
