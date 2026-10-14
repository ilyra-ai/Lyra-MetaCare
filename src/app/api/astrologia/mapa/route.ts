import { NextResponse } from 'next/server';

import {
  lerPerfilAstrologico,
  mapaDoPerfil,
} from '@/lib/astrology/perfil-astrologico';
import { mapaParaJson } from '@/lib/astrology/serializacao';
import { respostaDeErro } from '@/lib/http/api';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

/**
 * Mapa natal védico do próprio titular (Lagna, grahas, nakshatra natal e
 * Vimshottari vigente). Sem data ou cidade de nascimento, `mapa` é null e
 * `faltando` diz o que completar no perfil.
 */
export async function GET() {
  try {
    const session = await requireServerSession();
    const perfil = await lerPerfilAstrologico(session.user.id);
    const mapa = mapaDoPerfil(perfil);
    return NextResponse.json({
      mapa: mapa ? mapaParaJson(mapa) : null,
      faltando: perfil.faltando,
      localDeNascimento: perfil.nascimento.local?.rotulo ?? null,
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao calcular o mapa natal.');
  }
}
