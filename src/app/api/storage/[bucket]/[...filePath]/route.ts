import { readFile } from 'node:fs/promises';

import { NextResponse } from 'next/server';

import { HttpError } from '@/lib/http-error';
import { mensagemDeErro } from '@/lib/http/api';
import { contentTypeForPath, resolveStoragePath } from '@/lib/storage/local';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bucket: string; filePath: string[] }> }
) {
  try {
    const { bucket, filePath } = await params;
    const { absolute, relative } = resolveStoragePath(bucket, filePath);
    const contentType = contentTypeForPath(relative);
    if (!contentType) {
      throw new HttpError('Arquivo não encontrado.', 404);
    }

    let file: Buffer;
    try {
      file = await readFile(absolute);
    } catch {
      throw new HttpError('Arquivo não encontrado.', 404);
    }

    return new NextResponse(new Uint8Array(file), {
      headers: {
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox",
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    // Caminho inválido e arquivo ausente respondem igual: não revela o que
    // existe no servidor.
    const status = error instanceof HttpError ? error.statusCode : 500;
    return NextResponse.json(
      {
        error:
          status === 500
            ? mensagemDeErro(error, 'Falha ao ler o arquivo.')
            : 'Arquivo não encontrado.',
      },
      { status: status === 500 ? 500 : 404 }
    );
  }
}
