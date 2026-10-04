import mysql, {
  FieldPacket,
  Pool,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';
import { QueryRecord } from '@/lib/mysql/types';

// Cache do pool no escopo global (sobrevive ao hot reload em desenvolvimento);
// o acesso é sempre feito pelo tipo GlobalMysqlState.

type GlobalMysqlState = typeof globalThis & {
  __lyraMysqlPool?: Pool;
};

type MySqlParameter =
  | string
  | number
  | bigint
  | boolean
  | Date
  | null
  | Buffer
  | Uint8Array
  | MySqlParameter[]
  | { [key: string]: MySqlParameter };

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

function createLyraPool(): Pool {
  return mysql.createPool({
    host: getRequiredEnv('MYSQL_HOST'),
    port: Number(process.env.MYSQL_PORT ?? '3306'),
    user: getRequiredEnv('MYSQL_USER'),
    password: getRequiredEnv('MYSQL_PASSWORD'),
    database: getRequiredEnv('MYSQL_DATABASE'),
    charset: 'utf8mb4',
    connectionLimit: 20,
    maxIdle: 10,
    idleTimeout: 30000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    namedPlaceholders: false,
    decimalNumbers: true,
    dateStrings: true,
  });
}

const globalMysqlState = globalThis as GlobalMysqlState;

function getMysqlPool(): Pool {
  if (globalMysqlState.__lyraMysqlPool) {
    return globalMysqlState.__lyraMysqlPool;
  }

  const pool = createLyraPool();

  if (process.env.NODE_ENV !== 'production') {
    globalMysqlState.__lyraMysqlPool = pool;
  }

  return pool;
}

export async function queryRows<TRow extends object = QueryRecord>(
  sql: string,
  params: readonly unknown[] = []
): Promise<TRow[]> {
  const [rows] = await getMysqlPool().query<RowDataPacket[]>(
    sql,
    params as MySqlParameter[]
  );
  return rows as TRow[];
}

export async function executeStatement(
  sql: string,
  params: readonly unknown[] = []
): Promise<ResultSetHeader> {
  const [result] = await getMysqlPool().execute<ResultSetHeader>(
    sql,
    params as MySqlParameter[]
  );
  return result;
}

export async function withTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getMysqlPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export type MySqlRow = RowDataPacket;
export type MySqlFields = FieldPacket[];
