import type { RichText } from '@puckeditor/core';

type ComponentTransform = (
  props: Record<string, unknown>
) => Record<string, unknown>;

/**
 * Mapeamento de transforms por tipo de componente Puck Lyra.
 * Cada transform recebe os props brutos do documento e retorna os props
 * migrados — garantindo que campos adicionados em tasks posteriores
 * recebam seus valores padrão em documentos legados.
 */
export const lyraPuckComponentTransforms: Record<string, ComponentTransform> = {
  LyraBodyTextBlock: (props) => ({
    align: 'left',
    size: 'md',
    tone: 'default',
    ...props,
    content: ensureRichText(props.content),
  }),

  LyraFaqItemBlock: (props) => ({
    eyebrow: '',
    ...props,
    answer: ensureRichText(props.answer),
  }),

  LyraFeatureCardBlock: (props) => ({
    externalPlan: undefined,
    ...props,
  }),

  LyraHeroBlock: (props) => ({
    dynamicSource: 'manual',
    ctaMode: 'manual-url',
    ...props,
  }),

  LyraMetricCardBlock: (props) => ({
    dynamicSource: 'manual',
    ...props,
  }),

  LyraSectionContainerBlock: (props) => ({
    align: 'left',
    surface: 'surface',
    ...props,
  }),

  LyraFixedColumnsBlock: (props) => ({
    ratio: '1-1',
    gap: 'md',
    verticalAlign: 'stretch',
    surface: 'surface',
    ...props,
  }),

  LyraFluidGridBlock: (props) => ({
    layoutMode: 'grid',
    columnsDesktop: '3',
    columnsTablet: '2',
    gap: 'md',
    surface: 'surface',
    ...props,
  }),
};

function ensureRichText(value: unknown): RichText {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return value as RichText;
}
