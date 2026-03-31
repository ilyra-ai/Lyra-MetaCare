import type { ComponentConfig } from '@puckeditor/core';
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
import { obterResumoAssinaturaLyra } from '@/lib/puck/dynamic/metrics';
import type { LyraMetricCardBlockProps } from '@/lib/puck/types';

const camposSomenteLeituraMetricCard: Partial<
  Record<keyof LyraMetricCardBlockProps, boolean>
> = {
  eyebrow: true,
  value: true,
  unit: true,
  description: true,
  trendLabel: true,
  trendDirection: true,
  badgeLabel: true,
  icon: true,
};

function deveResolverMetricCard(
  changed: Partial<Record<keyof LyraMetricCardBlockProps, boolean>>
) {
  return Boolean(
    changed.dynamicSource ||
    changed.eyebrow ||
    changed.value ||
    changed.unit ||
    changed.description ||
    changed.trendLabel ||
    changed.trendDirection ||
    changed.badgeLabel ||
    changed.icon
  );
}

async function resolverPropsMetricCardDinamicos(
  props: LyraMetricCardBlockProps
) {
  const dynamicSource = props.dynamicSource ?? 'manual';

  if (dynamicSource === 'manual') {
    return {
      props: {
        dynamicSource,
      },
    };
  }

  const assinatura = await obterResumoAssinaturaLyra();
  const icon: LyraMetricCardBlockProps['icon'] =
    assinatura.tendenciaDirecao === 'down'
      ? 'shield'
      : assinatura.planoKey === 'care'
        ? 'sparkles'
        : 'activity';

  return {
    props: {
      dynamicSource,
      eyebrow: `Plano ${assinatura.planoNome}`,
      value: String(assinatura.recursosAtivos),
      unit: 'recursos',
      description: assinatura.descricaoCurta,
      trendLabel: assinatura.tendenciaRotulo,
      trendDirection: assinatura.tendenciaDirecao,
      badgeLabel: assinatura.badgeLabel,
      icon,
    },
    readOnly: camposSomenteLeituraMetricCard,
  };
}

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
    dynamicSource: {
      type: 'select',
      label: 'Fonte dinâmica',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Resumo da assinatura', value: 'subscription-summary' },
      ],
    },
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
    dynamicSource: 'manual',
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
  resolveData: async (data, params) => {
    const props = (data.props ?? {}) as Partial<LyraMetricCardBlockProps>;
    const changed = params.changed as Partial<
      Record<keyof LyraMetricCardBlockProps, boolean>
    >;
    const dynamicSource =
      (props.dynamicSource as LyraMetricCardBlockProps['dynamicSource']) ??
      'manual';

    if (
      params.trigger !== 'load' &&
      params.trigger !== 'force' &&
      !deveResolverMetricCard(changed)
    ) {
      return {
        props: {
          dynamicSource,
        },
        readOnly:
          dynamicSource === 'manual' ? {} : camposSomenteLeituraMetricCard,
      };
    }

    if (
      params.trigger !== 'load' &&
      params.trigger !== 'force' &&
      (params.lastData?.props as Partial<LyraMetricCardBlockProps> | undefined)
        ?.dynamicSource === dynamicSource
    ) {
      return {
        props: {
          dynamicSource,
        },
        readOnly:
          dynamicSource === 'manual' ? {} : camposSomenteLeituraMetricCard,
      };
    }

    return resolverPropsMetricCardDinamicos({
      dynamicSource,
      eyebrow: String(props.eyebrow ?? ''),
      value: String(props.value ?? ''),
      unit: String(props.unit ?? ''),
      description: String(props.description ?? ''),
      trendLabel: String(props.trendLabel ?? ''),
      trendDirection:
        (props.trendDirection as LyraMetricCardBlockProps['trendDirection']) ??
        'neutral',
      badgeLabel: String(props.badgeLabel ?? ''),
      icon: (props.icon as LyraMetricCardBlockProps['icon']) ?? 'activity',
    });
  },
  render: (props: Record<string, unknown>) => (
    <LyraMetricCardBlock
      dynamicSource={
        (props.dynamicSource as LyraMetricCardBlockProps['dynamicSource']) ??
        'manual'
      }
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
} satisfies ComponentConfig<LyraMetricCardBlockProps>;
