import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const STORAGE_ROOT = path.join(process.cwd(), 'storage');

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bucket: string; filePath: string[] }> }
) {
  try {
    const { bucket, filePath } = await params;
    const absolutePath = path.join(STORAGE_ROOT, bucket, ...filePath);
    const file = await readFile(absolutePath);
    return new NextResponse(file);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Arquivo não encontrado.' },
      { status: 404 }
    );
  }
}
