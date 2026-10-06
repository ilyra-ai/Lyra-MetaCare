import { z } from 'zod';

import { HttpError } from '@/lib/http-error';
import { isLyraPuckDocumentKey, LyraPuckDocumentKey } from '@/lib/puck/types';

// Estrutura mínima de um documento Puck recebido pela API: blocos com tipo e
// props, raiz e zonas opcionais. A normalização dos props por componente
// (valores padrão, migrações) continua no serviço.
const blocoSchema = z.looseObject({
  type: z.string().min(1).max(120),
  props: z.record(z.string(), z.unknown()),
});

export const puckDataSchema = z.looseObject({
  content: z.array(blocoSchema).max(500),
  root: z.looseObject({}).optional(),
  zones: z.record(z.string(), z.array(blocoSchema)).optional(),
});

export function lerDocumentKey(valor: string): LyraPuckDocumentKey {
  if (!isLyraPuckDocumentKey(valor)) {
    throw new HttpError(`Documento Puck não suportado: ${valor}`, 404);
  }
  return valor;
}
