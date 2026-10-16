import type { LyraPuckData, LyraPuckDocumentKey } from '@/lib/puck/types';

import { obterDocumentoDeDemonstracao } from './documentos-de-demonstracao';
import { lyraPuckComponentTransforms } from './transforms';

type RawItem = { type: string; props: Record<string, unknown> };

/**
 * Campos `slot` de cada contêiner da Lyra (os mesmos declarados com
 * `type: 'slot'` em src/lib/puck/config/components; o teste de migração
 * confere a correspondência). Ficam aqui, sem importar a configuração do
 * Puck, porque esta migração roda no servidor (rotas de API) e a
 * configuração importa componentes de cliente.
 */
export const CAMPOS_SLOT_POR_TIPO: Readonly<Record<string, readonly string[]>> =
  {
    LyraSectionContainerBlock: ['content'],
    LyraStackContainerBlock: ['content'],
    LyraFluidGridBlock: ['content'],
    LyraFixedColumnsBlock: ['leftColumn', 'rightColumn'],
  };

function ehBloco(valor: unknown): valor is RawItem {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    typeof (valor as RawItem).type === 'string' &&
    typeof (valor as RawItem).props === 'object' &&
    (valor as RawItem).props !== null
  );
}

function ehListaDeBlocos(valor: unknown): valor is RawItem[] {
  return Array.isArray(valor) && valor.length > 0 && valor.every(ehBloco);
}

/**
 * Aplica o transform do tipo e desce nos filhos guardados em props (slots).
 * Antes só a raiz e as zonas eram migradas: blocos dentro de um contêiner
 * em formato de slots ficavam sem os campos novos (tarefa 53).
 */
function migrarItem(item: RawItem): RawItem {
  const transform = lyraPuckComponentTransforms[item.type];
  const props = transform ? transform(item.props) : item.props;

  return {
    ...item,
    props: Object.fromEntries(
      Object.entries(props).map(([chave, valor]) => [
        chave,
        ehListaDeBlocos(valor) ? valor.map(migrarItem) : valor,
      ])
    ),
  };
}

function aplicarTransformNaLista(items: RawItem[]): RawItem[] {
  return items.map(migrarItem);
}

/** JSON com as chaves em ordem, para comparar blocos por conteúdo. */
function jsonCanonico(valor: unknown): string {
  if (Array.isArray(valor)) {
    return `[${valor.map(jsonCanonico).join(',')}]`;
  }
  if (valor && typeof valor === 'object') {
    const entradas = Object.entries(valor as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    return `{${entradas
      .map(([chave, item]) => `${JSON.stringify(chave)}:${jsonCanonico(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(valor);
}

/**
 * Traz os filhos guardados no formato legado de DropZones (`zones` com chave
 * `"<id>:<slot>"`) para dentro do slot do contêiner, registrando as zonas
 * usadas. É a mesma conversão do `migrate()` do Puck, feita só para os
 * contêineres conhecidos.
 */
function expandirZonas(
  items: RawItem[],
  zonas: Record<string, RawItem[]>,
  usadas: Set<string>
): RawItem[] {
  return items.map((item) => {
    const slots = CAMPOS_SLOT_POR_TIPO[item.type];
    if (!slots) {
      return item;
    }
    const props = { ...item.props };
    for (const slot of slots) {
      const chave = `${String(props.id)}:${slot}`;
      const atual = props[slot];
      const daZona = zonas[chave];
      let filhos: RawItem[] = [];
      if (Array.isArray(atual) && atual.length > 0) {
        filhos = atual as RawItem[];
      } else if (Array.isArray(daZona)) {
        filhos = daZona;
        usadas.add(chave);
      } else if (Array.isArray(atual)) {
        filhos = atual as RawItem[];
      }
      props[slot] = expandirZonas(filhos, zonas, usadas);
    }
    return { ...item, props };
  });
}

/**
 * Retira da raiz do documento os blocos idênticos aos de demonstração que
 * eram os dados iniciais (landing, login e app shell). Um bloco editado por
 * um administrador (qualquer diferença) é preservado. A comparação aceita o
 * bloco como foi gravado (formato legado de zonas ou slots) e também com os
 * campos que os transforms acrescentam.
 */
export function removerBlocosDeDemonstracao(
  data: LyraPuckData,
  documentKey: LyraPuckDocumentKey
): LyraPuckData {
  const demonstracao = obterDocumentoDeDemonstracao(documentKey);
  if (!demonstracao) {
    return data;
  }

  const assinaturasDeDemonstracao = new Map<string, Set<string>>();
  for (const bloco of demonstracao.content as RawItem[]) {
    const id = String(bloco.props.id);
    assinaturasDeDemonstracao.set(
      id,
      new Set([jsonCanonico(bloco), jsonCanonico(migrarItem(bloco))])
    );
  }

  const zonas = (data.zones ?? {}) as Record<string, RawItem[]>;
  const usadas = new Set<string>();
  const expandido = expandirZonas(
    (data.content ?? []) as RawItem[],
    zonas,
    usadas
  );

  const restantes = expandido.filter((bloco) => {
    const assinaturas = assinaturasDeDemonstracao.get(String(bloco.props.id));
    return !assinaturas?.has(jsonCanonico(bloco));
  });

  if (restantes.length === expandido.length) {
    return data;
  }

  const zonasRestantes = Object.fromEntries(
    Object.entries(zonas).filter(([chave]) => !usadas.has(chave))
  );

  return {
    ...data,
    content: restantes,
    zones: zonasRestantes,
  } as LyraPuckData;
}

/**
 * Aplica todos os transforms de migração sobre um documento Puck Lyra.
 * Deve ser chamado ao ler dados do banco para garantir que documentos
 * criados em versões anteriores do catálogo recebam os campos ausentes.
 * Com `documentKey`, também retira os blocos de demonstração intocados.
 */
export function migrarDocumentoPuckLyra(
  data: LyraPuckData,
  documentKey?: LyraPuckDocumentKey
): LyraPuckData {
  const semDemonstracao = documentKey
    ? removerBlocosDeDemonstracao(data, documentKey)
    : data;
  const content = aplicarTransformNaLista(
    (semDemonstracao.content ?? []) as RawItem[]
  );

  const zones: Record<string, RawItem[]> = {};

  for (const [zoneId, zoneItems] of Object.entries(
    semDemonstracao.zones ?? {}
  )) {
    zones[zoneId] = aplicarTransformNaLista((zoneItems ?? []) as RawItem[]);
  }

  return { ...semDemonstracao, content, zones } as LyraPuckData;
}
