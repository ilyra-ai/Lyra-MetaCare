import mysql, {
  FieldPacket,
  Pool,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';

declare global {
  let __lyraMysqlPool: Pool | undefined;
}

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

export const mysqlPool = global.__lyraMysqlPool ?? createLyraPool();

if (process.env.NODE_ENV !== 'production') {
  global.__lyraMysqlPool = mysqlPool;
}

export async function queryRows<T extends RowDataPacket[] = RowDataPacket[]>(
  sql: string,
  params: unknown[] = []
): Promise<T> {
  const [rows] = await mysqlPool.query<T>(sql, params);
  return rows;
}

export async function executeStatement(
  sql: string,
  params: unknown[] = []
): Promise<ResultSetHeader> {
  const [result] = await mysqlPool.execute<ResultSetHeader>(sql, params);
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
