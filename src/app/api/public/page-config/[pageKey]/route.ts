import { NextResponse } from 'next/server';

import { HttpError } from '@/lib/http-error';
import { respostaDeErro } from '@/lib/http/api';
import { getPublicSitePageConfig } from '@/lib/site-page-config/service';
import { isSitePageKey } from '@/lib/site-page-config/schema';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pageKey: string }> }
) {
  try {
    const { pageKey } = await params;
    if (!isSitePageKey(pageKey)) {
      throw new HttpError(`Página não suportada: ${pageKey}`, 404);
    }

    const config = await getPublicSitePageConfig(pageKey);
    return NextResponse.json({ pageKey, config });
  } catch (error) {
    return respostaDeErro(
      error,
      'Falha ao carregar a configuração pública da página.'
    );
  }
}
