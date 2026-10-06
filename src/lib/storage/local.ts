import path from 'node:path';

import { HttpError } from '@/lib/http-error';

/**
 * Armazenamento local de imagens (avatares), servido por /api/storage.
 *
 * Regras de segurança:
 * - somente buckets conhecidos;
 * - caminhos formados por segmentos simples (sem "..", barras invertidas ou
 *   segmentos vazios) e conferidos depois de resolvidos: nenhum acesso fora de
 *   `storage/<bucket>`. Antes, `/api/storage/avatars/..%2F..%2F.env.local`
 *   devolvia o .env.local sem autenticação;
 * - somente imagens raster (PNG, JPEG, WebP, GIF), identificadas pelo
 *   conteúdo e não pela extensão informada; SVG e HTML nunca são aceitos;
 * - o primeiro segmento do caminho é o id do dono: um usuário só grava nos
 *   próprios caminhos.
 */

// Pasta raiz: `storage/` do projeto, ou LYRA_STORAGE_DIR (absoluta) quando
// definida (ex.: volume persistente em produção, pasta temporária nos testes).
// `turbopackIgnore`: dados do usuário em tempo de execução, nunca rastreados
// para o pacote de build (sem a diretiva, o Turbopack incluiria o projeto
// inteiro no file tracing).
export const STORAGE_ROOT = path.resolve(
  /* turbopackIgnore: true */
  process.env.LYRA_STORAGE_DIR ||
    path.join(/* turbopackIgnore: true */ process.cwd(), 'storage')
);
export const STORAGE_BUCKETS = ['avatars', 'professional_avatars'] as const;
export const STORAGE_MAX_BYTES = 5 * 1024 * 1024;

export type StorageBucket = (typeof STORAGE_BUCKETS)[number];

const SEGMENTO_SEGURO = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

export const IMAGE_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
} as const;

type ImageExtension = keyof typeof IMAGE_TYPES;

export function assertBucket(bucket: string): asserts bucket is StorageBucket {
  if (!(STORAGE_BUCKETS as readonly string[]).includes(bucket)) {
    throw new HttpError('Bucket de armazenamento desconhecido.', 404);
  }
}

/** Valida os segmentos e devolve o caminho absoluto dentro do bucket. */
export function resolveStoragePath(
  bucket: string,
  segments: readonly string[]
): { absolute: string; relative: string } {
  assertBucket(bucket);
  if (
    segments.length === 0 ||
    segments.length > 8 ||
    segments.some((segmento) => !SEGMENTO_SEGURO.test(segmento))
  ) {
    throw new HttpError('Caminho de arquivo inválido.', 400);
  }
  const base = path.join(/* turbopackIgnore: true */ STORAGE_ROOT, bucket);
  const absolute = path.resolve(/* turbopackIgnore: true */ base, ...segments);
  if (!absolute.startsWith(base + path.sep)) {
    throw new HttpError('Caminho de arquivo inválido.', 400);
  }
  return { absolute, relative: segments.join('/') };
}

export function splitStoragePath(filePath: string): string[] {
  return filePath.split('/').filter((segmento) => segmento.length > 0);
}

/** Tipo da imagem pelo conteúdo (assinatura do arquivo). */
export function detectImageType(
  bytes: Uint8Array
): (typeof IMAGE_TYPES)[ImageExtension] | null {
  const inicia = (...assinatura: number[]) =>
    assinatura.every((byte, indice) => bytes[indice] === byte);
  if (inicia(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) {
    return 'image/png';
  }
  if (inicia(0xff, 0xd8, 0xff)) {
    return 'image/jpeg';
  }
  if (inicia(0x47, 0x49, 0x46, 0x38)) {
    return 'image/gif';
  }
  if (
    inicia(0x52, 0x49, 0x46, 0x46) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }
  return null;
}

export function contentTypeForPath(relative: string): string | null {
  const extensao = relative.split('.').pop()?.toLowerCase() ?? '';
  return extensao in IMAGE_TYPES
    ? IMAGE_TYPES[extensao as ImageExtension]
    : null;
}

/**
 * Confere a extensão do caminho contra o conteúdo real e o dono do caminho
 * (primeiro segmento) contra a sessão.
 */
export function assertUploadAllowed(options: {
  relative: string;
  bytes: Uint8Array;
  userId: string;
  isAdmin: boolean;
}) {
  if (options.bytes.byteLength === 0) {
    throw new HttpError('Arquivo vazio.', 400);
  }
  if (options.bytes.byteLength > STORAGE_MAX_BYTES) {
    throw new HttpError('A imagem precisa ter no máximo 5 MB.', 413);
  }
  const detectado = detectImageType(options.bytes);
  const declarado = contentTypeForPath(options.relative);
  if (!detectado || !declarado || detectado !== declarado) {
    throw new HttpError(
      'Envie uma imagem PNG, JPEG, WebP ou GIF com a extensão correspondente.',
      415
    );
  }
  const dono = options.relative.split('/')[0];
  if (dono !== options.userId && !options.isAdmin) {
    throw new HttpError(
      'O caminho do arquivo precisa começar pelo seu identificador.',
      403
    );
  }
}
