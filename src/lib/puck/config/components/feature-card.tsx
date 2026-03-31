import { ArrowUpRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  obterClasseTomHeading,
  obterIconeDecorativo,
} from '@/lib/puck/config/components/helpers';
import type { LyraFeatureCardBlockProps } from '@/lib/puck/types';

function LyraFeatureCardBlock({
  eyebrow,
  title,
  description,
  icon,
  tone,
  ctaLabel,
  ctaHref,
}: LyraFeatureCardBlockProps) {
  const Icone = obterIconeDecorativo(icon);

  return (
    <Card className="h-full border-border/70 bg-white/92">
      <CardHeader className="gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-aurora text-primary shadow-glass">
          <Icone className="h-5 w-5" />
        </div>
        <div className="space-y-3">
          <Badge variant="info" className="w-fit">
            {eyebrow}
          </Badge>
          <CardTitle className={obterClasseTomHeading(tone)}>{title}</CardTitle>
          <CardDescription className="leading-7">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent />
      {ctaLabel ? (
        <CardFooter>
          <Button asChild variant="ghost">
            <a href={ctaHref}>
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}

export const lyraFeatureCardBlockConfig = {
  label: 'Card de feature',
  fields: {
    eyebrow: {
      type: 'text',
      label: 'Selo',
    },
    title: {
      type: 'text',
      label: 'Título',
    },
    description: {
      type: 'textarea',
      label: 'Descrição',
    },
    icon: {
      type: 'select',
      label: 'Ícone',
      options: [
        { label: 'Sparkles', value: 'sparkles' },
        { label: 'Coração', value: 'heart' },
        { label: 'CPU', value: 'cpu' },
        { label: 'Calendário', value: 'calendar' },
        { label: 'Escudo', value: 'shield' },
        { label: 'Mensagem', value: 'message' },
        { label: 'Atividade', value: 'activity' },
      ],
    },
    tone: {
      type: 'select',
      label: 'Tom do título',
      options: [
        { label: 'Padrão', value: 'default' },
        { label: 'Cósmico', value: 'cosmic' },
        { label: 'Teal', value: 'teal' },
        { label: 'Coral', value: 'coral' },
      ],
    },
    ctaLabel: {
      type: 'text',
      label: 'CTA',
    },
    ctaHref: {
      type: 'text',
      label: 'Link do CTA',
    },
  },
  defaultProps: {
    eyebrow: 'Camada inteligente',
    title: 'IA aplicada com leitura serena e contexto humano.',
    description:
      'Use este bloco para destacar capacidades da Lyra com linguagem mais editorial, clara e controlável pelo time.',
    icon: 'cpu',
    tone: 'cosmic',
    ctaLabel: 'Explorar detalhe',
    ctaHref: '/dashboard',
  },
  render: (props: Record<string, unknown>) => (
    <LyraFeatureCardBlock
      eyebrow={String(props.eyebrow ?? '')}
      title={String(props.title ?? '')}
      description={String(props.description ?? '')}
      icon={(props.icon as LyraFeatureCardBlockProps['icon']) ?? 'sparkles'}
      tone={(props.tone as LyraFeatureCardBlockProps['tone']) ?? 'default'}
      ctaLabel={String(props.ctaLabel ?? '')}
      ctaHref={String(props.ctaHref ?? '#')}
    />
  ),
};
