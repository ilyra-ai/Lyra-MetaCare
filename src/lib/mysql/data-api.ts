import { executeStatement, queryRows, withTransaction } from '@/lib/mysql/pool';
import { AppSession } from '@/types/app-session';
import {
  QueryFilter,
  QueryOrder,
  TableName,
  TABLE_CONFIG,
} from '@/lib/mysql/table-config';
import { QueryRecord } from '@/lib/mysql/types';

type SingleMode = 'single' | 'maybeSingle' | null;

const JSON_COLUMNS: Record<TableName, string[]> = {
  profiles: ['goals'],
  daily_metrics: [],
  goals: [],
  habits: [],
  suggested_habits: [],
  ai_tips: [],
  ai_config: [],
  ai_plans: ['plan_data'],
  appointments: [],
  professionals: [],
  instruments: [],
};

const BOOLEAN_COLUMNS: Record<TableName, string[]> = {
  profiles: ['onboarding_completed'],
  daily_metrics: [],
  goals: [],
  habits: ['is_active'],
  suggested_habits: ['is_active'],
  ai_tips: ['is_active'],
  ai_config: [],
  ai_plans: [],
  appointments: [],
  professionals: [],
  instruments: [],
};

type ColumnFilter = Exclude<QueryFilter, { type: 'or' }>;

function assertTable(table: string): asserts table is TableName {
  if (!(table in TABLE_CONFIG)) {
    throw new Error(`Tabela não suportada: ${table}`);
  }
}

function isAdmin(session: AppSession | null) {
  return session?.user.role === 'admin';
}

function coerceWriteValue(table: TableName, column: string, value: unknown) {
  if (value === undefined) {
    return undefined;
  }
  if (JSON_COLUMNS[table].includes(column) && value !== null) {
    return JSON.stringify(value);
  }
  return value;
}

function normalizeRow<T extends QueryRecord>(
  table: TableName,
  row: T
): T {
  const jsonColumns = JSON_COLUMNS[table];
  const booleanColumns = BOOLEAN_COLUMNS[table];
  const normalizedEntries = Object.entries(row).map(([key, value]) => {
    if (jsonColumns.includes(key) && typeof value === 'string') {
      try {
        return [key, JSON.parse(value)];
      } catch {
        return [key, value];
      }
    }
    if (booleanColumns.includes(key) && typeof value === 'number') {
      return [key, value === 1];
    }
    return [key, value];
  });
  return Object.fromEntries(normalizedEntries) as T;
}

function isColumnFilter(filter: QueryFilter): filter is ColumnFilter {
  return filter.type !== 'or';
}

function ensureCanRead(table: TableName, session: AppSession | null) {
  const config = TABLE_CONFIG[table];
  if (config.publicRead) {
    return;
  }
  if (!session) {
    throw new Error('Sessão autenticada obrigatória para leitura.');
  }
}

function ensureCanWrite(table: TableName, session: AppSession | null) {
  if (!session) {
    throw new Error('Sessão autenticada obrigatória para escrita.');
  }
  if (TABLE_CONFIG[table].adminOnlyCrud && !isAdmin(session)) {
    throw new Error('Apenas administradores podem alterar este recurso.');
  }
}

function sanitizeColumns(table: TableName, select: string) {
  const trimmed = select.trim();
  if (trimmed === '*' || trimmed.length === 0) {
    return TABLE_CONFIG[table].columns
      .map((column) => `t.${column}`)
      .join(', ');
  }

  const specialAppointments =
    table === 'appointments' && trimmed.includes('professionals(');
  const specialProfiles =
    table === 'profiles' && trimmed.includes('daily_metrics(');

  if (specialAppointments || specialProfiles) {
    return trimmed;
  }

  const columns = trimmed
    .split(',')
    .map((column) => column.trim())
    .filter(Boolean);
  for (const column of columns) {
    if (!TABLE_CONFIG[table].columns.includes(column)) {
      throw new Error(`Coluna não permitida em ${table}: ${column}`);
    }
  }
  return columns.map((column) => `t.${column}`).join(', ');
}

function parseOrExpression(expression: string, table: TableName) {
  const pieces = expression
    .split(',')
    .map((piece) => piece.trim())
    .filter(Boolean);
  const sqlChunks: string[] = [];
  const params: unknown[] = [];

  for (const piece of pieces) {
    const match = piece.match(/^([a-z_]+)\.ilike\.\%(.*)\%$/i);
    if (!match) {
      continue;
    }
    const [, column, term] = match;
    if (!TABLE_CONFIG[table].columns.includes(column)) {
      throw new Error(`Filtro OR inválido em ${table}: ${column}`);
    }
    sqlChunks.push(`LOWER(t.${column}) LIKE ?`);
    params.push(`%${term.toLowerCase()}%`);
  }

  if (sqlChunks.length === 0) {
    return { clause: '', params: [] };
  }

  return {
    clause: `(${sqlChunks.join(' OR ')})`,
    params,
  };
}

function buildWhereClause(
  table: TableName,
  filters: QueryFilter[],
  session: AppSession | null,
  writeOperation = false
) {
  const whereParts: string[] = [];
  const params: unknown[] = [];
  const config = TABLE_CONFIG[table];
  const admin = isAdmin(session);

  if (
    config.userScopedBy &&
    session &&
    (!admin || !config.adminReadAll || writeOperation)
  ) {
    whereParts.push(`t.${config.userScopedBy} = ?`);
    params.push(session.user.id);
  }

  if (
    (table === 'suggested_habits' || table === 'ai_tips') &&
    !admin &&
    !writeOperation
  ) {
    whereParts.push('t.is_active = 1');
  }

  for (const filter of filters) {
    if (filter.type === 'or' && filter.expression) {
      const parsed = parseOrExpression(filter.expression, table);
      if (parsed.clause) {
        whereParts.push(parsed.clause);
        params.push(...parsed.params);
      }
      continue;
    }

    if (!isColumnFilter(filter) || !TABLE_CONFIG[table].columns.includes(filter.column)) {
      throw new Error(`Filtro inválido para ${table}.`);
    }

    const column = filter.column;

    if (filter.type === 'eq') {
      whereParts.push(`t.${column} = ?`);
      params.push(filter.value);
      continue;
    }

    if (filter.type === 'gte') {
      whereParts.push(`t.${column} >= ?`);
      params.push(filter.value);
      continue;
    }

    if (filter.type === 'lte') {
      whereParts.push(`t.${column} <= ?`);
      params.push(filter.value);
      continue;
    }

    if (filter.type === 'not') {
      if (filter.operator === 'is' && filter.value === null) {
        whereParts.push(`t.${column} IS NOT NULL`);
      } else {
        whereParts.push(`t.${column} <> ?`);
        params.push(filter.value);
      }
    }
  }

  return {
    clause: whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '',
    params,
  };
}

function buildOrderClause(
  table: TableName,
  orders: QueryOrder[],
  hasProfileDailyMetricSelect = false
) {
  if (hasProfileDailyMetricSelect) {
    return 'ORDER BY latest_metric_date DESC';
  }
  const safeOrders = orders.filter((order) =>
    TABLE_CONFIG[table].columns.includes(order.column)
  );
  if (safeOrders.length === 0) {
    return '';
  }
  return `ORDER BY ${safeOrders
    .map((order) => `t.${order.column} ${order.ascending ? 'ASC' : 'DESC'}`)
    .join(', ')}`;
}

async function selectAppointmentsWithProfessionals(
  filters: QueryFilter[],
  orders: QueryOrder[],
  session: AppSession | null
) {
  const where = buildWhereClause('appointments', filters, session);
  const order = buildOrderClause('appointments', orders);
  const rows = await queryRows<QueryRecord>(
    `
      SELECT
        t.id,
        t.user_id,
        t.professional_id,
        t.appointment_time,
        t.status,
        t.notes,
        t.meeting_link,
        t.created_at,
        t.updated_at,
        p.name AS professional_name,
        p.specialty AS professional_specialty,
        p.avatar_url AS professional_avatar_url
      FROM appointments t
      LEFT JOIN professionals p ON p.id = t.professional_id
      ${where.clause}
      ${order}
    `,
    where.params
  );

  return rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    professional_id: row.professional_id,
    appointment_time: row.appointment_time,
    status: row.status,
    notes: row.notes,
    meeting_link: row.meeting_link,
    created_at: row.created_at,
    updated_at: row.updated_at,
    professionals: row.professional_name
      ? {
          name: row.professional_name,
          specialty: row.professional_specialty,
          avatar_url: row.professional_avatar_url,
        }
      : null,
  }));
}

async function selectProfilesWithDailyMetrics(
  filters: QueryFilter[],
  session: AppSession | null
) {
  const where = buildWhereClause('profiles', filters, session);
  const rows = await queryRows<QueryRecord>(
    `
      SELECT
        t.id,
        t.first_name,
        t.email,
        latest.date AS latest_metric_date
      FROM profiles t
      LEFT JOIN (
        SELECT dm.user_id, MAX(dm.date) AS date
        FROM daily_metrics dm
        GROUP BY dm.user_id
      ) latest ON latest.user_id = t.id
      ${where.clause}
      ORDER BY latest_metric_date DESC
    `,
    where.params
  );

  return rows.map((row) => ({
    id: row.id,
    first_name: row.first_name,
    email: row.email,
    daily_metrics: row.latest_metric_date
      ? [{ date: row.latest_metric_date }]
      : [],
  }));
}

export async function runSelectQuery(options: {
  table: string;
  select: string;
  filters: QueryFilter[];
  orders: QueryOrder[];
  limit?: number | null;
  rangeFrom?: number | null;
  rangeTo?: number | null;
  count?: 'exact' | null;
  head?: boolean;
  singleMode?: SingleMode;
  session: AppSession | null;
}) {
  assertTable(options.table);
  const table = options.table;
  ensureCanRead(table, options.session);

  const specialAppointments =
    table === 'appointments' &&
    options.select.includes('professionals(');
  const specialProfiles =
    table === 'profiles' && options.select.includes('daily_metrics(');

  const where = buildWhereClause(
    table,
    options.filters,
    options.session
  );
  const order = buildOrderClause(
    table,
    options.orders,
    specialProfiles
  );
  const limit =
    options.limit ??
    (options.rangeFrom !== null &&
    options.rangeFrom !== undefined &&
    options.rangeTo !== null &&
    options.rangeTo !== undefined
      ? options.rangeTo - options.rangeFrom + 1
      : null);
  const offset = options.rangeFrom ?? null;
  const limitClause = limit ? `LIMIT ${limit}` : '';
  const offsetClause = offset !== null ? `OFFSET ${offset}` : '';

  let data: QueryRecord[];

  if (specialAppointments) {
    data = await selectAppointmentsWithProfessionals(
      options.filters,
      options.orders,
      options.session
    );
  } else if (specialProfiles) {
    data = await selectProfilesWithDailyMetrics(
      options.filters,
      options.session
    );
  } else {
    const selectedColumns = sanitizeColumns(table, options.select);
    data = await queryRows<QueryRecord>(
      `
        SELECT ${selectedColumns}
        FROM ${table} t
        ${where.clause}
        ${order}
        ${limitClause}
        ${offsetClause}
      `,
      where.params
    );
    data = data.map((row) => normalizeRow(table, row));
  }

  let count: number | null = null;
  if (options.count === 'exact') {
    const countRows = await queryRows<{ total: number }>(
      `SELECT COUNT(*) AS total FROM ${table} t ${where.clause}`,
      where.params
    );
    count = Number(countRows[0]?.total ?? 0);
  }

  if (options.head) {
    return { data: [], count, error: null };
  }

  if (options.singleMode === 'single') {
    if (!data[0]) {
      return {
        data: null,
        count,
        error: { message: 'Registro não encontrado.' },
      };
    }
    return { data: data[0], count, error: null };
  }

  if (options.singleMode === 'maybeSingle') {
    return { data: data[0] ?? null, count, error: null };
  }

  return { data, count, error: null };
}

export async function runInsertQuery(options: {
  table: string;
  values: Record<string, unknown> | Record<string, unknown>[];
  session: AppSession | null;
}) {
  assertTable(options.table);
  const table = options.table;
  ensureCanWrite(table, options.session);

  const config = TABLE_CONFIG[table];
  const payloads = Array.isArray(options.values)
    ? options.values
    : [options.values];
  const preparedPayloads = payloads.map((payload) => {
    const nextPayload: Record<string, unknown> = {};

    for (const column of config.columns) {
      if (column === 'created_at' || column === 'updated_at') {
        continue;
      }
      const incomingValue = payload[column];
      const coercedValue = coerceWriteValue(table, column, incomingValue);
      if (coercedValue !== undefined) {
        nextPayload[column] = coercedValue;
      }
    }

    if (!nextPayload.id && config.columns.includes('id')) {
      nextPayload.id = crypto.randomUUID();
    }

    if (
      config.userScopedBy &&
      options.session &&
      (!isAdmin(options.session) || config.userScopedBy !== 'id')
    ) {
      nextPayload[config.userScopedBy] = options.session.user.id;
    }

    if (
      table === 'profiles' &&
      options.session &&
      !isAdmin(options.session)
    ) {
      nextPayload.id = options.session.user.id;
      nextPayload.email = options.session.user.email;
    }

    return nextPayload;
  });

  const columns = Object.keys(preparedPayloads[0]);
  const placeholders = `(${columns.map(() => '?').join(', ')})`;
  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${preparedPayloads
    .map(() => placeholders)
    .join(', ')}`;
  const params = preparedPayloads.flatMap((payload) =>
    columns.map((column) => payload[column])
  );

  await executeStatement(sql, params);
  return {
    data: Array.isArray(options.values)
      ? preparedPayloads
      : preparedPayloads[0],
    error: null,
  };
}

export async function runUpsertQuery(options: {
  table: string;
  values: Record<string, unknown>;
  onConflict: string;
  session: AppSession | null;
}) {
  assertTable(options.table);
  const table = options.table;
  ensureCanWrite(table, options.session);

  const config = TABLE_CONFIG[table];
  const payload: Record<string, unknown> = {};

  for (const column of config.columns) {
    if (column === 'created_at' || column === 'updated_at') {
      continue;
    }
    const value = coerceWriteValue(
      table,
      column,
      options.values[column]
    );
    if (value !== undefined) {
      payload[column] = value;
    }
  }

  if (!payload.id && config.columns.includes('id')) {
    payload.id = crypto.randomUUID();
  }
  if (config.userScopedBy && options.session && table !== 'profiles') {
    payload[config.userScopedBy] = options.session.user.id;
  }

  const columns = Object.keys(payload);
  const updateColumns = columns.filter(
    (column) => column !== options.onConflict && column !== 'id'
  );
  const sql = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${columns.map(() => '?').join(', ')})
    ON DUPLICATE KEY UPDATE ${updateColumns.map((column) => `${column} = VALUES(${column})`).join(', ')}
  `;
  await executeStatement(
    sql,
    columns.map((column) => payload[column])
  );
  return { data: payload, error: null };
}

export async function runUpdateQuery(options: {
  table: string;
  values: Record<string, unknown>;
  filters: QueryFilter[];
  session: AppSession | null;
}) {
  assertTable(options.table);
  const table = options.table;
  ensureCanWrite(table, options.session);

  const entries = Object.entries(options.values)
    .filter(
      ([column]) => TABLE_CONFIG[table].columns.includes(column) && column !== 'id'
    )
    .map(
      ([column, value]) =>
        [column, coerceWriteValue(table, column, value)] as const
    )
    .filter(([, value]) => value !== undefined);

  if (entries.length === 0) {
    return {
      data: null,
      error: { message: 'Nenhum campo válido para atualização.' },
    };
  }

  const where = buildWhereClause(
    options.table,
    options.filters,
    options.session,
    true
  );
  const sql = `UPDATE ${table} t SET ${entries.map(([column]) => `${column} = ?`).join(', ')} ${where.clause}`;
  const params = [...entries.map(([, value]) => value), ...where.params];
  await executeStatement(sql, params);

  return { data: options.values, error: null };
}

export async function runDeleteQuery(options: {
  table: string;
  filters: QueryFilter[];
  session: AppSession | null;
}) {
  assertTable(options.table);
  const table = options.table;
  ensureCanWrite(table, options.session);

  if (table === 'profiles' && isAdmin(options.session)) {
    const where = buildWhereClause(
      table,
      options.filters,
      options.session,
      true
    );
    const rows = await queryRows<{ id: string }>(
      `SELECT t.id FROM profiles t ${where.clause}`,
      where.params
    );
    await withTransaction(async (connection) => {
      for (const row of rows) {
        await connection.execute('DELETE FROM users WHERE id = ?', [row.id]);
      }
    });
    return { data: { deleted: rows.length }, error: null };
  }

  const where = buildWhereClause(
    table,
    options.filters,
    options.session,
    true
  );
  const result = await executeStatement(
    `DELETE FROM ${table} t ${where.clause}`,
    where.params
  );
  return { data: { deleted: result.affectedRows }, error: null };
}
