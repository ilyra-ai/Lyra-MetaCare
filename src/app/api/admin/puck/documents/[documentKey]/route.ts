import { NextResponse } from 'next/server';

import { getHttpErrorStatus } from '@/lib/http-error';
import { requireAdminSession } from '@/lib/mysql/server-auth';
import {
  getAdminPuckDocument,
  publishPuckDocument,
  savePuckDraft,
} from '@/lib/puck/storage/service';
import {
  isLyraPuckDocumentKey,
  LyraPuckData,
  LyraPuckDocumentKey,
} from '@/lib/puck/types';

export const runtime = 'nodejs';

function assertDocumentKey(
  value: string
): asserts value is LyraPuckDocumentKey {
  if (!isLyraPuckDocumentKey(value)) {
    throw new Error(`Documento Puck não suportado: ${value}`);
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentKey: string }> }
) {
  try {
    await requireAdminSession();
    const { documentKey } = await params;
    assertDocumentKey(documentKey);

    return NextResponse.json(await getAdminPuckDocument(documentKey));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao carregar o documento administrativo do Puck.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ documentKey: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { documentKey } = await params;
    assertDocumentKey(documentKey);

    const body = (await request.json()) as {
      draftData: LyraPuckData;
    };

    return NextResponse.json(
      await savePuckDraft({
        documentKey,
        actorUserId: session.user.id,
        draftData: body.draftData,
      })
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao salvar o rascunho do documento Puck.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ documentKey: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { documentKey } = await params;
    assertDocumentKey(documentKey);

    const body = (await request.json()) as {
      action: 'publish';
      draftData?: LyraPuckData;
    };

    if (body.action !== 'publish') {
      throw new Error('Ação administrativa do Puck inválida.');
    }

    return NextResponse.json(
      await publishPuckDocument({
        documentKey,
        actorUserId: session.user.id,
        draftData: body.draftData,
      })
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao publicar o documento Puck.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
