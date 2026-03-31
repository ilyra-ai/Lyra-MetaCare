import { randomUUID } from 'node:crypto';

import { executeStatement, queryRows } from '@/lib/mysql/pool';
import { getInitialPuckData } from '@/lib/puck/config/initial-data';
import {
  LyraPuckData,
  LyraPuckDocumentKey,
  LyraPuckDocumentRecord,
} from '@/lib/puck/types';

type PuckDocumentRow = {
  id: string;
  document_key: LyraPuckDocumentKey;
  draft_data: string | Record<string, unknown>;
  published_data: string | Record<string, unknown>;
  updated_by_user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function cloneData(data: LyraPuckData): LyraPuckData {
  return JSON.parse(JSON.stringify(data)) as LyraPuckData;
}

function parseStoredValue(
  value: string | Record<string, unknown> | null
): Record<string, unknown> | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  return value;
}

function normalizePuckData(
  input: string | Record<string, unknown> | null,
  fallback: LyraPuckData
): LyraPuckData {
  const parsed = parseStoredValue(input);

  if (!parsed) {
    return cloneData(fallback);
  }

  const content = Array.isArray(parsed.content)
    ? (parsed.content as LyraPuckData['content'])
    : fallback.content;
  const root =
    parsed.root && typeof parsed.root === 'object'
      ? (parsed.root as LyraPuckData['root'])
      : fallback.root;
  const zones =
    parsed.zones && typeof parsed.zones === 'object'
      ? (parsed.zones as LyraPuckData['zones'])
      : fallback.zones;

  return {
    content,
    root,
    zones,
  };
}

function serializePuckData(data: LyraPuckData) {
  return JSON.stringify(data);
}

async function getPuckDocumentRow(documentKey: LyraPuckDocumentKey) {
  const rows = await queryRows<PuckDocumentRow>(
    `
      SELECT
        id,
        document_key,
        draft_data,
        published_data,
        updated_by_user_id,
        created_at,
        updated_at
      FROM puck_documents
      WHERE document_key = ?
      LIMIT 1
    `,
    [documentKey]
  );

  return rows[0] ?? null;
}

function buildEmptyPuckDocument(
  documentKey: LyraPuckDocumentKey
): LyraPuckDocumentRecord {
  const initialData = getInitialPuckData(documentKey);

  return {
    documentKey,
    draftData: initialData,
    publishedData: cloneData(initialData),
    createdAt: null,
    updatedAt: null,
    updatedByUserId: null,
  };
}

export async function getAdminPuckDocument(
  documentKey: LyraPuckDocumentKey
): Promise<LyraPuckDocumentRecord> {
  const row = await getPuckDocumentRow(documentKey);

  if (!row) {
    return buildEmptyPuckDocument(documentKey);
  }

  const fallback = getInitialPuckData(documentKey);

  return {
    documentKey,
    draftData: normalizePuckData(row.draft_data, fallback),
    publishedData: normalizePuckData(row.published_data, fallback),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedByUserId: row.updated_by_user_id,
  };
}

export async function getPublicPuckDocument(
  documentKey: LyraPuckDocumentKey
): Promise<LyraPuckDocumentRecord> {
  const row = await getPuckDocumentRow(documentKey);

  if (!row) {
    return buildEmptyPuckDocument(documentKey);
  }

  const fallback = getInitialPuckData(documentKey);
  const publishedData = normalizePuckData(row.published_data, fallback);

  return {
    documentKey,
    draftData: cloneData(publishedData),
    publishedData,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedByUserId: row.updated_by_user_id,
  };
}

export async function savePuckDraft(options: {
  documentKey: LyraPuckDocumentKey;
  actorUserId: string;
  draftData: LyraPuckData;
}) {
  const row = await getPuckDocumentRow(options.documentKey);
  const fallback = getInitialPuckData(options.documentKey);
  const nextDraft = normalizePuckData(options.draftData as never, fallback);
  const publishedData = row
    ? normalizePuckData(row.published_data, fallback)
    : fallback;

  if (row) {
    await executeStatement(
      `
        UPDATE puck_documents
        SET
          draft_data = ?,
          updated_by_user_id = ?
        WHERE document_key = ?
      `,
      [serializePuckData(nextDraft), options.actorUserId, options.documentKey]
    );
  } else {
    await executeStatement(
      `
        INSERT INTO puck_documents (
          id,
          document_key,
          draft_data,
          published_data,
          updated_by_user_id
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        randomUUID(),
        options.documentKey,
        serializePuckData(nextDraft),
        serializePuckData(publishedData),
        options.actorUserId,
      ]
    );
  }

  return getAdminPuckDocument(options.documentKey);
}

export async function publishPuckDocument(options: {
  documentKey: LyraPuckDocumentKey;
  actorUserId: string;
  draftData?: LyraPuckData;
}) {
  const row = await getPuckDocumentRow(options.documentKey);
  const fallback = getInitialPuckData(options.documentKey);
  const nextDraft = options.draftData
    ? normalizePuckData(options.draftData as never, fallback)
    : row
      ? normalizePuckData(row.draft_data, fallback)
      : fallback;

  if (row) {
    await executeStatement(
      `
        UPDATE puck_documents
        SET
          draft_data = ?,
          published_data = ?,
          updated_by_user_id = ?
        WHERE document_key = ?
      `,
      [
        serializePuckData(nextDraft),
        serializePuckData(nextDraft),
        options.actorUserId,
        options.documentKey,
      ]
    );
  } else {
    await executeStatement(
      `
        INSERT INTO puck_documents (
          id,
          document_key,
          draft_data,
          published_data,
          updated_by_user_id
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        randomUUID(),
        options.documentKey,
        serializePuckData(nextDraft),
        serializePuckData(nextDraft),
        options.actorUserId,
      ]
    );
  }

  return getAdminPuckDocument(options.documentKey);
}
