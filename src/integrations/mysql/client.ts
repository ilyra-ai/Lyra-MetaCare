'use client';

import { TableName } from '@/lib/mysql/table-config';
import { QueryRecord, TableRowMap } from '@/lib/mysql/types';
import { AppSession } from '@/types/app-session';
import { buscarJson, type RespostaDoTransporte } from '@/lib/http/transporte';

type QueryFilter =
  | { type: 'eq'; column: string; value: unknown }
  | { type: 'gte'; column: string; value: unknown }
  | { type: 'lte'; column: string; value: unknown }
  | { type: 'not'; column: string; operator: string; value: unknown }
  | { type: 'or'; expression: string };

type QueryOrder = {
  column: string;
  ascending: boolean;
};

type QueryEnvelope<T> = {
  data: T;
  error: { message: string } | null;
  count?: number | null;
};

type InferSingle<TData> = TData extends Array<infer TItem> ? TItem : TData;

type AuthChangeListener = (_event: string, session: AppSession | null) => void;

const authListeners = new Set<AuthChangeListener>();

function emitAuthChange(event: string, session: AppSession | null) {
  for (const listener of authListeners) {
    listener(event, session);
  }
}

/**
 * Pedido JSON à API do app sem lançar (tarefa 58): falha de rede, resposta
 * que não é JSON ou status de erro voltam como `falha`, com mensagem em
 * pt-BR. Antes `response.json()` era lido sem checar nada e a promise era
 * rejeitada, contra o contrato `{ data, error }` que quem chama espera.
 */
function requestJson(
  input: RequestInfo,
  init?: RequestInit
): Promise<RespostaDoTransporte> {
  return buscarJson(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

/** Envelope `{ data, error, count }` de uma resposta da API de dados. */
function envelopeDe<TData>(
  resposta: RespostaDoTransporte
): QueryEnvelope<TData> {
  if (resposta.ok) {
    const corpo = resposta.corpo as Partial<QueryEnvelope<TData>> | null;
    if (corpo && typeof corpo === 'object' && 'data' in corpo) {
      return {
        data: corpo.data as TData,
        error: corpo.error ?? null,
        count: corpo.count ?? null,
      };
    }
    return {
      data: null as TData,
      error: { message: 'A resposta do servidor veio sem os dados.' },
      count: null,
    };
  }
  return {
    data: null as TData,
    error: { message: resposta.falha.message },
    count: null,
  };
}

/** Sessão do corpo de /api/auth/session (ou null). */
function sessaoDoCorpo(corpo: unknown): AppSession | null {
  if (typeof corpo !== 'object' || corpo === null) return null;
  const sessao = (corpo as { session?: AppSession | null }).session;
  return sessao ?? null;
}

class QueryBuilder<TData = QueryRecord[]> implements PromiseLike<
  QueryEnvelope<TData>
> {
  private operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert' =
    'select';
  private selectColumns = '*';
  private filters: QueryFilter[] = [];
  private orders: QueryOrder[] = [];
  private count: 'exact' | null = null;
  private head = false;
  private limitValue: number | null = null;
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;
  private singleMode: 'single' | 'maybeSingle' | null = null;
  private values: QueryRecord | QueryRecord[] | null = null;
  private onConflict: string | null = null;

  constructor(private readonly table: string) {}

  select(columns = '*', options?: { count?: 'exact'; head?: boolean }) {
    this.operation = 'select';
    this.selectColumns = columns;
    this.count = options?.count ?? null;
    this.head = options?.head ?? false;
    return this;
  }

  insert(values: QueryRecord | QueryRecord[]) {
    this.operation = 'insert';
    this.values = values;
    return this;
  }

  update(values: QueryRecord) {
    this.operation = 'update';
    this.values = values;
    return this;
  }

  upsert(values: QueryRecord, options?: { onConflict?: string }) {
    this.operation = 'upsert';
    this.values = values;
    this.onConflict = options?.onConflict ?? 'id';
    return this;
  }

  delete() {
    this.operation = 'delete';
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

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({
      column,
      ascending: options?.ascending ?? true,
    });
    return this;
  }

  // Antes aceitava `{ foreignTable }` e ignorava em silêncio (tarefa 58):
  // o limite sempre vale para a tabela principal.
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
    return this as unknown as QueryBuilder<InferSingle<TData>>;
  }

  maybeSingle() {
    this.singleMode = 'maybeSingle';
    return this as unknown as QueryBuilder<InferSingle<TData> | null>;
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
    return envelopeDe<TData>(await this.enviar());
  }

  private enviar(): Promise<RespostaDoTransporte> {
    if (this.operation === 'select') {
      const params = new URLSearchParams();
      params.set('select', this.selectColumns);
      if (this.filters.length > 0) {
        params.set('filters', JSON.stringify(this.filters));
      }
      if (this.orders.length > 0) {
        params.set('orders', JSON.stringify(this.orders));
      }
      if (this.count) {
        params.set('count', this.count);
      }
      if (this.head) {
        params.set('head', 'true');
      }
      if (this.limitValue !== null) {
        params.set('limit', String(this.limitValue));
      }
      if (this.rangeFrom !== null) {
        params.set('rangeFrom', String(this.rangeFrom));
      }
      if (this.rangeTo !== null) {
        params.set('rangeTo', String(this.rangeTo));
      }
      if (this.singleMode) {
        params.set('singleMode', this.singleMode);
      }
      return requestJson(`/api/data/${this.table}?${params.toString()}`);
    }

    if (this.operation === 'insert') {
      return requestJson(`/api/data/${this.table}`, {
        method: 'POST',
        body: JSON.stringify({ values: this.values }),
      });
    }

    if (this.operation === 'upsert') {
      return requestJson(`/api/data/${this.table}`, {
        method: 'POST',
        body: JSON.stringify({
          values: this.values,
          onConflict: this.onConflict,
          upsert: true,
        }),
      });
    }

    if (this.operation === 'update') {
      return requestJson(`/api/data/${this.table}`, {
        method: 'PATCH',
        body: JSON.stringify({ values: this.values, filters: this.filters }),
      });
    }

    return requestJson(`/api/data/${this.table}`, {
      method: 'DELETE',
      body: JSON.stringify({ filters: this.filters }),
    });
  }
}

class StorageBucketClient {
  constructor(private readonly bucket: string) {}

  async upload(
    path: string,
    file: File,
    options?: { upsert?: boolean; cacheControl?: string }
  ) {
    const formData = new FormData();
    formData.set('bucket', this.bucket);
    formData.set('path', path);
    formData.set('upsert', String(options?.upsert ?? false));
    if (options?.cacheControl) {
      formData.set('cacheControl', options.cacheControl);
    }
    formData.set('file', file);

    const resposta = await buscarJson('/api/storage/upload', {
      method: 'POST',
      body: formData,
    });
    if (!resposta.ok) {
      return { data: null, error: { message: resposta.falha.message } };
    }
    return resposta.corpo as {
      data: { path: string; publicUrl: string } | null;
      error: { message: string } | null;
    };
  }

  getPublicUrl(path: string) {
    return {
      data: {
        publicUrl: `/api/storage/${this.bucket}/${path}`,
      },
    };
  }
}

class RealtimeChannel {
  private readonly channel: BroadcastChannel;
  private readonly listeners: Array<
    (
      event: MessageEvent<{ type: string; event: string; payload: unknown }>
    ) => void
  > = [];

  constructor(name: string) {
    this.channel = new BroadcastChannel(`lyra-${name}`);
  }

  on(
    _type: 'broadcast',
    options: { event: string },
    callback: (payload: { payload: unknown }) => void
  ) {
    const listener = (
      event: MessageEvent<{ type: string; event: string; payload: unknown }>
    ) => {
      if (event.data?.event === options.event) {
        callback({ payload: event.data.payload });
      }
    };
    this.listeners.push(listener);
    this.channel.addEventListener('message', listener);
    return this;
  }

  subscribe() {
    return this;
  }

  async send(message: { type: string; event: string; payload: unknown }) {
    this.channel.postMessage(message);
    return { data: null, error: null };
  }

  close() {
    for (const listener of this.listeners) {
      this.channel.removeEventListener('message', listener);
    }
    this.channel.close();
  }
}

function from<K extends TableName>(table: K): QueryBuilder<TableRowMap[K][]>;
function from<TData>(table: string): QueryBuilder<TData>;
function from(table: string) {
  return new QueryBuilder(table);
}

export const db = {
  from,
  auth: {
    // Sem resposta válida, `error` vem preenchido: quem chama distingue
    // "não deu para confirmar a sessão" de "não há sessão".
    async getSession() {
      const resposta = await requestJson('/api/auth/session');
      if (!resposta.ok) {
        return { data: { session: null }, error: resposta.falha };
      }
      return { data: { session: sessaoDoCorpo(resposta.corpo) }, error: null };
    },
    // Relê a sessão no servidor e avisa os ouvintes. Usado quando um dado
    // que faz parte da sessão muda (por exemplo, o onboarding concluído).
    async refreshSession() {
      const resposta = await requestJson('/api/auth/session');
      if (!resposta.ok) {
        return { data: { session: null }, error: resposta.falha };
      }
      const session = sessaoDoCorpo(resposta.corpo);
      emitAuthChange('USER_UPDATED', session);
      return { data: { session }, error: null };
    },
    onAuthStateChange(callback: AuthChangeListener) {
      authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
    // `jaEncerrada`: o servidor já encerrou a sessão (ex.: conta excluída);
    // a saída local acontece mesmo se o logout falhar.
    async signOut(opcoes?: { jaEncerrada?: boolean }) {
      const resposta = await requestJson('/api/auth/logout', {
        method: 'POST',
      });
      if (!resposta.ok && !opcoes?.jaEncerrada) {
        // O cookie continua válido no servidor: não finge que saiu.
        return { error: resposta.falha };
      }
      emitAuthChange('SIGNED_OUT', null);
      return { error: null };
    },
    async signInWithPassword(credentials: {
      email: string;
      password: string;
      remember?: boolean;
    }) {
      const resposta = await requestJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      const session = resposta.ok ? sessaoDoCorpo(resposta.corpo) : null;
      if (session) {
        emitAuthChange('SIGNED_IN', session);
        return { data: { session }, error: null };
      }
      return {
        data: { session: null },
        error: {
          message: resposta.ok ? 'Falha no login.' : resposta.falha.message,
        },
      };
    },
    async signUp(payload: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      // LGPD: aceite dos termos de uso e da política de privacidade.
      acceptTerms: boolean;
    }) {
      const resposta = await requestJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const session = resposta.ok ? sessaoDoCorpo(resposta.corpo) : null;
      if (session) {
        emitAuthChange('SIGNED_IN', session);
        return { data: { session }, error: null };
      }
      return {
        data: { session: null },
        error: {
          message: resposta.ok ? 'Falha no cadastro.' : resposta.falha.message,
        },
      };
    },
  },
  functions: {
    async invoke<T = unknown>(name: string, options?: { body?: unknown }) {
      const resposta = await requestJson(`/api/functions/${name}`, {
        method: 'POST',
        body: JSON.stringify(options?.body ?? {}),
      });
      if (!resposta.ok) {
        return {
          data: null,
          error: {
            message: resposta.falha.message,
            context: { status: resposta.status },
          },
        };
      }
      return { data: resposta.corpo as T, error: null };
    },
  },
  async rpc<T = unknown>(name: string): Promise<QueryEnvelope<T>> {
    const routeName = name.replaceAll('_', '-');
    return envelopeDe<T>(
      await requestJson(`/api/rpc/${routeName}`, { method: 'GET' })
    );
  },
  storage: {
    from(bucket: string) {
      return new StorageBucketClient(bucket);
    },
  },
  channel(name: string) {
    return new RealtimeChannel(name);
  },
  removeChannel(channel: RealtimeChannel) {
    channel.close();
  },
};
