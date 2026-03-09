"use client";

import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Activity, CheckCircle, Zap, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MetricHealth {
  metric_name: string;
  fill_rate: number;
  avg_value: number | null;
  min_value: number | null;
  max_value: number | null;
}

interface StaleUser {
  id: string;
  first_name: string | null;
  email: string | null;
  last_sync: string | null;
}

interface OverallStats {
  total_metrics_records: number;
  active_users_24h: number;
  stale_users_7d: number;
}

const StatCard = ({ icon: Icon, title, value, description }: { icon: React.ElementType, title: string, value: string, description: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export function DataHealthContent() {
  const { supabase } = useAuth();
  const [metrics, setMetrics] = React.useState<MetricHealth[]>([]);
  const [staleUsers, setStaleUsers] = React.useState<StaleUser[]>([]);
  const [stats, setStats] = React.useState<OverallStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. Fetch metric health analysis using the DB function
      const metricsPromise = supabase.rpc('get_data_health_metrics');

      // 2. Fetch stale users (no data in last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const staleUsersPromise = supabase
        .from('profiles')
        .select(`
          id, first_name, email,
          daily_metrics(date)
        `)
        .order('date', { foreignTable: 'daily_metrics', ascending: false })
        .limit(1, { foreignTable: 'daily_metrics' });
      
      // 3. Fetch overall stats
      const statsPromise = supabase.from('daily_metrics').select('*', { count: 'exact', head: true });
      const activeUsersPromise = supabase.from('daily_metrics').select('user_id', { count: 'exact' }).gte('date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());


      const [metricsResult, staleUsersResult, statsResult, activeUsersResult] = await Promise.all([metricsPromise, staleUsersPromise, statsPromise, activeUsersPromise]);

      // Process metrics
      if (metricsResult.error) toast.error("Erro ao analisar métricas.", { description: metricsResult.error.message });
      else setMetrics(metricsResult.data || []);

      // Process stale users
      if (staleUsersResult.error) toast.error("Erro ao buscar usuários inativos.", { description: staleUsersResult.error.message });
      else {
        const filteredStale = (staleUsersResult.data as any[])
          .filter(u => u.daily_metrics.length === 0 || new Date(u.daily_metrics[0].date) < new Date(sevenDaysAgo))
          .map(u => ({
            id: u.id,
            first_name: u.first_name,
            email: u.email,
            last_sync: u.daily_metrics.length > 0 ? u.daily_metrics[0].date : null,
          }));
        setStaleUsers(filteredStale);
        
        // Set stats that depend on this query
        if (statsResult.count !== null && activeUsersResult.count !== null) {
            setStats({
                total_metrics_records: statsResult.count,
                active_users_24h: new Set(activeUsersResult.data?.map((d: { user_id: string }) => d.user_id)).size,
                stale_users_7d: filteredStale.length,
            });
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const getFillRateBadge = (rate: number) => {
    if (rate > 80) return "bg-green-600";
    if (rate > 50) return "bg-yellow-500";
    return "bg-red-600";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /></div>
        <div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-96 w-full" /><Skeleton className="h-96 w-full" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Activity} title="Registros de Métricas" value={stats?.total_metrics_records.toLocaleString() || '0'} description="Total de entradas na tabela de métricas." />
        <StatCard icon={Zap} title="Usuários Ativos (24h)" value={stats?.active_users_24h.toString() || '0'} description="Usuários que sincronizaram dados hoje." />
        <StatCard icon={Clock} title="Usuários Inativos (7d)" value={stats?.stale_users_7d.toString() || '0'} description="Usuários sem novos dados há uma semana." />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Análise de Métricas</CardTitle><CardDescription>Completude e distribuição de cada métrica coletada.</CardDescription></CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Métrica</TableHead><TableHead>Preenchimento</TableHead><TableHead>Média</TableHead><TableHead>Min/Max</TableHead></TableRow></TableHeader>
              <TableBody>
                {metrics.sort((a, b) => a.fill_rate - b.fill_rate).map(m => (
                  <TableRow key={m.metric_name}>
                    <TableCell className="font-medium">{m.metric_name}</TableCell>
                    <TableCell><Badge className={cn("text-white", getFillRateBadge(m.fill_rate))}>{m.fill_rate.toFixed(1)}%</Badge></TableCell>
                    <TableCell>{m.avg_value?.toFixed(1) || 'N/A'}</TableCell>
                    <TableCell>{m.min_value?.toFixed(0)} / {m.max_value?.toFixed(0) || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Usuários Inativos</CardTitle><CardDescription>Usuários sem sincronização de dados há mais de 7 dias.</CardDescription></CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            {staleUsers.length > 0 ? (
              <ul className="space-y-3">
                {staleUsers.map(user => (
                  <li key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{user.first_name || 'Usuário Anônimo'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.last_sync ? `Último sync ${formatDistanceToNow(new Date(user.last_sync), { addSuffix: true, locale: ptBR })}` : 'Nenhum sync'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="font-semibold">Excelente!</p>
                <p className="text-sm text-muted-foreground">Nenhum usuário inativo encontrado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}