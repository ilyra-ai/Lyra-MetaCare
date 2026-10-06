import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import mysql from 'mysql2/promise';
import type { TestProject } from 'vitest/node';

import { parseEnvContents } from '../../scripts/lib/env-file.mjs';

import type { LyraMysqlTestConfig } from './provided-context';

const raiz = path.resolve(import.meta.dirname, '..', '..');

// O .env.local é lido para um objeto local: o setup global roda no processo
// principal do Vitest e alterar `process.env` aqui vazaria a configuração
// para os testes unitários executados na mesma rodada (ex.: chaves da Stripe).
async function lerEnvLocal(): Promise<Record<string, string>> {
  let conteudo: string;
  try {
    conteudo = await readFile(path.join(raiz, '.env.local'), 'utf8');
  } catch (error) {
    throw new Error(
      '.env.local não encontrado: rode `pnpm env:init` antes de `pnpm test:integration`.',
      { cause: error }
    );
  }
  return { ...parseEnvContents(conteudo), ...definidas(process.env) };
}

function definidas(env: NodeJS.ProcessEnv): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).filter((par): par is [string, string] => !!par[1])
  );
}

function obrigatoria(env: Record<string, string>, nome: string): string {
  const valor = env[nome];
  if (!valor) {
    throw new Error(
      `${nome} ausente no .env.local: rode \`pnpm env:init\` antes de \`pnpm test:integration\`.`
    );
  }
  return valor;
}

function aplicarMigrations(
  env: Record<string, string>,
  config: LyraMysqlTestConfig
): Promise<void> {
  // Ambiente só do processo filho (o do Vitest não é alterado).
  const ambienteFilho: NodeJS.ProcessEnv = {
    ...process.env,
    ...env,
    MYSQL_HOST: config.host,
    MYSQL_PORT: String(config.port),
    MYSQL_USER: config.user,
    MYSQL_PASSWORD: config.password,
    MYSQL_DATABASE: config.database,
  };
  return new Promise((resolve, reject) => {
    const filho = spawn(
      process.execPath,
      [path.join(raiz, 'scripts', 'mysql-migrate.mjs')],
      { cwd: raiz, env: ambienteFilho, stdio: ['ignore', 'pipe', 'pipe'] }
    );
    let saida = '';
    filho.stdout.on('data', (parte: Buffer) => {
      saida += parte.toString();
    });
    filho.stderr.on('data', (parte: Buffer) => {
      saida += parte.toString();
    });
    filho.on('error', reject);
    filho.on('close', (codigo) => {
      if (codigo === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Migrations falharam no banco de teste (exit ${codigo}):\n${saida}`
          )
        );
      }
    });
  });
}

/**
 * Cria um banco isolado `<MYSQL_DATABASE>_test` no MySQL do projeto, aplica as
 * migrations reais (scripts/mysql-migrate.mjs, inclusive o bootstrap admin) e
 * o remove ao final. O banco de desenvolvimento nunca é alterado.
 */
export default async function setup(project: TestProject) {
  const env = await lerEnvLocal();

  const database = `${obrigatoria(env, 'MYSQL_DATABASE')}_test`;
  if (!/^[A-Za-z0-9_]+$/.test(database)) {
    throw new Error(`Nome de banco de teste inválido: ${database}`);
  }

  const config: LyraMysqlTestConfig = {
    host: '127.0.0.1',
    port: Number(env.MYSQL_HOST_PORT ?? env.MYSQL_PORT ?? 3307),
    user: obrigatoria(env, 'MYSQL_USER'),
    password: obrigatoria(env, 'MYSQL_PASSWORD'),
    database,
  };

  let raizMysql: mysql.Connection;
  try {
    raizMysql = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: 'root',
      password: obrigatoria(env, 'MYSQL_ROOT_PASSWORD'),
    });
  } catch (error) {
    throw new Error(
      `MySQL do projeto inacessível em ${config.host}:${config.port} ` +
        `(${error instanceof Error ? error.message : String(error)}). ` +
        'Suba o banco com `./run.sh db`, `python3 run.py db` ou `pnpm db:start`.',
      { cause: error }
    );
  }

  await raizMysql.query(`DROP DATABASE IF EXISTS \`${database}\``);
  await raizMysql.query(
    `CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await raizMysql.query(`GRANT ALL PRIVILEGES ON \`${database}\`.* TO ?@'%'`, [
    config.user,
  ]);

  await aplicarMigrations(env, config);
  project.provide('lyraMysqlTest', config);

  return async () => {
    await raizMysql.query(`DROP DATABASE IF EXISTS \`${database}\``);
    await raizMysql.end();
  };
}
