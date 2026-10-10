'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Plus, Target, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { CreateGoalModal } from './CreateGoalModal';
import { UpdateGoalProgressModal } from './UpdateGoalProgressModal';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  target_value: number | null;
  current_value: number;
  unit: string | null;
  status: string;
}

const statusMap: Record<
  string,
  {
    icon: React.ElementType;
    label: string;
    tone: string;
  }
> = {
  completed: {
    icon: CheckCircle2,
    label: 'Concluída',
    tone: 'text-success',
  },
  in_progress: {
    icon: Clock3,
    label: 'Em progresso',
    tone: 'text-muted-foreground',
  },
  missed: {
    icon: XCircle,
    label: 'Em atraso',
    tone: 'text-destructive',
  },
};

const clampProgress = (goal: Goal) => {
  if (!goal.target_value || goal.target_value <= 0) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, (goal.current_value / goal.target_value) * 100)
  );
};

const formatMetricValue = (value: number | null, unit: string | null) => {
  if (value === null) {
    return 'Sem alvo';
  }

  return `${value.toLocaleString('pt-BR')} ${unit ?? ''}`.trim();
};

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-display text-[32px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
        {value}
      </p>
    </div>
  );
}

function LoadingGoals() {
  return (
    <div className="flex flex-col gap-6" role="status">
      <span className="sr-only">Carregando metas</span>
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

/*
  Metas no layout "Lyra Clean" aprovado: três indicadores, cartões de meta
  com barra de progresso e "Atualizar progresso", e um cartão tracejado
  para criar outra meta. O título da página vem do `PageIntro`.
*/
export function GoalTrackingContent() {
  const { db, session } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id ?? null;

  // Consulta pura das metas do usuário.
  const queryGoals = useCallback(
    (ownerId: string) =>
      db
        .from('goals')
        .select('*')
        .eq('user_id', ownerId)
        .order('created_at', { ascending: false }),
    [db]
  );

  const applyGoals = useCallback(
    ({ data, error }: Awaited<ReturnType<typeof queryGoals>>) => {
      if (error) {
        toast.error('Erro ao carregar metas.', {
          description: error.message,
        });
        setGoals([]);
      } else {
        setGoals(data as Goal[]);
      }
      setLoading(false);
    },
    []
  );

  // Recarga após criar ou atualizar metas.
  const fetchGoals = useCallback(async () => {
    if (!userId) return;
    applyGoals(await queryGoals(userId));
  }, [applyGoals, queryGoals, userId]);

  // Carga inicial (o estado inicial já é "carregando").
  useEffect(() => {
    if (!userId) return;
    let active = true;
    queryGoals(userId).then((result) => {
      if (active) applyGoals(result);
    });
    return () => {
      active = false;
    };
  }, [applyGoals, queryGoals, userId]);

  if (loading) {
    return <LoadingGoals />;
  }

  if (goals.length === 0) {
    return (
      <section className="flex flex-col items-center rounded-xl border border-dashed border-control/50 bg-card px-6 py-14 text-center">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-sidebar-accent text-primary"
        >
          <Target className="h-6 w-6" />
        </span>
        <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
          Seu mapa de metas ainda está vazio
        </h3>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Crie a primeira meta para acompanhar progresso, conclusão e ritmo de
          evolução. Você também pode gerar metas pelo Plano de IA.
        </p>
        <CreateGoalModal onCreated={fetchGoals}>
          <Button size="lg" className="mt-6">
            <Plus />
            Criar primeira meta
          </Button>
        </CreateGoalModal>
      </section>
    );
  }

  const completedGoals = goals.filter(
    (goal) => goal.status === 'completed'
  ).length;
  const averageProgress =
    goals.reduce((sum, goal) => sum + clampProgress(goal), 0) / goals.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <CreateGoalModal onCreated={fetchGoals}>
          <Button size="lg">
            <Plus />
            Nova meta
          </Button>
        </CreateGoalModal>
      </div>

      <section
        aria-label="Resumo das metas"
        className="grid gap-4 sm:grid-cols-3"
      >
        <StatTile label="Total de metas" value={String(goals.length)} />
        <StatTile label="Concluídas" value={String(completedGoals)} />
        <StatTile
          label="Progresso médio"
          value={`${averageProgress.toFixed(0)}%`}
        />
      </section>

      <section
        aria-label="Lista de metas"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {goals.map((goal) => {
          const statusKey =
            goal.status in statusMap ? goal.status : 'in_progress';
          const { icon: StatusIcon, label, tone } = statusMap[statusKey];
          const progressPercentage = clampProgress(goal);

          return (
            <article
              key={goal.id}
              className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge>{goal.category || 'Geral'}</Badge>
                <span
                  className={cn(
                    'flex items-center gap-1.5 text-[13px] font-medium',
                    tone
                  )}
                >
                  <StatusIcon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </span>
              </div>

              <div className="min-w-0">
                <h3 className="break-words font-display text-xl font-semibold tracking-tight text-foreground">
                  {goal.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {goal.description ||
                    'Meta cadastrada sem descrição adicional.'}
                </p>
              </div>

              <div className="mt-auto flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {formatMetricValue(goal.current_value, goal.unit)} de{' '}
                    {formatMetricValue(goal.target_value, goal.unit)}
                  </span>
                  <strong className="font-semibold text-foreground">
                    {progressPercentage.toFixed(0)}%
                  </strong>
                </div>
                <Progress
                  aria-label={`Progresso da meta ${goal.title}`}
                  value={progressPercentage}
                />
              </div>

              <UpdateGoalProgressModal goal={goal} onUpdate={fetchGoals}>
                <Button variant="secondary" size="lg" className="w-full">
                  Atualizar progresso
                </Button>
              </UpdateGoalProgressModal>
            </article>
          );
        })}

        <CreateGoalModal onCreated={fetchGoals}>
          <button
            type="button"
            className="flex min-h-60 flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-control/50 bg-transparent px-6 text-center text-[15px] font-medium text-foreground/80 transition-colors hover:border-primary hover:bg-card focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-5 w-5 text-primary" aria-hidden="true" />
            Criar outra meta
            <span className="text-[13px] font-normal text-muted-foreground">
              Ou gere metas pelo Plano de IA
            </span>
          </button>
        </CreateGoalModal>
      </section>
    </div>
  );
}
