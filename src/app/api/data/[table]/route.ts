import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { lerJson, lerParametroJson, respostaDeErroDados } from '@/lib/http/api';
import {
  runDeleteQuery,
  runInsertQuery,
  runSelectQuery,
  runUpdateQuery,
  runUpsertQuery,
} from '@/lib/mysql/data-api';
import { getServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

// Forma dos filtros e ordenações do cliente de dados
// (src/integrations/mysql/client.ts). Colunas, operadores e valores são
// validados contra a configuração da tabela no data-api.
const nomeDeColuna = z.string().min(1).max(64);
const filtroSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('eq'), column: nomeDeColuna, value: z.unknown() }),
  z.object({
    type: z.literal('gte'),
    column: nomeDeColuna,
    value: z.unknown(),
  }),
  z.object({
    type: z.literal('lte'),
    column: nomeDeColuna,
    value: z.unknown(),
  }),
  z.object({
    type: z.literal('not'),
    column: nomeDeColuna,
    operator: z.string().max(16),
    value: z.unknown(),
  }),
  z.object({ type: z.literal('or'), expression: z.string().min(1).max(500) }),
]);
const filtrosSchema = z.array(filtroSchema).max(50);
const ordensSchema = z
  .array(
    z.object({
      column: nomeDeColuna,
      ascending: z.boolean(),
      foreignTable: z.string().max(64).optional(),
    })
  )
  .max(10);

const registroSchema = z.record(z.string(), z.unknown());
const inserirSchema = z.object({
  values: z.union([registroSchema, z.array(registroSchema).max(500)]),
  onConflict: z.string().max(64).optional(),
  upsert: z.boolean().optional(),
});
const atualizarSchema = z.object({
  values: registroSchema,
  filters: filtrosSchema,
});
const excluirSchema = z.object({ filters: filtrosSchema });

function numeroOuNulo(valor: string | null) {
  return valor === null || valor === '' ? null : Number(valor);
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
      filters: lerParametroJson(
        searchParams.get('filters'),
        filtrosSchema,
        'filters',
        []
      ),
      orders: lerParametroJson(
        searchParams.get('orders'),
        ordensSchema,
        'orders',
        []
      ),
      limit: numeroOuNulo(searchParams.get('limit')),
      rangeFrom: numeroOuNulo(searchParams.get('rangeFrom')),
      rangeTo: numeroOuNulo(searchParams.get('rangeTo')),
      // Valores fora do contrato são recusados (400) pelo data-api.
      count: searchParams.get('count'),
      head: searchParams.get('head') === 'true',
      singleMode: searchParams.get('singleMode'),
      session,
    });

    return NextResponse.json(result, { status: result.error ? 400 : 200 });
  } catch (error) {
    return respostaDeErroDados(error, 'Falha na consulta.');
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const session = await getServerSession();
    const body = await lerJson(request, inserirSchema);

    let result;
    if (body.upsert) {
      if (Array.isArray(body.values)) {
        return NextResponse.json(
          {
            data: null,
            error: { message: 'O upsert aceita um único registro por vez.' },
          },
          { status: 400 }
        );
      }
      result = await runUpsertQuery({
        table,
        values: body.values,
        onConflict: body.onConflict ?? 'id',
        session,
      });
    } else {
      result = await runInsertQuery({ table, values: body.values, session });
    }

    return NextResponse.json(result, { status: result.error ? 400 : 200 });
  } catch (error) {
    return respostaDeErroDados(error, 'Falha na gravação.');
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const session = await getServerSession();
    const body = await lerJson(request, atualizarSchema);

    const result = await runUpdateQuery({
      table,
      values: body.values,
      filters: body.filters,
      session,
    });

    return NextResponse.json(result, { status: result.error ? 400 : 200 });
  } catch (error) {
    return respostaDeErroDados(error, 'Falha na atualização.');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const session = await getServerSession();
    const body = await lerJson(request, excluirSchema);

    const result = await runDeleteQuery({
      table,
      filters: body.filters,
      session,
    });

    return NextResponse.json(result, { status: result.error ? 400 : 200 });
  } catch (error) {
    return respostaDeErroDados(error, 'Falha na exclusão.');
  }
}
