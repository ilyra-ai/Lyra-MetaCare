"use client";

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
} from "@tremor/react";
import { TrendingUp, Activity, BedDouble, Sparkles } from "lucide-react";
import { useDailyMetrics } from "@/hooks/use-daily-metrics";
import { useAIScores } from "@/hooks/use-ai-scores";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AITipsCard } from "./AITipsCard";
import { MetricGrid } from "./MetricGrid";

const valueFormatter = (number: number) =>
  Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(number);

const deltaTypeForValue = (delta: number) => {
  if (delta > 10) return "increase" as const;
  if (delta > 2) return "moderateIncrease" as const;
  if (delta < -10) return "decrease" as const;
  if (delta < -2) return "moderateDecrease" as const;
  if (delta === 0) return "unchanged" as const;
  return delta > 0 ? "moderateIncrease" : "moderateDecrease";
};

export function Dashboard() {
  const {
    metrics,
    todayMetrics,
    loading: metricsLoading,
  } = useDailyMetrics(7);
  const { scores, loading: scoresLoading } = useAIScores();

  const loading = metricsLoading || scoresLoading;

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-[320px] w-full lg:col-span-2" />
        <Skeleton className="h-[320px] w-full lg:col-span-2" />
      </div>
    );
  }

  const previousMetrics = metrics.length > 1 ? metrics[metrics.length - 2] : null;

  const longevityScore = scores?.longevityScore ?? null;
  const readinessScore = scores?.readinessScore ?? todayMetrics?.readiness_score ?? null;
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
      ? ((sleepMinutesToday - sleepMinutesYesterday) / sleepMinutesYesterday) * 100
      : 0;

  const readinessDelta =
    readinessScore && readinessYesterday
      ? ((readinessScore - readinessYesterday) / readinessYesterday) * 100
      : 0;

  const stepsTrendData = metrics.map((metric) => ({
    day: format(new Date(metric.date), "EEE"),
    Passos: metric.steps,
  }));

  const sleepTrendData = metrics.map((metric) => ({
    day: format(new Date(metric.date), "EEE"),
    "Sono (h)": Number((metric.sleep_duration_minutes / 60).toFixed(2)),
  }));

  const sleepBreakdownData = todayMetrics
    ? [
        {
          name: "Sono profundo",
          value: Number((todayMetrics.deep_sleep_minutes / 60).toFixed(2)),
        },
        {
          name: "Sono REM",
          value: Number((todayMetrics.rem_sleep_minutes / 60).toFixed(2)),
        },
        {
          name: "Sono leve",
          value: Number((todayMetrics.light_sleep_minutes / 60).toFixed(2)),
        },
      ].filter((segment) => segment.value > 0)
    : [];

  const highlightCards = [
    {
      title: "Índice de Longevidade",
      value: longevityScore ? longevityScore.toFixed(1) : "N/A",
      description: "Score global calculado pela IA.",
      icon: TrendingUp,
      delta: 0,
      deltaType: "unchanged" as const,
    },
    {
      title: "Prontidão diária",
      value: readinessScore ? `${Math.round(readinessScore)}/100` : "N/A",
      description: "Energia disponível para hoje.",
      icon: Sparkles,
      delta: readinessDelta,
      deltaType: deltaTypeForValue(readinessDelta),
    },
    {
      title: "Passos",
      value: stepsToday.toLocaleString("pt-BR"),
      description: "Últimas 24 horas", 
      icon: Activity,
      delta: stepsDelta,
      deltaType: deltaTypeForValue(stepsDelta),
    },
    {
      title: "Sono",
      value: `${Math.floor(sleepMinutesToday / 60)}h ${sleepMinutesToday % 60}m`,
      description: "Duração total da última noite.",
      icon: BedDouble,
      delta: sleepDelta,
      deltaType: deltaTypeForValue(sleepDelta),
    },
  ];

  return (
    <div className="space-y-8">
      <Grid numItemsSm={1} numItemsMd={2} numItemsLg={4} className="gap-8">
        {highlightCards.map(({ title, value, description, icon: Icon, delta, deltaType }) => (
          <Card key={title} decoration="top" decorationColor="emerald" className="space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-glass dark:hover:shadow-neon bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border border-white/20">
            <Flex justifyContent="between" alignItems="start" className="gap-4">
              <div>
                <Text className="text-sm text-tremor-content-subtle">{title}</Text>
                <Metric className="mt-1 text-tremor-content-strong bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-400">{value}</Metric>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/20 shadow-sm">
                <Icon className="h-6 w-6 text-emerald-600" />
              </span>
            </Flex>
            <Flex justifyContent="between" alignItems="center">
              <Text className="text-sm text-tremor-content-subtle">{description}</Text>
              <BadgeDelta deltaType={deltaType} size="xs" className="rounded-full px-2 py-0.5">
                {delta === 0 ? "Estável" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`}
              </BadgeDelta>
            </Flex>
          </Card>
        ))}
      </Grid>

      <Grid numItemsSm={1} numItemsLg={3} className="gap-8">
        <Card className="space-y-4 lg:col-span-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-glass dark:hover:shadow-neon bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border border-white/20" decoration="top" decorationColor="emerald">
          <Flex justifyContent="between" alignItems="center">
            <div>
              <Title className="font-bold">Atividade Semanal</Title>
              <Text className="text-sm text-tremor-content-subtle">
                Evolução dos seus passos nos últimos 7 dias.
              </Text>
            </div>
          </Flex>
          <Divider className="opacity-50" />
          <AreaChart
            className="h-72 mt-4"
            data={stepsTrendData}
            index="day"
            categories={["Passos"]}
            colors={["emerald"]}
            valueFormatter={(value) => valueFormatter(value)}
            showLegend={false}
            showYAxis={false}
            curveType="monotone"
          />
        </Card>
        <div className="lg:col-span-1 h-full transition-all duration-300 hover:-translate-y-1">
          <AITipsCard className="h-full shadow-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border border-white/20 hover:shadow-glass dark:hover:shadow-neon" />
        </div>
      </Grid>

      <Grid numItemsSm={1} numItemsLg={3} className="gap-8">
        <Card className="space-y-4 lg:col-span-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-glass dark:hover:shadow-neon bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border border-white/20" decoration="top" decorationColor="indigo">
          <Flex justifyContent="between" alignItems="center">
            <div>
              <Title className="font-bold">Padrão de Sono</Title>
              <Text className="text-sm text-tremor-content-subtle">
                Duração do sono em horas nos últimos 7 dias.
              </Text>
            </div>
          </Flex>
          <Divider className="opacity-50" />
          <BarChart
            className="h-72 mt-4"
            data={sleepTrendData}
            index="day"
            categories={["Sono (h)"]}
            colors={["indigo"]}
            valueFormatter={(value) => `${valueFormatter(value)} h`}
            showLegend={false}
            yAxisWidth={40}
          />
        </Card>
        <Card className="space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-glass dark:hover:shadow-neon bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border border-white/20" decoration="top" decorationColor="indigo">
          <Title className="font-bold">Estrutura da última noite</Title>
          <Text className="text-sm text-tremor-content-subtle">
            Distribuição das fases de sono.
          </Text>
          <Divider className="opacity-50" />
          {sleepBreakdownData.length > 0 ? (
            <DonutChart
              data={sleepBreakdownData}
              index="name"
              category="value"
              valueFormatter={(value) => `${valueFormatter(value)} h`}
              colors={["violet", "indigo", "sky"]}
              className="mt-6"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-tremor-content-subtle">
              Sem dados de sono para hoje.
            </div>
          )}
        </Card>
      </Grid>

      {todayMetrics ? (
        <div className="space-y-6 pt-4">
          <div>
            <Title className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent inline-block">Pilares avançados de saúde</Title>
            <Text className="text-base text-tremor-content-subtle mt-1">
              Visualize a profundidade das suas métricas de longevidade.
            </Text>
          </div>
          <div className="transition-all duration-300 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-glass">
             <MetricGrid metrics={todayMetrics} />
          </div>
        </div>
      ) : (
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border border-white/20 shadow-glass">
          <Flex justifyContent="between" alignItems="center">
            <div>
              <Title>Dados indisponíveis</Title>
              <Text className="text-sm text-tremor-content-subtle">
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
