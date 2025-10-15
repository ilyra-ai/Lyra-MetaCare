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
import { Activity, BedDouble, HeartPulse, Flame, TrendingUp, Zap, BrainCircuit } from "lucide-react";
import { useDailyMetrics, DailyMetric } from "@/hooks/use-daily-metrics";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AITipsCard } from "./AITipsCard";

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

// --- Helper Functions ---
const formatMinutesToHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

// --- Metric Card Component ---
interface MetricCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
    colorClass: string;
    className?: string;
}

function MetricCard({ title, value, description, icon: Icon, colorClass, className }: MetricCardProps) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${colorClass}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

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

  // Today's metrics
  const stepsToday = todayMetrics?.steps || 0;
  const sleepTotalMinutes = todayMetrics?.sleep_duration_minutes || 0;
  const heartRate = todayMetrics?.resting_heart_rate || 0;
  const calories = todayMetrics?.calories_burned || 0;
  
  // NEW 2025 METRICS
  const hrvToday = todayMetrics?.hrv_ms || 0;
  const deepSleepMinutes = todayMetrics?.deep_sleep_minutes || 0;
  
  // Longevity Metric Calculations (Simulated based on data)
  const sleepQuality = sleepTotalMinutes >= 450 ? "Excelente" : (sleepTotalMinutes >= 360 ? "Bom" : "Abaixo da Meta"); // 7.5 hours vs 6 hours
  const hrvStatus = hrvToday >= 50 ? "Ótimo" : (hrvToday >= 30 ? "Bom" : "Baixo");
  
  // Simulated Longevity Score (8.0 - 9.9) based on multiple factors
  const calculateLongevityScore = () => {
      let score = 8.0;
      if (stepsToday > 8000) score += 0.3;
      if (sleepTotalMinutes > 450) score += 0.4;
      if (hrvToday > 50) score += 0.5;
      if (deepSleepMinutes > 90) score += 0.3;
      
      return Math.min(9.9, score).toFixed(1);
  }
  const longevityScore = calculateLongevityScore();


  return (
    <div className="space-y-8">
      {/* Asymmetrical Grid Layout (2025 Trend: Focus on key metrics) */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
        
        {/* Card 1: Steps Today (Small Metric) */}
        <MetricCard
            title="Passos Hoje"
            value={`${stepsToday.toLocaleString()} Steps`}
            description={stepsToday >= 8000 ? "Meta alcançada!" : "Continue se movendo."}
            icon={Activity}
            colorClass="text-green-600"
        />
        
        {/* Card 2: Sleep (Small Metric) */}
        <MetricCard
            title="Sono Total"
            value={formatMinutesToHours(sleepTotalMinutes)}
            description={`Qualidade: ${sleepQuality}`}
            icon={BedDouble}
            colorClass="text-blue-600"
        />
        
        {/* Card 3: HRV (New 2025 Metric) */}
        <MetricCard
            title="Variabilidade Cardíaca (HRV)"
            value={hrvToday ? `${hrvToday} ms` : "N/A"}
            description={`Resiliência ao estresse: ${hrvStatus}`}
            icon={HeartPulse}
            colorClass="text-red-600"
        />
        
        {/* Card 4: Deep Sleep (New 2025 Metric) */}
        <MetricCard
            title="Sono Profundo"
            value={deepSleepMinutes ? formatMinutesToHours(deepSleepMinutes) : "N/A"}
            description="Crucial para recuperação física."
            icon={BrainCircuit}
            colorClass="text-purple-600"
        />
        
        {/* Card 5: AI Tips (Vertical Focus / Alert Color) - Spans 2 columns */}
        <AITipsCard className="lg:col-span-2" />

        {/* Card 6: Longevity Score (Medium Metric) - Spans 2 columns */}
        <Card className="lg:col-span-2 flex flex-col justify-center items-center text-center p-6 bg-green-100/50 border-green-500/50 dark:bg-green-900/20 dark:border-green-700/50">
            <TrendingUp className="h-10 w-10 text-green-700 dark:text-green-400 mb-2" />
            <CardTitle className="text-4xl font-extrabold text-green-800 dark:text-green-300">{longevityScore}</CardTitle>
            <CardDescription className="text-green-700 dark:text-green-400 font-medium">Índice de Longevidade Otimizado</CardDescription>
            <p className="text-xs text-muted-foreground mt-2">Baseado em métricas de sono, atividade e variabilidade cardíaca.</p>
        </Card>
        
        {/* Card 7: Steps Chart (Large/Chart) - Spans 4 columns */}
        <Card className="lg:col-span-4">
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
        
        {/* Card 8: Sleep Chart (Medium/Chart) - Spans 4 columns */}
        <Card className="lg:col-span-4">
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