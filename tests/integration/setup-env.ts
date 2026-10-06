import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterAll, inject, vi } from 'vitest';

import { closeMysqlPool } from '@/lib/mysql/pool';

import { cookieJar } from './http';
import './provided-context';

// Aponta o pool da aplicação para o banco de teste criado no setup global,
// antes de qualquer consulta.
const config = inject('lyraMysqlTest');
process.env.MYSQL_HOST = config.host;
process.env.MYSQL_PORT = String(config.port);
process.env.MYSQL_USER = config.user;
process.env.MYSQL_PASSWORD = config.password;
process.env.MYSQL_DATABASE = config.database;

// Segredo de sessão próprio da execução e storage em pasta temporária.
process.env.AUTH_SECRET = randomBytes(48).toString('base64url');
const pastaStorage = mkdtempSync(path.join(tmpdir(), 'lyra-storage-'));
process.env.LYRA_STORAGE_DIR = pastaStorage;

// Fora do servidor do Next.js não há contexto de requisição para os cookies:
// o `next/headers` lê e grava neste Map, com a mesma semântica de expiração.
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (nome: string) => {
      const valor = cookieJar.get(nome);
      return valor === undefined ? undefined : { name: nome, value: valor };
    },
    set: (
      nome: string,
      valor: string,
      opcoes?: { expires?: Date; maxAge?: number }
    ) => {
      const expirado =
        valor === '' ||
        (opcoes?.expires !== undefined &&
          opcoes.expires.getTime() <= Date.now());
      if (expirado) {
        cookieJar.delete(nome);
      } else {
        cookieJar.set(nome, valor);
      }
    },
  }),
}));

afterAll(async () => {
  await closeMysqlPool();
  rmSync(pastaStorage, { recursive: true, force: true });
});
