import { NextResponse } from 'next/server';

import { getHttpErrorStatus } from '@/lib/http-error';
import { getPublicPuckDocument } from '@/lib/puck/storage/service';
import { isLyraPuckDocumentKey, LyraPuckDocumentKey } from '@/lib/puck/types';

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
    const { documentKey } = await params;
    assertDocumentKey(documentKey);

    return NextResponse.json(await getPublicPuckDocument(documentKey));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao carregar o documento público do Puck.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
