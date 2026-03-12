import { getServerSession } from '@/lib/mysql/server-auth';
import { QueryFilter, QueryOrder, TableName } from '@/lib/mysql/table-config';
import { runSelectQuery } from '@/lib/mysql/data-api';
import { QueryRecord, TableRowMap } from '@/lib/mysql/types';

type QueryEnvelope<T> = {
  data: T;
  error: { message: string } | null;
  count?: number | null;
};

type InferSingle<TData> = TData extends Array<infer TItem> ? TItem : TData;

class ServerQueryBuilder<TData = QueryRecord[]> implements PromiseLike<
  QueryEnvelope<TData>
> {
  private selectColumns = '*';
  private filters: QueryFilter[] = [];
  private orders: QueryOrder[] = [];
  private count: 'exact' | null = null;
  private head = false;
  private limitValue: number | null = null;
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;
  private singleMode: 'single' | 'maybeSingle' | null = null;

  constructor(private readonly table: string) {}

  select(columns = '*', options?: { count?: 'exact'; head?: boolean }) {
    this.selectColumns = columns;
    this.count = options?.count ?? null;
    this.head = options?.head ?? false;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  gte(column: string, value: unknown) {
    this.filters.push({ type: 'gte', column, value });
    return this;
  }

  lte(column: string, value: unknown) {
    this.filters.push({ type: 'lte', column, value });
    return this;
  }

  not(column: string, operator: string, value: unknown) {
    this.filters.push({ type: 'not', column, operator, value });
    return this;
  }

  or(expression: string) {
    this.filters.push({ type: 'or', expression });
    return this;
  }

  order(
    column: string,
    options?: { ascending?: boolean; foreignTable?: string }
  ) {
    this.orders.push({
      column,
      ascending: options?.ascending ?? true,
      foreignTable: options?.foreignTable,
    });
    return this;
  }

  limit(limit: number) {
    this.limitValue = limit;
    return this;
  }

  range(from: number, to: number) {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  single() {
    this.singleMode = 'single';
    return this as unknown as ServerQueryBuilder<InferSingle<TData>>;
  }

  maybeSingle() {
    this.singleMode = 'maybeSingle';
    return this as unknown as ServerQueryBuilder<InferSingle<TData> | null>;
  }

  then<TResult1 = QueryEnvelope<TData>, TResult2 = never>(
    onfulfilled?:
      | ((value: QueryEnvelope<TData>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return this.execute().then(
      onfulfilled ?? undefined,
      onrejected ?? undefined
    );
  }

  private async execute(): Promise<QueryEnvelope<TData>> {
    const session = await getServerSession();
    return runSelectQuery({
      table: this.table,
      select: this.selectColumns,
      filters: this.filters,
      orders: this.orders,
      limit: this.limitValue,
      rangeFrom: this.rangeFrom,
      rangeTo: this.rangeTo,
      count: this.count,
      head: this.head,
      singleMode: this.singleMode,
      session,
    }) as Promise<QueryEnvelope<TData>>;
  }
}

export async function createServerDatabaseClient() {
  return {
    from<K extends TableName>(table: K) {
      return new ServerQueryBuilder<TableRowMap[K][]>(table);
    },
  };
}
