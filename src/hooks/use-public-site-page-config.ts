'use client';

import * as React from 'react';

import { requisicaoCompartilhada } from '@/lib/http/requisicao-compartilhada';
import { getDefaultPageConfig } from '@/lib/site-page-config/defaults';
import type {
  SitePageConfigMap,
  SitePageKey,
} from '@/lib/site-page-config/schema';

type PublicPageConfigResponse<TKey extends SitePageKey> = {
  config?: SitePageConfigMap[TKey];
  error?: string;
};

async function buscarConfiguracaoPublica<TKey extends SitePageKey>(
  pageKey: TKey
): Promise<SitePageConfigMap[TKey]> {
  const response = await fetch(`/api/public/page-config/${pageKey}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar configuração pública de ${pageKey}.`);
  }

  // A rota pública já devolve a configuração validada pelo schema no
  // servidor (getPublicSitePageConfig); revalidar aqui exigiria baixar o Zod
  // em todas as páginas. Sem configuração na resposta, vale o padrão.
  const data = (await response.json()) as PublicPageConfigResponse<TKey>;
  return data.config ?? getDefaultPageConfig(pageKey);
}

export function usePublicSitePageConfig<TKey extends SitePageKey>(
  pageKey: TKey
) {
  const [config, setConfig] = React.useState<SitePageConfigMap[TKey]>(() =>
    getDefaultPageConfig(pageKey)
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Recarga explícita: sempre uma chamada nova.
  const refresh = React.useCallback(async () => {
    const recebida = await buscarConfiguracaoPublica(pageKey);
    setConfig(recebida);
    return recebida;
  }, [pageKey]);

  React.useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Cabeçalho, menus e conteúdo montam juntos e pedem a mesma
        // configuração: uma única chamada atende a todos.
        const recebida = await requisicaoCompartilhada(
          `page-config:${pageKey}`,
          () => buscarConfiguracaoPublica(pageKey)
        );

        if (active) {
          setConfig(recebida);
        }
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
  }, [pageKey]);

  return {
    config,
    loading,
    error,
    refresh,
  };
}
