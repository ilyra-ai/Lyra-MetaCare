import { NextResponse } from 'next/server';

import { configuracaoSchema } from '@/lib/ai/esquema-do-provedor';
import {
  configuracaoPublica,
  lerConfiguracaoDeIa,
  POSICOES_DA_ORDEM,
  salvarConfiguracaoDeIa,
} from '@/lib/ai/provedores-da-plataforma';
import { PRESETS_DE_PROVEDOR } from '@/lib/ai/provedores-catalogo';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { requireAdminSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

const SEM_CACHE = { 'Cache-Control': 'private, no-store' };

/**
 * Provedores de IA da plataforma (sem as chaves), a ordem de uso dos modelos
 * e o catálogo de provedores (tarefa 54).
 */
export async function GET() {
  try {
    await requireAdminSession();
    return NextResponse.json(
      {
        ...configuracaoPublica(await lerConfiguracaoDeIa()),
        posicoes: POSICOES_DA_ORDEM,
        presets: PRESETS_DE_PROVEDOR,
      },
      { headers: SEM_CACHE }
    );
  } catch (error) {
    return respostaDeErro(error, 'Falha ao ler os provedores de IA.');
  }
}

/**
 * Grava os provedores escolhidos e a ordem de uso; as chaves são cifradas
 * antes de ir ao banco.
 */
export async function PUT(request: Request) {
  try {
    const sessao = await requireAdminSession();
    const informado = await lerJson(request, configuracaoSchema);
    const salvo = await salvarConfiguracaoDeIa(informado, sessao.user.id);
    return NextResponse.json(
      { ...configuracaoPublica(salvo), posicoes: POSICOES_DA_ORDEM },
      { headers: SEM_CACHE }
    );
  } catch (error) {
    return respostaDeErro(error, 'Falha ao salvar os provedores de IA.');
  }
}
