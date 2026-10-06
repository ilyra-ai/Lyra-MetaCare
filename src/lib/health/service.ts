import { queryRows } from '@/lib/mysql/pool';

export interface HealthReport {
  status: 'ok' | 'indisponivel';
  database: 'ok' | 'indisponivel';
  migrationsApplied: number | null;
  checkedAt: string;
}

/**
 * Prontidão da aplicação para os launchers e o monitoramento: confirma que o
 * servidor conversa com o MySQL e informa quantas migrations estão aplicadas.
 * Não expõe versões, credenciais nem mensagens internas de erro (o detalhe
 * fica apenas no log do servidor).
 */
export async function getHealthReport(): Promise<HealthReport> {
  const checkedAt = new Date().toISOString();

  try {
    const [row] = await queryRows<{ total: number }>(
      'SELECT COUNT(*) AS total FROM _lyra_schema_migrations'
    );
    return {
      status: 'ok',
      database: 'ok',
      migrationsApplied: Number(row?.total ?? 0),
      checkedAt,
    };
  } catch (error) {
    console.error(
      '[health] Banco de dados indisponível:',
      error instanceof Error ? error.message : String(error)
    );
    return {
      status: 'indisponivel',
      database: 'indisponivel',
      migrationsApplied: null,
      checkedAt,
    };
  }
}
