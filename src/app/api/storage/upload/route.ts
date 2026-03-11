import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

const STORAGE_ROOT = path.join(process.cwd(), 'storage');

export async function POST(request: Request) {
  try {
    await requireServerSession();
    const formData = await request.formData();
    const bucket = String(formData.get('bucket') ?? '');
    const filePath = String(formData.get('path') ?? '');
    const upsert = String(formData.get('upsert') ?? 'false') === 'true';
    const file = formData.get('file');

    if (!bucket || !filePath || !(file instanceof File)) {
      return NextResponse.json({ error: 'Parâmetros de upload inválidos.' }, { status: 400 });
    }

    const normalizedPath = filePath.replace(/^\/+/, '');
    const fullDirectory = path.join(STORAGE_ROOT, bucket, path.dirname(normalizedPath));
    const fullFilePath = path.join(STORAGE_ROOT, bucket, normalizedPath);
    await mkdir(fullDirectory, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(fullFilePath, buffer, { flag: upsert ? 'w' : 'wx' });

    return NextResponse.json({
      data: {
        path: normalizedPath,
        publicUrl: `/api/storage/${bucket}/${normalizedPath}`
      },
      error: null
    });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: { message: error instanceof Error ? error.message : 'Falha no upload local.' } },
      { status: 500 }
    );
  }
}
