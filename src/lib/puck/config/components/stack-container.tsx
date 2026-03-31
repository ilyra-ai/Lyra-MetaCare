import type { ComponentConfig, SlotComponent } from '@puckeditor/core';

import {
  juntarClasses,
  obterClasseGapStack,
  obterClasseSurfaceStack,
} from '@/lib/puck/config/components/helpers';
import type { LyraStackContainerBlockProps } from '@/lib/puck/types';

type StackRenderProps = Omit<LyraStackContainerBlockProps, 'content'> & {
  content?: SlotComponent;
};

function LyraStackContainerBlock({
  title,
  description,
  direction,
  gap,
  surface,
  content: Content,
}: StackRenderProps) {
  return (
    <div
      className={juntarClasses(
        'w-full rounded-[24px] p-5 sm:p-6',
        obterClasseSurfaceStack(surface)
      )}
    >
      {title || description ? (
        <div className="mb-5 flex flex-col gap-2">
          {title ? (
            <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className="text-sm leading-7 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      {Content ? (
        <Content
          className={juntarClasses(
            direction === 'horizontal'
              ? 'flex flex-col md:flex-row'
              : 'flex flex-col',
            obterClasseGapStack(gap)
          )}
        />
      ) : null}
    </div>
  );
}

export const lyraStackContainerBlockConfig = {
  label: 'Stack de composição',
  fields: {
    title: {
      type: 'text',
      label: 'Título do grupo',
    },
    description: {
      type: 'textarea',
      label: 'Descrição do grupo',
    },
    direction: {
      type: 'radio',
      label: 'Direção',
      options: [
        { label: 'Vertical', value: 'vertical' },
        { label: 'Horizontal', value: 'horizontal' },
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
        { label: 'Transparente', value: 'transparent' },
        { label: 'Soft', value: 'soft' },
        { label: 'Glass', value: 'glass' },
      ],
    },
    content: {
      type: 'slot',
      label: 'Itens do stack',
    },
  },
  defaultProps: {
    title: 'Composição guiada',
    description:
      'Agrupe blocos em pilhas verticais ou horizontais mantendo consistência de espaçamento e superfície.',
    direction: 'vertical',
    gap: 'md',
    surface: 'transparent',
  },
  render: (props: Record<string, unknown>) => (
    <LyraStackContainerBlock
      title={String(props.title ?? '')}
      description={String(props.description ?? '')}
      direction={
        (props.direction as StackRenderProps['direction']) ?? 'vertical'
      }
      gap={(props.gap as StackRenderProps['gap']) ?? 'md'}
      surface={(props.surface as StackRenderProps['surface']) ?? 'transparent'}
      content={props.content as SlotComponent | undefined}
    />
  ),
} satisfies ComponentConfig<LyraStackContainerBlockProps>;
