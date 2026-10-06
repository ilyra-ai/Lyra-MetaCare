import { NextResponse } from 'next/server';
import { z } from 'zod';

import { lerJson, respostaDeErro } from '@/lib/http/api';
import { requireAdminSession } from '@/lib/mysql/server-auth';
import { lerDocumentKey, puckDataSchema } from '@/lib/puck/api-schema';
import {
  getAdminPuckDocument,
  publishPuckDocument,
  savePuckDraft,
} from '@/lib/puck/storage/service';

export const runtime = 'nodejs';

const salvarSchema = z.object({ draftData: puckDataSchema });
const publicarSchema = z.object({
  action: z.literal('publish'),
  draftData: puckDataSchema.optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentKey: string }> }
) {
  try {
    await requireAdminSession();
    const documentKey = lerDocumentKey((await params).documentKey);
    return NextResponse.json(await getAdminPuckDocument(documentKey));
  } catch (error) {
    return respostaDeErro(
      error,
      'Falha ao carregar o documento administrativo do Puck.'
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ documentKey: string }> }
) {
  try {
    const session = await requireAdminSession();
    const documentKey = lerDocumentKey((await params).documentKey);
    const { draftData } = await lerJson(request, salvarSchema);
    return NextResponse.json(
      await savePuckDraft({
        documentKey,
        actorUserId: session.user.id,
        draftData,
      })
    );
  } catch (error) {
    return respostaDeErro(
      error,
      'Falha ao salvar o rascunho do documento Puck.'
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ documentKey: string }> }
) {
  try {
    const session = await requireAdminSession();
    const documentKey = lerDocumentKey((await params).documentKey);
    const { draftData } = await lerJson(request, publicarSchema);
    return NextResponse.json(
      await publishPuckDocument({
        documentKey,
        actorUserId: session.user.id,
        draftData,
      })
    );
  } catch (error) {
    return respostaDeErro(error, 'Falha ao publicar o documento Puck.');
  }
}
