import { randomUUID } from 'node:crypto';

import { queryRows, executeStatement } from '@/lib/mysql/pool';
import {
  getDefaultPageConfig,
  parsePageConfig,
  SitePageConfigMap,
  SitePageKey,
} from '@/lib/site-page-config/schema';
import {
  normalizeStoredPageConfig,
  parseStoredJson,
  serializePageConfig,
  StoredPageConfig,
  validatePageConfigOrThrow,
} from '@/lib/site-page-config/storage';

interface SitePageConfigRow {
  id: string;
  page_key: SitePageKey;
  draft_config: string | Record<string, unknown>;
  published_config: string | Record<string, unknown>;
  updated_by_user_id: string | null;
  created_at: string;
  updated_at: string;
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
  return normalizeStoredPageConfig(pageKey, {
    draftConfig: row?.draft_config ?? null,
    publishedConfig: row?.published_config ?? null,
    updatedByUserId: row?.updated_by_user_id ?? null,
    createdAt: row?.created_at ?? null,
    updatedAt: row?.updated_at ?? null,
  });
}

export async function saveSitePageDraft<TKey extends SitePageKey>(options: {
  pageKey: TKey;
  actorUserId: string;
  draftConfig: unknown;
}): Promise<StoredPageConfig<TKey>> {
  const normalizedDraft = validatePageConfigOrThrow(
    options.pageKey,
    options.draftConfig
  );
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
      [
        serializePageConfig(normalizedDraft),
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
        serializePageConfig(normalizedDraft),
        serializePageConfig(nowPublished),
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
        serializePageConfig(draftConfig),
        serializePageConfig(draftConfig),
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
        serializePageConfig(draftConfig),
        serializePageConfig(draftConfig),
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
      [
        serializePageConfig(publishedConfig),
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
        serializePageConfig(publishedConfig),
        serializePageConfig(publishedConfig),
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
      [serializePageConfig(defaultConfig), options.actorUserId, options.pageKey]
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
        serializePageConfig(defaultConfig),
        serializePageConfig(defaultConfig),
        options.actorUserId,
      ]
    );
  }

  return getAdminSitePageConfig(options.pageKey);
}
