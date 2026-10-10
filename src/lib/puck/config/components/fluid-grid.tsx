import type { CSSProperties } from 'react';
import type { ComponentConfig, SlotComponent } from '@puckeditor/core';

import {
  juntarClasses,
  obterClasseGapStack,
  obterClasseSurfaceSection,
} from '@/lib/puck/config/components/helpers';
import type { LyraFluidGridBlockProps } from '@/lib/puck/types';

const componentesPermitidosNaGrade = ['LyraGridTileBlock'];

type FluidGridRenderProps = Omit<LyraFluidGridBlockProps, 'content'> & {
  content?: SlotComponent;
};

function obterQuantidadeColunas(
  valor: LyraFluidGridBlockProps['columnsDesktop']
) {
  return Number.parseInt(valor, 10) || 1;
}

function obterEstiloGrid(
  columnsDesktop: LyraFluidGridBlockProps['columnsDesktop'],
  columnsTablet: LyraFluidGridBlockProps['columnsTablet']
) {
  const desktop = obterQuantidadeColunas(columnsDesktop);
  const tablet = obterQuantidadeColunas(columnsTablet);

  return {
    '--lyra-grid-desktop': `repeat(${desktop}, minmax(0, 1fr))`,
    '--lyra-grid-tablet': `repeat(${tablet}, minmax(0, 1fr))`,
  } as CSSProperties;
}

function LyraFluidGridBlock({
  eyebrow,
  title,
  description,
  layoutMode,
  columnsDesktop,
  columnsTablet,
  gap,
  surface,
  content: Content,
}: FluidGridRenderProps) {
  const estiloGrid = obterEstiloGrid(columnsDesktop, columnsTablet);

  return (
    <section
      className={juntarClasses(
        'w-full min-w-0 rounded-xl border p-5 sm:p-6',
        obterClasseSurfaceSection(surface)
      )}
    >
      {(eyebrow || title || description) && (
        <div className="mb-6 flex flex-col gap-2">
          {eyebrow ? (
            <p className="text-sm font-medium text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h3 className="max-w-4xl text-balance break-words font-display text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className="max-w-3xl text-pretty text-sm leading-6 text-muted-foreground md:text-base md:leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
      )}

      {Content ? (
        <Content
          allow={componentesPermitidosNaGrade}
          className={juntarClasses(
            'lyra-fluid-grid',
            obterClasseGapStack(gap),
            layoutMode === 'flex'
              ? 'flex flex-wrap items-stretch'
              : 'grid grid-cols-1 md:grid-cols-(--lyra-grid-tablet) xl:grid-cols-(--lyra-grid-desktop)'
          )}
          style={layoutMode === 'grid' ? estiloGrid : undefined}
        />
      ) : null}
    </section>
  );
}

export const lyraFluidGridBlockConfig = {
  label: 'Grade fluida',
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
    layoutMode: {
      type: 'radio',
      label: 'Modo de layout',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Flex', value: 'flex' },
      ],
    },
    columnsDesktop: {
      type: 'select',
      label: 'Colunas no desktop',
      options: [
        { label: '1 coluna', value: '1' },
        { label: '2 colunas', value: '2' },
        { label: '3 colunas', value: '3' },
        { label: '4 colunas', value: '4' },
      ],
    },
    columnsTablet: {
      type: 'select',
      label: 'Colunas no tablet',
      options: [
        { label: '1 coluna', value: '1' },
        { label: '2 colunas', value: '2' },
        { label: '3 colunas', value: '3' },
      ],
    },
    gap: {
      type: 'select',
      label: 'Espaçamento',
      options: [
        { label: 'Pequeno', value: 'sm' },
        { label: 'Médio', value: 'md' },
        { label: 'Grande', value: 'lg' },
        { label: 'Extra grande', value: 'xl' },
      ],
    },
    surface: {
      type: 'select',
      label: 'Superfície',
      options: [
        { label: 'Glass', value: 'glass' },
        { label: 'Surface', value: 'surface' },
        { label: 'Cósmica', value: 'cosmic' },
        { label: 'Aurora', value: 'aurora' },
      ],
    },
    content: {
      type: 'slot',
      label: 'Tiles da grade',
    },
  },
  defaultProps: {
    eyebrow: 'Grade fluida',
    title: 'Layout com grid ou flex sem perder drag-and-drop.',
    description:
      'Este bloco usa slot com style/className para reorganizar os filhos em grid ou flex, preservando spans reais quando necessário.',
    layoutMode: 'grid',
    columnsDesktop: '3',
    columnsTablet: '2',
    gap: 'md',
    surface: 'glass',
    content: [
      {
        type: 'LyraGridTileBlock',
        props: {
          eyebrow: 'Tile 01',
          title: 'Ocupação ampla e leitura editorial.',
          description:
            'Este tile nasce com span maior para destacar um contexto prioritário.',
          badgeLabel: 'Destaque',
          tone: 'cosmic',
          spanCol: '2',
          spanRow: '1',
        },
      },
      {
        type: 'LyraGridTileBlock',
        props: {
          eyebrow: 'Tile 02',
          title: 'Bloco modular compacto.',
          description: 'Ideal para apoio, prova de valor, badges ou estados.',
          badgeLabel: 'Compacto',
          tone: 'teal',
          spanCol: '1',
          spanRow: '1',
        },
      },
      {
        type: 'LyraGridTileBlock',
        props: {
          eyebrow: 'Tile 03',
          title: 'Expansão vertical controlada.',
          description:
            'Use spans de linha para criar mosaicos com ritmo editorial premium.',
          badgeLabel: 'Alto',
          tone: 'coral',
          spanCol: '1',
          spanRow: '2',
        },
      },
    ],
  },
  render: (props: Record<string, unknown>) => (
    <LyraFluidGridBlock
      eyebrow={String(props.eyebrow ?? '')}
      title={String(props.title ?? '')}
      description={String(props.description ?? '')}
      layoutMode={
        (props.layoutMode as FluidGridRenderProps['layoutMode']) ?? 'grid'
      }
      columnsDesktop={
        (props.columnsDesktop as FluidGridRenderProps['columnsDesktop']) ?? '3'
      }
      columnsTablet={
        (props.columnsTablet as FluidGridRenderProps['columnsTablet']) ?? '2'
      }
      gap={(props.gap as FluidGridRenderProps['gap']) ?? 'md'}
      surface={(props.surface as FluidGridRenderProps['surface']) ?? 'glass'}
      content={props.content as SlotComponent | undefined}
    />
  ),
} satisfies ComponentConfig<LyraFluidGridBlockProps>;
