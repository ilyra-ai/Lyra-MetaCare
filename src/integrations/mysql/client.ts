'use client';

import { AppSession } from '@/types/app-session';

type QueryFilter =
  | { type: 'eq'; column: string; value: unknown }
  | { type: 'gte'; column: string; value: unknown }
  | { type: 'lte'; column: string; value: unknown }
  | { type: 'not'; column: string; operator: string; value: unknown }
  | { type: 'or'; expression: string };

type QueryOrder = {
  column: string;
  ascending: boolean;
  foreignTable?: string;
};

type QueryEnvelope<T> = {
  data: T;
  error: { message: string } | null;
  count?: number | null;
};

type AuthChangeListener = (_event: string, session: AppSession | null) => void;

const authListeners = new Set<AuthChangeListener>();

function emitAuthChange(event: string, session: AppSession | null) {
  for (const listener of authListeners) {
    listener(event, session);
  }
}

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  });
  return response.json() as Promise<T>;
}

class QueryBuilder<T = unknown> implements PromiseLike<QueryEnvelope<T>> {
  private operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private selectColumns = '*';
  private filters: QueryFilter[] = [];
  private orders: QueryOrder[] = [];
  private count: 'exact' | null = null;
  private head = false;
  private limitValue: number | null = null;
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;
  private singleMode: 'single' | 'maybeSingle' | null = null;
  private values: Record<string, unknown> | Record<string, unknown>[] | null = null;
  private onConflict: string | null = null;

  constructor(private readonly table: string) {}

  select(columns = '*', options?: { count?: 'exact'; head?: boolean }) {
    this.operation = 'select';
    this.selectColumns = columns;
    this.count = options?.count ?? null;
    this.head = options?.head ?? false;
    return this;
  }

  insert(values: Record<string, unknown> | Record<string, unknown>[]) {
    this.operation = 'insert';
    this.values = values;
    return this;
  }

  update(values: Record<string, unknown>) {
    this.operation = 'update';
    this.values = values;
    return this;
  }

  upsert(values: Record<string, unknown>, options?: { onConflict?: string }) {
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

  order(column: string, options?: { ascending?: boolean; foreignTable?: string }) {
    this.orders.push({
      column,
      ascending: options?.ascending ?? true,
      foreignTable: options?.foreignTable
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
    return this;
  }

  maybeSingle() {
    this.singleMode = 'maybeSingle';
    return this;
  }

  then<TResult1 = QueryEnvelope<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryEnvelope<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return this.execute().then(onfulfilled ?? undefined, onrejected ?? undefined);
  }

  private async execute(): Promise<QueryEnvelope<T>> {
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
        body: JSON.stringify({ values: this.values })
      });
    }

    if (this.operation === 'upsert') {
      return requestJson(`/api/data/${this.table}`, {
        method: 'POST',
        body: JSON.stringify({ values: this.values, onConflict: this.onConflict, upsert: true })
      });
    }

    if (this.operation === 'update') {
      return requestJson(`/api/data/${this.table}`, {
        method: 'PATCH',
        body: JSON.stringify({ values: this.values, filters: this.filters })
      });
    }

    return requestJson(`/api/data/${this.table}`, {
      method: 'DELETE',
      body: JSON.stringify({ filters: this.filters })
    });
  }
}

class StorageBucketClient {
  constructor(private readonly bucket: string) {}

  async upload(path: string, file: File, options?: { upsert?: boolean }) {
    const formData = new FormData();
    formData.set('bucket', this.bucket);
    formData.set('path', path);
    formData.set('upsert', String(options?.upsert ?? false));
    formData.set('file', file);

    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    return response.json();
  }

  getPublicUrl(path: string) {
    return {
      data: {
        publicUrl: `/api/storage/${this.bucket}/${path}`
      }
    };
  }
}

class RealtimeChannel {
  private readonly channel: BroadcastChannel;
  private readonly listeners: Array<(event: MessageEvent<{ type: string; event: string; payload: unknown }>) => void> = [];

  constructor(name: string) {
    this.channel = new BroadcastChannel(`lyra-${name}`);
  }

  on(_type: 'broadcast', options: { event: string }, callback: (payload: { payload: unknown }) => void) {
    const listener = (event: MessageEvent<{ type: string; event: string; payload: unknown }>) => {
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

export const db = {
  from<T = unknown>(table: string) {
    return new QueryBuilder<T>(table);
  },
  auth: {
    async getSession() {
      const result = await requestJson<{ session: AppSession | null }>('/api/auth/session');
      return { data: result, error: null };
    },
    onAuthStateChange(callback: AuthChangeListener) {
      authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners.delete(callback);
            }
          }
        }
      };
    },
    async signOut() {
      await requestJson('/api/auth/logout', { method: 'POST' });
      emitAuthChange('SIGNED_OUT', null);
      return { error: null };
    },
    async signInWithPassword(credentials: { email: string; password: string }) {
      const result = await requestJson<{ session?: AppSession; error?: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      if (result.session) {
        emitAuthChange('SIGNED_IN', result.session);
        return { data: { session: result.session }, error: null };
      }
      return {
        data: { session: null },
        error: { message: result.error ?? 'Falha no login.' }
      };
    },
    async signUp(payload: { email: string; password: string; firstName?: string; lastName?: string }) {
      const result = await requestJson<{ session?: AppSession; error?: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (result.session) {
        emitAuthChange('SIGNED_IN', result.session);
        return { data: { session: result.session }, error: null };
      }
      return {
        data: { session: null },
        error: { message: result.error ?? 'Falha no cadastro.' }
      };
    }
  },
  functions: {
    async invoke<T = unknown>(name: string, options?: { body?: unknown }) {
      const response = await fetch(`/api/functions/${name}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options?.body ?? {})
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          data: null,
          error: {
            message: data.error ?? 'Falha na função local.',
            context: { status: response.status }
          }
        };
      }
      return { data: data as T, error: null };
    }
  },
  rpc<T = unknown>(name: string) {
    return fetch(`/api/rpc/${name}`, {
      method: 'GET',
      credentials: 'include'
    }).then(async (response) => response.json() as Promise<QueryEnvelope<T>>);
  },
  storage: {
    from(bucket: string) {
      return new StorageBucketClient(bucket);
    }
  },
  channel(name: string) {
    return new RealtimeChannel(name);
  },
  removeChannel(channel: RealtimeChannel) {
    channel.close();
  }
};
