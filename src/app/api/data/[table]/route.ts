import { NextRequest, NextResponse } from 'next/server';

import {
  runDeleteQuery,
  runInsertQuery,
  runSelectQuery,
  runUpdateQuery,
  runUpsertQuery,
} from '@/lib/mysql/data-api';
import { getHttpErrorStatus } from '@/lib/http-error';
import { getServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

function parseNumber(value: string | null) {
  return value === null ? null : Number(value);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const session = await getServerSession();
    const searchParams = request.nextUrl.searchParams;

    const result = await runSelectQuery({
      table,
      select: searchParams.get('select') ?? '*',
      filters: searchParams.get('filters')
        ? JSON.parse(searchParams.get('filters') as string)
        : [],
      orders: searchParams.get('orders')
        ? JSON.parse(searchParams.get('orders') as string)
        : [],
      limit: parseNumber(searchParams.get('limit')),
      rangeFrom: parseNumber(searchParams.get('rangeFrom')),
      rangeTo: parseNumber(searchParams.get('rangeTo')),
      count: (searchParams.get('count') as 'exact' | null) ?? null,
      head: searchParams.get('head') === 'true',
      singleMode:
        (searchParams.get('singleMode') as 'single' | 'maybeSingle' | null) ??
        null,
      session,
    });

    const status = result.error ? 400 : 200;
    return NextResponse.json(result, { status });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Falha na consulta.',
        },
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const session = await getServerSession();
    const body = (await request.json()) as {
      values?: Record<string, unknown> | Record<string, unknown>[];
      onConflict?: string;
      upsert?: boolean;
    };

    const result = body.upsert
      ? await runUpsertQuery({
          table,
          values: body.values as Record<string, unknown>,
          onConflict: body.onConflict ?? 'id',
          session,
        })
      : await runInsertQuery({
          table,
          values: body.values ?? {},
          session,
        });

    const status = result.error ? 400 : 200;
    return NextResponse.json(result, { status });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Falha na gravação.',
        },
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const session = await getServerSession();
    const body = (await request.json()) as {
      values: Record<string, unknown>;
      filters: unknown[];
    };

    const result = await runUpdateQuery({
      table,
      values: body.values,
      filters: (body.filters ?? []) as never[],
      session,
    });

    const status = result.error ? 400 : 200;
    return NextResponse.json(result, { status });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Falha na atualização.',
        },
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const session = await getServerSession();
    const body = (await request.json()) as {
      filters: unknown[];
    };

    const result = await runDeleteQuery({
      table,
      filters: (body.filters ?? []) as never[],
      session,
    });

    const status = result.error ? 400 : 200;
    return NextResponse.json(result, { status });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Falha na exclusão.',
        },
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
