import type { ComponentConfig, SlotComponent } from '@puckeditor/core';

import {
  juntarClasses,
  obterClasseAlinhamento,
  obterClasseSurfaceSection,
} from '@/lib/puck/config/components/helpers';
import type { LyraSectionContainerBlockProps } from '@/lib/puck/types';

type SectionRenderProps = Omit<LyraSectionContainerBlockProps, 'content'> & {
  content?: SlotComponent;
};

function LyraSectionContainerBlock({
  eyebrow,
  title,
  description,
  align,
  surface,
  content: Content,
}: SectionRenderProps) {
  return (
    <section
      className={juntarClasses(
        'w-full min-w-0 rounded-xl border p-5 sm:p-6',
        obterClasseSurfaceSection(surface)
      )}
    >
      <div
        className={juntarClasses(
          'flex flex-col gap-2',
          obterClasseAlinhamento(align)
        )}
      >
        {eyebrow ? (
          <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
        ) : null}
        {title ? (
          <h2 className="max-w-4xl text-balance break-words font-display text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            {title}
          </h2>
        ) : null}
        {description ? (
          <p className="max-w-3xl text-pretty text-sm leading-6 text-muted-foreground md:text-base md:leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>

      {Content ? (
        <div className="mt-6">
          <Content className="flex flex-col gap-4" />
        </div>
      ) : null}
    </section>
  );
}

export const lyraSectionContainerBlockConfig = {
  label: 'Seção editorial',
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
    align: {
      type: 'radio',
      label: 'Alinhamento',
      options: [
        { label: 'Esquerda', value: 'left' },
        { label: 'Centro', value: 'center' },
        { label: 'Direita', value: 'right' },
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
      label: 'Conteúdo interno',
    },
  },
  defaultProps: {
    eyebrow: 'Seção guiada',
    title: 'Monte áreas completas com hierarquia visual consistente.',
    description:
      'Este contêiner organiza blocos internos e já nasce com superfície, espaçamento e cabeçalho editáveis.',
    align: 'left',
    surface: 'surface',
  },
  render: (props: Record<string, unknown>) => (
    <LyraSectionContainerBlock
      eyebrow={String(props.eyebrow ?? '')}
      title={String(props.title ?? '')}
      description={String(props.description ?? '')}
      align={(props.align as SectionRenderProps['align']) ?? 'left'}
      surface={(props.surface as SectionRenderProps['surface']) ?? 'surface'}
      content={props.content as SlotComponent | undefined}
    />
  ),
} satisfies ComponentConfig<LyraSectionContainerBlockProps>;
