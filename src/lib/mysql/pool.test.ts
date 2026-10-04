import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Pool falso: registra quantas vezes o mysql2 foi chamado para criar pools.
const createPoolMock = vi.fn(() => ({
  query: vi.fn(async () => [[{ ok: 1 }], []]),
  execute: vi.fn(async () => [{ affectedRows: 1 }, []]),
}));

vi.mock('mysql2/promise', () => ({
  default: { createPool: createPoolMock },
}));

const ORIGINAL_ENV = { ...process.env };

describe('pool MySQL', () => {
  beforeEach(() => {
    vi.resetModules();
    createPoolMock.mockClear();
    delete (globalThis as { __lyraMysqlPool?: unknown }).__lyraMysqlPool;
    process.env = {
      ...ORIGINAL_ENV,
      MYSQL_HOST: '127.0.0.1',
      MYSQL_PORT: '3306',
      MYSQL_USER: 'lyra',
      MYSQL_PASSWORD: 'senha-de-teste',
      MYSQL_DATABASE: 'lyra_metacare',
    };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete (globalThis as { __lyraMysqlPool?: unknown }).__lyraMysqlPool;
  });

  it('reutiliza um único pool em produção (sem vazar conexões)', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'production';
    const { queryRows, executeStatement } = await import('./pool');

    await queryRows('SELECT 1');
    await queryRows('SELECT 2');
    await executeStatement('UPDATE t SET a = 1');

    expect(createPoolMock).toHaveBeenCalledTimes(1);
  });

  it('reutiliza um único pool em desenvolvimento', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'development';
    const { queryRows } = await import('./pool');

    await queryRows('SELECT 1');
    await queryRows('SELECT 2');

    expect(createPoolMock).toHaveBeenCalledTimes(1);
  });

  it('falha com mensagem clara quando falta variável obrigatória', async () => {
    delete process.env.MYSQL_PASSWORD;
    const { queryRows } = await import('./pool');

    await expect(queryRows('SELECT 1')).rejects.toThrow(
      'Variável de ambiente obrigatória ausente: MYSQL_PASSWORD'
    );
  });
});
