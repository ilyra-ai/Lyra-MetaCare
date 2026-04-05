import type { LyraPuckData } from '@/lib/puck/types';

import { lyraPuckComponentTransforms } from './transforms';

type RawItem = { type: string; props: Record<string, unknown> };

function aplicarTransformNaLista(items: RawItem[]): RawItem[] {
  return items.map((item) => {
    const transform = lyraPuckComponentTransforms[item.type];

    if (!transform) return item;

    return { ...item, props: transform(item.props) };
  });
}

/**
 * Aplica todos os transforms de migração sobre um documento Puck Lyra.
 * Deve ser chamado ao ler dados do banco para garantir que documentos
 * criados em versões anteriores do catálogo recebam os campos ausentes.
 */
export function migrarDocumentoPuckLyra(data: LyraPuckData): LyraPuckData {
  const content = aplicarTransformNaLista((data.content ?? []) as RawItem[]);

  const zones: Record<string, RawItem[]> = {};

  for (const [zoneId, zoneItems] of Object.entries(data.zones ?? {})) {
    zones[zoneId] = aplicarTransformNaLista((zoneItems ?? []) as RawItem[]);
  }

  return { ...data, content, zones } as LyraPuckData;
}
