import { createHash, randomUUID } from 'node:crypto';
import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import bcrypt from 'bcryptjs';
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

async function ensureBootstrapAdmin(pool) {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();

  if (!email || !password) {
    console.log('Bootstrap admin: desativado.');
    return;
  }

  if (password.length < 8) {
    throw new Error(
      'ADMIN_BOOTSTRAP_PASSWORD precisa ter pelo menos 8 caracteres.'
    );
  }

  const firstName = process.env.ADMIN_BOOTSTRAP_FIRST_NAME?.trim() || 'Admin';
  const lastName = process.env.ADMIN_BOOTSTRAP_LAST_NAME?.trim() || 'Local';
  const passwordHash = await bcrypt.hash(password, 10);

  const [userRows] = await pool.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  const existingUser = userRows[0];
  const userId = existingUser?.id ?? randomUUID();

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (existingUser) {
      await connection.execute(
        `
          UPDATE users
          SET email = ?, password_hash = ?
          WHERE id = ?
        `,
        [email, passwordHash, userId]
      );
    } else {
      await connection.execute(
        `
          INSERT INTO users (id, email, password_hash)
          VALUES (?, ?, ?)
        `,
        [userId, email, passwordHash]
      );
    }

    const [profileRows] = await connection.query(
      'SELECT id FROM profiles WHERE id = ? LIMIT 1',
      [userId]
    );
    const existingProfile = profileRows[0];

    if (existingProfile) {
      await connection.execute(
        `
          UPDATE profiles
          SET
            first_name = ?,
            last_name = ?,
            email = ?,
            onboarding_completed = TRUE,
            role = 'admin'
          WHERE id = ?
        `,
        [firstName, lastName, email, userId]
      );
    } else {
      await connection.execute(
        `
          INSERT INTO profiles (
            id,
            first_name,
            last_name,
            email,
            onboarding_completed,
            role
          )
          VALUES (?, ?, ?, ?, TRUE, 'admin')
        `,
        [userId, firstName, lastName, email]
      );
    }

    await connection.commit();
    console.log(`Bootstrap admin assegurado: ${email}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function waitForDatabase(pool, attempts = 30, delayMs = 2000) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      if (index === attempts - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
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
    charset: 'utf8mb4',
    decimalNumbers: true,
    multipleStatements: true,
  });

  try {
    await waitForDatabase(pool);
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

    await ensureBootstrapAdmin(pool);
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
