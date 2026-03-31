import type { ComponentConfig } from '@puckeditor/core';
import { criarCampoRichTextLyra } from '@/lib/puck/config/fields/rich-text';
import {
  juntarClasses,
  obterClasseAlinhamento,
} from '@/lib/puck/config/components/helpers';
import { LyraRichTextRenderer } from '@/lib/puck/render/rich-text-renderer';
import type { LyraBodyTextBlockProps } from '@/lib/puck/types';

const toneClasses: Record<LyraBodyTextBlockProps['tone'], string> = {
  default: 'text-foreground/88',
  muted: 'text-muted-foreground',
  cosmic: 'text-cosmic/90',
};

const sizeClasses: Record<LyraBodyTextBlockProps['size'], string> = {
  sm: 'text-sm leading-6',
  md: 'text-base leading-8',
  lg: 'text-lg leading-9',
};

function LyraBodyTextBlock({
  content,
  align,
  size,
  tone,
}: LyraBodyTextBlockProps) {
  return (
    <div
      className={juntarClasses(
        'flex w-full flex-col',
        obterClasseAlinhamento(align)
      )}
    >
      <div
        className={juntarClasses(
          'max-w-3xl text-pretty',
          sizeClasses[size],
          toneClasses[tone]
        )}
      >
        <LyraRichTextRenderer value={content} className="text-inherit" />
      </div>
    </div>
  );
}

export const lyraBodyTextBlockConfig = {
  label: 'Texto de apoio',
  fields: {
    content: criarCampoRichTextLyra({
      label: 'Conteúdo',
      initialHeight: 240,
      headingLevels: [2, 3, 4],
    }),
    align: {
      type: 'radio',
      label: 'Alinhamento',
      options: [
        { label: 'Esquerda', value: 'left' },
        { label: 'Centro', value: 'center' },
        { label: 'Direita', value: 'right' },
      ],
    },
    size: {
      type: 'select',
      label: 'Escala',
      options: [
        { label: 'Pequeno', value: 'sm' },
        { label: 'Médio', value: 'md' },
        { label: 'Grande', value: 'lg' },
      ],
    },
    tone: {
      type: 'select',
      label: 'Tom visual',
      options: [
        { label: 'Padrão', value: 'default' },
        { label: 'Suave', value: 'muted' },
        { label: 'Cósmico', value: 'cosmic' },
      ],
    },
  },
  defaultProps: {
    content:
      'A Lyra combina sinais do cotidiano, linguagem acolhedora e leitura contextual para transformar dados em direção prática.',
    align: 'left',
    size: 'md',
    tone: 'muted',
  },
  render: (props: Record<string, unknown>) => (
    <LyraBodyTextBlock
      content={(props.content as LyraBodyTextBlockProps['content']) ?? ''}
      align={(props.align as LyraBodyTextBlockProps['align']) ?? 'left'}
      size={(props.size as LyraBodyTextBlockProps['size']) ?? 'md'}
      tone={(props.tone as LyraBodyTextBlockProps['tone']) ?? 'muted'}
    />
  ),
} satisfies ComponentConfig<LyraBodyTextBlockProps>;
