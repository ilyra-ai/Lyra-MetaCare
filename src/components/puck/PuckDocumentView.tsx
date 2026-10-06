'use client';

import * as React from 'react';
import { Render } from '@puckeditor/core';

import { obterConfigPuckLyra } from '@/lib/puck/config/base';
import { aplicarResolveAllDataLyra } from '@/lib/puck/dynamic/resolve-data';
import type { LyraPuckData, LyraPuckDocumentKey } from '@/lib/puck/types';

type PuckDocumentViewProps = {
  documentKey: LyraPuckDocumentKey;
  data: LyraPuckData;
  className?: string;
};

/**
 * Renderização de um documento publicado do Puck. Carregado sob demanda pelo
 * PuckClientRenderer (next/dynamic) somente quando o documento tem blocos:
 * o runtime do Puck, os componentes e o editor de rich text não entram no
 * carregamento das páginas cujo documento está vazio.
 */
export default function PuckDocumentView({
  documentKey,
  data,
  className,
}: PuckDocumentViewProps) {
  const config = React.useMemo(
    () => obterConfigPuckLyra(documentKey),
    [documentKey]
  );
  const [resolvido, setResolvido] = React.useState<LyraPuckData | null>(null);
  const [erro, setErro] = React.useState(false);

  React.useEffect(() => {
    let ativo = true;
    aplicarResolveAllDataLyra(data, config)
      .then((resultado) => {
        if (ativo) {
          setResolvido(resultado);
        }
      })
      .catch((error: unknown) => {
        if (!ativo) {
          return;
        }
        console.error(
          `PuckDocumentView [${documentKey}]:`,
          error instanceof Error ? error.message : error
        );
        setErro(true);
      });
    return () => {
      ativo = false;
    };
  }, [config, data, documentKey]);

  if (erro || !resolvido) {
    return null;
  }

  return (
    <div className={className}>
      <Render config={config} data={resolvido} />
    </div>
  );
}
