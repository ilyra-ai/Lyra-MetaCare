'use client';

import type { ElementType } from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useHealthOrchestrator } from '@/context/HealthOrchestratorContext';
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Heart,
  Leaf,
  Loader2,
  Moon,
  Orbit,
  RefreshCw,
  Scale,
  Sparkles,
  SunMedium,
  Utensils,
  Waves,
  Zap,
  Droplet,
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
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { scaleRem } from '@/lib/site-page-config/runtime';
import { cn } from '@/lib/utils';

interface PlanItemData {
  id: string;
  title: string;
  details: string;
  image: string;
}

interface PillarData {
  title: string;
  icon: string;
  color: string;
  description: string;
  items: PlanItemData[];
}

interface PlanData {
  summary: string;
  pillars: Record<string, PillarData>;
}

function isPlanData(value: unknown): value is PlanData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PlanData>;
  return (
    typeof candidate.summary === 'string' &&
    !!candidate.pillars &&
    typeof candidate.pillars === 'object'
  );
}

const IconMap: Record<string, ElementType> = {
  Utensils,
  Dumbbell,
  Moon,
  RefreshCw,
  Droplet,
  BrainCircuit,
  protein: Utensils,
  fiber: Leaf,
  hydration: Droplet,
  strength: Dumbbell,
  cardio: Heart,
  sedentary: Clock3,
  breath: Waves,
  cold: Zap,
  strain: Activity,
  regularity: SunMedium,
  light: Moon,
  deep_sleep: BrainCircuit,
  glucose_control: Droplet,
  post_meal: Activity,
  tir: Scale,
  meditation: Waves,
  cognition: BrainCircuit,
  social: Heart,
  CheckCircle: CheckCircle2,
};

/*
  Tons por pilar no visual "Lyra Clean": fundo suave chapado + texto do
  próprio estado. O violeta fica reservado ao conteúdo astral/IA, então
  movimento usa o tom de alerta e sono o tom informativo.
*/
type ToneKey = 'primary' | 'warning' | 'info' | 'golden';

const toneStyles: Record<
  ToneKey,
  {
    badge: 'default' | 'warning' | 'cosmic' | 'golden' | 'success' | 'info';
    icon: string;
  }
> = {
  primary: {
    badge: 'default',
    icon: 'bg-sidebar-accent text-primary',
  },
  warning: {
    badge: 'warning',
    icon: 'bg-warning-light text-warning',
  },
  info: {
    badge: 'info',
    icon: 'bg-info-light text-info',
  },
  golden: {
    badge: 'golden',
    icon: 'bg-golden-light text-golden',
  },
};

const hasMetricValue = (value: number | null | undefined): value is number =>
  value !== null && value !== undefined && Number.isFinite(value);

function resolveTone(pillarKey: string): ToneKey {
  if (pillarKey.includes('nutrition')) {
    return 'golden';
  }

  if (pillarKey.includes('exercise') || pillarKey.includes('movement')) {
    return 'warning';
  }

  if (pillarKey.includes('sleep')) {
    return 'info';
  }

  return 'primary';
}

function LoadingPlan() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_22rem]">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <Skeleton className="h-14 rounded-xl" />
      <Skeleton className="h-128 rounded-xl" />
    </div>
  );
}

function PlanItemCard({
  item,
  itemIndex,
  tone,
}: {
  item: PlanItemData;
  itemIndex: number;
  tone: ToneKey;
}) {
  const styles = toneStyles[tone];
  const ItemIcon = IconMap[item.image] || CheckCircle2;

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full border border-border bg-background font-display text-xs font-semibold text-muted-foreground">
              {String(itemIndex + 1).padStart(2, '0')}
            </div>
            <div
              className={cn(
                'flex size-10 items-center justify-center rounded-md',
                styles.icon
              )}
            >
              <ItemIcon className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <Badge variant={styles.badge}>Ação real</Badge>
        </div>

        <div className="min-w-0 space-y-2">
          <h3 className="break-words font-display text-lg font-semibold tracking-tight text-foreground">
            {item.title}
          </h3>
          <p className="text-sm leading-6 text-foreground/80">{item.details}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PillarPanel({
  pillarKey,
  pillar,
}: {
  pillarKey: string;
  pillar: PillarData;
}) {
  const tone = resolveTone(pillarKey);
  const styles = toneStyles[tone];
  const PillarIcon = IconMap[pillar.icon] || BrainCircuit;

  return (
    <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader className="gap-4">
          <Badge variant={styles.badge} className="w-fit">
            Pilar ativo
          </Badge>
          <div
            className={cn(
              'flex size-12 items-center justify-center rounded-md',
              styles.icon
            )}
          >
            <PillarIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl">{pillar.title}</CardTitle>
            <CardDescription>{pillar.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Entregas do momento
            </p>
            <p className="mt-2 font-display text-4xl font-semibold tracking-[-0.02em] text-foreground">
              {pillar.items.length}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Recomendações reais produzidas pelo motor local para este eixo.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {pillar.items.map((item, itemIndex) => (
          <PlanItemCard
            key={item.id}
            item={item}
            itemIndex={itemIndex}
            tone={tone}
          />
        ))}
      </div>
    </div>
  );
}

export function AIPlanContent() {
  const { db, session } = useAuth();
  const { vitals, astrology, isSyncing, syncError } = useHealthOrchestrator();
  const { config: appConfig } = usePublicSitePageConfig('app');
  const planConfig = appConfig.aiPlan;
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const userId = session?.user?.id ?? null;

  // Carrega o plano salvo do usuário (o estado inicial já é "carregando").
  useEffect(() => {
    if (!userId) {
      return;
    }

    let active = true;

    const fetchPlan = async () => {
      const { data, error } = await db
        .from('ai_plans')
        .select('plan_data')
        .eq('user_id', userId)
        .maybeSingle();

      if (!active) return;

      if (error) {
        toast.error('Erro ao carregar o plano salvo.', {
          description: error.message,
        });
        setLoading(false);
        return;
      }

      if (data?.plan_data && isPlanData(data.plan_data)) {
        setPlan(data.plan_data);
      } else if (data?.plan_data) {
        toast.error('Plano persistido em formato inválido.', {
          description:
            'O registro encontrado em ai_plans não segue o contrato esperado do motor local.',
        });
        setPlan(null);
      } else {
        setPlan(null);
      }

      setLoading(false);
    };

    void fetchPlan();

    return () => {
      active = false;
    };
  }, [db, userId]);

  const handleGeneratePlan = async () => {
    if (!session?.user) {
      return;
    }

    if (isSyncing) {
      toast.info('Aguarde a sincronização atual terminar.');
      return;
    }

    if (syncError) {
      toast.info('Plano seguirá com contexto parcial, porém real.', {
        description: syncError,
      });
    }

    setIsGenerating(true);
    toast.info('Gerando plano com motor local e persistindo em MySQL.');

    try {
      const payload = {
        metrics: {
          hrv_ms: null,
          sleep_duration_minutes: vitals?.sleepDurationMinutes ?? null,
          steps: null,
          blood_glucose_mgdl: vitals?.bloodGlucoseMgDl ?? null,
          weight_kg: vitals?.weightKg ?? null,
        },
      };

      const { data, error } = await db.functions.invoke<PlanData>(
        'generate-ai-plan',
        {
          body: payload,
        }
      );

      if (error) {
        throw new Error(
          error.message || 'A infraestrutura local de geração do plano falhou.'
        );
      }

      if (!data || !isPlanData(data)) {
        throw new Error(
          'O motor respondeu, mas o payload do plano veio fora do contrato esperado.'
        );
      }

      setPlan(data);
      toast.success('Plano atualizado com sucesso.', {
        description:
          'A leitura local cruzou sinais reais disponíveis com o contexto astrológico atual.',
      });
    } catch (error) {
      toast.error('Não foi possível concluir a orquestração.', {
        description:
          error instanceof Error
            ? error.message
            : 'Falha desconhecida ao gerar o plano.',
        duration: 10000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return <LoadingPlan />;
  }

  const pillarEntries = plan ? Object.entries(plan.pillars) : [];
  const firstPillarKey = pillarEntries[0]?.[0] ?? 'nutrition';
  const totalRecommendations = pillarEntries.reduce(
    (sum, [, pillar]) => sum + pillar.items.length,
    0
  );
  const availableSignals = [
    vitals?.heartRate,
    vitals?.sleepDurationMinutes,
    vitals?.bloodGlucoseMgDl,
    vitals?.weightKg,
    vitals?.moodScore,
  ].filter(hasMetricValue).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_23rem]">
        <Card className="min-w-0">
          <CardHeader className="gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 space-y-4">
                <Badge variant="cosmic" className="w-fit">
                  {planConfig.heroBadge}
                </Badge>
                <div className="space-y-3">
                  <CardTitle
                    className="text-2xl tracking-[-0.02em] md:text-3xl"
                    style={{
                      fontSize: scaleRem(2, appConfig.typography.pageTitle),
                    }}
                  >
                    {plan
                      ? planConfig.heroReadyTitle
                      : planConfig.heroEmptyTitle}
                  </CardTitle>
                  <CardDescription
                    className="max-w-3xl text-base leading-relaxed text-foreground/80"
                    style={{
                      fontSize: scaleRem(1, appConfig.typography.pageBody),
                    }}
                  >
                    {plan ? plan.summary : planConfig.heroEmptyDescription}
                  </CardDescription>
                </div>
              </div>

              <Button
                onClick={() => void handleGeneratePlan()}
                disabled={isGenerating || isSyncing}
                variant={plan ? 'secondary' : 'default'}
                size="lg"
                className="w-full sm:w-auto sm:min-w-52"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    {planConfig.generatingButtonLabel}
                  </>
                ) : isSyncing ? (
                  <>
                    <RefreshCw className="animate-spin" aria-hidden="true" />
                    {planConfig.syncingButtonLabel}
                  </>
                ) : (
                  <>
                    <Sparkles aria-hidden="true" />
                    {plan
                      ? planConfig.regenerateButtonLabel
                      : planConfig.generateButtonLabel}
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-md border border-border bg-background p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {planConfig.pillarsCountLabel}
              </p>
              <p className="mt-2 font-display text-4xl font-semibold tracking-[-0.02em] text-foreground">
                {plan ? pillarEntries.length : 0}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Estruturas do plano disponíveis nesta leitura.
              </p>
            </div>

            <div className="rounded-md border border-border bg-background p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {planConfig.recommendationsLabel}
              </p>
              <p className="mt-2 font-display text-4xl font-semibold tracking-[-0.02em] text-foreground">
                {plan ? totalRecommendations : 0}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Ações persistidas a partir do motor local desta conta.
              </p>
            </div>

            <div className="rounded-md border border-border bg-background p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {planConfig.signalsLabel}
              </p>
              <p className="mt-2 font-display text-4xl font-semibold tracking-[-0.02em] text-foreground">
                {availableSignals}/5
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Leituras ativas reconhecidas na orquestração atual.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="gap-4">
            <Badge variant="cosmic" className="w-fit">
              {planConfig.liveContextBadge}
            </Badge>
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-cosmic-light text-cosmic">
                <Orbit className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 space-y-1">
                <CardTitle className="text-xl">
                  {astrology
                    ? `Lua em ${astrology.moonSign}`
                    : planConfig.liveContextTitleFallback}
                </CardTitle>
                <CardDescription>
                  {astrology
                    ? `${astrology.nakshatra} · ${astrology.tithi}`
                    : planConfig.liveContextDescriptionFallback}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-border bg-background p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Energia do momento
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/80">
                {astrology
                  ? astrology.impactOnHealth.energy
                  : 'Sincronize o ecossistema para captar o estado do momento.'}
              </p>
            </div>
            <div className="rounded-md border border-border bg-background p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Estado da sincronização
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/80">
                {isSyncing
                  ? 'Sincronizando leituras reais para refinar o plano.'
                  : syncError
                    ? syncError
                    : 'Sinais disponíveis já consolidados para esta leitura.'}
              </p>
            </div>
            <div className="rounded-md border border-border bg-background p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {planConfig.persistenceTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/80">
                {planConfig.persistenceDescription}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {!plan ? (
        <Card>
          <CardContent className="grid gap-4 p-6 md:grid-cols-3">
            <div className="rounded-md border border-border bg-background p-5">
              <div className="flex size-11 items-center justify-center rounded-md bg-cosmic-light text-cosmic">
                <BrainCircuit className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-foreground">
                {planConfig.emptyLocalAiTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {planConfig.emptyLocalAiDescription}
              </p>
            </div>

            <div className="rounded-md border border-border bg-background p-5">
              <div className="flex size-11 items-center justify-center rounded-md bg-cosmic-light text-cosmic">
                <Moon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-foreground">
                {planConfig.emptyAstroTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {planConfig.emptyAstroDescription}
              </p>
            </div>

            <div className="rounded-md border border-border bg-background p-5">
              <div className="flex size-11 items-center justify-center rounded-md bg-sidebar-accent text-primary">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-foreground">
                {planConfig.emptyPersistenceTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {planConfig.emptyPersistenceDescription}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={firstPillarKey} className="w-full space-y-6">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-xl border border-border bg-card p-2">
            {pillarEntries.map(([key, pillar]) => {
              const PillarIcon = IconMap[pillar.icon] || BrainCircuit;
              const tone = toneStyles[resolveTone(key)];

              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="rounded-[10px] border border-transparent px-3 py-2 data-[state=active]:border-transparent data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground data-[state=active]:shadow-none"
                >
                  <span
                    className={cn(
                      'mr-2 flex size-7 items-center justify-center rounded-full',
                      tone.icon
                    )}
                  >
                    <PillarIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium">{pillar.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {pillar.items.length}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {pillarEntries.map(([key, pillar]) => (
            <TabsContent key={key} value={key} className="m-0">
              <PillarPanel pillarKey={key} pillar={pillar} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
