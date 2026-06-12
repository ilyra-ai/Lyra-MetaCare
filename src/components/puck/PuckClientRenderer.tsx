'use client';

import * as React from 'react';
import { Render } from '@puckeditor/core';

import { obterConfigPuckLyra } from '@/lib/puck/config/base';
import { getInitialPuckData } from '@/lib/puck/config/initial-data';
import { normalizarDadosPuck } from '@/lib/puck/data-utils';
import { aplicarResolveAllDataLyra } from '@/lib/puck/dynamic/resolve-data';
import type { LyraPuckData, LyraPuckDocumentKey } from '@/lib/puck/types';

type PuckClientRendererProps = {
  documentKey: LyraPuckDocumentKey;
  className?: string;
};

export function PuckClientRenderer({
  documentKey,
  className,
}: PuckClientRendererProps) {
  const [data, setData] = React.useState<LyraPuckData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const res = await fetch(`/api/public/puck/documents/${documentKey}`);
        if (!res.ok) {
          throw new Error('Falha ao obter documento do Puck');
        }

        const json = await res.json();
        const publishedData = json.publishedData;
        const fallback = getInitialPuckData(documentKey);

        const normalized = normalizarDadosPuck(publishedData, fallback);
        const config = obterConfigPuckLyra(documentKey);

        const resolved = await aplicarResolveAllDataLyra(normalized, config);

        if (active && resolved) {
          setData(resolved);
        }
      } catch (err) {
        if (active)
          setError(err instanceof Error ? err.message : 'Erro genérico');
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [documentKey]);

  if (!isClient) return null;

  if (error) {
    console.error(`PuckClientRenderer [${documentKey}]:`, error);
    return null;
  }

  if (!data) {
    return (
      <div
        className="hidden animate-pulse rounded bg-muted/20 pb-4 pt-4"
        aria-hidden="true"
      />
    );
  }

  const config = obterConfigPuckLyra(documentKey);

  return (
    <div className={className}>
      <Render config={config} data={data} />
    </div>
  );
}
