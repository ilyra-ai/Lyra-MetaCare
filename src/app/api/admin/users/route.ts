import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { respostaDeErro } from '@/lib/http/api';
import { requireAdminSession } from '@/lib/mysql/server-auth';
import { listAdminUsersWithSubscriptions } from '@/lib/plans/service';

export const runtime = 'nodejs';

const querySchema = z.object({
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(0).max(100_000).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortColumn: z.enum(['created_at', 'first_name', 'email']).optional(),
  ascending: z.enum(['true', 'false']).default('false'),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const parametros = Object.fromEntries(
      [...request.nextUrl.searchParams.entries()].filter(([, valor]) => valor)
    );
    const query = querySchema.parse(parametros);
    const response = await listAdminUsersWithSubscriptions({
      search: query.search,
      page: query.page,
      pageSize: query.pageSize,
      sortColumn: query.sortColumn,
      ascending: query.ascending === 'true',
    });

    return NextResponse.json(response);
  } catch (error) {
    return respostaDeErro(
      error,
      'Falha ao carregar a lista administrativa de usuários.'
    );
  }
}
