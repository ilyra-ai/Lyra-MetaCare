'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  Plus,
  Target,
  TrendingUp,
  Trophy,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
    badge: 'success' | 'info' | 'warning' | 'destructive';
    label: string;
    tone: string;
  }
> = {
  completed: {
    icon: CheckCircle2,
    badge: 'success',
    label: 'Concluída',
    tone: 'text-success',
  },
  in_progress: {
    icon: Clock3,
    badge: 'info',
    label: 'Em progresso',
    tone: 'text-info',
  },
  missed: {
    icon: XCircle,
    badge: 'destructive',
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

function GoalProgressRing({
  progress,
  label,
}: {
  progress: number;
  label: string;
}) {
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <div
      className="relative flex size-24 shrink-0 items-center justify-center rounded-full shadow-[0_18px_40px_-28px_rgba(22,21,48,0.4)]"
      style={{
        background: `conic-gradient(hsl(var(--primary)) ${safeProgress * 3.6}deg, hsl(var(--muted)) ${safeProgress * 3.6}deg 360deg)`,
      }}
      aria-label={label}
    >
      <div className="flex size-[4.6rem] flex-col items-center justify-center rounded-full border border-white/70 bg-white text-center shadow-inner">
        <span className="font-mono text-xl font-semibold tracking-[-0.04em] text-foreground">
          {safeProgress.toFixed(0)}%
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          atual
        </span>
      </div>
    </div>
  );
}

function LoadingGoals() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_24rem]">
        <Skeleton className="h-72 rounded-[32px]" />
        <Skeleton className="h-72 rounded-[32px]" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-72 rounded-[28px]" />
        <Skeleton className="h-72 rounded-[28px]" />
        <Skeleton className="h-72 rounded-[28px]" />
      </div>
    </div>
  );
}

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

  const completedGoals = goals.filter(
    (goal) => goal.status === 'completed'
  ).length;
  const inProgressGoals = goals.filter(
    (goal) => goal.status === 'in_progress'
  ).length;
  const averageProgress =
    goals.length > 0
      ? goals.reduce((sum, goal) => sum + clampProgress(goal), 0) / goals.length
      : 0;

  if (goals.length === 0) {
    return (
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_23rem]">
          <Card className="border-primary/12 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12)_0%,rgba(255,255,255,0.98)_34%,rgba(255,255,255,0.94)_100%)]">
            <CardHeader className="gap-5">
              <Badge variant="cosmic">Ciclo de evolução pessoal</Badge>
              <div className="space-y-3">
                <CardTitle className="text-3xl md:text-4xl">
                  Seu mapa de metas ainda está vazio.
                </CardTitle>
                <CardDescription className="max-w-3xl text-base leading-7">
                  Quando você criar a primeira meta, esta visão passará a
                  acompanhar progresso, conclusão e ritmo real de evolução sem
                  depender de dados simulados.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <CreateGoalModal onCreated={fetchGoals}>
                <Button size="lg">
                  <Plus />
                  Criar primeira meta
                </Button>
              </CreateGoalModal>
              <div className="rounded-full border border-border/70 bg-white/78 px-4 py-3 text-sm text-muted-foreground">
                A criação manual grava diretamente em `goals`.
              </div>
            </CardContent>
          </Card>

          <Card className="border-cosmic/12 bg-[radial-gradient(circle_at_top,hsl(var(--cosmic)/0.12)_0%,rgba(255,255,255,0.98)_40%,rgba(255,255,255,0.94)_100%)]">
            <CardHeader className="gap-4">
              <Badge variant="info">Pronto para uso real</Badge>
              <div className="space-y-2">
                <CardTitle className="text-2xl">
                  Como esta tela funciona
                </CardTitle>
                <CardDescription>
                  Nada aqui depende de placeholder visual.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] border border-white/75 bg-white/78 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Origem
                </p>
                <p className="mt-2 text-sm leading-7 text-foreground">
                  As metas podem nascer do seu plano de IA ou da criação manual.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/75 bg-white/78 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Persistência
                </p>
                <p className="mt-2 text-sm leading-7 text-foreground">
                  Os registros são lidos e escritos na tabela `goals` desta
                  instância.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/75 bg-white/78 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Evolução
                </p>
                <p className="mt-2 text-sm leading-7 text-foreground">
                  Assim que existir pelo menos uma meta, a página passa a
                  mostrar progresso percentual, status e atualização individual.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_23rem]">
        <Card className="border-primary/12 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12)_0%,rgba(255,255,255,0.98)_34%,rgba(255,255,255,0.94)_100%)]">
          <CardHeader className="gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-4">
                <Badge variant="success">Acompanhamento vivo</Badge>
                <div className="space-y-3">
                  <CardTitle className="text-3xl md:text-4xl">
                    Seu ciclo de metas já está em movimento.
                  </CardTitle>
                  <CardDescription className="max-w-3xl text-base leading-7">
                    Aqui ficam metas reais com atualização real de progresso,
                    para sustentar foco, leveza e consistência sem ruído visual.
                  </CardDescription>
                </div>
              </div>

              <CreateGoalModal onCreated={fetchGoals}>
                <Button size="lg">
                  <Plus />
                  Nova meta
                </Button>
              </CreateGoalModal>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/80 bg-white/78 p-4 shadow-sm backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Total de metas
              </p>
              <p className="mt-3 font-mono text-4xl font-semibold tracking-[-0.04em] text-foreground">
                {goals.length}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Metas carregadas desta conta.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/80 bg-white/78 p-4 shadow-sm backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Concluídas
              </p>
              <p className="mt-3 font-mono text-4xl font-semibold tracking-[-0.04em] text-foreground">
                {completedGoals}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Entregas já finalizadas neste ciclo.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/80 bg-white/78 p-4 shadow-sm backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Progresso médio
              </p>
              <p className="mt-3 font-mono text-4xl font-semibold tracking-[-0.04em] text-foreground">
                {averageProgress.toFixed(0)}%
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Média real calculada a partir do progresso atual.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/12 bg-[radial-gradient(circle_at_top,hsl(var(--accent)/0.12)_0%,rgba(255,255,255,0.98)_40%,rgba(255,255,255,0.94)_100%)]">
          <CardHeader className="gap-4">
            <Badge variant="warning">Leitura rápida</Badge>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Panorama do momento</CardTitle>
              <CardDescription>
                Um recorte simples e objetivo da sua evolução atual.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-white/75 bg-white/78 p-4">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Em progresso
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {inProgressGoals} metas pedindo continuidade gentil.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/75 bg-white/78 p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-golden" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Concluídas
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {completedGoals} metas já atingiram o alvo.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/75 bg-white/78 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-info" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Ritmo médio
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {averageProgress.toFixed(0)}% de avanço consolidado.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal) => {
          const statusKey =
            goal.status in statusMap ? goal.status : 'in_progress';
          const { icon: StatusIcon, badge, label, tone } = statusMap[statusKey];
          const progressPercentage = clampProgress(goal);

          return (
            <Card
              key={goal.id}
              className="overflow-hidden border-border/70 bg-white/90 shadow-[0_20px_60px_-34px_rgba(22,21,48,0.35)] backdrop-blur-xl"
            >
              <CardHeader className="gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Badge variant={badge}>{label}</Badge>
                    <div className="space-y-2">
                      <CardTitle className="text-2xl">{goal.title}</CardTitle>
                      <CardDescription>
                        {goal.description ||
                          'Meta cadastrada sem descrição adicional.'}
                      </CardDescription>
                    </div>
                  </div>
                  <GoalProgressRing
                    progress={progressPercentage}
                    label={`Progresso da meta ${goal.title}`}
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline">{goal.category || 'Geral'}</Badge>
                  <div
                    className={cn(
                      'flex items-center gap-2 text-sm font-medium',
                      tone
                    )}
                  >
                    <StatusIcon className="h-4 w-4" />
                    {label}
                  </div>
                </div>

                <div className="rounded-[24px] border border-border/70 bg-muted/30 p-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      Progresso atual
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatMetricValue(goal.current_value, goal.unit)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">Alvo</span>
                    <span className="font-semibold text-foreground">
                      {formatMetricValue(goal.target_value, goal.unit)}
                    </span>
                  </div>
                  <Progress
                    aria-label={`Progresso da meta ${goal.title}`}
                    value={progressPercentage}
                    className="mt-4 h-3"
                  />
                </div>

                <UpdateGoalProgressModal goal={goal} onUpdate={fetchGoals}>
                  <Button variant="secondary" className="w-full">
                    Atualizar progresso
                  </Button>
                </UpdateGoalProgressModal>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
