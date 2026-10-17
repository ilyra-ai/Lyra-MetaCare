'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BedDouble,
  Bot,
  Droplets,
  HeartPulse,
  MoonStar,
  Sparkles,
  TimerReset,
  Waves,
  Bluetooth,
  BluetoothConnected,
} from 'lucide-react';

import { useDailyMetrics } from '@/hooks/use-daily-metrics';
import { useMetaDeSono } from '@/hooks/use-meta-de-sono';
import { resumoDoGrafico } from '@/lib/graficos/resumo';
import { useAIScores } from '@/hooks/use-ai-scores';
import { useProfile } from '@/hooks/use-profile';
import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { useHealthOrchestrator } from '@/context/HealthOrchestratorContext';
import { isPlanFeatureEnabled } from '@/lib/plans/access';
import { scaleRem } from '@/lib/site-page-config/runtime';
import { cn } from '@/lib/utils';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';
import { AITipsCard } from './AITipsCard';
import { MetricGrid } from './MetricGrid';
import { LyraIntelligence2026 } from './LyraIntelligence2026';
import { VedicDashboard } from './VedicDashboard';
import { AssessmentCard } from './AssessmentCard';
import { PuckClientRenderer } from '@/components/puck/PuckClientRenderer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartFigure,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { SeuDiaCard } from '@/components/coach/SeuDiaCard';
import { BotaoRegistroDoDia } from '@/components/metricas/RegistroDoDia';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const weeklyChartConfig = {
  prontidao: {
    label: 'Prontidão',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function formatWeekday(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
  })
    .format(new Date(`${date}T12:00:00`))
    .replace('.', '');
}

/** "7h30" ou "8h" (meta de sono). */
function formatarHoras(minutos: number) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0
    ? `${horas}h`
    : `${horas}h${String(resto).padStart(2, '0')}`;
}

const PERCENTUAL = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
  signDisplay: 'exceptZero',
});

function formatDelta(delta: number) {
  if (delta === 0 || Number.isNaN(delta)) {
    return 'Estável';
  }

  return `${PERCENTUAL.format(delta)}%`;
}

/** Variação contra o dia anterior; null quando falta um dos dois registros. */
function calculateDelta(
  current: number | null | undefined,
  previous: number | null | undefined
) {
  if (
    current === null ||
    current === undefined ||
    previous === null ||
    previous === undefined ||
    previous === 0
  ) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function getDeltaVisual(delta: number) {
  if (delta > 0) {
    return {
      icon: ArrowUpRight,
      className: 'text-success',
    };
  }

  if (delta < 0) {
    return {
      icon: ArrowDownRight,
      className: 'text-destructive',
    };
  }

  return {
    icon: TimerReset,
    className: 'text-muted-foreground',
  };
}

function LoadingDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-80 md:col-span-2" />
        <Skeleton className="h-80 md:col-span-2" />
        <Skeleton className="h-72 xl:col-span-2" />
        <Skeleton className="h-72 xl:col-span-2" />
        <Skeleton className="h-72 md:col-span-2 xl:col-span-4" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-96" />
      <Skeleton className="h-144" />
    </div>
  );
}

interface MiniMetricCardProps {
  title: string;
  value: string;
  description: string;
  tone: 'primary' | 'warning' | 'info' | 'success' | 'golden';
  icon: React.ElementType;
  /** null: sem registro hoje ou ontem para comparar. */
  delta: number | null;
}

/** Fundo suave + ícone de cada tom (o coral fica só para astral/IA). */
const miniMetricToneStyles: Record<MiniMetricCardProps['tone'], string> = {
  primary: 'bg-sidebar-accent text-primary',
  warning: 'bg-warning-light text-warning',
  info: 'bg-info-light text-info',
  success: 'bg-success-light text-success',
  golden: 'bg-golden-light text-golden',
};

function MiniMetricCard({
  title,
  value,
  description,
  tone,
  icon: Icon,
  delta,
}: MiniMetricCardProps) {
  const deltaVisual = delta === null ? null : getDeltaVisual(delta);
  const DeltaIcon = deltaVisual?.icon ?? null;

  return (
    <Card className="min-w-0">
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <div
            aria-hidden="true"
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full',
              miniMetricToneStyles[tone]
            )}
          >
            <Icon className="size-4" />
          </div>
        </div>

        <p className="break-words font-display text-4xl font-semibold tracking-[-0.03em] text-foreground">
          {value}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="min-w-0 text-caption leading-5 text-muted-foreground">
            {description}
          </p>
          {delta !== null && deltaVisual && DeltaIcon ? (
            <div
              className={cn(
                'flex shrink-0 items-center gap-1',
                deltaVisual.className
              )}
            >
              <DeltaIcon aria-hidden="true" className="size-4" />
              <span className="text-caption font-medium">
                {formatDelta(delta)}
                <span className="sr-only"> em relação a ontem</span>
              </span>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { config: appConfig } = usePublicSitePageConfig('app');
  const { data: subscription, loading: subscriptionLoading } =
    useAccountSubscription();
  const {
    astrology,
    isSyncing,
    syncError,
    vitals,
    triggerManualSync,
    bluetoothConnect,
    bluetoothDisconnect,
    isBluetoothConnected,
  } = useHealthOrchestrator();

  const dashboardEnabled = isPlanFeatureEnabled(
    subscription,
    'dashboard_access'
  );
  const aiScoresEnabled = isPlanFeatureEnabled(subscription, 'ai_scores');
  const aiTipsEnabled = isPlanFeatureEnabled(subscription, 'ai_tips_feed');

  const {
    metrics,
    todayMetrics,
    loading: metricsLoading,
  } = useDailyMetrics(7, dashboardEnabled);
  const { scores, loading: scoresLoading } = useAIScores(aiScoresEnabled);
  const {
    profile: intelligenceProfile,
    chronologicalAge,
    isFemale,
  } = useProfile(dashboardEnabled);

  const { meta: metaDeSono } = useMetaDeSono();

  const loading = subscriptionLoading || metricsLoading || scoresLoading;

  const previousMetrics =
    metrics.length > 1 ? metrics[metrics.length - 2] : null;

  const readinessScore =
    scores?.readinessScore ?? todayMetrics?.readiness_score ?? null;
  const longevityScore = scores?.longevityScore ?? null;
  // "Bloqueado" só quando o plano não inclui os scores; sem dados, "—".
  const rotuloDaLongevidade = !aiScoresEnabled
    ? 'Bloqueado'
    : longevityScore !== null
      ? longevityScore.toLocaleString('pt-BR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })
      : '—';
  const detalheDaLongevidade = !aiScoresEnabled
    ? 'Disponível em planos com scores de IA.'
    : scores && longevityScore !== null
      ? `Escala de 0 a 10, com ${scores.cobertura} de ${scores.totalDeMetricas} métricas medidas hoje.`
      : `Precisa de pelo menos 3 métricas medidas hoje${
          scores ? ` (agora: ${scores.cobertura})` : ''
        }.`;
  const sleepMinutes = todayMetrics?.sleep_duration_minutes ?? null;
  const deepSleepMinutes = todayMetrics?.deep_sleep_minutes ?? null;
  const remSleepMinutes = todayMetrics?.rem_sleep_minutes ?? null;
  // Meta de sono da própria pessoa (ou a sugestão do catálogo de metas);
  // antes, 8 horas fixas para todos.
  const sleepGoalMinutes = metaDeSono.minutos;
  const rotuloDaMetaDeSono = `${formatarHoras(sleepGoalMinutes)} por noite${
    metaDeSono.origem === 'sugestao' ? ' (sugestão)' : ''
  }`;
  const sleepProgress =
    sleepMinutes === null
      ? 0
      : Math.min(100, Math.round((sleepMinutes / sleepGoalMinutes) * 100));
  const stepsDelta = calculateDelta(
    todayMetrics?.steps,
    previousMetrics?.steps
  );
  const hydrationDelta = calculateDelta(
    todayMetrics?.water_liters,
    previousMetrics?.water_liters
  );
  const meditationDelta = calculateDelta(
    todayMetrics?.meditation_minutes,
    previousMetrics?.meditation_minutes
  );
  const glucoseDelta = calculateDelta(
    todayMetrics?.blood_glucose_mgdl,
    previousMetrics?.blood_glucose_mgdl
  );

  const hrvHoje = todayMetrics?.hrv_ms ?? null;
  const pulseValue = hrvHoje ?? readinessScore ?? null;
  const pulseUnit = hrvHoje !== null ? 'ms' : '/100';
  const pulseLabel =
    hrvHoje !== null ? 'Variabilidade cardíaca' : 'Prontidão geral';

  // Uma única grandeza no gráfico (tarefa 57): VFC em ms quando há VFC na
  // semana; senão, a prontidão de 0 a 100. Antes a mesma linha misturava ms
  // e pontuação, dia a dia. Dias sem registro ficam null (lacuna), nunca 0.
  const trajetoriaPelaVfc = metrics.some((metric) => metric.hrv_ms !== null);
  const serieDaTrajetoria = trajetoriaPelaVfc
    ? { rotulo: 'Variabilidade cardíaca (VFC)', unidade: 'ms' }
    : { rotulo: 'Prontidão geral', unidade: '/100' };
  const pulseTrendData = metrics.map((metric) => ({
    dia: formatWeekday(metric.date),
    pulso: trajetoriaPelaVfc ? metric.hrv_ms : metric.readiness_score,
  }));
  const temTrajetoria = pulseTrendData.some((ponto) => ponto.pulso !== null);
  const configDaTrajetoria = {
    pulso: { label: serieDaTrajetoria.rotulo, color: 'hsl(var(--primary))' },
  } satisfies ChartConfig;

  const weeklyFlowData = metrics.map((metric) => {
    const valor = metric.readiness_score ?? metric.recovery_score;
    return {
      dia: formatWeekday(metric.date),
      prontidao: valor === null ? null : Math.round(valor),
    };
  });
  const temSemana = weeklyFlowData.some((ponto) => ponto.prontidao !== null);

  const passosHoje = todayMetrics?.steps ?? null;
  const aguaHoje = todayMetrics?.water_liters ?? null;
  const meditacaoHoje = todayMetrics?.meditation_minutes ?? null;
  const glicoseHoje = todayMetrics?.blood_glucose_mgdl ?? null;

  const miniMetrics: MiniMetricCardProps[] = [
    {
      title: 'Passos do dia',
      value: passosHoje === null ? '—' : passosHoje.toLocaleString('pt-BR'),
      description:
        passosHoje === null
          ? 'Sem registro hoje: registre no check-in.'
          : 'Ritmo corporal e constância do movimento.',
      tone: 'primary',
      icon: Activity,
      delta: stepsDelta,
    },
    {
      title: 'Hidratação',
      value:
        aguaHoje === null
          ? '—'
          : `${aguaHoje.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} L`,
      description:
        aguaHoje === null
          ? 'Sem registro hoje: registre no check-in.'
          : 'Presença hídrica ao longo da jornada.',
      tone: 'info',
      icon: Droplets,
      delta: hydrationDelta,
    },
    {
      title: 'Meditação',
      value: meditacaoHoje === null ? '—' : `${meditacaoHoje} min`,
      description:
        meditacaoHoje === null
          ? 'Sem registro hoje: registre no check-in.'
          : 'Espaço de regulação e foco suave.',
      tone: 'success',
      icon: Waves,
      delta: meditationDelta,
    },
    {
      title: 'Glicose atual',
      value:
        glicoseHoje === null
          ? '—'
          : `${glicoseHoje.toLocaleString('pt-BR')} mg/dL`,
      description:
        glicoseHoje === null
          ? 'Sem leitura hoje: registre no check-in ou conecte o sensor.'
          : 'Leitura disponível do metabolismo do dia.',
      tone: 'golden',
      icon: Sparkles,
      delta: glucoseDelta,
    },
  ];

  const syncBadgeVariant = isSyncing
    ? 'info'
    : syncError
      ? 'warning'
      : 'success';

  const syncBadgeLabel = isSyncing
    ? appConfig.dashboard.syncStatusLoading
    : syncError
      ? appConfig.dashboard.syncStatusPartial
      : appConfig.dashboard.syncStatusReady;

  const syncSummary = isSyncing
    ? 'Reavaliando sinais disponíveis e o céu do momento.'
    : syncError
      ? syncError
      : todayMetrics?.registrado
        ? 'Leitura consolidada com os registros de hoje, do dispositivo e da sua conta.'
        : 'Ainda não há registro hoje: faça o check-in ou conecte um dispositivo.';

  const astroTitle = astrology
    ? `Lua em ${astrology.moonSign}`
    : appConfig.dashboard.astroCardFallbackTitle;
  const astroDetail = astrology
    ? astrology.impactOnHealth.energy
    : appConfig.dashboard.astroCardFallbackDescription;

  const handleSyncNow = async () => {
    await triggerManualSync();
  };

  if (loading) {
    return <LoadingDashboard />;
  }

  if (!subscription || !dashboardEnabled) {
    return (
      <PlanUpgradeNotice
        currentPlanKey={subscription?.plan.key ?? 'free'}
        title="Painel completo indisponível"
        description="O painel completo não faz parte do seu plano atual. Conheça os planos que incluem esta visão."
      />
    );
  }

  return (
    // `pb-24`: espaço no fim da página para o botão flutuante "Ações rápidas"
    // (QuickScanFAB) não cobrir o último cartão, sobretudo no celular.
    <div className="flex flex-col gap-6 pb-24">
      <div className="w-full relative z-20">
        <PuckClientRenderer documentKey="dashboard" />
      </div>

      {/* Coach diário (tarefa 42): o feed de dicas de IA do plano. */}
      {aiTipsEnabled ? <SeuDiaCard /> : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="min-w-0 md:col-span-2">
          <CardHeader className="gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-3">
                <Badge variant="default" className="self-start">
                  {appConfig.dashboard.pulseBadge}
                </Badge>
                <div className="flex flex-col gap-1">
                  <CardTitle
                    className="md:text-3xl"
                    style={{
                      fontSize: scaleRem(1.5, appConfig.typography.pageTitle),
                    }}
                  >
                    {appConfig.dashboard.pulseTitle}
                  </CardTitle>
                  <CardDescription
                    className="max-w-2xl"
                    style={{
                      fontSize: scaleRem(0.95, appConfig.typography.pageBody),
                    }}
                  >
                    {appConfig.dashboard.pulseDescription}
                  </CardDescription>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <BotaoRegistroDoDia />
                <Button
                  variant="outline"
                  className={cn(
                    isBluetoothConnected && 'border-primary text-primary'
                  )}
                  onClick={() =>
                    isBluetoothConnected
                      ? bluetoothDisconnect()
                      : bluetoothConnect()
                  }
                >
                  {isBluetoothConnected ? (
                    <BluetoothConnected aria-hidden="true" />
                  ) : (
                    <Bluetooth aria-hidden="true" />
                  )}
                  {isBluetoothConnected ? 'Cinta conectada' : 'Conectar cinta'}
                </Button>
                {/* Rótulo editável no construtor de UI
                    (app.dashboard.syncButtonLabel); antes o botão só tinha
                    ícone e um texto fixo para leitores de tela. */}
                <Button
                  variant="secondary"
                  onClick={() => void handleSyncNow()}
                  disabled={isSyncing}
                  aria-busy={isSyncing}
                >
                  <TimerReset aria-hidden="true" />
                  {isSyncing
                    ? 'Atualizando...'
                    : appConfig.dashboard.syncButtonLabel}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                {pulseLabel}
              </p>
              <p className="font-display text-4xl font-semibold tracking-[-0.03em] text-foreground">
                {pulseValue !== null ? Math.round(pulseValue) : '—'}
                {pulseValue !== null ? (
                  <span className="ml-1 text-base font-medium text-muted-foreground">
                    {pulseUnit}
                  </span>
                ) : null}
              </p>
              {pulseValue === null ? (
                <p className="text-caption text-muted-foreground">
                  Sem VFC nem prontidão hoje: faça o check-in ou conecte a
                  pulseira.
                </p>
              ) : null}
              {pulseValue !== null && pulseUnit === '/100' ? (
                <Progress
                  aria-label="Prontidão geral de 0 a 100"
                  value={Math.min(100, Math.round(pulseValue))}
                  className="h-1.5"
                />
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-full border border-border bg-background px-3 py-1.5 text-caption text-foreground">
                FC repouso:{' '}
                <span className="font-semibold">
                  {todayMetrics?.resting_heart_rate
                    ? `${todayMetrics.resting_heart_rate} bpm`
                    : vitals?.heartRate
                      ? `${Math.round(vitals.heartRate)} bpm`
                      : 'Sem leitura'}
                </span>
              </div>
              <div className="rounded-full border border-border bg-background px-3 py-1.5 text-caption text-foreground">
                Longevidade:{' '}
                <span className="font-semibold">{rotuloDaLongevidade}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-md border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <HeartPulse
                    aria-hidden="true"
                    className="size-4 text-primary"
                  />
                  <span className="text-sm font-semibold text-foreground">
                    Estado atual
                  </span>
                </div>
                <Badge variant={syncBadgeVariant}>{syncBadgeLabel}</Badge>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {syncSummary}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex min-w-0 flex-col md:col-span-2">
          <CardHeader className="gap-1">
            <CardTitle>Trajetória recente</CardTitle>
            <CardDescription>
              {serieDaTrajetoria.rotulo} nos últimos 7 dias (
              {serieDaTrajetoria.unidade === 'ms' ? 'em ms' : 'de 0 a 100'}).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {temTrajetoria ? (
              <ChartFigure
                resumo={resumoDoGrafico('Trajetória dos últimos 7 dias', [
                  {
                    nome: serieDaTrajetoria.rotulo,
                    valores: pulseTrendData.map((ponto) => ponto.pulso),
                    unidade: serieDaTrajetoria.unidade,
                  },
                ])}
              >
                <ChartContainer
                  config={configDaTrajetoria}
                  className="aspect-auto h-64 w-full border-none bg-transparent p-0"
                >
                  <AreaChart
                    data={pulseTrendData}
                    margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="dia"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={12}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={40}
                      allowDecimals={false}
                      domain={
                        serieDaTrajetoria.unidade === '/100'
                          ? [0, 100]
                          : ['auto', 'auto']
                      }
                      unit={serieDaTrajetoria.unidade === 'ms' ? ' ms' : ''}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Area
                      type="monotone"
                      dataKey="pulso"
                      stroke="var(--color-pulso)"
                      fill="var(--color-pulso)"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </ChartFigure>
            ) : (
              <div className="flex min-h-48 flex-1 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background p-6 text-center">
                <Activity
                  aria-hidden="true"
                  className="size-6 text-muted-foreground"
                />
                <p className="text-sm text-muted-foreground">
                  Ainda não há leituras suficientes para desenhar a trajetória.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 xl:col-span-2">
          <CardHeader className="gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <MoonStar
                  aria-hidden="true"
                  className="size-5 shrink-0 text-cosmic"
                />
                <Badge variant="cosmic">{appConfig.dashboard.astroBadge}</Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-2xl">{astroTitle}</CardTitle>
              <p className="text-body leading-relaxed text-foreground/80">
                {astroDetail}
              </p>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {astrology?.nakshatra || astrology?.paksha || astrology?.tithi ? (
              <div className="flex flex-wrap gap-2">
                {[astrology?.nakshatra, astrology?.paksha, astrology?.tithi]
                  .filter((chip): chip is string => Boolean(chip))
                  .map((chip, index) => (
                    <span
                      key={`${index}-${chip}`}
                      className="rounded-full bg-cosmic-light px-2.5 py-1 text-caption font-medium text-cosmic-strong"
                    >
                      {chip}
                    </span>
                  ))}
              </div>
            ) : null}

            <div className="rounded-md border border-border bg-background p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {appConfig.dashboard.astroInsightLabel}
              </p>
              <p className="mt-2 text-body leading-relaxed text-foreground/80">
                {astrology?.impactOnHealth.stress ??
                  appConfig.dashboard.astroInsightFallback}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 xl:col-span-2">
          <CardHeader className="gap-4">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="info">{appConfig.dashboard.sleepBadge}</Badge>
              <div
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-full bg-info-light text-info"
              >
                <BedDouble className="size-4" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-4xl tracking-[-0.03em]">
                {sleepMinutes !== null
                  ? formatMinutes(sleepMinutes)
                  : 'Sem dados'}
              </CardTitle>
              <CardDescription>
                {sleepMinutes !== null
                  ? appConfig.dashboard.sleepDescription
                  : appConfig.dashboard.sleepEmptyDescription}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {appConfig.dashboard.sleepGoalLabel}
                </span>
                <span className="font-medium text-foreground">
                  {rotuloDaMetaDeSono}
                </span>
              </div>
              <Progress
                aria-label={`Sono em relação à meta de ${formatarHoras(sleepGoalMinutes)}`}
                value={sleepProgress}
              />
              {metaDeSono.origem === 'sugestao' ? (
                <p className="text-caption leading-5 text-muted-foreground">
                  Crie a meta “Sono por noite” em Metas para usar o seu alvo.
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {appConfig.dashboard.deepSleepLabel}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-foreground">
                  {deepSleepMinutes !== null
                    ? formatMinutes(deepSleepMinutes)
                    : '—'}
                </p>
              </div>
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {appConfig.dashboard.remSleepLabel}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-foreground">
                  {remSleepMinutes !== null
                    ? formatMinutes(remSleepMinutes)
                    : '—'}
                </p>
              </div>
            </div>

            <p className="text-caption leading-5 text-muted-foreground">
              {astrology?.impactOnHealth.sleep ??
                appConfig.dashboard.sleepInsightFallback}
            </p>
          </CardContent>
        </Card>

        <div className="md:col-span-2 xl:col-span-4">
          <AITipsCard
            className="h-full"
            featureEnabled={aiTipsEnabled}
            currentPlanKey={subscription.plan.key}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {miniMetrics.map((metric) => (
          <MiniMetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <Card className="min-w-0">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <Badge variant="secondary" className="self-start">
                {appConfig.dashboard.weeklyBadge}
              </Badge>
              <CardTitle className="text-2xl">
                {appConfig.dashboard.weeklyTitle}
              </CardTitle>
              <CardDescription>
                {appConfig.dashboard.weeklyDescription}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-caption text-muted-foreground">
              <Bot aria-hidden="true" className="size-4 text-accent" />
              {appConfig.dashboard.aiUnlockedLabel}:{' '}
              <span className="font-semibold text-foreground">
                {aiScoresEnabled
                  ? appConfig.dashboard.aiUnlockedYes
                  : appConfig.dashboard.aiUnlockedNo}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {temSemana ? (
            <ChartFigure
              resumo={resumoDoGrafico('Prontidão nos últimos 7 dias', [
                {
                  nome: 'Prontidão',
                  valores: weeklyFlowData.map((ponto) => ponto.prontidao),
                  unidade: '/100',
                },
              ])}
            >
              <ChartContainer
                config={weeklyChartConfig}
                className="aspect-auto h-72 w-full border-none bg-transparent p-0 md:h-80"
              >
                <AreaChart
                  data={weeklyFlowData}
                  margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="dia"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={36}
                    domain={[0, 100]}
                    ticks={[0, 50, 100]}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Area
                    type="monotone"
                    dataKey="prontidao"
                    stroke="var(--color-prontidao)"
                    fill="var(--color-prontidao)"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </ChartFigure>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background p-6 text-center">
              <Activity
                aria-hidden="true"
                className="size-6 text-muted-foreground"
              />
              <p className="text-sm text-muted-foreground">
                Ainda não há leituras da semana para exibir a prontidão.
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2 rounded-md border border-border p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {appConfig.dashboard.currentReadinessLabel}
              </p>
              <p className="font-display text-4xl font-semibold tracking-[-0.03em] text-foreground">
                {readinessScore !== null ? Math.round(readinessScore) : '—'}
                {readinessScore !== null ? (
                  <span className="ml-1 text-base font-medium text-muted-foreground">
                    /100
                  </span>
                ) : null}
              </p>
              {readinessScore === null ? (
                <p className="text-caption text-muted-foreground">
                  Registre ao menos dois sinais hoje (sono, energia, humor,
                  estresse ou a pulseira).
                </p>
              ) : null}
              {readinessScore !== null ? (
                <Progress
                  aria-label="Prontidão atual de 0 a 100"
                  value={Math.min(100, Math.round(readinessScore))}
                  className="h-1.5"
                />
              ) : null}
            </div>
            <div className="flex flex-col gap-2 rounded-md border border-border p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {appConfig.dashboard.longevityLabel}
              </p>
              <p className="font-display text-4xl font-semibold tracking-[-0.03em] text-foreground">
                {rotuloDaLongevidade}
              </p>
              <p className="text-caption text-muted-foreground">
                {detalheDaLongevidade}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-md border border-border p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {appConfig.dashboard.liveContextLabel}
              </p>
              <p className="text-body leading-relaxed text-foreground/80">
                {astrology?.impactOnHealth.energy ??
                  appConfig.dashboard.liveContextFallback}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <LyraIntelligence2026
        metrics={metrics}
        todayMetrics={todayMetrics}
        profile={intelligenceProfile}
        chronologicalAge={chronologicalAge}
        isFemale={isFemale}
        readinessScore={readinessScore}
      />

      {/* `todayMetrics` sempre existe (linha do dia com `registrado: false`):
          sem testar o registro, o estado vazio nunca aparecia. */}
      {todayMetrics?.registrado ? (
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground">
              {appConfig.dashboard.pillarsTitle}
            </h2>
            <p className="max-w-3xl text-body leading-relaxed text-muted-foreground">
              {appConfig.dashboard.pillarsDescription}
            </p>
          </div>
          <MetricGrid metrics={todayMetrics} />
        </section>
      ) : (
        <Card className="border-dashed">
          <CardHeader className="gap-3">
            <CardTitle className="text-2xl">
              {appConfig.dashboard.emptyMetricsTitle}
            </CardTitle>
            <CardDescription>
              {appConfig.dashboard.emptyMetricsDescription}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <section className="flex flex-col gap-5">
        <AssessmentCard />
      </section>

      <VedicDashboard featureEnabled={dashboardEnabled} />
    </div>
  );
}
