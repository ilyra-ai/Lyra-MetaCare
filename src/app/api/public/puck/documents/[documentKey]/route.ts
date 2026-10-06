import { NextResponse } from 'next/server';

import { respostaDeErro } from '@/lib/http/api';
import { lerDocumentKey } from '@/lib/puck/api-schema';
import { getPublicPuckDocument } from '@/lib/puck/storage/service';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentKey: string }> }
) {
  try {
    const documentKey = lerDocumentKey((await params).documentKey);
    return NextResponse.json(await getPublicPuckDocument(documentKey));
  } catch (error) {
    return respostaDeErro(
      error,
      'Falha ao carregar o documento público do Puck.'
    );
  }
}
