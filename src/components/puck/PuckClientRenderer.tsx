'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

import { getInitialPuckData } from '@/lib/puck/config/initial-data';
import { documentoPuckTemBlocos } from '@/lib/puck/conteudo';
import { normalizarDadosPuck } from '@/lib/puck/data-utils';
import type { LyraPuckData, LyraPuckDocumentKey } from '@/lib/puck/types';

// O runtime do Puck só é baixado quando o documento publicado tem blocos.
const PuckDocumentView = dynamic(() => import('./PuckDocumentView'), {
  ssr: false,
});

type PuckClientRendererProps = {
  documentKey: LyraPuckDocumentKey;
  className?: string;
};

export function PuckClientRenderer({
  documentKey,
  className,
}: PuckClientRendererProps) {
  const [data, setData] = React.useState<LyraPuckData | null>(null);

  // Os dados só existem após a busca no cliente; no servidor e na primeira
  // renderização do cliente o resultado é o mesmo (nada), então não há
  // divergência de hidratação.
  React.useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const res = await fetch(`/api/public/puck/documents/${documentKey}`);
        if (!res.ok) {
          throw new Error('Falha ao obter documento do Puck');
        }

        const json = (await res.json()) as { publishedData?: unknown };
        const normalized = normalizarDadosPuck(
          json.publishedData,
          getInitialPuckData(documentKey)
        );

        if (active) {
          setData(normalized);
        }
      } catch (err) {
        if (!active) return;
        // Bloco opcional: a falha fica registrada e a página segue sem ele.
        console.error(
          `PuckClientRenderer [${documentKey}]:`,
          err instanceof Error ? err.message : 'Erro desconhecido.'
        );
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [documentKey]);

  if (!data || !documentoPuckTemBlocos(data)) {
    return null;
  }

  return (
    <PuckDocumentView
      documentKey={documentKey}
      data={data}
      className={className}
    />
  );
}
