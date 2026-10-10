'use client';

import type { ComponentConfig } from '@puckeditor/core';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { criarCampoRichTextLyra } from '@/lib/puck/config/fields/rich-text';
import { useOverlayPortal } from '@/lib/puck/overlay-portals/register';
import { LyraRichTextRenderer } from '@/lib/puck/render/rich-text-renderer';
import type { LyraFaqItemBlockProps } from '@/lib/puck/types';

function LyraFaqItemBlock({
  question,
  answer,
  eyebrow,
}: LyraFaqItemBlockProps) {
  const triggerRef = useOverlayPortal<HTMLDivElement>();

  return (
    <div className="w-full">
      <Accordion type="single" collapsible defaultValue="faq-item">
        <AccordionItem value="faq-item">
          <div ref={triggerRef}>
            <AccordionTrigger className="gap-4 py-5">
              <div className="flex min-w-0 flex-col items-start gap-2 text-left">
                {eyebrow ? (
                  <Badge variant="secondary" className="w-fit">
                    {eyebrow}
                  </Badge>
                ) : null}
                <span className="break-words font-display text-base font-semibold tracking-tight text-foreground">
                  {question}
                </span>
              </div>
            </AccordionTrigger>
          </div>
          <AccordionContent className="leading-6 text-muted-foreground">
            <LyraRichTextRenderer
              value={answer}
              className="text-sm leading-6 text-muted-foreground"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export const lyraFaqItemBlockConfig = {
  label: 'Item de FAQ',
  fields: {
    eyebrow: {
      type: 'text',
      label: 'Selo',
    },
    question: {
      type: 'text',
      label: 'Pergunta',
    },
    answer: criarCampoRichTextLyra({
      label: 'Resposta',
      initialHeight: 200,
      headingLevels: [3, 4],
    }),
  },
  defaultProps: {
    eyebrow: 'Pergunta recorrente',
    question: 'Como a experiência publicada conversa com o builder?',
    answer:
      'Os documentos do Puck são persistidos no banco, publicados de forma explícita e renderizados pelo frontend público com o mesmo catálogo de componentes.',
  },
  render: (props: Record<string, unknown>) => (
    <LyraFaqItemBlock
      eyebrow={String(props.eyebrow ?? '')}
      question={String(props.question ?? '')}
      answer={(props.answer as LyraFaqItemBlockProps['answer']) ?? ''}
    />
  ),
} satisfies ComponentConfig<LyraFaqItemBlockProps>;
