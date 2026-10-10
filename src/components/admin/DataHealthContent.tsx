'use client';

import * as React from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, Zap, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface ProfileWithLatestMetric {
  id: string;
  first_name: string | null;
  email: string | null;
  daily_metrics: Array<{ date: string }>;
}

const StatCard = ({
  icon: Icon,
  title,
  value,
  description,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
}) => (
  <Card className="p-5">
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
    </div>
    <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
      {value}
    </p>
    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
  </Card>
);

export function DataHealthContent() {
  const { db } = useAuth();
  const [metrics, setMetrics] = React.useState<MetricHealth[]>([]);
  const [staleUsers, setStaleUsers] = React.useState<StaleUser[]>([]);
  const [stats, setStats] = React.useState<OverallStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. Fetch metric health analysis using the DB function
      const metricsPromise = db.rpc<MetricHealth[]>('get_data_health_metrics');

      // 2. Fetch stale users (no data in last 7 days)
      const sevenDaysAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString();
      const staleUsersPromise = db
        .from<ProfileWithLatestMetric[]>('profiles')
        .select(
          `
          id, first_name, email,
          daily_metrics(date)
        `
        )
        .order('date', { foreignTable: 'daily_metrics', ascending: false })
        .limit(1, { foreignTable: 'daily_metrics' });

      // 3. Fetch overall stats
      const statsPromise = db
        .from('daily_metrics')
        .select('*', { count: 'exact', head: true });
      const activeUsersPromise = db
        .from<Array<{ user_id: string }>>('daily_metrics')
        .select('user_id', { count: 'exact' })
        .gte('date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const [metricsResult, staleUsersResult, statsResult, activeUsersResult] =
        await Promise.all([
          metricsPromise,
          staleUsersPromise,
          statsPromise,
          activeUsersPromise,
        ]);

      // Process metrics
      if (metricsResult.error)
        toast.error('Erro ao analisar métricas.', {
          description: metricsResult.error.message,
        });
      else setMetrics(metricsResult.data || []);

      // Process stale users
      if (staleUsersResult.error)
        toast.error('Erro ao buscar usuários inativos.', {
          description: staleUsersResult.error.message,
        });
      else {
        const filteredStale = (staleUsersResult.data || [])
          .filter(
            (u) =>
              u.daily_metrics.length === 0 ||
              new Date(u.daily_metrics[0].date) < new Date(sevenDaysAgo)
          )
          .map((u) => ({
            id: u.id,
            first_name: u.first_name,
            email: u.email,
            last_sync:
              u.daily_metrics.length > 0 ? u.daily_metrics[0].date : null,
          }));
        setStaleUsers(filteredStale);

        // Set stats that depend on this query
        if (statsResult.count != null && activeUsersResult.count != null) {
          setStats({
            total_metrics_records: statsResult.count ?? 0,
            active_users_24h: new Set(
              activeUsersResult.data?.map((d) => d.user_id)
            ).size,
            stale_users_7d: filteredStale.length,
          });
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [db]);

  const getFillRateVariant = (
    rate: number
  ): 'success' | 'warning' | 'destructive' => {
    if (rate > 80) return 'success';
    if (rate > 50) return 'warning';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Activity}
          title="Registros de Métricas"
          value={stats?.total_metrics_records.toLocaleString() || '0'}
          description="Total de entradas na tabela de métricas."
        />
        <StatCard
          icon={Zap}
          title="Usuários Ativos (24h)"
          value={stats?.active_users_24h.toString() || '0'}
          description="Usuários que sincronizaram dados hoje."
        />
        <StatCard
          icon={Clock}
          title="Usuários Inativos (7d)"
          value={stats?.stale_users_7d.toString() || '0'}
          description="Usuários sem novos dados há uma semana."
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* `min-w-0`: sem ele a tabela alarga o item da grade no celular. */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Análise de Métricas</CardTitle>
            <CardDescription>
              Completude e distribuição de cada métrica coletada.
            </CardDescription>
          </CardHeader>
          <CardContent
            className="max-h-[600px] overflow-y-auto"
            tabIndex={0}
            role="region"
            aria-label="Análise de métricas (rolável)"
          >
            <Table scrollLabel="Tabela de métricas (rolável na horizontal)">
              <TableHeader>
                <TableRow>
                  <TableHead>Métrica</TableHead>
                  <TableHead>Preenchimento</TableHead>
                  <TableHead>Média</TableHead>
                  <TableHead>Min/Max</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics
                  .sort((a, b) => a.fill_rate - b.fill_rate)
                  .map((m) => (
                    <TableRow key={m.metric_name}>
                      <TableCell className="font-medium">
                        {m.metric_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getFillRateVariant(m.fill_rate)}>
                          {m.fill_rate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>{m.avg_value?.toFixed(1) || 'N/A'}</TableCell>
                      <TableCell>
                        {m.min_value?.toFixed(0)} /{' '}
                        {m.max_value?.toFixed(0) || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Usuários Inativos</CardTitle>
            <CardDescription>
              Usuários sem sincronização de dados há mais de 7 dias.
            </CardDescription>
          </CardHeader>
          <CardContent
            className="max-h-[600px] overflow-y-auto"
            tabIndex={0}
            role="region"
            aria-label="Usuários inativos (rolável)"
          >
            {staleUsers.length > 0 ? (
              <ul className="divide-y divide-border">
                {staleUsers.map((user) => (
                  <li
                    key={user.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {user.first_name || 'Usuário Anônimo'}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.last_sync
                        ? `Último sync ${formatDistanceToNow(new Date(user.last_sync), { addSuffix: true, locale: ptBR })}`
                        : 'Nenhum sync'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-md border border-dashed border-border bg-background p-8 text-center">
                <span
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success"
                  aria-hidden="true"
                >
                  <CheckCircle className="h-6 w-6" />
                </span>
                <p className="font-semibold text-foreground">Excelente!</p>
                <p className="text-sm text-muted-foreground">
                  Nenhum usuário inativo encontrado.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
