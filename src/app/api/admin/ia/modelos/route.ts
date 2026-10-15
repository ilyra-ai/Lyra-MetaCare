import { NextResponse } from 'next/server';

import { ErroDoProvedor, listarModelos } from '@/lib/ai/cliente-de-ia';
import { conexaoInformada, provedorSchema } from '@/lib/ai/esquema-do-provedor';
import { lerProvedorDaPlataforma } from '@/lib/ai/provedor-da-plataforma';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { requireAdminSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

/**
 * Modelos disponíveis no provedor informado (ex.: os baixados no Ollama ou
 * carregados no LM Studio). Falha do provedor volta como 502 com a causa.
 */
export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const informado = await lerJson(request, provedorSchema);
    const conexao = conexaoInformada(
      informado,
      await lerProvedorDaPlataforma(),
      false
    );
    try {
      const modelos = await listarModelos(conexao);
      return NextResponse.json(
        { modelos },
        { headers: { 'Cache-Control': 'private, no-store' } }
      );
    } catch (erro) {
      if (erro instanceof ErroDoProvedor) {
        return NextResponse.json({ error: erro.message }, { status: 502 });
      }
      throw erro;
    }
  } catch (error) {
    return respostaDeErro(error, 'Falha ao listar os modelos.');
  }
}
