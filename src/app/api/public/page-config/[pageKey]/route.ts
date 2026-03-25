import { NextResponse } from 'next/server';

import { getHttpErrorStatus } from '@/lib/http-error';
import { getPublicSitePageConfig } from '@/lib/site-page-config/service';
import { SitePageKey } from '@/lib/site-page-config/schema';

export const runtime = 'nodejs';

function assertPageKey(value: string): asserts value is SitePageKey {
  if (value !== 'landing' && value !== 'login') {
    throw new Error(`Pagina nao suportada: ${value}`);
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pageKey: string }> }
) {
  try {
    const { pageKey } = await params;
    assertPageKey(pageKey);

    const config = await getPublicSitePageConfig(pageKey);

    return NextResponse.json({
      pageKey,
      config,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao carregar a configuracao publica da pagina.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
