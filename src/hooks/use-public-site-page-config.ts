'use client';

import * as React from 'react';

import {
  getDefaultPageConfig,
  parsePageConfig,
  SitePageConfigMap,
  SitePageKey,
} from '@/lib/site-page-config/schema';

type PublicPageConfigResponse<TKey extends SitePageKey> = {
  config?: SitePageConfigMap[TKey];
  error?: string;
};

export function usePublicSitePageConfig<TKey extends SitePageKey>(
  pageKey: TKey
) {
  const [config, setConfig] = React.useState<SitePageConfigMap[TKey]>(() =>
    getDefaultPageConfig(pageKey)
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    const response = await fetch(`/api/public/page-config/${pageKey}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Falha ao carregar configuração pública de ${pageKey}.`);
    }

    const data = (await response.json()) as PublicPageConfigResponse<TKey>;
    const parsed = parsePageConfig(pageKey, data.config);
    setConfig(parsed);
    return parsed;
  }, [pageKey]);

  React.useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const parsed = await refresh();

        if (!active) {
          return;
        }

        setConfig(parsed);
      } catch (caughtError) {
        if (!active) {
          return;
        }

        console.error('Erro ao carregar configuração pública:', caughtError);
        setConfig(getDefaultPageConfig(pageKey));
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Erro desconhecido ao carregar configuração pública.'
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [pageKey, refresh]);

  return {
    config,
    loading,
    error,
    refresh,
  };
}
