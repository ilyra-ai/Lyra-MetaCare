import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  obterApresentacaoTrend,
  obterIconeDecorativo,
} from '@/lib/puck/config/components/helpers';
import type { LyraMetricCardBlockProps } from '@/lib/puck/types';

function LyraMetricCardBlock({
  eyebrow,
  value,
  unit,
  description,
  trendLabel,
  trendDirection,
  badgeLabel,
  icon,
}: LyraMetricCardBlockProps) {
  const Icone = obterIconeDecorativo(icon);
  const trend = obterApresentacaoTrend(trendDirection);

  return (
    <Card className="h-full border-border/70 bg-white/90">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
              {eyebrow}
            </p>
            <CardTitle className="metric-display flex items-end gap-2 text-foreground">
              <span>{value}</span>
              {unit ? (
                <span className="pb-1 text-sm font-medium tracking-normal text-muted-foreground">
                  {unit}
                </span>
              ) : null}
            </CardTitle>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-teal text-white shadow-teal">
            <Icone className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="leading-7">{description}</CardDescription>
        <div className="flex flex-wrap items-center gap-3">
          {badgeLabel ? <Badge variant="cosmic">{badgeLabel}</Badge> : null}
          <div
            className={`inline-flex items-center gap-2 text-sm font-medium ${trend.classe}`}
          >
            <trend.Icone className="h-4 w-4" />
            <span>{trendLabel || trend.texto}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const lyraMetricCardBlockConfig = {
  label: 'Card de métrica',
  fields: {
    eyebrow: {
      type: 'text',
      label: 'Sobretítulo',
    },
    value: {
      type: 'text',
      label: 'Valor principal',
    },
    unit: {
      type: 'text',
      label: 'Unidade',
    },
    description: {
      type: 'textarea',
      label: 'Descrição',
    },
    trendLabel: {
      type: 'text',
      label: 'Texto de tendência',
    },
    trendDirection: {
      type: 'select',
      label: 'Direção da tendência',
      options: [
        { label: 'Alta', value: 'up' },
        { label: 'Queda', value: 'down' },
        { label: 'Estável', value: 'neutral' },
      ],
    },
    badgeLabel: {
      type: 'text',
      label: 'Badge',
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
  },
  defaultProps: {
    eyebrow: 'Frequência em harmonia',
    value: '84',
    unit: 'ms',
    description:
      'Leitura sintetizada para destacar coerência fisiológica, resposta ao descanso e ritmo da semana.',
    trendLabel: 'Subiu 12% em relação aos últimos 7 dias',
    trendDirection: 'up',
    badgeLabel: 'Pico harmônico',
    icon: 'heart',
  },
  render: (props: Record<string, unknown>) => (
    <LyraMetricCardBlock
      eyebrow={String(props.eyebrow ?? '')}
      value={String(props.value ?? '')}
      unit={String(props.unit ?? '')}
      description={String(props.description ?? '')}
      trendLabel={String(props.trendLabel ?? '')}
      trendDirection={
        (props.trendDirection as LyraMetricCardBlockProps['trendDirection']) ??
        'neutral'
      }
      badgeLabel={String(props.badgeLabel ?? '')}
      icon={(props.icon as LyraMetricCardBlockProps['icon']) ?? 'activity'}
    />
  ),
};
