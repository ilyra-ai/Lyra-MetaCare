import { Render } from '@puckeditor/core';

import { obterConfigPuckLyra } from '@/lib/puck/config/base';
import { getInitialPuckData } from '@/lib/puck/config/initial-data';
import { normalizarDadosPuck } from '@/lib/puck/data-utils';
import { aplicarResolveAllDataLyra } from '@/lib/puck/dynamic/resolve-data';
import { getPublicPuckDocument } from '@/lib/puck/storage/service';
import type { LyraPuckDocumentKey } from '@/lib/puck/types';

type PuckPublicRendererProps = {
  documentKey: LyraPuckDocumentKey;
  className?: string;
};

/**
 * PuckPublicRenderer é um Server Component assíncrono que busca o documento
 * Puck publicado diretamente do banco de dados e renderiza com resolveAllData
 * antes de entregar o HTML ao cliente — sem round-trip de fetch no browser.
 */
export async function PuckPublicRenderer({
  documentKey,
  className,
}: PuckPublicRendererProps) {
  const config = obterConfigPuckLyra(documentKey);
  const record = await getPublicPuckDocument(documentKey);
  const fallback = getInitialPuckData(documentKey);
  const normalizedData = normalizarDadosPuck(record.publishedData, fallback);
  const resolvedData = await aplicarResolveAllDataLyra(normalizedData, config);

  return (
    <div className={className}>
      <Render config={config} data={resolvedData} />
    </div>
  );
}
