'use client';

import {
  Card,
  Metric,
  Text,
  Flex,
  Grid,
  Title,
  AreaChart,
  BarChart,
  DonutChart,
  Divider,
  BadgeDelta,
} from '@tremor/react';
import { TrendingUp, Activity, BedDouble, Sparkles } from 'lucide-react';
import { useDailyMetrics } from '@/hooks/use-daily-metrics';
import { useAIScores } from '@/hooks/use-ai-scores';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { AITipsCard } from './AITipsCard';
import { MetricGrid } from './MetricGrid';
import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { isPlanFeatureEnabled } from '@/lib/plans/access';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';

const valueFormatter = (number: number) =>
  Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(number);

const deltaTypeForValue = (delta: number) => {
  if (delta > 10) return 'increase' as const;
  if (delta > 2) return 'moderateIncrease' as const;
  if (delta < -10) return 'decrease' as const;
  if (delta < -2) return 'moderateDecrease' as const;
  if (delta === 0) return 'unchanged' as const;
  return delta > 0 ? 'moderateIncrease' : 'moderateDecrease';
};

export function Dashboard() {
  const { data: subscription, loading: subscriptionLoading } =
    useAccountSubscription();

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

  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-[320px] w-full lg:col-span-2 rounded-2xl" />
        <Skeleton className="h-[320px] w-full lg:col-span-2 rounded-2xl" />
      </div>
    );
  }

  if (!subscription || !dashboardEnabled) {
    return (
      <PlanUpgradeNotice
        currentPlanKey={subscription?.plan.key ?? 'free'}
        title="Dashboard bloqueado pelo plano"
        description="O acesso à visão executiva do dashboard está vinculado ao entitlement `dashboard_access`. Hoje essa capacidade não está liberada para sua assinatura."
      />
    );
  }

  const previousMetrics =
    metrics.length > 1 ? metrics[metrics.length - 2] : null;

  const longevityScore = scores?.longevityScore ?? null;
  const readinessScore =
    scores?.readinessScore ?? todayMetrics?.readiness_score ?? null;
  const stepsToday = todayMetrics?.steps ?? 0;
  const stepsYesterday = previousMetrics?.steps ?? null;
  const sleepMinutesToday = todayMetrics?.sleep_duration_minutes ?? 0;
  const sleepMinutesYesterday = previousMetrics?.sleep_duration_minutes ?? null;

  const readinessYesterday = previousMetrics?.readiness_score ?? null;

  const stepsDelta =
    stepsYesterday && stepsYesterday > 0
      ? ((stepsToday - stepsYesterday) / stepsYesterday) * 100
      : 0;

  const sleepDelta =
    sleepMinutesYesterday && sleepMinutesYesterday > 0
      ? ((sleepMinutesToday - sleepMinutesYesterday) / sleepMinutesYesterday) *
        100
      : 0;

  const readinessDelta =
    readinessScore && readinessYesterday
      ? ((readinessScore - readinessYesterday) / readinessYesterday) * 100
      : 0;

  const stepsTrendData = metrics.map((metric) => ({
    day: format(new Date(metric.date), 'EEE'),
    Passos: metric.steps,
  }));

  const sleepTrendData = metrics.map((metric) => ({
    day: format(new Date(metric.date), 'EEE'),
    'Sono (h)': Number((metric.sleep_duration_minutes / 60).toFixed(2)),
  }));

  const sleepBreakdownData = todayMetrics
    ? [
        {
          name: 'Sono profundo',
          value: Number((todayMetrics.deep_sleep_minutes / 60).toFixed(2)),
        },
        {
          name: 'Sono REM',
          value: Number((todayMetrics.rem_sleep_minutes / 60).toFixed(2)),
        },
        {
          name: 'Sono leve',
          value: Number((todayMetrics.light_sleep_minutes / 60).toFixed(2)),
        },
      ].filter((segment) => segment.value > 0)
    : [];

  const iconBgMap: Record<string, string> = {
    'Índice de Longevidade': 'bg-primary/10',
    'Prontidão diária': 'bg-cosmic/10',
    Passos: 'bg-accent/10',
    Sono: 'bg-info/10',
  };

  const iconColorMap: Record<string, string> = {
    'Índice de Longevidade': 'text-primary',
    'Prontidão diária': 'text-cosmic',
    Passos: 'text-accent',
    Sono: 'text-info',
  };

  const highlightCards = [
    {
      title: 'Índice de Longevidade',
      value: longevityScore ? longevityScore.toFixed(1) : 'N/A',
      description: 'Score global calculado pela IA.',
      icon: TrendingUp,
      delta: 0,
      deltaType: 'unchanged' as const,
    },
    {
      title: 'Prontidão diária',
      value: readinessScore ? `${Math.round(readinessScore)}/100` : 'N/A',
      description: 'Energia disponível para hoje.',
      icon: Sparkles,
      delta: readinessDelta,
      deltaType: deltaTypeForValue(readinessDelta),
    },
    {
      title: 'Passos',
      value: stepsToday.toLocaleString('pt-BR'),
      description: 'Últimas 24 horas',
      icon: Activity,
      delta: stepsDelta,
      deltaType: deltaTypeForValue(stepsDelta),
    },
    {
      title: 'Sono',
      value: `${Math.floor(sleepMinutesToday / 60)}h ${sleepMinutesToday % 60}m`,
      description: 'Duração total da última noite.',
      icon: BedDouble,
      delta: sleepDelta,
      deltaType: deltaTypeForValue(sleepDelta),
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <Grid numItemsSm={1} numItemsMd={2} numItemsLg={4} className="gap-5">
        {highlightCards.map(
          ({ title, value, description, icon: Icon, delta, deltaType }) => (
            <Card
              key={title}
              className="space-y-3 rounded-2xl border border-border bg-card shadow hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
            >
              <Flex
                justifyContent="between"
                alignItems="start"
                className="gap-4"
              >
                <div>
                  <Text className="text-sm text-muted-foreground">{title}</Text>
                  <Metric className="mt-1 text-foreground font-display">
                    {title === 'Índice de Longevidade' && !aiScoresEnabled
                      ? 'Bloqueado'
                      : value}
                  </Metric>
                </div>
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBgMap[title] || 'bg-secondary'}`}
                >
                  <Icon
                    className={`h-5 w-5 ${iconColorMap[title] || 'text-primary'}`}
                  />
                </span>
              </Flex>
              <Flex justifyContent="between" alignItems="center">
                <Text className="text-xs text-muted-foreground">
                  {title === 'Índice de Longevidade' && !aiScoresEnabled
                    ? 'Seu plano atual não libera scores de IA.'
                    : description}
                </Text>
                {title === 'Índice de Longevidade' &&
                !aiScoresEnabled ? null : (
                  <BadgeDelta
                    deltaType={deltaType}
                    size="xs"
                    className="rounded-full px-2 py-0.5"
                  >
                    {delta === 0
                      ? 'Estável'
                      : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`}
                  </BadgeDelta>
                )}
              </Flex>
            </Card>
          )
        )}
      </Grid>

      {/* Charts Row 1 */}
      <Grid numItemsSm={1} numItemsLg={3} className="gap-5">
        <Card className="space-y-3 lg:col-span-2 rounded-2xl border border-border bg-card shadow hover:shadow-md transition-all duration-200">
          <Flex justifyContent="between" alignItems="center">
            <div>
              <Title className="font-display font-semibold text-foreground">
                Atividade Semanal
              </Title>
              <Text className="text-sm text-muted-foreground">
                Evolução dos seus passos nos últimos 7 dias.
              </Text>
            </div>
          </Flex>
          <Divider className="opacity-30" />
          <AreaChart
            className="h-72 mt-2"
            data={stepsTrendData}
            index="day"
            categories={['Passos']}
            colors={['teal']}
            valueFormatter={(value) => valueFormatter(value)}
            showLegend={false}
            showYAxis={false}
            curveType="monotone"
          />
        </Card>
        <div className="lg:col-span-1 h-full">
          <AITipsCard
            className="h-full rounded-2xl"
            featureEnabled={aiTipsEnabled}
            currentPlanKey={subscription.plan.key}
          />
        </div>
      </Grid>

      {/* Charts Row 2 */}
      <Grid numItemsSm={1} numItemsLg={3} className="gap-5">
        <Card className="space-y-3 lg:col-span-2 rounded-2xl border border-border bg-card shadow hover:shadow-md transition-all duration-200">
          <Flex justifyContent="between" alignItems="center">
            <div>
              <Title className="font-display font-semibold text-foreground">
                Padrão de Sono
              </Title>
              <Text className="text-sm text-muted-foreground">
                Duração do sono em horas nos últimos 7 dias.
              </Text>
            </div>
          </Flex>
          <Divider className="opacity-30" />
          <BarChart
            className="h-72 mt-2"
            data={sleepTrendData}
            index="day"
            categories={['Sono (h)']}
            colors={['indigo']}
            valueFormatter={(value) => `${valueFormatter(value)} h`}
            showLegend={false}
            yAxisWidth={40}
          />
        </Card>
        <Card className="space-y-3 rounded-2xl border border-border bg-card shadow hover:shadow-md transition-all duration-200">
          <Title className="font-display font-semibold text-foreground">
            Estrutura da última noite
          </Title>
          <Text className="text-sm text-muted-foreground">
            Distribuição das fases de sono.
          </Text>
          <Divider className="opacity-30" />
          {sleepBreakdownData.length > 0 ? (
            <DonutChart
              data={sleepBreakdownData}
              index="name"
              category="value"
              valueFormatter={(value) => `${valueFormatter(value)} h`}
              colors={['violet', 'indigo', 'sky']}
              className="mt-4"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-12">
              Sem dados de sono para hoje.
            </div>
          )}
        </Card>
      </Grid>

      {/* Advanced Health Pillars */}
      {todayMetrics ? (
        <div className="space-y-5 pt-2">
          <div>
            <h2 className="text-xl font-display font-bold text-gradient-hero">
              Pilares avançados de saúde
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize a profundidade das suas métricas de longevidade.
            </p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-5 shadow">
            <MetricGrid metrics={todayMetrics} />
          </div>
        </div>
      ) : (
        <Card className="rounded-2xl border border-border bg-card shadow">
          <Flex justifyContent="between" alignItems="center">
            <div>
              <Title className="font-display text-foreground">
                Dados indisponíveis
              </Title>
              <Text className="text-sm text-muted-foreground">
                Não encontramos métricas para hoje. Conecte seus dispositivos de
                monitoramento para ver recomendações personalizadas.
              </Text>
            </div>
          </Flex>
        </Card>
      )}
    </div>
  );
}
