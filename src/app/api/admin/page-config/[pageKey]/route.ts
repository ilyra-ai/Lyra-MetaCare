import { NextResponse } from 'next/server';

import { getHttpErrorStatus } from '@/lib/http-error';
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

function assertPageKey(value: string): asserts value is SitePageKey {
  if (!isSitePageKey(value)) {
    throw new Error(`Pagina nao suportada: ${value}`);
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pageKey: string }> }
) {
  try {
    await requireAdminSession();
    const { pageKey } = await params;
    assertPageKey(pageKey);

    const config = await getAdminSitePageConfig(pageKey);
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao carregar o editor administrativo.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ pageKey: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { pageKey } = await params;
    assertPageKey(pageKey);

    const body = (await request.json()) as { config: unknown };
    const response = await saveSitePageDraft({
      pageKey,
      actorUserId: session.user.id,
      draftConfig: body.config,
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao salvar o rascunho da pagina.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pageKey: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { pageKey } = await params;
    assertPageKey(pageKey);

    const body = (await request.json()) as {
      action: 'publish' | 'restorePublished' | 'restoreDefaults';
    };

    if (body.action === 'publish') {
      return NextResponse.json(
        await publishSitePageDraft({
          pageKey,
          actorUserId: session.user.id,
        })
      );
    }

    if (body.action === 'restorePublished') {
      return NextResponse.json(
        await restoreSitePageDraftFromPublished({
          pageKey,
          actorUserId: session.user.id,
        })
      );
    }

    if (body.action === 'restoreDefaults') {
      return NextResponse.json(
        await restoreSitePageDefaults({
          pageKey,
          actorUserId: session.user.id,
        })
      );
    }

    throw new Error('Acao administrativa invalida.');
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao executar a acao administrativa.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
