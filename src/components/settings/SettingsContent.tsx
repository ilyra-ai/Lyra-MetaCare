"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, FileDown, BarChart2, Palette, AlertTriangle, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useDailyMetrics } from "@/hooks/use-daily-metrics";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  sleep: {
    label: "Sono (h)",
    color: "hsl(var(--chart-3))",
  },
};

export function SettingsContent() {
  const { metrics, loading } = useDailyMetrics(7);

  const handleExport = () => {
    toast.info("Gerando relatório...", {
      description: "Esta funcionalidade está em desenvolvimento.",
    });
  };

  const handleTestError = () => {
    try {
      throw new Error("Este é um erro de teste para o Sentry.");
    } catch (error) {
      toast.error("Erro de teste enviado para o Sentry!");
      // Sentry.captureException(error); // Descomente quando o DSN estiver configurado
    }
  };

  const sleepChartData = metrics.map(m => ({
    day: format(new Date(m.date), 'EEE'),
    sleep: m.sleep_duration_minutes / 60,
  }));

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><Bell className="mr-3 h-5 w-5 text-primary" /> Notificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="summary-notifications" className="font-medium">Resumos Diários</label>
            <Switch id="summary-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="goal-notifications" className="font-medium">Alertas de Metas</label>
            <Switch id="goal-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="insight-notifications" className="font-medium">Novos Insights da IA</label>
            <Switch id="insight-notifications" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><BarChart2 className="mr-3 h-5 w-5 text-primary" /> Relatório Semanal de Sono</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart data={sleepChartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sleep" fill="var(--color-sleep)" radius={4} />
              </BarChart>
            </ChartContainer>
          )}
          <Button onClick={handleExport} variant="outline" className="w-full mt-4">
            <FileDown className="mr-2 h-4 w-4" /> Exportar como PDF
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><Palette className="mr-3 h-5 w-5 text-primary" /> Aparência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="font-medium">Modo Escuro</span>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md border-red-500/50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600"><AlertTriangle className="mr-3 h-5 w-5" /> Configurações Avançadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleTestError} variant="destructive" className="w-full">
            Testar Integração Sentry (Gerar Erro)
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Use esta opção para verificar se os erros estão sendo capturados corretamente pelo Sentry.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}