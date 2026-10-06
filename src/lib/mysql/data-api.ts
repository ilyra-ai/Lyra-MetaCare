import { executeStatement, queryRows, withTransaction } from '@/lib/mysql/pool';
import { AppSession } from '@/types/app-session';
import {
  QueryFilter,
  QueryOrder,
  TableName,
  TABLE_CONFIG,
} from '@/lib/mysql/table-config';
import { HttpError } from '@/lib/http-error';
import { QueryRecord } from '@/lib/mysql/types';
import {
  assertActiveRowsQuota,
  getMetricsHistoryLimit,
  requireFeatureEnabled,
} from '@/lib/plans/service';
import { PlanFeatureKey } from '@/types/subscription';

type SingleMode = 'single' | 'maybeSingle' | null;

const JSON_COLUMNS: Record<TableName, string[]> = {
  profiles: ['goals'],
  daily_metrics: [],
  goals: [],
  habits: [],
  suggested_habits: [],
  ai_tips: [],
  ai_config: [],
  ai_knowledge_documents: [],
  ai_plans: ['plan_data'],
  appointments: [],
  professionals: [],
  instruments: [],
  user_assessments: ['raw_responses'],
  user_streaks: [],
};

const BOOLEAN_COLUMNS: Record<TableName, string[]> = {
  profiles: ['onboarding_completed', 'tracks_menstrual_cycle'],
  daily_metrics: [],
  goals: [],
  habits: ['is_active'],
  suggested_habits: ['is_active'],
  ai_tips: ['is_active'],
  ai_config: [],
  ai_knowledge_documents: ['is_active'],
  ai_plans: [],
  appointments: [],
  professionals: [],
  instruments: [],
  user_assessments: [],
  user_streaks: [],
};

const DATE_COLUMNS: Record<TableName, string[]> = {
  profiles: ['birth_date', 'last_menstrual_period'],
  daily_metrics: ['date'],
  goals: [],
  habits: [],
  suggested_habits: [],
  ai_tips: [],
  ai_config: [],
  ai_knowledge_documents: [],
  ai_plans: [],
  appointments: [],
  professionals: [],
  instruments: [],
  user_assessments: [],
  user_streaks: ['last_activity_date'],
};

const TIME_COLUMNS: Record<TableName, string[]> = {
  profiles: ['birth_time'],
  daily_metrics: [],
  goals: [],
  habits: [],
  suggested_habits: [],
  ai_tips: [],
  ai_config: [],
  ai_knowledge_documents: [],
  ai_plans: [],
  appointments: [],
  professionals: [],
  instruments: [],
  user_assessments: [],
  user_streaks: [],
};

const DATETIME_COLUMNS: Record<TableName, string[]> = {
  profiles: ['created_at', 'updated_at'],
  daily_metrics: ['created_at'],
  goals: ['created_at', 'updated_at'],
  habits: ['created_at'],
  suggested_habits: ['created_at'],
  ai_tips: ['created_at'],
  ai_config: ['updated_at'],
  ai_knowledge_documents: ['created_at', 'updated_at'],
  ai_plans: ['created_at', 'updated_at'],
  appointments: ['appointment_time', 'created_at', 'updated_at'],
  professionals: ['created_at', 'updated_at'],
  instruments: [],
  user_assessments: ['created_at', 'updated_at'],
  user_streaks: ['created_at', 'updated_at'],
};

type ColumnFilter = Exclude<QueryFilter, { type: 'or' }>;

const TABLE_FEATURE_ACCESS: Partial<
  Record<
    TableName,
    {
      read?: PlanFeatureKey;
      write?: PlanFeatureKey;
    }
  >
> = {
  goals: {
    read: 'goal_progress_tracking',
    write: 'goal_progress_tracking',
  },
  ai_tips: {
    read: 'ai_tips_feed',
  },
  ai_plans: {
    read: 'ai_plan_generations',
    write: 'ai_plan_generations',
  },
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function formatUtcDate(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function formatUtcTime(date: Date) {
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

function formatUtcDateTime(date: Date) {
  return `${formatUtcDate(date)} ${formatUtcTime(date)}`;
}

function normalizeDateWriteValue(value: unknown) {
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return formatUtcDate(parsed);
    }
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatUtcDate(value);
  }
  return value;
}

function normalizeTimeWriteValue(value: unknown) {
  if (typeof value === 'string') {
    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
      return value;
    }
    if (/^\d{2}:\d{2}$/.test(value)) {
      return `${value}:00`;
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return formatUtcTime(parsed);
    }
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatUtcTime(value);
  }
  return value;
}

function normalizeDateTimeWriteValue(value: unknown) {
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
      return value;
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return formatUtcDateTime(parsed);
    }
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatUtcDateTime(value);
  }
  return value;
}

function normalizeDateTimeReadValue(value: unknown) {
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
      return `${value.replace(' ', 'T')}Z`;
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) {
      return `${value}Z`;
    }
  }
  return value;
}

function coerceFilterValue(table: TableName, column: string, value: unknown) {
  if (BOOLEAN_COLUMNS[table].includes(column)) {
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    if (value === 'true') {
      return 1;
    }
    if (value === 'false') {
      return 0;
    }
  }
  if (DATE_COLUMNS[table].includes(column)) {
    return normalizeDateWriteValue(value);
  }
  if (TIME_COLUMNS[table].includes(column)) {
    return normalizeTimeWriteValue(value);
  }
  if (DATETIME_COLUMNS[table].includes(column)) {
    return normalizeDateTimeWriteValue(value);
  }
  return value;
}

function assertTable(table: string): asserts table is TableName {
  if (!(table in TABLE_CONFIG)) {
    throw new HttpError(`Tabela não suportada: ${table}`, 400);
  }
}

function isAdmin(session: AppSession | null) {
  return session?.user.role === 'admin';
}

// Limite de linhas por consulta da API genérica.
export const DATA_API_MAX_LIMIT = 1000;

function isScalarValue(value: unknown) {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value)) ||
    (value instanceof Date && !Number.isNaN(value.getTime()))
  );
}

// Objetos e arrays nunca chegam ao SQL fora das colunas JSON: o mysql2 os
// expandiria em `chave` = valor ou listas, alterando o sentido da consulta.
function assertScalarValue(table: TableName, column: string, value: unknown) {
  if (!isScalarValue(value)) {
    throw new HttpError(`Valor inválido para ${table}.${column}.`, 400);
  }
}

function assertNonNegativeInteger(
  name: string,
  value: number | null | undefined,
  minimum = 0
) {
  if (value === null || value === undefined) {
    return;
  }
  if (!Number.isInteger(value) || value < minimum) {
    throw new HttpError(
      `Parâmetro ${name} inválido: use um inteiro maior ou igual a ${minimum}.`,
      400
    );
  }
}

// Regras de escrita por coluna, aplicadas antes de qualquer SQL:
// - colunas exclusivas de administradores (profiles.role);
// - o e-mail do próprio perfil acompanha o da conta;
// - a coluna de dono não pode transferir a linha para outro usuário.
function protectWriteColumns(
  table: TableName,
  session: AppSession,
  payload: Record<string, unknown>,
  mode: 'insert' | 'update' | 'upsert'
) {
  const config = TABLE_CONFIG[table];
  const admin = isAdmin(session);

  if (!admin) {
    for (const column of config.adminOnlyColumns ?? []) {
      if (!(column in payload)) {
        continue;
      }
      if (column === 'role' && payload.role === session.user.role) {
        delete payload.role;
        continue;
      }
      throw new HttpError(
        `Apenas administradores podem alterar ${table}.${column}.`,
        403
      );
    }

    if (
      table === 'profiles' &&
      'email' in payload &&
      payload.email !== session.user.email
    ) {
      throw new HttpError(
        'O e-mail do perfil acompanha o e-mail da conta e não pode ser alterado aqui.',
        403
      );
    }
  }

  const owner = config.userScopedBy;
  if (mode === 'update' && owner && owner in payload) {
    if (payload[owner] !== session.user.id) {
      throw new HttpError(
        `Não é permitido transferir registros de ${table} para outro usuário.`,
        403
      );
    }
    delete payload[owner];
  }
}

// UPDATE e DELETE sempre exigem ao menos um filtro explícito: sem ele, a
// operação atingiria todas as linhas visíveis (ou a tabela inteira, para
// administradores).
function assertWriteFilters(filters: QueryFilter[], operation: string) {
  if (!Array.isArray(filters) || filters.length === 0) {
    throw new HttpError(
      `Informe ao menos um filtro para ${operation} registros.`,
      400
    );
  }
}

function coerceWriteValue(table: TableName, column: string, value: unknown) {
  if (value === undefined) {
    return undefined;
  }
  if (JSON_COLUMNS[table].includes(column) && value !== null) {
    return JSON.stringify(value);
  }
  if (DATE_COLUMNS[table].includes(column)) {
    return normalizeDateWriteValue(value);
  }
  if (TIME_COLUMNS[table].includes(column)) {
    return normalizeTimeWriteValue(value);
  }
  if (DATETIME_COLUMNS[table].includes(column)) {
    return normalizeDateTimeWriteValue(value);
  }
  return value;
}

function normalizeRow<T extends QueryRecord>(table: TableName, row: T): T {
  const jsonColumns = JSON_COLUMNS[table];
  const booleanColumns = BOOLEAN_COLUMNS[table];
  const dateTimeColumns = DATETIME_COLUMNS[table];
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
    if (dateTimeColumns.includes(key)) {
      return [key, normalizeDateTimeReadValue(value)];
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
    throw new HttpError('Sessão autenticada obrigatória para leitura.', 401);
  }
}

function ensureCanWrite(
  table: TableName,
  session: AppSession | null
): AppSession {
  if (!session) {
    throw new HttpError('Sessão autenticada obrigatória para escrita.', 401);
  }
  if (TABLE_CONFIG[table].adminOnlyCrud && !isAdmin(session)) {
    throw new HttpError(
      'Apenas administradores podem alterar este recurso.',
      403
    );
  }
  return session;
}

// Valida o valor recebido para uma coluna antes da conversão: colunas JSON
// aceitam qualquer valor serializável; as demais, somente escalares.
function prepareWriteValue(table: TableName, column: string, value: unknown) {
  if (value === undefined) {
    return undefined;
  }
  if (!JSON_COLUMNS[table].includes(column)) {
    assertScalarValue(table, column, value);
  }
  return coerceWriteValue(table, column, value);
}

async function ensurePlanFeatureAccessForTable(
  table: TableName,
  session: AppSession | null,
  mode: 'read' | 'write'
) {
  if (!session || isAdmin(session)) {
    return;
  }

  const featureKey = TABLE_FEATURE_ACCESS[table]?.[mode];
  if (!featureKey) {
    return;
  }

  await requireFeatureEnabled(session, featureKey);
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
      throw new HttpError(`Coluna não permitida em ${table}: ${column}`, 400);
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
      // Um trecho ignorado em silêncio ampliaria o resultado (ou o alvo de
      // uma escrita) sem que o chamador soubesse.
      throw new HttpError(
        `Filtro OR inválido em ${table}: use coluna.ilike.%termo%.`,
        400
      );
    }
    const [, column, term] = match;
    if (!TABLE_CONFIG[table].columns.includes(column)) {
      throw new HttpError(`Filtro OR inválido em ${table}: ${column}`, 400);
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
  if (!Array.isArray(filters)) {
    throw new HttpError(`Filtros inválidos para ${table}: use uma lista.`, 400);
  }
  const whereParts: string[] = [];
  const params: unknown[] = [];
  const config = TABLE_CONFIG[table];
  const admin = isAdmin(session);

  // Usuários comuns só alcançam as próprias linhas, na leitura e na escrita.
  // Administradores alcançam qualquer linha das tabelas `adminReadAll` (ex.:
  // marcar o onboarding ou remover o perfil de outro usuário); antes, as
  // escritas do administrador também eram limitadas às próprias linhas e
  // essas ações terminavam sem efeito.
  if (config.userScopedBy && session && !(admin && config.adminReadAll)) {
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
    if (!filter || typeof filter !== 'object') {
      throw new HttpError(`Filtro inválido para ${table}.`, 400);
    }

    if (filter.type === 'or') {
      if (typeof filter.expression !== 'string' || !filter.expression.trim()) {
        throw new HttpError(`Filtro OR vazio em ${table}.`, 400);
      }
      const parsed = parseOrExpression(filter.expression, table);
      whereParts.push(parsed.clause);
      params.push(...parsed.params);
      continue;
    }

    if (
      !isColumnFilter(filter) ||
      !['eq', 'gte', 'lte', 'not'].includes(filter.type) ||
      typeof filter.column !== 'string' ||
      !TABLE_CONFIG[table].columns.includes(filter.column)
    ) {
      throw new HttpError(`Filtro inválido para ${table}.`, 400);
    }

    const column = filter.column;
    assertScalarValue(table, column, filter.value);
    const filterValue = coerceFilterValue(table, column, filter.value);

    if (filter.type === 'eq') {
      whereParts.push(`t.${column} = ?`);
      params.push(filterValue);
      continue;
    }

    if (filter.type === 'gte') {
      whereParts.push(`t.${column} >= ?`);
      params.push(filterValue);
      continue;
    }

    if (filter.type === 'lte') {
      whereParts.push(`t.${column} <= ?`);
      params.push(filterValue);
      continue;
    }

    // `not`: somente "is null" (IS NOT NULL) e "eq" (<>), os operadores que o
    // cliente expõe; qualquer outro seria interpretado de forma errada.
    if (filter.operator === 'is' && filter.value === null) {
      whereParts.push(`t.${column} IS NOT NULL`);
    } else if (filter.operator === 'eq' && filter.value !== null) {
      whereParts.push(`t.${column} <> ?`);
      params.push(filterValue);
    } else {
      throw new HttpError(
        `Operador "not.${String(filter.operator)}" não suportado em ${table}.`,
        400
      );
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
  if (!Array.isArray(orders)) {
    throw new HttpError(
      `Ordenação inválida para ${table}: use uma lista.`,
      400
    );
  }
  if (hasProfileDailyMetricSelect) {
    return 'ORDER BY latest_metric_date DESC';
  }
  // Ordenações de tabelas relacionadas (`foreignTable`) são resolvidas pelas
  // consultas especiais; na tabela principal, só colunas conhecidas.
  const safeOrders = orders.filter((order) => {
    if (!order || typeof order !== 'object' || order.foreignTable) {
      return false;
    }
    if (!TABLE_CONFIG[table].columns.includes(order.column)) {
      throw new HttpError(
        `Coluna de ordenação não permitida em ${table}: ${String(order.column)}`,
        400
      );
    }
    return true;
  });
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

  return rows.map((rawRow) => {
    const row = normalizeRow('appointments', rawRow);
    return {
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
    };
  });
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

  // LIMIT/OFFSET são interpolados no SQL: só inteiros validados chegam lá.
  assertNonNegativeInteger('limit', options.limit, 1);
  assertNonNegativeInteger('rangeFrom', options.rangeFrom);
  assertNonNegativeInteger('rangeTo', options.rangeTo);
  const hasRangeFrom =
    options.rangeFrom !== null && options.rangeFrom !== undefined;
  const hasRangeTo = options.rangeTo !== null && options.rangeTo !== undefined;
  if (hasRangeFrom !== hasRangeTo) {
    throw new HttpError('Informe rangeFrom e rangeTo juntos.', 400);
  }
  if (
    hasRangeFrom &&
    hasRangeTo &&
    (options.rangeTo as number) < (options.rangeFrom as number)
  ) {
    throw new HttpError('rangeTo precisa ser maior ou igual a rangeFrom.', 400);
  }
  const requestedRows =
    options.limit ??
    (hasRangeFrom && hasRangeTo
      ? (options.rangeTo as number) - (options.rangeFrom as number) + 1
      : null);
  if (requestedRows !== null && requestedRows > DATA_API_MAX_LIMIT) {
    throw new HttpError(
      `No máximo ${DATA_API_MAX_LIMIT} linhas por consulta.`,
      400
    );
  }
  if (options.count !== null && options.count !== undefined) {
    if (options.count !== 'exact') {
      throw new HttpError('Parâmetro count inválido: use "exact".', 400);
    }
  }
  if (
    options.singleMode !== null &&
    options.singleMode !== undefined &&
    options.singleMode !== 'single' &&
    options.singleMode !== 'maybeSingle'
  ) {
    throw new HttpError(
      'Parâmetro singleMode inválido: use "single" ou "maybeSingle".',
      400
    );
  }

  await ensurePlanFeatureAccessForTable(table, options.session, 'read');

  if (!Array.isArray(options.filters)) {
    throw new HttpError(`Filtros inválidos para ${table}: use uma lista.`, 400);
  }
  const effectiveFilters = [...options.filters];
  if (
    table === 'daily_metrics' &&
    options.session &&
    !isAdmin(options.session)
  ) {
    const historyDays = await getMetricsHistoryLimit(options.session);
    if (historyDays === 0) {
      throw new HttpError(
        'Seu plano atual não permite consultar o histórico biométrico.',
        403
      );
    }

    if (historyDays !== null) {
      const cutoffDate = new Date();
      cutoffDate.setUTCDate(cutoffDate.getUTCDate() - historyDays + 1);
      effectiveFilters.push({
        type: 'gte',
        column: 'date',
        value: formatUtcDate(cutoffDate),
      });
    }
  }

  const specialAppointments =
    table === 'appointments' && options.select.includes('professionals(');
  const specialProfiles =
    table === 'profiles' && options.select.includes('daily_metrics(');

  const where = buildWhereClause(table, effectiveFilters, options.session);
  const order = buildOrderClause(table, options.orders, specialProfiles);
  const offset = hasRangeFrom ? (options.rangeFrom as number) : null;
  const limitClause = requestedRows !== null ? `LIMIT ${requestedRows}` : '';
  const offsetClause = offset !== null ? `OFFSET ${offset}` : '';

  let data: QueryRecord[];

  if (specialAppointments) {
    data = await selectAppointmentsWithProfessionals(
      effectiveFilters,
      options.orders,
      options.session
    );
  } else if (specialProfiles) {
    data = await selectProfilesWithDailyMetrics(
      effectiveFilters,
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
  const session = ensureCanWrite(table, options.session);
  await ensurePlanFeatureAccessForTable(table, session, 'write');

  const config = TABLE_CONFIG[table];
  const payloads = Array.isArray(options.values)
    ? options.values
    : [options.values];
  if (
    payloads.length === 0 ||
    payloads.some(
      (payload) =>
        !payload || typeof payload !== 'object' || Array.isArray(payload)
    )
  ) {
    throw new HttpError(
      `Informe o registro (ou a lista de registros) a inserir em ${table}.`,
      400
    );
  }
  const preparedPayloads = payloads.map((payload) => {
    const nextPayload: Record<string, unknown> = {};

    for (const column of config.columns) {
      if (column === 'created_at' || column === 'updated_at') {
        continue;
      }
      const preparedValue = prepareWriteValue(table, column, payload[column]);
      if (preparedValue !== undefined) {
        nextPayload[column] = preparedValue;
      }
    }

    if (!nextPayload.id && config.columns.includes('id')) {
      nextPayload.id = crypto.randomUUID();
    }

    if (
      config.userScopedBy &&
      (!isAdmin(session) || config.userScopedBy !== 'id')
    ) {
      nextPayload[config.userScopedBy] = session.user.id;
    }

    if (table === 'profiles' && !isAdmin(session)) {
      nextPayload.id = session.user.id;
      nextPayload.email = session.user.email;
    }

    protectWriteColumns(table, session, nextPayload, 'insert');
    return nextPayload;
  });

  // Um INSERT de várias linhas usa uma única lista de colunas.
  const columnSignature = Object.keys(preparedPayloads[0]).sort().join(',');
  if (
    preparedPayloads.some(
      (payload) => Object.keys(payload).sort().join(',') !== columnSignature
    )
  ) {
    throw new HttpError(
      `Todas as linhas inseridas em ${table} precisam informar as mesmas colunas.`,
      400
    );
  }

  if (options.session && !isAdmin(options.session)) {
    if (table === 'professionals') {
      const countRows = await queryRows<{ total: number }>(
        'SELECT COUNT(*) AS total FROM professionals WHERE user_id = ?',
        [options.session.user.id]
      );
      await assertActiveRowsQuota({
        session: options.session,
        featureKey: 'professionals_total',
        currentCount: Number(countRows[0]?.total ?? 0),
        increment: preparedPayloads.length,
      });
    }

    if (table === 'appointments') {
      const countRows = await queryRows<{ total: number }>(
        `
          SELECT COUNT(*) AS total
          FROM appointments
          WHERE user_id = ?
            AND appointment_time >= UTC_TIMESTAMP()
        `,
        [options.session.user.id]
      );
      const futureInserts = preparedPayloads.filter((payload) => {
        const appointmentTime = payload.appointment_time;
        return (
          typeof appointmentTime === 'string' &&
          new Date(appointmentTime).getTime() >= Date.now()
        );
      }).length;

      if (futureInserts > 0) {
        await assertActiveRowsQuota({
          session: options.session,
          featureKey: 'appointments_active',
          currentCount: Number(countRows[0]?.total ?? 0),
          increment: futureInserts,
        });
      }
    }
  }

  const columns = Object.keys(preparedPayloads[0]);
  const placeholders = `(${columns.map(() => '?').join(', ')})`;
  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${preparedPayloads
    .map(() => placeholders)
    .join(', ')}`;
  const params = preparedPayloads.flatMap((payload) =>
    columns.map((column) => payload[column])
  );

  await executeStatement(sql, params);
  const normalizedPayloads = preparedPayloads.map((payload) =>
    normalizeRow(table, payload as QueryRecord)
  );
  return {
    data: Array.isArray(options.values)
      ? normalizedPayloads
      : normalizedPayloads[0],
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
  const session = ensureCanWrite(table, options.session);
  await ensurePlanFeatureAccessForTable(table, session, 'write');

  const config = TABLE_CONFIG[table];
  if (
    !options.values ||
    typeof options.values !== 'object' ||
    Array.isArray(options.values)
  ) {
    throw new HttpError(`Informe o registro a gravar em ${table}.`, 400);
  }
  if (!config.columns.includes(options.onConflict)) {
    throw new HttpError(
      `Coluna de conflito inválida em ${table}: ${String(options.onConflict)}`,
      400
    );
  }
  const payload: Record<string, unknown> = {};

  for (const column of config.columns) {
    if (column === 'created_at' || column === 'updated_at') {
      continue;
    }
    const value = prepareWriteValue(table, column, options.values[column]);
    if (value !== undefined) {
      payload[column] = value;
    }
  }

  if (!payload.id && config.columns.includes('id')) {
    payload.id = crypto.randomUUID();
  }
  if (table === 'profiles' && !isAdmin(session)) {
    payload.id = session.user.id;
    payload.email = session.user.email;
  } else if (config.userScopedBy && config.userScopedBy !== 'id') {
    payload[config.userScopedBy] = session.user.id;
  }
  protectWriteColumns(table, session, payload, 'upsert');

  // O ON DUPLICATE KEY UPDATE sobrescreveria a linha de outro usuário que
  // tivesse o mesmo id: a linha existente precisa pertencer à sessão.
  const owner = config.userScopedBy;
  if (owner && typeof payload.id === 'string') {
    const existing = await queryRows<Record<string, unknown>>(
      `SELECT ${owner} AS owner FROM ${table} WHERE id = ? LIMIT 1`,
      [payload.id]
    );
    if (existing[0] && existing[0].owner !== payload[owner]) {
      throw new HttpError(
        `O registro ${payload.id} de ${table} pertence a outro usuário.`,
        403
      );
    }
  }

  const columns = Object.keys(payload);
  const updateColumns = columns.filter(
    (column) =>
      column !== options.onConflict && column !== 'id' && column !== owner
  );
  // Alias de linha (`AS novo`) no lugar da função VALUES(), depreciada desde
  // o MySQL 8.0.20 (warning 1287). Sem colunas a atualizar, o conflito é um
  // no-op explícito (`id = id`).
  const updateAssignments =
    updateColumns.length > 0
      ? updateColumns.map((column) => `${column} = novo.${column}`).join(', ')
      : `id = ${table}.id`;
  const sql = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${columns.map(() => '?').join(', ')}) AS novo
    ON DUPLICATE KEY UPDATE ${updateAssignments}
  `;
  await executeStatement(
    sql,
    columns.map((column) => payload[column])
  );
  return { data: normalizeRow(table, payload as QueryRecord), error: null };
}

export async function runUpdateQuery(options: {
  table: string;
  values: Record<string, unknown>;
  filters: QueryFilter[];
  session: AppSession | null;
}) {
  assertTable(options.table);
  const table = options.table;
  const session = ensureCanWrite(table, options.session);
  await ensurePlanFeatureAccessForTable(table, session, 'write');

  if (
    !options.values ||
    typeof options.values !== 'object' ||
    Array.isArray(options.values)
  ) {
    throw new HttpError(`Informe os campos a atualizar em ${table}.`, 400);
  }
  assertWriteFilters(options.filters, 'atualizar');

  // Colunas fora da configuração da tabela são ignoradas (o cliente pode
  // enviar campos calculados); `id` nunca é alterado.
  const payload: Record<string, unknown> = {};
  for (const [column, value] of Object.entries(options.values)) {
    if (!TABLE_CONFIG[table].columns.includes(column) || column === 'id') {
      continue;
    }
    const preparedValue = prepareWriteValue(table, column, value);
    if (preparedValue !== undefined) {
      payload[column] = preparedValue;
    }
  }
  protectWriteColumns(table, session, payload, 'update');
  const entries = Object.entries(payload);

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

  if (
    table === 'appointments' &&
    options.session &&
    !isAdmin(options.session) &&
    Object.prototype.hasOwnProperty.call(options.values, 'appointment_time')
  ) {
    const normalizedAppointmentTime = coerceWriteValue(
      table,
      'appointment_time',
      options.values.appointment_time
    );
    const targetWillBeActive =
      typeof normalizedAppointmentTime === 'string' &&
      new Date(normalizedAppointmentTime).getTime() >= Date.now();

    if (targetWillBeActive) {
      const scopedRows = await queryRows<{ id: string }>(
        `SELECT t.id FROM appointments t ${where.clause}`,
        where.params
      );

      if (scopedRows.length > 0) {
        const placeholders = scopedRows.map(() => '?').join(', ');
        const countRows = await queryRows<{ total: number }>(
          `
            SELECT COUNT(*) AS total
            FROM appointments
            WHERE user_id = ?
              AND appointment_time >= UTC_TIMESTAMP()
              AND id NOT IN (${placeholders})
          `,
          [options.session.user.id, ...scopedRows.map((row) => row.id)]
        );

        await assertActiveRowsQuota({
          session: options.session,
          featureKey: 'appointments_active',
          currentCount: Number(countRows[0]?.total ?? 0),
          increment: scopedRows.length,
        });
      }
    }
  }

  const sql = `UPDATE ${table} t SET ${entries.map(([column]) => `${column} = ?`).join(', ')} ${where.clause}`;
  const params = [...entries.map(([, value]) => value), ...where.params];
  await executeStatement(sql, params);

  return {
    data: normalizeRow(table, Object.fromEntries(entries) as QueryRecord),
    error: null,
  };
}

export async function runDeleteQuery(options: {
  table: string;
  filters: QueryFilter[];
  session: AppSession | null;
}) {
  assertTable(options.table);
  const table = options.table;
  const session = ensureCanWrite(table, options.session);
  await ensurePlanFeatureAccessForTable(table, session, 'write');
  assertWriteFilters(options.filters, 'excluir');

  // O administrador remove a conta inteira (users → perfil e dados em
  // cascata), nunca a própria.
  if (table === 'profiles' && isAdmin(session)) {
    const where = buildWhereClause(table, options.filters, session, true);
    const rows = await queryRows<{ id: string }>(
      `SELECT t.id FROM profiles t ${where.clause}`,
      where.params
    );
    if (rows.some((row) => row.id === session.user.id)) {
      throw new HttpError(
        'Um administrador não pode remover a própria conta por aqui.',
        400
      );
    }
    await withTransaction(async (connection) => {
      for (const row of rows) {
        await connection.execute('DELETE FROM users WHERE id = ?', [row.id]);
      }
    });
    return { data: { deleted: rows.length }, error: null };
  }

  const where = buildWhereClause(table, options.filters, options.session, true);
  const result = await executeStatement(
    `DELETE FROM ${table} t ${where.clause}`,
    where.params
  );
  return { data: { deleted: result.affectedRows }, error: null };
}
