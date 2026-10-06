import { NextResponse } from 'next/server';
import { z } from 'zod';

import { HttpError } from '@/lib/http-error';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { requireAdminSession } from '@/lib/mysql/server-auth';
import {
  getAdminSitePageConfig,
  publishSitePageDraft,
  restoreSitePageDefaults,
  restoreSitePageDraftFromPublished,
  saveSitePageDraft,
} from '@/lib/site-page-config/service';
import { isSitePageKey, SitePageKey } from '@/lib/site-page-config/schema';

export const runtime = 'nodejs';

async function lerPageKey(
  params: Promise<{ pageKey: string }>
): Promise<SitePageKey> {
  const { pageKey } = await params;
  if (!isSitePageKey(pageKey)) {
    throw new HttpError(`Página não suportada: ${pageKey}`, 404);
  }
  return pageKey;
}

// O conteúdo de `config` é validado pelo schema da página no serviço.
const salvarSchema = z.object({ config: z.unknown() });
const acaoSchema = z.object({
  action: z.enum(['publish', 'restorePublished', 'restoreDefaults']),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pageKey: string }> }
) {
  try {
    await requireAdminSession();
    const pageKey = await lerPageKey(params);
    return NextResponse.json(await getAdminSitePageConfig(pageKey));
  } catch (error) {
    return respostaDeErro(error, 'Falha ao carregar o editor administrativo.');
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ pageKey: string }> }
) {
  try {
    const session = await requireAdminSession();
    const pageKey = await lerPageKey(params);
    const body = await lerJson(request, salvarSchema);
    const response = await saveSitePageDraft({
      pageKey,
      actorUserId: session.user.id,
      draftConfig: body.config,
    });
    return NextResponse.json(response);
  } catch (error) {
    return respostaDeErro(error, 'Falha ao salvar o rascunho da página.');
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pageKey: string }> }
) {
  try {
    const session = await requireAdminSession();
    const pageKey = await lerPageKey(params);
    const { action } = await lerJson(request, acaoSchema);
    const opcoes = { pageKey, actorUserId: session.user.id };

    if (action === 'publish') {
      return NextResponse.json(await publishSitePageDraft(opcoes));
    }
    if (action === 'restorePublished') {
      return NextResponse.json(await restoreSitePageDraftFromPublished(opcoes));
    }
    return NextResponse.json(await restoreSitePageDefaults(opcoes));
  } catch (error) {
    return respostaDeErro(error, 'Falha ao executar a ação administrativa.');
  }
}
