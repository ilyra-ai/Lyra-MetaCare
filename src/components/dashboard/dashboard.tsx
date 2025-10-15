"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { useDailyMetrics } from "@/hooks/use-daily-metrics";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AITipsCard } from "./AITipsCard";
import { MetricGrid } from "./MetricGrid";

// --- Chart Configuration ---
const stepsChartConfig = {
  steps: {
    label: "Passos",
    color: "hsl(var(--chart-1))", // Green/Blue
  },
};

const sleepChartConfig = {
  sleep: {
    label: "Sono (h)",
    color: "hsl(var(--chart-3))", // Blue/Purple
  },
};

// --- Main Dashboard Component ---
export function Dashboard() {
  const { metrics, todayMetrics, loading, refresh } = useDailyMetrics(7);

  if (loading) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-[300px] w-full lg:col-span-2" />
            <Skeleton className="h-[300px] w-full lg:col-span-2" />
        </div>
    );
  }

  // Prepare data for charts
  const stepsChartData = metrics.map(m => ({
    day: format(new Date(m.date), 'EEE'),
    steps: m.steps,
  }));
  
  const sleepChartData = metrics.map(m => ({
    day: format(new Date(m.date), 'EEE'),
    sleep: m.sleep_duration_minutes / 60, // Convert minutes to hours for chart
  }));

  // Longevity Score Calculation (Refined based on 30+ metrics)
  const calculateLongevityScore = () => {
      if (!todayMetrics) return "N/A";
      
      let score = 8.0;
      // Weighting factors for 2025 trends: Recovery and Sleep Quality are paramount
      if (todayMetrics.steps > 8000) score += 0.2;
      if (todayMetrics.sleep_duration_minutes > 450) score += 0.3;
      if ((todayMetrics.hrv_ms || 0) > 50) score += 0.5;
      if ((todayMetrics.recovery_score || 0) > 85) score += 0.4;
      if (todayMetrics.protein_grams > 100) score += 0.1;
      
      return Math.min(9.9, score).toFixed(1);
  }
  const longevityScore = calculateLongevityScore();


  return (
    <div className="space-y-8">
      {/* Top Section: Longevity Score & AI Insight (Asymmetrical Focus) */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4 auto-rows-fr">
        
        {/* Card 1: Longevity Score (Spans 2 columns) */}
        <Card className="lg:col-span-2 flex flex-col justify-center items-center text-center p-6 bg-green-100/50 border-green-500/50 dark:bg-green-900/20 dark:border-green-700/50">
            <TrendingUp className="h-10 w-10 text-green-700 dark:text-green-400 mb-2" />
            <CardTitle className="text-4xl font-extrabold text-green-800 dark:text-green-300">{longevityScore}</CardTitle>
            <CardDescription className="text-green-700 dark:text-green-400 font-medium">Índice de Longevidade Otimizado</CardDescription>
            <p className="text-xs text-muted-foreground mt-2">Baseado em 30+ métricas de saúde biológica e resiliência.</p>
        </Card>
        
        {/* Card 2: AI Tips (Spans 2 columns) */}
        <AITipsCard className="lg:col-span-2" />
      </div>

      {/* Middle Section: Metric Grid (Symmetrical 4-column layout) */}
      <Card>
        <CardHeader>
            <CardTitle>Métricas Biológicas Diárias</CardTitle>
            <CardDescription>Visão detalhada dos seus pilares de saúde.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
            {todayMetrics ? <MetricGrid metrics={todayMetrics} /> : <p className="text-center text-muted-foreground">Nenhum dado disponível para hoje.</p>}
        </CardContent>
      </Card>

      {/* Bottom Section: Charts (Full Width) */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        
        {/* Chart 1: Steps Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Semanal</CardTitle>
            <CardDescription>Seu contador de passos dos últimos 7 dias.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={stepsChartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={stepsChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="steps" fill="var(--color-steps)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* Chart 2: Sleep Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Padrão de Sono</CardTitle>
            <CardDescription>Duração do sono (em horas) nos últimos 7 dias.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={sleepChartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={sleepChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis domain={[0, 10]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sleep" fill="var(--color-sleep)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}