import { NextResponse } from 'next/server';

import { ErroDoProvedor, gerarTexto } from '@/lib/ai/cliente-de-ia';
import {
  conexaoInformada,
  provedorParaTesteSchema,
} from '@/lib/ai/esquema-do-provedor';
import { lerConfiguracaoDeIa } from '@/lib/ai/provedores-da-plataforma';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { requireAdminSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

/**
 * Pede uma resposta curta a um modelo com os valores do formulário e mede o
 * tempo. Não grava nada: o administrador testa antes de salvar.
 */
export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const informado = await lerJson(request, provedorParaTesteSchema);
    const conexao = conexaoInformada(
      informado,
      await lerConfiguracaoDeIa(),
      true
    );
    const inicio = performance.now();
    try {
      const resposta = await gerarTexto(conexao, {
        sistema:
          'Você é um verificador de conexão. Responda em português do Brasil, em uma frase curta.',
        usuario:
          'Confirme que está funcionando dizendo, em até 12 palavras, qual nakshatra a Lua ocupa no mapa de quem nasce com a Lua a 5° de Touro.',
        maximoDeTokens: 120,
      });
      return NextResponse.json({
        ok: true,
        milissegundos: Math.round(performance.now() - inicio),
        resposta: resposta.slice(0, 400),
      });
    } catch (erro) {
      if (erro instanceof ErroDoProvedor) {
        return NextResponse.json(
          {
            ok: false,
            milissegundos: Math.round(performance.now() - inicio),
            error: erro.message,
          },
          { status: 502 }
        );
      }
      throw erro;
    }
  } catch (error) {
    return respostaDeErro(error, 'Falha ao testar o provedor de IA.');
  }
}
