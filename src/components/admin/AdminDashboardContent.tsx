'use client';

import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  UserPlus,
  Users,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useKeyedResource } from '@/hooks/use-keyed-resource';

interface DashboardStats {
  totalUsers: number;
  newUsersLast7Days: number;
  onboardingCompletionRate: number | null;
}

interface RecentUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  created_at: string;
  avatar_url: string | null;
}

/**
 * Resultado da carga do painel. Uma falha vira estado de erro explícito
 * (tarefa 57): antes, qualquer erro deixava os cartões com "0", como se não
 * houvesse nenhum usuário.
 */
type Carga =
  | { ok: true; stats: DashboardStats; recentes: RecentUser[] }
  | { ok: false; mensagem: string };

const FALHA_DE_REDE: Carga = {
  ok: false,
  mensagem: 'Não foi possível falar com o servidor. Verifique a conexão.',
};

const PERCENTUAL = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
});
const INTEIRO = new Intl.NumberFormat('pt-BR');

function StatCard({
  icon: Icon,
  title,
  value,
  description,
  color,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  color: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className={`size-4 shrink-0 ${color}`} aria-hidden="true" />
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight tabular-nums text-foreground">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}

function avisar(erro: unknown) {
  console.error('Falha ao carregar o painel administrativo:', erro);
}

export function AdminDashboardContent() {
  const { db, session } = useAuth();
  const chave = session?.user ? `admin-painel:${session.user.id}` : null;

  const carregar = React.useCallback(async (): Promise<Carga> => {
    const seteDiasAtras = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const [total, novos, concluidos, recentes] = await Promise.all([
      db.from('profiles').select('*', { count: 'exact', head: true }),
      db
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', seteDiasAtras),
      db
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('onboarding_completed', true),
      db
        .from<RecentUser[]>('profiles')
        .select('id, first_name, last_name, email, created_at, avatar_url')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);
    const erro =
      total.error ?? novos.error ?? concluidos.error ?? recentes.error;
    if (erro) {
      return { ok: false, mensagem: erro.message };
    }
    const totalDeUsuarios = total.count ?? 0;
    return {
      ok: true,
      stats: {
        totalUsers: totalDeUsuarios,
        newUsersLast7Days: novos.count ?? 0,
        onboardingCompletionRate:
          totalDeUsuarios > 0
            ? ((concluidos.count ?? 0) / totalDeUsuarios) * 100
            : null,
      },
      recentes: recentes.data ?? [],
    };
  }, [db]);

  const { data, loading, refresh } = useKeyedResource(
    chave,
    carregar,
    avisar,
    FALHA_DE_REDE
  );

  if (loading) {
    return (
      <div
        className="space-y-6"
        role="status"
        aria-label="Carregando o painel administrativo"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!data.ok) {
    return (
      <Alert variant="destructive">
        <AlertTriangle aria-hidden="true" className="size-4" />
        <div className="flex flex-col gap-3">
          <AlertTitle>Não foi possível carregar o painel</AlertTitle>
          <AlertDescription>{data.mensagem}</AlertDescription>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => void refresh()}
          >
            <RefreshCw aria-hidden="true" />
            Tentar de novo
          </Button>
        </div>
      </Alert>
    );
  }

  const { stats, recentes } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Users}
          title="Total de usuários"
          value={INTEIRO.format(stats.totalUsers)}
          description="Usuários cadastrados na plataforma."
          color="text-info"
        />
        <StatCard
          icon={UserPlus}
          title="Novos usuários (7 dias)"
          value={INTEIRO.format(stats.newUsersLast7Days)}
          description="Cadastros na última semana."
          color="text-success"
        />
        <StatCard
          icon={CheckCircle}
          title="Taxa de onboarding"
          value={
            stats.onboardingCompletionRate === null
              ? '—'
              : `${PERCENTUAL.format(stats.onboardingCompletionRate)}%`
          }
          description={
            stats.onboardingCompletionRate === null
              ? 'Sem usuários cadastrados ainda.'
              : 'Usuários que completaram o perfil.'
          }
          color="text-primary"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Usuários recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum usuário cadastrado ainda.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentes.map((user) => (
                <li
                  key={user.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar>
                      {/* O nome aparece ao lado: a foto é decorativa. */}
                      <AvatarImage src={user.avatar_url || undefined} alt="" />
                      <AvatarFallback>
                        {user.first_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {user.first_name || 'Usuário'} {user.last_name || ''}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="size-3" aria-hidden="true" />
                    <time dateTime={user.created_at}>
                      {formatDistanceToNow(new Date(user.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </time>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
