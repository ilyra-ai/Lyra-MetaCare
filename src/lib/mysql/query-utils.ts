import { AppSession } from '@/types/app-session';
import { TableName, TABLE_CONFIG } from '@/lib/mysql/table-config';

export interface QueryFilter {
  type: 'eq' | 'gte' | 'lte' | 'not' | 'or';
  column?: string;
  operator?: string;
  value?: string | number | boolean | null;
  expression?: string;
}

export interface QueryOrder {
  column: string;
  ascending: boolean;
  foreignTable?: string;
}

export function getTableConfig(table: string) {
  return TABLE_CONFIG[table as TableName];
}

export function assertKnownTable(table: string): asserts table is TableName {
  if (!getTableConfig(table)) {
    throw new Error(`Tabela não suportada pela camada MySQL: ${table}`);
  }
}

export function assertColumn(table: TableName, column: string) {
  if (!TABLE_CONFIG[table].columns.includes(column)) {
    throw new Error(`Coluna não permitida em ${table}: ${column}`);
  }
}

export function isAdmin(session: AppSession | null) {
  return session?.user.role === 'admin';
}

export function ensureCanReadTable(
  table: TableName,
  session: AppSession | null
) {
  const config = TABLE_CONFIG[table];
  if (config.publicRead) {
    return;
  }
  if (!session) {
    throw new Error('Sessão autenticada obrigatória para esta consulta.');
  }
}

export function ensureCanWriteTable(
  table: TableName,
  session: AppSession | null
) {
  const config = TABLE_CONFIG[table];
  if (!session) {
    throw new Error('Sessão autenticada obrigatória para esta operação.');
  }
  if (config.adminOnlyCrud && !isAdmin(session)) {
    throw new Error('Apenas administradores podem alterar este recurso.');
  }
}

export function parseJsonQueryParam<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }
  return JSON.parse(value) as T;
}
