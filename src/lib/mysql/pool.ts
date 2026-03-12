import mysql, {
  FieldPacket,
  Pool,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';
import { QueryRecord } from '@/lib/mysql/types';

declare global {
  var __lyraMysqlPool: Pool | undefined;
}

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
    connectionLimit: 10,
    namedPlaceholders: false,
    decimalNumbers: true,
    dateStrings: true,
  });
}

const globalMysqlState = globalThis as GlobalMysqlState;

export const mysqlPool = globalMysqlState.__lyraMysqlPool ?? createLyraPool();

if (process.env.NODE_ENV !== 'production') {
  globalMysqlState.__lyraMysqlPool = mysqlPool;
}

export async function queryRows<
  TRow extends object = QueryRecord,
>(
  sql: string,
  params: readonly unknown[] = []
): Promise<TRow[]> {
  const [rows] = await mysqlPool.query<RowDataPacket[]>(
    sql,
    params as MySqlParameter[]
  );
  return rows as TRow[];
}

export async function executeStatement(
  sql: string,
  params: readonly unknown[] = []
): Promise<ResultSetHeader> {
  const [result] = await mysqlPool.execute<ResultSetHeader>(
    sql,
    params as MySqlParameter[]
  );
  return result;
}

export async function withTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await mysqlPool.getConnection();
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
