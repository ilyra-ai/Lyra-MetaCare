import type { ComponentConfig } from '@puckeditor/core';
import {
  juntarClasses,
  obterClasseAlinhamento,
  obterClasseTomHeading,
} from '@/lib/puck/config/components/helpers';
import type { LyraHeadingBlockProps } from '@/lib/puck/types';

function LyraHeadingBlock({
  children,
  level,
  align,
  tone,
}: LyraHeadingBlockProps) {
  const Tag = level;

  return (
    <div
      className={juntarClasses(
        'flex w-full flex-col gap-3',
        obterClasseAlinhamento(align)
      )}
    >
      <Tag
        className={juntarClasses(
          'max-w-4xl text-balance font-display font-bold tracking-tight',
          level === 'h1' && 'text-4xl leading-[1.05] md:text-5xl',
          level === 'h2' && 'text-3xl leading-[1.08] md:text-4xl',
          level === 'h3' && 'text-2xl leading-[1.12] md:text-3xl',
          level === 'h4' && 'text-xl leading-[1.2] md:text-2xl',
          obterClasseTomHeading(tone)
        )}
      >
        {children}
      </Tag>
    </div>
  );
}

export const lyraHeadingBlockConfig = {
  label: 'Título editorial',
  fields: {
    children: {
      type: 'text',
      label: 'Texto do título',
    },
    level: {
      type: 'select',
      label: 'Nível semântico',
      options: [
        { label: 'H1', value: 'h1' },
        { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' },
      ],
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
    tone: {
      type: 'select',
      label: 'Tom visual',
      options: [
        { label: 'Padrão', value: 'default' },
        { label: 'Cósmico', value: 'cosmic' },
        { label: 'Teal', value: 'teal' },
        { label: 'Coral', value: 'coral' },
      ],
    },
  },
  defaultProps: {
    children: 'Seu bem-estar com direção cósmica e inteligência aplicada.',
    level: 'h2',
    align: 'left',
    tone: 'default',
  },
  render: (props: Record<string, unknown>) => (
    <LyraHeadingBlock
      level={(props.level as LyraHeadingBlockProps['level']) ?? 'h2'}
      align={(props.align as LyraHeadingBlockProps['align']) ?? 'left'}
      tone={(props.tone as LyraHeadingBlockProps['tone']) ?? 'default'}
    >
      {String(props.children ?? '')}
    </LyraHeadingBlock>
  ),
} satisfies ComponentConfig<LyraHeadingBlockProps>;
