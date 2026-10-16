import type { LyraPuckData } from '@/lib/puck/types';

type RawItem = { type: string; props: Record<string, unknown> };

/**
 * Campos que o `resolveData` dos blocos dinâmicos preenche com os dados de
 * quem está vendo a página (nome, plano, resumo da sessão). No editor eles
 * são preenchidos com os dados do administrador e o Puck os mantém no
 * documento; gravados assim, iriam para o documento publicado, que a rota
 * pública devolve a qualquer visitante (tarefa 53, LGPD). Ao salvar e ao
 * publicar, estes campos são esvaziados: a página os resolve de novo para
 * cada pessoa (PuckDocumentView chama `resolveAllData`).
 */
const CAMPOS_RESOLVIDOS_POR_TIPO: Readonly<Record<string, readonly string[]>> =
  {
    LyraHeroBlock: ['eyebrow', 'title', 'description', 'note'],
    LyraMetricCardBlock: [
      'eyebrow',
      'value',
      'unit',
      'description',
      'trendLabel',
      'badgeLabel',
    ],
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

function limparItem(item: RawItem): RawItem {
  const props: Record<string, unknown> = {};
  for (const [chave, valor] of Object.entries(item.props)) {
    props[chave] =
      Array.isArray(valor) && valor.length > 0 && valor.every(ehBloco)
        ? valor.map(limparItem)
        : valor;
  }

  const dinamico =
    typeof props.dynamicSource === 'string' && props.dynamicSource !== 'manual';
  const campos = CAMPOS_RESOLVIDOS_POR_TIPO[item.type];
  if (dinamico && campos) {
    for (const campo of campos) {
      props[campo] = '';
    }
  }

  return { ...item, props };
}

export function limparDadosResolvidosPuck(data: LyraPuckData): LyraPuckData {
  const content = ((data.content ?? []) as RawItem[]).map(limparItem);
  const zones = Object.fromEntries(
    Object.entries(data.zones ?? {}).map(([chave, itens]) => [
      chave,
      ((itens ?? []) as RawItem[]).map(limparItem),
    ])
  );
  const rootProps = data.root?.props;

  return {
    ...data,
    content,
    zones,
    root: {
      ...data.root,
      ...(rootProps
        ? { props: { ...rootProps, resolvedContextSummary: '' } }
        : {}),
    },
  } as LyraPuckData;
}
