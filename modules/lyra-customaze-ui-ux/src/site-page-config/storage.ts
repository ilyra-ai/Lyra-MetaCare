import {
  getDefaultPageConfig,
  parsePageConfig,
  SitePageConfigMap,
  SitePageKey,
  validatePageConfig,
} from './schema';

export interface SitePageStorageRecord {
  draftConfig: string | Record<string, unknown> | null;
  publishedConfig: string | Record<string, unknown> | null;
  updatedByUserId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type StoredPageConfig<TKey extends SitePageKey> = {
  pageKey: TKey;
  draftConfig: SitePageConfigMap[TKey];
  publishedConfig: SitePageConfigMap[TKey];
  createdAt: string | null;
  updatedAt: string | null;
  updatedByUserId: string | null;
};

export function parseStoredJson(
  value: string | Record<string, unknown> | null
) {
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

export function serializePageConfig(value: unknown) {
  return JSON.stringify(value);
}

export function buildEmptyStoredPageConfig<TKey extends SitePageKey>(
  pageKey: TKey
): StoredPageConfig<TKey> {
  return {
    pageKey,
    draftConfig: getDefaultPageConfig(pageKey),
    publishedConfig: getDefaultPageConfig(pageKey),
    createdAt: null,
    updatedAt: null,
    updatedByUserId: null,
  };
}

export function normalizeStoredPageConfig<TKey extends SitePageKey>(
  pageKey: TKey,
  row: SitePageStorageRecord | null
): StoredPageConfig<TKey> {
  if (!row) {
    return buildEmptyStoredPageConfig(pageKey);
  }

  return {
    pageKey,
    draftConfig: parsePageConfig(pageKey, parseStoredJson(row.draftConfig)),
    publishedConfig: parsePageConfig(
      pageKey,
      parseStoredJson(row.publishedConfig)
    ),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    updatedByUserId: row.updatedByUserId,
  };
}

export function validatePageConfigOrThrow<TKey extends SitePageKey>(
  pageKey: TKey,
  input: unknown
): SitePageConfigMap[TKey] {
  const validation = validatePageConfig(pageKey, input);

  if (!validation.success) {
    throw new Error(
      validation.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(' | ')
    );
  }

  return validation.data;
}
