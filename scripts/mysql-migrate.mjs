import { createHash } from 'node:crypto';
import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import mysql from 'mysql2/promise';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const migrationsDir = path.join(projectRoot, 'mysql', 'migrations');
const migrationTable = '_lyra_schema_migrations';

function parseEnvContents(contents) {
  const entries = {};

  for (const rawLine of contents.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    const normalizedValue =
      rawValue.startsWith('"') && rawValue.endsWith('"')
        ? rawValue.slice(1, -1)
        : rawValue.startsWith("'") && rawValue.endsWith("'")
          ? rawValue.slice(1, -1)
          : rawValue;

    entries[key] = normalizedValue;
  }

  return entries;
}

async function loadEnvFile(fileName) {
  const filePath = path.join(projectRoot, fileName);
  try {
    await access(filePath);
  } catch {
    return;
  }

  const contents = await readFile(filePath, 'utf8');
  const values = parseEnvContents(contents);

  for (const [key, value] of Object.entries(values)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável obrigatória ausente: ${name}`);
  }
  return value;
}

function buildChecksum(contents) {
  return createHash('sha256').update(contents).digest('hex');
}

async function ensureMigrationTable(connection) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS ${migrationTable} (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      checksum CHAR(64) NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function main() {
  await loadEnvFile('.env.local');
  await loadEnvFile('.env');

  const pool = mysql.createPool({
    host: getRequiredEnv('MYSQL_HOST'),
    port: Number(process.env.MYSQL_PORT ?? '3306'),
    user: getRequiredEnv('MYSQL_USER'),
    password: getRequiredEnv('MYSQL_PASSWORD'),
    database: getRequiredEnv('MYSQL_DATABASE'),
    decimalNumbers: true,
    multipleStatements: true,
  });

  try {
    const files = (await readdir(migrationsDir))
      .filter((file) => file.endsWith('.sql'))
      .sort((left, right) => left.localeCompare(right));

    await ensureMigrationTable(pool);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = await readFile(filePath, 'utf8');
      const checksum = buildChecksum(sql);

      const [existingRows] = await pool.query(
        `SELECT checksum FROM ${migrationTable} WHERE name = ? LIMIT 1`,
        [file]
      );
      const existing = existingRows[0];

      if (existing) {
        if (existing.checksum !== checksum) {
          throw new Error(
            `Migração já aplicada com conteúdo diferente: ${file}`
          );
        }
        console.log(`Já aplicada: ${file}`);
        continue;
      }

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.query(sql);
        await connection.execute(
          `INSERT INTO ${migrationTable} (name, checksum) VALUES (?, ?)`,
          [file, checksum]
        );
        await connection.commit();
        console.log(`Aplicada: ${file}`);
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : 'Falha ao aplicar migrações MySQL.'
  );
  process.exit(1);
});
