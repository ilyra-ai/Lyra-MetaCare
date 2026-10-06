import { beforeEach, describe, expect, it, vi } from 'vitest';

const queryRowsMock = vi.fn();

vi.mock('@/lib/mysql/pool', () => ({
  queryRows: (...args: unknown[]) => queryRowsMock(...args),
}));

const { getHealthReport } = await import('./service');

describe('getHealthReport', () => {
  beforeEach(() => {
    queryRowsMock.mockReset();
  });

  it('informa banco disponível e a quantidade de migrations aplicadas', async () => {
    queryRowsMock.mockResolvedValue([{ total: 12 }]);

    const report = await getHealthReport();

    expect(queryRowsMock).toHaveBeenCalledWith(
      'SELECT COUNT(*) AS total FROM _lyra_schema_migrations'
    );
    expect(report).toMatchObject({
      status: 'ok',
      database: 'ok',
      migrationsApplied: 12,
    });
    expect(Number.isNaN(Date.parse(report.checkedAt))).toBe(false);
  });

  it('reporta indisponibilidade sem expor a mensagem interna do erro', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    queryRowsMock.mockRejectedValue(
      new Error("Access denied for user 'lyra'@'172.18.0.1'")
    );

    const report = await getHealthReport();

    expect(report).toMatchObject({
      status: 'indisponivel',
      database: 'indisponivel',
      migrationsApplied: null,
    });
    expect(JSON.stringify(report)).not.toContain('Access denied');
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });
});
