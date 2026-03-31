import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { LyraFaqItemBlockProps } from '@/lib/puck/types';

function LyraFaqItemBlock({
  question,
  answer,
  eyebrow,
}: LyraFaqItemBlockProps) {
  return (
    <div className="w-full">
      <Accordion type="single" collapsible defaultValue="faq-item">
        <AccordionItem
          value="faq-item"
          className="border-border/70 bg-white/90 px-5"
        >
          <AccordionTrigger className="gap-4 py-5">
            <div className="flex flex-col items-start gap-3 text-left">
              {eyebrow ? (
                <Badge variant="cosmic" className="w-fit">
                  {eyebrow}
                </Badge>
              ) : null}
              <span className="font-display text-lg font-semibold text-foreground">
                {question}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="leading-7 text-muted-foreground">
            {answer}
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
    answer: {
      type: 'textarea',
      label: 'Resposta',
    },
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
      answer={String(props.answer ?? '')}
    />
  ),
};
