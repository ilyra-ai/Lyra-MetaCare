import { randomUUID } from 'node:crypto';

import { queryRows, executeStatement } from '@/lib/mysql/pool';
import {
  getDefaultPageConfig,
  parsePageConfig,
  SitePageConfigMap,
  SitePageKey,
  validatePageConfig,
} from '@/lib/site-page-config/schema';

interface SitePageConfigRow {
  id: string;
  page_key: SitePageKey;
  draft_config: string | Record<string, unknown>;
  published_config: string | Record<string, unknown>;
  updated_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}

type StoredPageConfig<TKey extends SitePageKey> = {
  pageKey: TKey;
  draftConfig: SitePageConfigMap[TKey];
  publishedConfig: SitePageConfigMap[TKey];
  createdAt: string | null;
  updatedAt: string | null;
  updatedByUserId: string | null;
};

function parseStoredJson(value: string | Record<string, unknown> | null) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }

  return value;
}

function serializeConfig(value: unknown) {
  return JSON.stringify(value);
}

async function getSitePageConfigRow(pageKey: SitePageKey) {
  const rows = await queryRows<SitePageConfigRow>(
    `
      SELECT
        id,
        page_key,
        draft_config,
        published_config,
        updated_by_user_id,
        created_at,
        updated_at
      FROM site_page_configs
      WHERE page_key = ?
      LIMIT 1
    `,
    [pageKey]
  );

  return rows[0] ?? null;
}

export async function getPublicSitePageConfig<TKey extends SitePageKey>(
  pageKey: TKey
): Promise<SitePageConfigMap[TKey]> {
  const row = await getSitePageConfigRow(pageKey);
  if (!row) {
    return getDefaultPageConfig(pageKey);
  }

  return parsePageConfig(pageKey, parseStoredJson(row.published_config));
}

export async function getAdminSitePageConfig<TKey extends SitePageKey>(
  pageKey: TKey
): Promise<StoredPageConfig<TKey>> {
  const row = await getSitePageConfigRow(pageKey);
  if (!row) {
    const defaultConfig = getDefaultPageConfig(pageKey);
    return {
      pageKey,
      draftConfig: defaultConfig,
      publishedConfig: getDefaultPageConfig(pageKey),
      createdAt: null,
      updatedAt: null,
      updatedByUserId: null,
    };
  }

  return {
    pageKey,
    draftConfig: parsePageConfig(pageKey, parseStoredJson(row.draft_config)),
    publishedConfig: parsePageConfig(
      pageKey,
      parseStoredJson(row.published_config)
    ),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedByUserId: row.updated_by_user_id,
  };
}

export async function saveSitePageDraft<TKey extends SitePageKey>(options: {
  pageKey: TKey;
  actorUserId: string;
  draftConfig: unknown;
}): Promise<StoredPageConfig<TKey>> {
  const validation = validatePageConfig(options.pageKey, options.draftConfig);
  if (!validation.success) {
    throw new Error(
      validation.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(' | ')
    );
  }

  const normalizedDraft = validation.data;
  const row = await getSitePageConfigRow(options.pageKey);
  const nowPublished = row
    ? parsePageConfig(options.pageKey, parseStoredJson(row.published_config))
    : getDefaultPageConfig(options.pageKey);

  if (row) {
    await executeStatement(
      `
        UPDATE site_page_configs
        SET
          draft_config = ?,
          updated_by_user_id = ?
        WHERE page_key = ?
      `,
      [serializeConfig(normalizedDraft), options.actorUserId, options.pageKey]
    );
  } else {
    await executeStatement(
      `
        INSERT INTO site_page_configs (
          id,
          page_key,
          draft_config,
          published_config,
          updated_by_user_id
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        randomUUID(),
        options.pageKey,
        serializeConfig(normalizedDraft),
        serializeConfig(nowPublished),
        options.actorUserId,
      ]
    );
  }

  return getAdminSitePageConfig(options.pageKey);
}

export async function publishSitePageDraft<TKey extends SitePageKey>(options: {
  pageKey: TKey;
  actorUserId: string;
}): Promise<StoredPageConfig<TKey>> {
  const row = await getSitePageConfigRow(options.pageKey);
  const fallbackDraft = getDefaultPageConfig(options.pageKey);
  const draftConfig = row
    ? parsePageConfig(options.pageKey, parseStoredJson(row.draft_config))
    : fallbackDraft;

  if (row) {
    await executeStatement(
      `
        UPDATE site_page_configs
        SET
          draft_config = ?,
          published_config = ?,
          updated_by_user_id = ?
        WHERE page_key = ?
      `,
      [
        serializeConfig(draftConfig),
        serializeConfig(draftConfig),
        options.actorUserId,
        options.pageKey,
      ]
    );
  } else {
    await executeStatement(
      `
        INSERT INTO site_page_configs (
          id,
          page_key,
          draft_config,
          published_config,
          updated_by_user_id
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        randomUUID(),
        options.pageKey,
        serializeConfig(draftConfig),
        serializeConfig(draftConfig),
        options.actorUserId,
      ]
    );
  }

  return getAdminSitePageConfig(options.pageKey);
}

export async function restoreSitePageDraftFromPublished<
  TKey extends SitePageKey,
>(options: {
  pageKey: TKey;
  actorUserId: string;
}): Promise<StoredPageConfig<TKey>> {
  const row = await getSitePageConfigRow(options.pageKey);
  const publishedConfig = row
    ? parsePageConfig(options.pageKey, parseStoredJson(row.published_config))
    : getDefaultPageConfig(options.pageKey);

  if (row) {
    await executeStatement(
      `
        UPDATE site_page_configs
        SET
          draft_config = ?,
          updated_by_user_id = ?
        WHERE page_key = ?
      `,
      [serializeConfig(publishedConfig), options.actorUserId, options.pageKey]
    );
  } else {
    await executeStatement(
      `
        INSERT INTO site_page_configs (
          id,
          page_key,
          draft_config,
          published_config,
          updated_by_user_id
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        randomUUID(),
        options.pageKey,
        serializeConfig(publishedConfig),
        serializeConfig(publishedConfig),
        options.actorUserId,
      ]
    );
  }

  return getAdminSitePageConfig(options.pageKey);
}

export async function restoreSitePageDefaults<
  TKey extends SitePageKey,
>(options: {
  pageKey: TKey;
  actorUserId: string;
}): Promise<StoredPageConfig<TKey>> {
  const defaultConfig = getDefaultPageConfig(options.pageKey);
  const row = await getSitePageConfigRow(options.pageKey);

  if (row) {
    await executeStatement(
      `
        UPDATE site_page_configs
        SET
          draft_config = ?,
          updated_by_user_id = ?
        WHERE page_key = ?
      `,
      [serializeConfig(defaultConfig), options.actorUserId, options.pageKey]
    );
  } else {
    await executeStatement(
      `
        INSERT INTO site_page_configs (
          id,
          page_key,
          draft_config,
          published_config,
          updated_by_user_id
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        randomUUID(),
        options.pageKey,
        serializeConfig(defaultConfig),
        serializeConfig(defaultConfig),
        options.actorUserId,
      ]
    );
  }

  return getAdminSitePageConfig(options.pageKey);
}
