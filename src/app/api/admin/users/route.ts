import { NextRequest, NextResponse } from 'next/server';

import { getHttpErrorStatus } from '@/lib/http-error';
import { requireAdminSession } from '@/lib/mysql/server-auth';
import { listAdminUsersWithSubscriptions } from '@/lib/plans/service';

export const runtime = 'nodejs';

function parseIntegerParam(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = request.nextUrl;
    const response = await listAdminUsersWithSubscriptions({
      search: searchParams.get('search') ?? undefined,
      page: parseIntegerParam(searchParams.get('page'), 0),
      pageSize: parseIntegerParam(searchParams.get('pageSize'), 10),
      sortColumn:
        (searchParams.get('sortColumn') as
          'created_at' | 'first_name' | 'email' | null) ?? undefined,
      ascending: searchParams.get('ascending') === 'true',
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao carregar a lista administrativa de usuários.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
