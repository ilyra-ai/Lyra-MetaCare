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
  IconeDecorativo,
  obterApresentacaoTrend,
} from '@/lib/puck/config/components/helpers';
import { obterResumoAssinaturaLyra } from '@/lib/puck/dynamic/metrics';
import {
  criarCamposBaseMetricCardLyra,
  resolverCamposMetricCardLyra,
} from '@/lib/puck/fields/dynamic';
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
  const trend = obterApresentacaoTrend(trendDirection);

  return (
    <Card className="h-full">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {eyebrow}
            </p>
            <CardTitle className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-display text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-4xl">
              <span className="min-w-0 break-words">{value}</span>
              {unit ? (
                <span className="text-sm font-medium tracking-normal text-muted-foreground">
                  {unit}
                </span>
              ) : null}
            </CardTitle>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-primary">
            <IconeDecorativo icone={icon} className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription>{description}</CardDescription>
        <div className="flex flex-wrap items-center gap-3">
          {badgeLabel ? <Badge variant="default">{badgeLabel}</Badge> : null}
          <div
            className={`inline-flex min-w-0 items-center gap-2 text-sm font-medium ${trend.classe}`}
          >
            <trend.Icone className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{trendLabel || trend.texto}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const lyraMetricCardBlockConfig = {
  label: 'Card de métrica',
  fields: criarCamposBaseMetricCardLyra(),
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
  resolveFields: (data, params) => {
    const dynamicSource =
      (data.props
        ?.dynamicSource as LyraMetricCardBlockProps['dynamicSource']) ??
      'manual';
    const trendDirection =
      (data.props
        ?.trendDirection as LyraMetricCardBlockProps['trendDirection']) ??
      'neutral';

    if (
      !params.changed.dynamicSource &&
      !params.changed.trendDirection &&
      !params.changed.icon &&
      !params.changed.badgeLabel &&
      params.lastFields
    ) {
      return params.lastFields;
    }

    return resolverCamposMetricCardLyra({
      dynamicSource,
      trendDirection,
      eyebrow: String(data.props?.eyebrow ?? ''),
      value: String(data.props?.value ?? ''),
      unit: String(data.props?.unit ?? ''),
      description: String(data.props?.description ?? ''),
      trendLabel: String(data.props?.trendLabel ?? ''),
      badgeLabel: String(data.props?.badgeLabel ?? ''),
      icon:
        (data.props?.icon as LyraMetricCardBlockProps['icon']) ?? 'activity',
    });
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
