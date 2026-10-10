import type { ComponentConfig } from '@puckeditor/core';

import {
  juntarClasses,
  obterClasseTomTile,
} from '@/lib/puck/config/components/helpers';
import type { LyraGridTileBlockProps } from '@/lib/puck/types';

type GridTileRenderProps = LyraGridTileBlockProps & {
  puck: {
    dragRef: ((element: Element | null) => void) | null;
  };
};

function obterNumeroSpan(span: LyraGridTileBlockProps['spanCol']) {
  return Number.parseInt(span, 10) || 1;
}

function LyraGridTileBlock({
  eyebrow,
  title,
  description,
  badgeLabel,
  tone,
  spanCol,
  spanRow,
  // Callback ref do Puck para componentes `inline`: repassado diretamente ao
  // elemento raiz para que o editor arraste o próprio tile, sem wrapper.
  puck: { dragRef },
}: GridTileRenderProps) {
  const colunas = obterNumeroSpan(spanCol);
  const linhas = obterNumeroSpan(spanRow);

  return (
    <article
      ref={dragRef}
      className={juntarClasses(
        'min-h-[196px] min-w-0 rounded-xl border p-5 transition-colors duration-150 sm:p-6',
        obterClasseTomTile(tone)
      )}
      style={{
        gridColumn: `span ${colunas}`,
        gridRow: `span ${linhas}`,
        flexGrow: colunas,
        flexBasis: `${220 * colunas}px`,
      }}
    >
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 text-sm font-medium text-muted-foreground">
            {eyebrow}
          </p>
          {badgeLabel ? (
            <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-foreground">
              {badgeLabel}
            </span>
          ) : null}
        </div>
        <div className="space-y-2">
          <h4 className="text-balance break-words font-display text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h4>
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

export const lyraGridTileBlockConfig = {
  label: 'Tile inline de grade',
  inline: true,
  fields: {
    eyebrow: {
      type: 'text',
      label: 'Sobretítulo',
    },
    title: {
      type: 'text',
      label: 'Título',
    },
    description: {
      type: 'textarea',
      label: 'Descrição',
    },
    badgeLabel: {
      type: 'text',
      label: 'Badge',
    },
    tone: {
      type: 'radio',
      label: 'Tom visual',
      options: [
        { label: 'Padrão', value: 'default' },
        { label: 'Cósmico', value: 'cosmic' },
        { label: 'Teal', value: 'teal' },
        { label: 'Coral', value: 'coral' },
      ],
    },
    spanCol: {
      type: 'select',
      label: 'Span de colunas',
      options: [
        { label: '1 coluna', value: '1' },
        { label: '2 colunas', value: '2' },
        { label: '3 colunas', value: '3' },
      ],
    },
    spanRow: {
      type: 'select',
      label: 'Span de linhas',
      options: [
        { label: '1 linha', value: '1' },
        { label: '2 linhas', value: '2' },
        { label: '3 linhas', value: '3' },
      ],
    },
  },
  defaultProps: {
    eyebrow: 'Tile modular',
    title: 'Item inline sem wrapper extra do Puck.',
    description:
      'Este bloco usa inline + dragRef para permitir spans reais de grid e layouts mais sofisticados.',
    badgeLabel: 'Inline',
    tone: 'default',
    spanCol: '1',
    spanRow: '1',
  },
  render: (props: Record<string, unknown>) => (
    <LyraGridTileBlock
      eyebrow={String(props.eyebrow ?? '')}
      title={String(props.title ?? '')}
      description={String(props.description ?? '')}
      badgeLabel={String(props.badgeLabel ?? '')}
      tone={(props.tone as GridTileRenderProps['tone']) ?? 'default'}
      spanCol={(props.spanCol as GridTileRenderProps['spanCol']) ?? '1'}
      spanRow={(props.spanRow as GridTileRenderProps['spanRow']) ?? '1'}
      puck={
        (props.puck as GridTileRenderProps['puck']) ?? {
          dragRef: null,
        }
      }
    />
  ),
} satisfies ComponentConfig<LyraGridTileBlockProps>;
