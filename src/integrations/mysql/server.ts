import { queryRows } from '@/lib/mysql/pool';

export async function createServerDatabaseClient() {
  return {
    from(table: string) {
      return {
        async select() {
          const rows = await queryRows<Record<string, unknown>>(
            `SELECT * FROM ${table}`
          );
          return {
            data: rows,
            error: null as { message: string } | null,
          };
        },
      };
    },
  };
}
