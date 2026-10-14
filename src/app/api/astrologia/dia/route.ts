import { NextResponse } from 'next/server';

import { LocalSemNascerDoSolError } from '@/lib/astrology/panchang';
import {
  diaVedicoDoPerfil,
  lerPerfilAstrologico,
  mapaDoPerfil,
} from '@/lib/astrology/perfil-astrologico';
import { diaParaJson } from '@/lib/astrology/serializacao';
import { HttpError } from '@/lib/http-error';
import { respostaDeErro } from '@/lib/http/api';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

const FORMATO_DE_DATA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Dia védico do titular no lugar onde mora (ou de nascimento): Panchang,
 * nascer e pôr do sol, Rahu Kalam, Yamaganda, Gulika, Abhijit, Brahma
 * Muhurta, Choghadiya e, com mapa natal, Tara Bala e Chandra Bala.
 * `?data=AAAA-MM-DD` opcional (padrão: hoje no fuso do lugar).
 */
export async function GET(request: Request) {
  try {
    const session = await requireServerSession();
    const data = new URL(request.url).searchParams.get('data') ?? undefined;
    const conferida = data === undefined ? null : new Date(`${data}T00:00:00Z`);
    if (
      data !== undefined &&
      (!FORMATO_DE_DATA.test(data) ||
        !conferida ||
        Number.isNaN(conferida.getTime()) ||
        conferida.toISOString().slice(0, 10) !== data)
    ) {
      throw new HttpError('Data inválida: use AAAA-MM-DD.', 400);
    }
    const perfil = await lerPerfilAstrologico(session.user.id);
    let dia;
    try {
      dia = diaVedicoDoPerfil(perfil, mapaDoPerfil(perfil), data);
    } catch (erro) {
      if (erro instanceof LocalSemNascerDoSolError) {
        throw new HttpError(erro.message, 422);
      }
      throw erro;
    }
    return NextResponse.json({
      dia: dia ? diaParaJson(dia) : null,
      faltando: perfil.localDoDia ? [] : ['local'],
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao calcular o dia védico.');
  }
}
