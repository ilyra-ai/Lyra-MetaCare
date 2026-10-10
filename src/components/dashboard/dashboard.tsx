'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const pulseChartConfig = {
  pulso: {
    label: 'Pulso harmônico',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

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

function formatDelta(delta: number) {
  if (delta === 0 || Number.isNaN(delta)) {
    return 'Estável';
  }

  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`;
}

function calculateDelta(current: number | null, previous: number | null) {
  if (!current || !previous || previous === 0) {
    return 0;
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
  delta: number;
}

/** Fundo suave + ícone de cada tom (violeta fica só para astral/IA). */
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
  const deltaVisual = getDeltaVisual(delta);
  const DeltaIcon = deltaVisual.icon;

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
          <p className="min-w-0 text-[13px] leading-5 text-muted-foreground">
            {description}
          </p>
          <div
            className={cn(
              'flex shrink-0 items-center gap-1',
              deltaVisual.className
            )}
          >
            <DeltaIcon aria-hidden="true" className="size-4" />
            <span className="text-[13px] font-medium">
              {formatDelta(delta)}
            </span>
          </div>
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

  const loading = subscriptionLoading || metricsLoading || scoresLoading;

  const previousMetrics =
    metrics.length > 1 ? metrics[metrics.length - 2] : null;

  const readinessScore =
    scores?.readinessScore ?? todayMetrics?.readiness_score ?? null;
  const longevityScore = scores?.longevityScore ?? null;
  const sleepMinutes = todayMetrics?.sleep_duration_minutes ?? 0;
  const deepSleepMinutes = todayMetrics?.deep_sleep_minutes ?? 0;
  const remSleepMinutes = todayMetrics?.rem_sleep_minutes ?? 0;
  const sleepGoalMinutes = 8 * 60;
  const sleepProgress = Math.min(
    100,
    Math.round((sleepMinutes / sleepGoalMinutes) * 100)
  );
  const stepsDelta = calculateDelta(
    todayMetrics?.steps ?? 0,
    previousMetrics?.steps ?? 0
  );
  const hydrationDelta = calculateDelta(
    todayMetrics?.water_liters ?? 0,
    previousMetrics?.water_liters ?? 0
  );
  const meditationDelta = calculateDelta(
    todayMetrics?.meditation_minutes ?? 0,
    previousMetrics?.meditation_minutes ?? 0
  );
  const glucoseDelta = calculateDelta(
    todayMetrics?.blood_glucose_mgdl ?? 0,
    previousMetrics?.blood_glucose_mgdl ?? 0
  );

  const pulseValue = todayMetrics?.hrv_ms ?? readinessScore ?? null;
  const pulseUnit = todayMetrics?.hrv_ms ? 'ms' : '/100';
  const pulseLabel = todayMetrics?.hrv_ms
    ? 'Variabilidade cardíaca'
    : 'Prontidão geral';

  const pulseTrendData = metrics.map((metric) => ({
    dia: formatWeekday(metric.date),
    pulso: metric.hrv_ms ?? metric.readiness_score ?? 0,
  }));

  const weeklyFlowData = metrics.map((metric) => ({
    dia: formatWeekday(metric.date),
    prontidao: Math.round(metric.readiness_score ?? metric.recovery_score ?? 0),
  }));

  const miniMetrics: MiniMetricCardProps[] = [
    {
      title: 'Passos do dia',
      value: (todayMetrics?.steps ?? 0).toLocaleString('pt-BR'),
      description: 'Ritmo corporal e constância do movimento.',
      tone: 'primary',
      icon: Activity,
      delta: stepsDelta,
    },
    {
      title: 'Hidratação',
      value: `${(todayMetrics?.water_liters ?? 0).toFixed(1)} L`,
      description: 'Presença hídrica ao longo da jornada.',
      tone: 'info',
      icon: Droplets,
      delta: hydrationDelta,
    },
    {
      title: 'Meditação',
      value: `${todayMetrics?.meditation_minutes ?? 0} min`,
      description: 'Espaço de regulação e foco suave.',
      tone: 'success',
      icon: Waves,
      delta: meditationDelta,
    },
    {
      title: 'Glicose atual',
      value: todayMetrics?.blood_glucose_mgdl
        ? `${todayMetrics.blood_glucose_mgdl} mg/dL`
        : 'Sem leitura',
      description: 'Leitura disponível do metabolismo do dia.',
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
      : 'Última leitura consolidada com dados reais disponíveis no dispositivo e no banco.';

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
        title="Dashboard premium indisponível"
        description="O entitlement `dashboard_access` ainda não está liberado para a sua assinatura. O bloqueio desta visão continua aplicado de forma real."
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
                    <BluetoothConnected className="mr-2" />
                  ) : (
                    <Bluetooth className="mr-2" />
                  )}
                  {isBluetoothConnected ? 'BLE Ativo' : 'Parear Cinta'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => void handleSyncNow()}
                  disabled={isSyncing}
                >
                  <TimerReset />
                  <span className="sr-only">Atualizar Saúde</span>
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
                {pulseValue ? Math.round(pulseValue) : 'N/A'}
                {pulseValue ? (
                  <span className="ml-1 text-base font-medium text-muted-foreground">
                    {pulseUnit}
                  </span>
                ) : null}
              </p>
              {pulseValue && pulseUnit === '/100' ? (
                <Progress
                  aria-label="Prontidão geral de 0 a 100"
                  value={Math.min(100, Math.round(pulseValue))}
                  className="h-1.5"
                />
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-full border border-border bg-background px-3 py-1.5 text-[13px] text-foreground">
                FC repouso:{' '}
                <span className="font-semibold">
                  {todayMetrics?.resting_heart_rate
                    ? `${todayMetrics.resting_heart_rate} bpm`
                    : vitals?.heartRate
                      ? `${Math.round(vitals.heartRate)} bpm`
                      : 'Sem leitura'}
                </span>
              </div>
              <div className="rounded-full border border-border bg-background px-3 py-1.5 text-[13px] text-foreground">
                Longevidade:{' '}
                <span className="font-semibold">
                  {longevityScore ? longevityScore.toFixed(1) : 'Bloqueado'}
                </span>
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
            <CardDescription>{pulseChartConfig.pulso.label}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {pulseTrendData.length > 0 ? (
              <ChartContainer
                config={pulseChartConfig}
                className="aspect-auto h-64 w-full border-none bg-transparent p-0"
              >
                <AreaChart accessibilityLayer data={pulseTrendData}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="dia"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
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
              <p className="text-[15px] leading-relaxed text-foreground/80">
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
                      className="rounded-full bg-cosmic-light px-2.5 py-1 text-[13px] font-medium text-cosmic-strong"
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
              <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">
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
                {sleepMinutes > 0 ? formatMinutes(sleepMinutes) : 'Sem dados'}
              </CardTitle>
              <CardDescription>
                {sleepMinutes > 0
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
                  8h por noite
                </span>
              </div>
              <Progress
                aria-label="Sono em relação à meta de 8 horas"
                value={sleepProgress}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {appConfig.dashboard.deepSleepLabel}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-foreground">
                  {formatMinutes(deepSleepMinutes)}
                </p>
              </div>
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {appConfig.dashboard.remSleepLabel}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-foreground">
                  {formatMinutes(remSleepMinutes)}
                </p>
              </div>
            </div>

            <p className="text-[13px] leading-5 text-muted-foreground">
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
            <div className="flex flex-wrap items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-[13px] text-muted-foreground">
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
          {weeklyFlowData.length > 0 ? (
            <ChartContainer
              config={weeklyChartConfig}
              className="aspect-auto h-72 w-full border-none bg-transparent p-0 md:h-80"
            >
              <AreaChart accessibilityLayer data={weeklyFlowData}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="dia"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
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
                {readinessScore ? Math.round(readinessScore) : 'N/A'}
                {readinessScore ? (
                  <span className="ml-1 text-base font-medium text-muted-foreground">
                    /100
                  </span>
                ) : null}
              </p>
              {readinessScore ? (
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
                {longevityScore ? longevityScore.toFixed(1) : 'Bloqueado'}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-md border border-border p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {appConfig.dashboard.liveContextLabel}
              </p>
              <p className="text-[15px] leading-relaxed text-foreground/80">
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

      {todayMetrics ? (
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground">
              {appConfig.dashboard.pillarsTitle}
            </h2>
            <p className="max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
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
