import { NextResponse } from 'next/server';

import {
  type BirthReference,
  getAstrologicalContext,
} from '@/lib/astrology/engine';
import { HttpError } from '@/lib/http-error';
import { respostaDeErro } from '@/lib/http/api';
import { queryRows } from '@/lib/mysql/pool';
import { getServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

// Faixa de datas do cálculo: o astronomy-engine é preciso por séculos, mas
// uma data absurda indica erro do chamador.
const ANO_MINIMO = 1800;
const ANO_MAXIMO = 2200;

export async function GET(request: Request) {
  try {
    const dateParam = new URL(request.url).searchParams.get('date');
    const date = dateParam ? new Date(dateParam) : new Date();
    if (
      Number.isNaN(date.getTime()) ||
      date.getUTCFullYear() < ANO_MINIMO ||
      date.getUTCFullYear() > ANO_MAXIMO
    ) {
      throw new HttpError(
        `Data inválida: use ISO 8601 entre ${ANO_MINIMO} e ${ANO_MAXIMO}.`,
        400
      );
    }

    // Com sessão, o céu do momento vem com o dasha natal da pessoa (o mesmo
    // mapa do coach); sem sessão, só o céu geral.
    const sessao = await getServerSession();
    const [nascimento] = sessao
      ? await queryRows<BirthReference>(
          `SELECT birth_date, birth_time, birth_location, birth_latitude,
                  birth_longitude, birth_timezone
             FROM profiles WHERE id = ? LIMIT 1`,
          [sessao.user.id]
        )
      : [];

    return NextResponse.json(
      {
        success: true,
        data: getAstrologicalContext(date, nascimento),
      },
      sessao ? { headers: { 'Cache-Control': 'private, no-store' } } : undefined
    );
  } catch (error) {
    return respostaDeErro(error, 'Falha ao calcular efemérides.');
  }
}
