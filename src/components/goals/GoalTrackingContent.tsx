'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Flame,
  Plus,
  Sparkles,
  Target,
  Trash2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import {
  CRITERIOS_DAS_SEQUENCIAS,
  type TipoDeSequencia,
} from '@/lib/metas/catalogo';
import { cn } from '@/lib/utils';

import { CreateAutoGoalModal } from './CreateAutoGoalModal';
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
  metric_key: string | null;
  metric_direction: string | null;
  deadline: string | null;
  auto_sample_days: number | null;
  status: string;
}

interface Sequencia {
  tipo: string;
  atual: number;
  maisLonga: number;
  ultimoDia: string;
}

interface Sincronizacao {
  sequencias: Sequencia[];
  aderencia: { score: number; level: string };
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

const TIPOS_DE_SEQUENCIA = Object.keys(
  CRITERIOS_DAS_SEQUENCIAS
) as TipoDeSequencia[];

// Progresso até o alvo; em metas de redução (peso), a distância que falta
// vira o progresso: no alvo ou abaixo dele, 100%.
const clampProgress = (goal: Goal) => {
  if (!goal.target_value || goal.target_value <= 0) {
    return 0;
  }
  if (goal.metric_direction === 'down') {
    if (!goal.auto_sample_days) return 0;
    return goal.current_value <= goal.target_value
      ? 100
      : Math.max(0, (goal.target_value / goal.current_value) * 100);
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

  return `${Number(value).toLocaleString('pt-BR')} ${unit ?? ''}`.trim();
};

function dataBr(data: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${data.slice(0, 10)}T12:00:00Z`));
}

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

function Sequencias({ dados }: { dados: Sincronizacao }) {
  const porTipo = new Map(dados.sequencias.map((s) => [s.tipo, s]));
  return (
    <section
      aria-labelledby="titulo-sequencias"
      className="flex flex-col gap-3"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h3
          id="titulo-sequencias"
          className="font-display text-lg font-semibold text-foreground"
        >
          Suas sequências
        </h3>
        <p className="text-sm text-muted-foreground">
          Aderência {dados.aderencia.score}% · {dados.aderencia.level}
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {TIPOS_DE_SEQUENCIA.map((tipo) => {
          const sequencia = porTipo.get(tipo);
          const atual = sequencia?.atual ?? 0;
          return (
            <li
              key={tipo}
              className="flex min-w-0 flex-col gap-1 rounded-xl border border-border bg-card p-4"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Flame
                  aria-hidden="true"
                  className={cn(
                    'h-4 w-4 shrink-0',
                    atual > 0 ? 'text-warning' : 'text-muted-foreground'
                  )}
                />
                {CRITERIOS_DAS_SEQUENCIAS[tipo].rotulo}
              </span>
              <span className="font-display text-2xl font-semibold tabular-nums text-foreground">
                {atual} {atual === 1 ? 'dia' : 'dias'}
              </span>
              <span className="text-xs text-muted-foreground">
                {CRITERIOS_DAS_SEQUENCIAS[tipo].regra}
                {sequencia && sequencia.maisLonga > atual
                  ? ` · recorde ${sequencia.maisLonga}`
                  : ''}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/*
  Metas no layout "Lyra Clean" aprovado: sequências, três indicadores,
  cartões de meta com barra de progresso e um cartão tracejado para criar
  outra meta. Metas automáticas se atualizam sozinhas com o registro do dia
  (tarefa 43); as manuais continuam com "Atualizar progresso".
*/
export function GoalTrackingContent() {
  const { db, session } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sincronizacao, setSincronizacao] = useState<Sincronizacao | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id ?? null;

  // Recalcula metas automáticas, prazos e sequências no servidor e lê as
  // metas já atualizadas.
  const carregar = useCallback(
    async (ownerId: string) => {
      let dados: Sincronizacao | null = null;
      try {
        const resposta = await fetch('/api/metas/sincronizar', {
          method: 'POST',
          credentials: 'include',
        });
        if (resposta.ok) dados = (await resposta.json()) as Sincronizacao;
      } catch {
        dados = null;
      }
      const resultado = await db
        .from('goals')
        .select('*')
        .eq('user_id', ownerId)
        .order('created_at', { ascending: false });
      return { dados, resultado };
    },
    [db]
  );

  const aplicar = useCallback(
    ({ dados, resultado }: Awaited<ReturnType<typeof carregar>>) => {
      setSincronizacao(dados);
      if (resultado.error) {
        toast.error('Erro ao carregar metas.', {
          description: resultado.error.message,
        });
        setGoals([]);
      } else {
        setGoals((resultado.data as Goal[]) ?? []);
      }
      setLoading(false);
    },
    []
  );

  const fetchGoals = useCallback(async () => {
    if (!userId) return;
    aplicar(await carregar(userId));
  }, [aplicar, carregar, userId]);

  // Carga inicial (o estado inicial já é "carregando").
  useEffect(() => {
    if (!userId) return;
    let active = true;
    carregar(userId).then((resultado) => {
      if (active) aplicar(resultado);
    });
    return () => {
      active = false;
    };
  }, [aplicar, carregar, userId]);

  const excluir = async (goal: Goal) => {
    const { error } = await db.from('goals').delete().eq('id', goal.id);
    if (error) {
      toast.error('Erro ao excluir a meta.', { description: error.message });
      return;
    }
    toast.success('Meta excluída.');
    void fetchGoals();
  };

  if (loading) {
    return <LoadingGoals />;
  }

  const acoes = (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <CreateGoalModal onCreated={fetchGoals}>
        <Button size="lg" variant="secondary">
          <Plus />
          Meta manual
        </Button>
      </CreateGoalModal>
      <CreateAutoGoalModal onCreated={fetchGoals}>
        <Button size="lg">
          <Sparkles />
          Meta automática
        </Button>
      </CreateAutoGoalModal>
    </div>
  );

  if (goals.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {sincronizacao ? <Sequencias dados={sincronizacao} /> : null}
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
          <p className="mt-2 max-w-md text-body leading-relaxed text-muted-foreground">
            Crie uma meta automática (passos, sono, água, meditação, minutos
            ativos ou peso) e ela avança sozinha com o seu registro do dia, ou
            uma meta manual para qualquer outro objetivo.
          </p>
          <div className="mt-6">{acoes}</div>
        </section>
      </div>
    );
  }

  const completedGoals = goals.filter(
    (goal) => goal.status === 'completed'
  ).length;
  const averageProgress =
    goals.reduce((sum, goal) => sum + clampProgress(goal), 0) / goals.length;

  return (
    <div className="flex flex-col gap-6">
      {acoes}

      {sincronizacao ? <Sequencias dados={sincronizacao} /> : null}

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
          const automatica = goal.metric_key !== null;
          const semDados = automatica && !goal.auto_sample_days;

          return (
            <article
              key={goal.id}
              className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{goal.category || 'Geral'}</Badge>
                  {automatica ? (
                    <Badge variant="cosmic">
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      Automática
                    </Badge>
                  ) : null}
                </div>
                <span
                  className={cn(
                    'flex items-center gap-1.5 text-caption font-medium',
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
                {goal.deadline ? (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                    Prazo: {dataBr(goal.deadline)}
                  </p>
                ) : null}
              </div>

              <div className="mt-auto flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {semDados
                      ? 'Sem registros na janela'
                      : formatMetricValue(goal.current_value, goal.unit)}{' '}
                    de {formatMetricValue(goal.target_value, goal.unit)}
                  </span>
                  <strong className="font-semibold text-foreground">
                    {progressPercentage.toFixed(0)}%
                  </strong>
                </div>
                <Progress
                  aria-label={`Progresso da meta ${goal.title}`}
                  value={progressPercentage}
                />
                {automatica ? (
                  <p className="text-xs text-muted-foreground">
                    {semDados
                      ? 'Faça o check-in do dia: a meta se atualiza sozinha.'
                      : `Calculada com ${goal.auto_sample_days} ${goal.auto_sample_days === 1 ? 'dia' : 'dias'} de registro · atualiza sozinha.`}
                  </p>
                ) : null}
              </div>

              <div className="flex gap-2">
                {automatica ? null : (
                  <UpdateGoalProgressModal goal={goal} onUpdate={fetchGoals}>
                    <Button variant="secondary" size="lg" className="flex-1">
                      Atualizar progresso
                    </Button>
                  </UpdateGoalProgressModal>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className={automatica ? 'flex-1' : undefined}
                      // O nome começa pelo texto visível (WCAG 2.5.3).
                      aria-label={`Excluir meta: ${goal.title}`}
                    >
                      <Trash2 aria-hidden="true" />
                      {automatica ? 'Excluir meta' : null}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir esta meta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &quot;{goal.title}&quot; será removida. O seu registro
                        do dia continua guardado.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void excluir(goal)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </article>
          );
        })}

        <CreateAutoGoalModal onCreated={fetchGoals}>
          <button
            type="button"
            className="flex min-h-60 flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-control/50 bg-transparent px-6 text-center text-body font-medium text-foreground/80 transition-colors hover:border-primary hover:bg-card focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-5 w-5 text-primary" aria-hidden="true" />
            Criar outra meta automática
            <span className="text-caption font-normal text-muted-foreground">
              Avança sozinha com o seu registro do dia
            </span>
          </button>
        </CreateAutoGoalModal>
      </section>
    </div>
  );
}
