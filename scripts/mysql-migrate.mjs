import { createHash, randomUUID } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

import { loadEnvFile } from './lib/env-file.mjs';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const migrationsDir = path.join(projectRoot, 'mysql', 'migrations');
const migrationTable = '_lyra_schema_migrations';

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

function normalizeMigrationContents(contents) {
  return contents
    .replace(/^\uFEFF/u, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

function buildStableChecksum(contents) {
  return buildChecksum(normalizeMigrationContents(contents));
}

function buildChecksumCandidates(contents) {
  const normalized = normalizeMigrationContents(contents);

  return [
    ...new Set([
      buildChecksum(contents),
      buildChecksum(normalized),
      buildChecksum(normalized.replace(/\n/g, '\r\n')),
    ]),
  ];
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

function normalizeOptionalString(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function parseAdditionalBootstrapAdmins(rawValue) {
  const normalizedValue = normalizeOptionalString(rawValue);
  if (!normalizedValue) {
    return [];
  }

  let parsedValue;
  try {
    parsedValue = JSON.parse(normalizedValue);
  } catch {
    throw new Error(
      'ADMIN_BOOTSTRAP_ADDITIONAL_ADMINS precisa ser um JSON valido.'
    );
  }

  if (!Array.isArray(parsedValue)) {
    throw new Error(
      'ADMIN_BOOTSTRAP_ADDITIONAL_ADMINS precisa ser um array JSON.'
    );
  }

  return parsedValue.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(
        `ADMIN_BOOTSTRAP_ADDITIONAL_ADMINS[${index}] precisa ser um objeto valido.`
      );
    }

    return {
      email: normalizeOptionalString(item.email).toLowerCase(),
      password: normalizeOptionalString(item.password),
      firstName: normalizeOptionalString(item.firstName) || 'Admin',
      lastName: normalizeOptionalString(item.lastName) || 'Local',
    };
  });
}

function buildBootstrapAdmins() {
  const primaryEmail = normalizeOptionalString(
    process.env.ADMIN_BOOTSTRAP_EMAIL
  ).toLowerCase();
  const primaryPassword = normalizeOptionalString(
    process.env.ADMIN_BOOTSTRAP_PASSWORD
  );
  const primaryFirstName =
    normalizeOptionalString(process.env.ADMIN_BOOTSTRAP_FIRST_NAME) || 'Admin';
  const primaryLastName =
    normalizeOptionalString(process.env.ADMIN_BOOTSTRAP_LAST_NAME) || 'Local';

  const admins = [];
  const hasAnyPrimaryValue = [
    primaryEmail,
    primaryPassword,
    primaryFirstName,
    primaryLastName,
  ].some(Boolean);

  if (hasAnyPrimaryValue) {
    if (!primaryEmail || !primaryPassword) {
      throw new Error(
        'Bootstrap admin principal configurado de forma incompleta: ADMIN_BOOTSTRAP_EMAIL e ADMIN_BOOTSTRAP_PASSWORD sao obrigatorios.'
      );
    }

    admins.push({
      email: primaryEmail,
      password: primaryPassword,
      firstName: primaryFirstName,
      lastName: primaryLastName,
    });
  }

  admins.push(
    ...parseAdditionalBootstrapAdmins(
      process.env.ADMIN_BOOTSTRAP_ADDITIONAL_ADMINS
    )
  );

  if (admins.length === 0) {
    return [];
  }

  const seenEmails = new Set();
  for (const admin of admins) {
    if (!admin.email || !admin.password) {
      throw new Error(
        'Todo admin bootstrap precisa ter email e password preenchidos.'
      );
    }

    if (admin.password.length < 8) {
      throw new Error(
        `A senha do bootstrap admin ${admin.email} precisa ter pelo menos 8 caracteres.`
      );
    }

    if (seenEmails.has(admin.email)) {
      throw new Error(`Email duplicado em bootstrap admin: ${admin.email}.`);
    }

    seenEmails.add(admin.email);
  }

  return admins;
}

async function ensureBootstrapAdminUser(pool, admin) {
  const [userRows] = await pool.query(
    'SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1',
    [admin.email]
  );
  const existingUser = userRows[0];
  const userId = existingUser?.id ?? randomUUID();

  // O .env.local é a fonte da senha dos administradores de bootstrap, mas o
  // hash só é regravado quando a senha mudou: reexecutar as migrations não
  // altera a linha (idempotência) nem gera um hash novo a cada subida.
  const passwordMatches =
    typeof existingUser?.password_hash === 'string' &&
    (await bcrypt.compare(admin.password, existingUser.password_hash));

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (existingUser) {
      // A busca ignora maiúsculas (collation *_ci); o e-mail é gravado
      // normalizado em minúsculas, como no login.
      if (existingUser.email !== admin.email) {
        await connection.execute('UPDATE users SET email = ? WHERE id = ?', [
          admin.email,
          userId,
        ]);
      }
      if (!passwordMatches) {
        const passwordHash = await bcrypt.hash(admin.password, 10);
        await connection.execute(
          'UPDATE users SET password_hash = ? WHERE id = ?',
          [passwordHash, userId]
        );
        console.log(`Senha do bootstrap admin atualizada: ${admin.email}`);
      }
    } else {
      const passwordHash = await bcrypt.hash(admin.password, 10);
      await connection.execute(
        `
          INSERT INTO users (id, email, password_hash)
          VALUES (?, ?, ?)
        `,
        [userId, admin.email, passwordHash]
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
        [admin.firstName, admin.lastName, admin.email, userId]
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
        [userId, admin.firstName, admin.lastName, admin.email]
      );
    }

    const [carePlanRows] = await connection.query(
      `
        SELECT id
        FROM subscription_plans
        WHERE plan_key = 'care'
        LIMIT 1
      `
    );
    const carePlanId = carePlanRows[0]?.id;

    if (carePlanId) {
      const [activeSubscriptionRows] = await connection.query(
        `
          SELECT plan_id
          FROM user_subscriptions
          WHERE user_id = ?
            AND status = 'active'
            AND (ended_at IS NULL OR ended_at > UTC_TIMESTAMP())
          ORDER BY current_period_end DESC, created_at DESC
          LIMIT 1
        `,
        [userId]
      );
      const activePlanId = activeSubscriptionRows[0]?.plan_id;

      if (activePlanId !== carePlanId) {
        await connection.execute(
          `
            UPDATE user_subscriptions
            SET
              status = 'replaced',
              ended_at = UTC_TIMESTAMP(),
              cancel_at_period_end = FALSE
            WHERE user_id = ?
              AND status = 'active'
              AND (ended_at IS NULL OR ended_at > UTC_TIMESTAMP())
          `,
          [userId]
        );

        await connection.execute(
          `
            INSERT INTO user_subscriptions (
              id,
              user_id,
              plan_id,
              status,
              billing_interval,
              source,
              starts_at,
              current_period_start,
              current_period_end,
              cancel_at_period_end,
              metadata
            )
            VALUES (
              ?, ?, ?, 'active', 'monthly', 'bootstrap_admin',
              UTC_TIMESTAMP(), UTC_TIMESTAMP(), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 MONTH),
              FALSE, JSON_OBJECT('reason', 'bootstrap_admin_care')
            )
          `,
          [randomUUID(), userId, carePlanId]
        );
      }
    }

    await connection.commit();
    console.log(`Bootstrap admin assegurado: ${admin.email}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function ensureBootstrapAdmins(pool) {
  const admins = buildBootstrapAdmins();

  if (admins.length === 0) {
    console.log('Bootstrap admin: desativado.');
    return;
  }

  for (const admin of admins) {
    await ensureBootstrapAdminUser(pool, admin);
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
  await loadEnvFile(projectRoot, '.env.local');
  await loadEnvFile(projectRoot, '.env');

  const pool = mysql.createPool({
    host: getRequiredEnv('MYSQL_HOST'),
    port: Number(process.env.MYSQL_PORT ?? '3306'),
    user: getRequiredEnv('MYSQL_USER'),
    password: getRequiredEnv('MYSQL_PASSWORD'),
    database: getRequiredEnv('MYSQL_DATABASE'),
    charset: 'utf8mb4',
    // Datas do JavaScript são enviadas em UTC, o mesmo fuso do servidor
    // (--default-time-zone=+00:00 no compose.yaml).
    timezone: 'Z',
    decimalNumbers: true,
    multipleStatements: true,
  });

  try {
    await waitForDatabase(pool);
    // Ordenação por código de caractere (independente de locale/ICU) para que
    // a sequência das migrations seja idêntica em qualquer máquina.
    const files = (await readdir(migrationsDir))
      .filter((file) => file.endsWith('.sql'))
      .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));

    await ensureMigrationTable(pool);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = await readFile(filePath, 'utf8');
      const checksum = buildStableChecksum(sql);
      const checksumCandidates = buildChecksumCandidates(sql);

      const [existingRows] = await pool.query(
        `SELECT checksum FROM ${migrationTable} WHERE name = ? LIMIT 1`,
        [file]
      );
      const existing = existingRows[0];

      if (existing) {
        if (!checksumCandidates.includes(existing.checksum)) {
          throw new Error(
            `Migração já aplicada com conteúdo diferente: ${file}`
          );
        }

        if (existing.checksum !== checksum) {
          await pool.execute(
            `UPDATE ${migrationTable} SET checksum = ? WHERE name = ?`,
            [checksum, file]
          );
          console.log(`Checksum normalizado: ${file}`);
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
        // Identifica a migration que falhou (a mensagem do MySQL não a cita).
        throw new Error(
          `Falha ao aplicar ${file}: ${error instanceof Error ? error.message : String(error)}`,
          { cause: error }
        );
      } finally {
        connection.release();
      }
    }

    await ensureBootstrapAdmins(pool);
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
