import { NextResponse } from 'next/server';

import { provedorSchema } from '@/lib/ai/esquema-do-provedor';
import {
  lerProvedorDaPlataforma,
  provedorPublico,
  salvarProvedorDaPlataforma,
} from '@/lib/ai/provedor-da-plataforma';
import { PRESETS_DE_PROVEDOR } from '@/lib/ai/provedores-catalogo';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { requireAdminSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

const SEM_CACHE = { 'Cache-Control': 'private, no-store' };

/** Provedor de IA da plataforma (sem a chave) e o catálogo de provedores. */
export async function GET() {
  try {
    await requireAdminSession();
    return NextResponse.json(
      {
        provedor: provedorPublico(await lerProvedorDaPlataforma()),
        presets: PRESETS_DE_PROVEDOR,
      },
      { headers: SEM_CACHE }
    );
  } catch (error) {
    return respostaDeErro(error, 'Falha ao ler o provedor de IA.');
  }
}

/** Grava o provedor escolhido; a chave é cifrada antes de ir ao banco. */
export async function PUT(request: Request) {
  try {
    const sessao = await requireAdminSession();
    const informado = await lerJson(request, provedorSchema);
    const salvo = await salvarProvedorDaPlataforma(informado, sessao.user.id);
    return NextResponse.json(
      { provedor: provedorPublico(salvo) },
      { headers: SEM_CACHE }
    );
  } catch (error) {
    return respostaDeErro(error, 'Falha ao salvar o provedor de IA.');
  }
}
