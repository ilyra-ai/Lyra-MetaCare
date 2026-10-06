import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { HttpError } from '@/lib/http-error';
import { respostaDeErroDados } from '@/lib/http/api';
import { requireServerSession } from '@/lib/mysql/server-auth';
import {
  assertUploadAllowed,
  resolveStoragePath,
  splitStoragePath,
} from '@/lib/storage/local';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      throw new HttpError('Envie o arquivo como multipart/form-data.', 400);
    }
    const bucket = String(formData.get('bucket') ?? '');
    const filePath = String(formData.get('path') ?? '');
    const upsert = String(formData.get('upsert') ?? 'false') === 'true';
    const file = formData.get('file');

    if (!bucket || !filePath || !(file instanceof File)) {
      throw new HttpError('Parâmetros de upload inválidos.', 400);
    }

    const { absolute, relative } = resolveStoragePath(
      bucket,
      splitStoragePath(filePath)
    );
    const bytes = new Uint8Array(await file.arrayBuffer());
    assertUploadAllowed({
      relative,
      bytes,
      userId: session.user.id,
      isAdmin: session.user.role === 'admin',
    });

    await mkdir(path.dirname(absolute), { recursive: true });
    try {
      await writeFile(absolute, bytes, { flag: upsert ? 'w' : 'wx' });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        throw new HttpError('Já existe um arquivo nesse caminho.', 409);
      }
      throw error;
    }

    return NextResponse.json({
      data: {
        path: relative,
        publicUrl: `/api/storage/${bucket}/${relative}`,
      },
      error: null,
    });
  } catch (error) {
    return respostaDeErroDados(error, 'Falha no upload.');
  }
}
