import { NextResponse } from 'next/server';

import { getAstrologicalContext } from '@/lib/astrology/engine';
import { HttpError } from '@/lib/http-error';
import { respostaDeErro } from '@/lib/http/api';

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

    return NextResponse.json({
      success: true,
      data: getAstrologicalContext(date),
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao calcular efemérides.');
  }
}
