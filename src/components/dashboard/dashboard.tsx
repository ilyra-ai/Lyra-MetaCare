'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BedDouble,
  Bot,
  BrainCircuit,
  Droplets,
  HeartPulse,
  MoonStar,
  Orbit,
  Sparkles,
  TimerReset,
  Waves,
  Bluetooth,
  BluetoothConnected,
} from 'lucide-react';

import { useDailyMetrics } from '@/hooks/use-daily-metrics';
import { useAIScores } from '@/hooks/use-ai-scores';
import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { useHealthOrchestrator } from '@/context/HealthOrchestratorContext';
import { isPlanFeatureEnabled } from '@/lib/plans/access';
import { scaleRem } from '@/lib/site-page-config/runtime';
import { cn } from '@/lib/utils';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';
import { AITipsCard } from './AITipsCard';
import { MetricGrid } from './MetricGrid';
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
    color: 'hsl(var(--accent))',
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
        <Skeleton className="h-[20rem] md:col-span-2" />
        <Skeleton className="h-[20rem]" />
        <Skeleton className="h-[20rem]" />
        <Skeleton className="h-[18rem] md:col-span-2 xl:col-span-4" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-[24rem]" />
      <Skeleton className="h-[36rem]" />
    </div>
  );
}

interface MiniMetricCardProps {
  title: string;
  value: string;
  description: string;
  tone: 'primary' | 'accent' | 'cosmic' | 'info' | 'success' | 'golden';
  icon: React.ElementType;
  delta: number;
}

function MiniMetricCard({
  title,
  value,
  description,
  tone,
  icon: Icon,
  delta,
}: MiniMetricCardProps) {
  const toneStyles = {
    primary: 'bg-primary/12 text-primary',
    accent: 'bg-accent/12 text-accent',
    cosmic: 'bg-cosmic/12 text-cosmic',
    info: 'bg-info/12 text-info',
    success: 'bg-success/12 text-success',
    golden: 'bg-golden/12 text-golden',
  };

  const deltaVisual = getDeltaVisual(delta);
  const DeltaIcon = deltaVisual.icon;

  return (
    <Card className="border-border/70 bg-card/90 backdrop-blur-xl">
      <CardContent className="flex h-full flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {title}
            </p>
            <p className="font-mono text-3xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
          </div>
          <div
            className={cn(
              'flex size-11 items-center justify-center rounded-2xl shadow-sm',
              toneStyles[tone]
            )}
          >
            <Icon />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
          <div
            className={cn('flex items-center gap-1.5', deltaVisual.className)}
          >
            <DeltaIcon />
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">
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
    isBluetoothConnected 
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
      tone: 'accent',
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
      tone: 'cosmic',
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
    <div className="flex flex-col gap-6">
      <div className="w-full relative z-20">
        <PuckClientRenderer documentKey="dashboard" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="relative overflow-hidden border-primary/15 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.15)_0%,hsl(var(--card))_42%,hsl(var(--card))_100%)] md:col-span-2">
          <div className="orchestrated-orb -left-14 top-0 h-32 w-32 bg-primary/70" />
          <div className="orchestrated-orb bottom-0 right-0 h-28 w-28 bg-accent/45" />

          <CardHeader className="relative gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-3">
                <Badge variant="default">
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

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className={cn(isBluetoothConnected && "border-primary text-primary")}
                  onClick={() => isBluetoothConnected ? bluetoothDisconnect() : bluetoothConnect()}
                >
                  {isBluetoothConnected ? <BluetoothConnected className="mr-2" /> : <Bluetooth className="mr-2" />}
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

          <CardContent className="relative flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-end gap-3">
                  <span className="font-mono text-6xl font-semibold tracking-[-0.04em] text-foreground">
                    {pulseValue ? Math.round(pulseValue) : 'N/A'}
                  </span>
                  <span className="pb-2 font-mono text-xl text-muted-foreground">
                    {pulseValue ? pulseUnit : ''}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="rounded-full border border-primary/15 bg-primary/8 px-4 py-2 text-sm text-primary">
                    {pulseLabel}
                  </div>
                  <div className="rounded-full border border-border bg-card/80 px-4 py-2 text-sm text-foreground">
                    FC repouso:{' '}
                    <span className="font-semibold">
                      {todayMetrics?.resting_heart_rate
                        ? `${todayMetrics.resting_heart_rate} bpm`
                        : vitals?.heartRate
                          ? `${Math.round(vitals.heartRate)} bpm`
                          : 'Sem leitura'}
                    </span>
                  </div>
                  <div className="rounded-full border border-border bg-card/80 px-4 py-2 text-sm text-foreground">
                    Longevidade:{' '}
                    <span className="font-semibold">
                      {longevityScore ? longevityScore.toFixed(1) : 'Bloqueado'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 rounded-[24px] border border-white/75 bg-white/75 p-4 shadow-sm backdrop-blur-md">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <HeartPulse className="text-accent" />
                      <span className="text-sm font-semibold text-foreground">
                        Estado atual
                      </span>
                    </div>
                    <Badge variant={syncBadgeVariant}>{syncBadgeLabel}</Badge>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {syncSummary}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-[28px] border border-border/70 bg-card/85 p-4 backdrop-blur-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Trajetória recente
                </p>
                <ChartContainer
                  config={pulseChartConfig}
                  className="min-h-[12rem] border-none bg-transparent p-0 shadow-none"
                >
                  <AreaChart accessibilityLayer data={pulseTrendData}>
                    <defs>
                      <linearGradient
                        id="fillPulse"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-pulso)"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-pulso)"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
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
                      fill="url(#fillPulse)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-cosmic/15 bg-[radial-gradient(circle_at_top_right,hsl(var(--cosmic)/0.14)_0%,hsl(var(--card))_45%,hsl(var(--card))_100%)]">
          <div className="absolute right-4 top-4 text-cosmic/20">
            <Orbit className="size-28 animate-spin-slow" />
          </div>

          <CardHeader className="relative gap-5">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="cosmic">{appConfig.dashboard.astroBadge}</Badge>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-cosmic-light text-cosmic shadow-cosmic">
                <MoonStar />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-2xl">{astroTitle}</CardTitle>
              <CardDescription>{astroDetail}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="relative flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {astrology?.nakshatra ? (
                <Badge variant="secondary">{astrology.nakshatra}</Badge>
              ) : null}
              {astrology?.paksha ? (
                <Badge variant="cosmic">{astrology.paksha}</Badge>
              ) : null}
              {astrology?.tithi ? (
                <Badge variant="info">{astrology.tithi}</Badge>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {appConfig.dashboard.astroInsightLabel}
              </p>
              <p className="mt-3 text-sm leading-7 text-foreground">
                {astrology?.impactOnHealth.stress ??
                  appConfig.dashboard.astroInsightFallback}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-info/15 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--info)/0.16)_0%,hsl(var(--card))_48%,hsl(var(--card))_100%)]">
          <CardHeader className="gap-5">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="info">{appConfig.dashboard.sleepBadge}</Badge>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-info-light text-info shadow-md">
                <BedDouble />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-2xl">
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
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {appConfig.dashboard.sleepGoalLabel}
                </span>
                <span className="font-medium text-foreground">
                  8h por noite
                </span>
              </div>
              <Progress value={sleepProgress} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] border border-border/70 bg-card/80 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {appConfig.dashboard.deepSleepLabel}
                </p>
                <p className="mt-2 font-mono text-2xl text-foreground">
                  {formatMinutes(deepSleepMinutes)}
                </p>
              </div>
              <div className="rounded-[20px] border border-border/70 bg-card/80 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {appConfig.dashboard.remSleepLabel}
                </p>
                <p className="mt-2 font-mono text-2xl text-foreground">
                  {formatMinutes(remSleepMinutes)}
                </p>
              </div>
            </div>

            <p className="text-sm leading-7 text-muted-foreground">
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

      <Card className="border-primary/10 bg-card/90 backdrop-blur-xl">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Badge variant="secondary">
                {appConfig.dashboard.weeklyBadge}
              </Badge>
              <CardTitle className="text-2xl">
                {appConfig.dashboard.weeklyTitle}
              </CardTitle>
              <CardDescription>
                {appConfig.dashboard.weeklyDescription}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
              <Bot className="text-primary" />
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
          <ChartContainer
            config={weeklyChartConfig}
            className="min-h-[22rem] border-none bg-transparent p-0 shadow-none"
          >
            <AreaChart accessibilityLayer data={weeklyFlowData}>
              <defs>
                <linearGradient id="fillReadiness" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-prontidao)"
                    stopOpacity={0.32}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-prontidao)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="dia"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="prontidao"
                stroke="var(--color-prontidao)"
                fill="url(#fillReadiness)"
                strokeWidth={3}
              />
            </AreaChart>
          </ChartContainer>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[22px] border border-border/70 bg-card/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {appConfig.dashboard.currentReadinessLabel}
              </p>
              <p className="mt-2 font-mono text-3xl text-foreground">
                {readinessScore ? Math.round(readinessScore) : 'N/A'}
              </p>
            </div>
            <div className="rounded-[22px] border border-border/70 bg-card/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {appConfig.dashboard.longevityLabel}
              </p>
              <p className="mt-2 font-mono text-3xl text-foreground">
                {longevityScore ? longevityScore.toFixed(1) : 'Bloqueado'}
              </p>
            </div>
            <div className="rounded-[22px] border border-border/70 bg-card/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {appConfig.dashboard.liveContextLabel}
              </p>
              <p className="mt-2 text-sm leading-7 text-foreground">
                {astrology?.impactOnHealth.energy ??
                  appConfig.dashboard.liveContextFallback}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {todayMetrics ? (
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-display font-bold tracking-tight text-gradient-hero">
              {appConfig.dashboard.pillarsTitle}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              {appConfig.dashboard.pillarsDescription}
            </p>
          </div>
          <div className="rounded-[32px] border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-xl">
            <MetricGrid metrics={todayMetrics} />
          </div>
        </section>
      ) : (
        <Card className="border-dashed border-border/80 bg-card/80">
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
