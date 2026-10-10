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
  updated_by_name: string | null;
  created_at: string;
  updated_at: string;
}

async function getSitePageConfigRow(pageKey: SitePageKey) {
  // Nome legível de quem salvou por último (nome completo ou, sem nome,
  // e-mail), para o construtor de UI não exibir um UUID.
  const rows = await queryRows<SitePageConfigRow>(
    `
      SELECT
        c.id,
        c.page_key,
        c.draft_config,
        c.published_config,
        c.updated_by_user_id,
        COALESCE(
          NULLIF(TRIM(CONCAT_WS(' ', p.first_name, p.last_name)), ''),
          p.email
        ) AS updated_by_name,
        c.created_at,
        c.updated_at
      FROM site_page_configs c
      LEFT JOIN profiles p ON p.id = c.updated_by_user_id
      WHERE c.page_key = ?
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
    updatedByName: row?.updated_by_name ?? null,
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
