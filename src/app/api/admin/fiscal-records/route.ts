import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { HttpError } from '@/lib/http-error';
import { respostaDeErro } from '@/lib/http/api';
import { listarRegistrosFiscais } from '@/lib/lgpd/conta';
import { requireAdminSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

const dataIso = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use datas no formato AAAA-MM-DD.');

const querySchema = z.object({
  page: z.coerce.number().int().min(0).max(100_000).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  de: dataIso.optional(),
  ate: dataIso.optional(),
});

/**
 * Registros fiscais (LGPD, tarefa 28.1): só o administrador consulta, sempre
 * em leitura. Não existe rota para alterar ou excluir estes registros.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const parametros = Object.fromEntries(
      [...request.nextUrl.searchParams.entries()].filter(([, valor]) => valor)
    );
    const query = querySchema.parse(parametros);
    if (query.de && query.ate && query.de > query.ate) {
      throw new HttpError('A data inicial precisa ser anterior à final.', 400);
    }
    const resultado = await listarRegistrosFiscais(query);
    return NextResponse.json(resultado, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao carregar os registros fiscais.');
  }
}
