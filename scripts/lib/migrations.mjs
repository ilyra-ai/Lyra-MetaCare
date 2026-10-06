/**
 * Regras puras do runner de migrations (scripts/mysql-migrate.mjs), isoladas
 * para teste: ordem dos arquivos, checksum e validação dos administradores de
 * bootstrap lidos do ambiente.
 */
import { createHash } from 'node:crypto';

export const MIGRATION_TABLE = '_lyra_schema_migrations';
export const MIN_BOOTSTRAP_PASSWORD_LENGTH = 8;

function sha256(contents) {
  return createHash('sha256').update(contents).digest('hex');
}

/** Remove BOM e normaliza CRLF/CR para LF. */
export function normalizeMigrationContents(contents) {
  return contents
    .replace(/^﻿/u, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

/** Checksum registrado para uma migration (independe do fim de linha). */
export function buildStableChecksum(contents) {
  return sha256(normalizeMigrationContents(contents));
}

/**
 * Checksums aceitos para uma migration já aplicada: o conteúdo bruto, o
 * normalizado e a variante CRLF (registros antigos foram gravados sem
 * normalização em clones Windows). Qualquer outra diferença é recusada.
 */
export function buildChecksumCandidates(contents) {
  const normalized = normalizeMigrationContents(contents);
  return [
    ...new Set([
      sha256(contents),
      sha256(normalized),
      sha256(normalized.replace(/\n/g, '\r\n')),
    ]),
  ];
}

/**
 * Arquivos .sql em ordem de código de caractere (independente de locale/ICU),
 * para que a sequência seja idêntica em qualquer máquina.
 */
export function sortMigrationFiles(fileNames) {
  return fileNames
    .filter((file) => file.endsWith('.sql'))
    .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
}

function normalizeOptionalString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function parseAdditionalBootstrapAdmins(rawValue) {
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

/**
 * Administradores de bootstrap a partir do ambiente (ADMIN_BOOTSTRAP_* e
 * ADMIN_BOOTSTRAP_ADDITIONAL_ADMINS). Lista vazia desativa o bootstrap.
 */
export function buildBootstrapAdmins(env = process.env) {
  const primaryEmail = normalizeOptionalString(
    env.ADMIN_BOOTSTRAP_EMAIL
  ).toLowerCase();
  const primaryPassword = normalizeOptionalString(env.ADMIN_BOOTSTRAP_PASSWORD);
  const primaryFirstName =
    normalizeOptionalString(env.ADMIN_BOOTSTRAP_FIRST_NAME) || 'Admin';
  const primaryLastName =
    normalizeOptionalString(env.ADMIN_BOOTSTRAP_LAST_NAME) || 'Local';

  const admins = [];
  // Nome e sobrenome têm valor padrão: só e-mail ou senha informados ativam o
  // administrador principal.
  if (primaryEmail || primaryPassword) {
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
    ...parseAdditionalBootstrapAdmins(env.ADMIN_BOOTSTRAP_ADDITIONAL_ADMINS)
  );

  const seenEmails = new Set();
  for (const admin of admins) {
    if (!admin.email || !admin.password) {
      throw new Error(
        'Todo admin bootstrap precisa ter email e password preenchidos.'
      );
    }

    if (admin.password.length < MIN_BOOTSTRAP_PASSWORD_LENGTH) {
      throw new Error(
        `A senha do bootstrap admin ${admin.email} precisa ter pelo menos ${MIN_BOOTSTRAP_PASSWORD_LENGTH} caracteres.`
      );
    }

    if (seenEmails.has(admin.email)) {
      throw new Error(`Email duplicado em bootstrap admin: ${admin.email}.`);
    }

    seenEmails.add(admin.email);
  }

  return admins;
}
