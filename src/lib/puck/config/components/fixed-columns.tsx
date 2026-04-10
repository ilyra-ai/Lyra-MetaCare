import type { ComponentConfig, SlotComponent } from '@puckeditor/core';

import {
  juntarClasses,
  obterClasseAlinhamento,
  obterClasseAlinhamentoColunas,
  obterClasseGapStack,
  obterClasseRatioColunas,
  obterClasseSurfaceSection,
} from '@/lib/puck/config/components/helpers';
import type { LyraFixedColumnsBlockProps } from '@/lib/puck/types';

const componentesPermitidosNasColunas = [
  'LyraHeadingBlock',
  'LyraBodyTextBlock',
  'LyraCTAButtonBlock',
  'LyraMetricCardBlock',
  'LyraFeatureCardBlock',
  'LyraFaqItemBlock',
  'LyraStackContainerBlock',
] as const;

type FixedColumnsRenderProps = Omit<
  LyraFixedColumnsBlockProps,
  'leftColumn' | 'rightColumn'
> & {
  leftColumn?: SlotComponent;
  rightColumn?: SlotComponent;
};

function LyraFixedColumnsBlock({
  eyebrow,
  title,
  description,
  ratio,
  gap,
  verticalAlign,
  surface,
  leftColumn: LeftColumn,
  rightColumn: RightColumn,
}: FixedColumnsRenderProps) {
  return (
    <section
      className={juntarClasses(
        'w-full rounded-[28px] border px-6 py-7 sm:px-8 sm:py-8',
        obterClasseSurfaceSection(surface)
      )}
    >
      {(eyebrow || title || description) && (
        <div className="mb-6 flex flex-col gap-4">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h3 className="max-w-4xl text-balance font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className="max-w-3xl text-pretty text-sm leading-7 text-muted-foreground md:text-base">
              {description}
            </p>
          ) : null}
        </div>
      )}

      <div
        className={juntarClasses(
          'grid',
          obterClasseRatioColunas(ratio),
          obterClasseGapStack(gap),
          obterClasseAlinhamentoColunas(verticalAlign)
        )}
      >
        <div className="flex h-full flex-col gap-5">
          {LeftColumn ? (
            <LeftColumn
              className={juntarClasses(
                'flex h-full flex-col gap-5',
                obterClasseAlinhamento('left')
              )}
            />
          ) : null}
        </div>

        <div className="flex h-full flex-col gap-5">
          {RightColumn ? (
            <RightColumn
              className={juntarClasses(
                'flex h-full flex-col gap-5',
                obterClasseAlinhamento('left')
              )}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

export const lyraFixedColumnsBlockConfig = {
  label: 'Layout fixo em colunas',
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
    ratio: {
      type: 'radio',
      label: 'Proporção das colunas',
      options: [
        { label: '50 / 50', value: '1-1' },
        { label: '66 / 33', value: '2-1' },
        { label: '33 / 66', value: '1-2' },
      ],
    },
    gap: {
      type: 'select',
      label: 'Espaçamento entre colunas',
      options: [
        { label: 'Pequeno', value: 'sm' },
        { label: 'Médio', value: 'md' },
        { label: 'Grande', value: 'lg' },
        { label: 'Extra grande', value: 'xl' },
      ],
    },
    verticalAlign: {
      type: 'radio',
      label: 'Alinhamento vertical',
      options: [
        { label: 'Topo', value: 'start' },
        { label: 'Centro', value: 'center' },
        { label: 'Esticado', value: 'stretch' },
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
    leftColumn: {
      type: 'slot',
      label: 'Coluna esquerda',
      allow: [...componentesPermitidosNasColunas],
    },
    rightColumn: {
      type: 'slot',
      label: 'Coluna direita',
      allow: [...componentesPermitidosNasColunas],
    },
  },
  defaultProps: {
    eyebrow: 'Layout fixo com governança',
    title:
      'Duas colunas reais, com zonas independentes e drag-and-drop nativo.',
    description:
      'Use esta composição quando a narrativa pedir hierarquia clara entre contexto editorial e conteúdo de apoio.',
    ratio: '1-1',
    gap: 'lg',
    verticalAlign: 'stretch',
    surface: 'surface',
    leftColumn: [
      {
        type: 'LyraHeadingBlock',
        props: {
          children: 'Coluna principal pronta para narrativa, CTA e texto.',
          level: 'h3',
          align: 'left',
          tone: 'default',
        },
      },
      {
        type: 'LyraBodyTextBlock',
        props: {
          content:
            'Os slots desta composição são independentes e podem receber blocos diferentes mantendo a estrutura fixa do layout.',
          align: 'left',
          size: 'md',
          tone: 'muted',
        },
      },
    ],
    rightColumn: [
      {
        type: 'LyraFeatureCardBlock',
        props: {
          eyebrow: 'Coluna secundária',
          title: 'Apoie a mensagem principal com cards, métricas ou FAQs.',
          description:
            'Este lado funciona muito bem para conteúdo complementar e provas de valor.',
          icon: 'sparkles',
          tone: 'cosmic',
          ctaLabel: 'Explorar',
          ctaHref: '/',
        },
      },
    ],
  },
  render: (props: Record<string, unknown>) => (
    <LyraFixedColumnsBlock
      eyebrow={String(props.eyebrow ?? '')}
      title={String(props.title ?? '')}
      description={String(props.description ?? '')}
      ratio={(props.ratio as FixedColumnsRenderProps['ratio']) ?? '1-1'}
      gap={(props.gap as FixedColumnsRenderProps['gap']) ?? 'lg'}
      verticalAlign={
        (props.verticalAlign as FixedColumnsRenderProps['verticalAlign']) ??
        'stretch'
      }
      surface={
        (props.surface as FixedColumnsRenderProps['surface']) ?? 'surface'
      }
      leftColumn={props.leftColumn as SlotComponent | undefined}
      rightColumn={props.rightColumn as SlotComponent | undefined}
    />
  ),
} satisfies ComponentConfig<LyraFixedColumnsBlockProps>;
