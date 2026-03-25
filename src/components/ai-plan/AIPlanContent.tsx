'use client';

import type { ElementType } from 'react';
import { useCallback, useEffect, useState } from 'react';
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

type ToneKey = 'primary' | 'accent' | 'cosmic' | 'golden';

const toneStyles: Record<
  ToneKey,
  {
    badge: 'default' | 'warning' | 'cosmic' | 'golden' | 'success' | 'info';
    icon: string;
    frame: string;
    tile: string;
  }
> = {
  primary: {
    badge: 'default',
    icon: 'bg-primary/12 text-primary',
    frame:
      'border-primary/12 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.14)_0%,rgba(255,255,255,0.96)_36%,rgba(255,255,255,0.92)_100%)]',
    tile: 'border-primary/12',
  },
  accent: {
    badge: 'warning',
    icon: 'bg-accent/12 text-accent',
    frame:
      'border-accent/12 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.14)_0%,rgba(255,255,255,0.96)_36%,rgba(255,255,255,0.92)_100%)]',
    tile: 'border-accent/12',
  },
  cosmic: {
    badge: 'cosmic',
    icon: 'bg-cosmic/12 text-cosmic',
    frame:
      'border-cosmic/12 bg-[radial-gradient(circle_at_top_right,hsl(var(--cosmic)/0.14)_0%,rgba(255,255,255,0.96)_36%,rgba(255,255,255,0.92)_100%)]',
    tile: 'border-cosmic/12',
  },
  golden: {
    badge: 'golden',
    icon: 'bg-golden/12 text-golden',
    frame:
      'border-golden/12 bg-[radial-gradient(circle_at_top_right,hsl(var(--golden)/0.14)_0%,rgba(255,255,255,0.96)_36%,rgba(255,255,255,0.92)_100%)]',
    tile: 'border-golden/12',
  },
};

const hasMetricValue = (value: number | null | undefined): value is number =>
  value !== null && value !== undefined && Number.isFinite(value);

function resolveTone(pillarKey: string): ToneKey {
  if (pillarKey.includes('nutrition')) {
    return 'golden';
  }

  if (pillarKey.includes('exercise') || pillarKey.includes('movement')) {
    return 'accent';
  }

  if (pillarKey.includes('sleep')) {
    return 'cosmic';
  }

  return 'primary';
}

function LoadingPlan() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_22rem]">
        <Skeleton className="h-72 rounded-[32px]" />
        <Skeleton className="h-72 rounded-[32px]" />
      </div>
      <Skeleton className="h-14 rounded-full" />
      <Skeleton className="h-[32rem] rounded-[32px]" />
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
    <Card
      className={cn(
        'overflow-hidden rounded-[28px] border-white/70 bg-white/88 shadow-[0_18px_55px_-32px_rgba(22,21,48,0.35)] backdrop-blur-xl',
        styles.tile
      )}
    >
      <CardContent className="flex h-full flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-white text-xs font-semibold tracking-[0.18em] text-muted-foreground">
              {String(itemIndex + 1).padStart(2, '0')}
            </div>
            <div
              className={cn(
                'flex size-11 items-center justify-center rounded-[18px]',
                styles.icon
              )}
            >
              <ItemIcon className="h-5 w-5" />
            </div>
          </div>
          <Badge variant={styles.badge}>Ação real</Badge>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            {item.title}
          </h3>
          <p className="text-sm leading-7 text-muted-foreground">
            {item.details}
          </p>
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
      <Card
        className={cn(
          'rounded-[32px] border-white/75 shadow-[0_24px_70px_-36px_rgba(22,21,48,0.35)] backdrop-blur-xl',
          styles.frame
        )}
      >
        <CardHeader className="gap-5">
          <Badge variant={styles.badge}>Pilar ativo</Badge>
          <div
            className={cn(
              'flex size-14 items-center justify-center rounded-[20px] shadow-sm',
              styles.icon
            )}
          >
            <PillarIcon className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">{pillar.title}</CardTitle>
            <CardDescription>{pillar.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[24px] border border-white/70 bg-white/72 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Entregas do momento
            </p>
            <p className="mt-2 font-mono text-4xl font-semibold tracking-[-0.04em] text-foreground">
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
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchPlan = useCallback(async () => {
    if (!session?.user) {
      return;
    }

    setLoading(true);
    const { data, error } = await db
      .from('ai_plans')
      .select('plan_data')
      .eq('user_id', session.user.id)
      .maybeSingle();

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
  }, [db, session?.user]);

  useEffect(() => {
    void fetchPlan();
  }, [fetchPlan]);

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
        <Card className="relative overflow-hidden border-primary/12 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12)_0%,rgba(255,255,255,0.98)_34%,rgba(255,255,255,0.94)_100%)]">
          <div className="orchestrated-orb -left-14 top-2 h-36 w-36 bg-primary/70" />
          <div className="orchestrated-orb bottom-0 right-6 h-28 w-28 bg-cosmic/50" />

          <CardHeader className="relative gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-4">
                <Badge variant="cosmic">
                  Orquestração local com astrologia + IA
                </Badge>
                <div className="space-y-3">
                  <CardTitle className="text-3xl md:text-4xl">
                    {plan
                      ? 'Seu plano do dia está pronto.'
                      : 'Vamos desenhar seu próximo passo com elegância e contexto real.'}
                  </CardTitle>
                  <CardDescription className="max-w-3xl text-base leading-7">
                    {plan
                      ? plan.summary
                      : 'Esta experiência cruza os sinais realmente disponíveis no dispositivo e no banco com o céu atual, gerando um protocolo utilizável e persistido na sua base principal.'}
                  </CardDescription>
                </div>
              </div>

              <Button
                onClick={() => void handleGeneratePlan()}
                disabled={isGenerating || isSyncing}
                variant={plan ? 'secondary' : 'default'}
                size="lg"
                className="min-w-[13rem]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Orquestrando agora
                  </>
                ) : isSyncing ? (
                  <>
                    <RefreshCw className="animate-spin" />
                    Sincronizando sinais
                  </>
                ) : (
                  <>
                    <Sparkles />
                    {plan ? 'Regenerar plano' : 'Gerar plano real'}
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="relative grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/80 bg-white/78 p-4 shadow-sm backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Pilares ativos
              </p>
              <p className="mt-3 font-mono text-4xl font-semibold tracking-[-0.04em] text-foreground">
                {plan ? pillarEntries.length : 0}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Estruturas do plano disponíveis nesta leitura.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/80 bg-white/78 p-4 shadow-sm backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Recomendações reais
              </p>
              <p className="mt-3 font-mono text-4xl font-semibold tracking-[-0.04em] text-foreground">
                {plan ? totalRecommendations : 0}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Ações persistidas a partir do motor local desta conta.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/80 bg-white/78 p-4 shadow-sm backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Sinais disponíveis
              </p>
              <p className="mt-3 font-mono text-4xl font-semibold tracking-[-0.04em] text-foreground">
                {availableSignals}/5
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Leituras ativas reconhecidas na orquestração atual.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-cosmic/12 bg-[radial-gradient(circle_at_top,hsl(var(--cosmic)/0.12)_0%,rgba(255,255,255,0.98)_40%,rgba(255,255,255,0.94)_100%)]">
          <CardHeader className="gap-4">
            <Badge variant="info">Contexto vivo</Badge>
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-[18px] bg-cosmic/12 text-cosmic">
                <Orbit className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl">
                  {astrology
                    ? `Lua em ${astrology.moonSign}`
                    : 'Céu do momento'}
                </CardTitle>
                <CardDescription>
                  {astrology
                    ? `${astrology.nakshatra} · ${astrology.tithi}`
                    : 'O contexto astrológico será consolidado localmente ao sincronizar.'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-white/75 bg-white/76 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Energia do momento
              </p>
              <p className="mt-2 text-sm leading-7 text-foreground">
                {astrology
                  ? astrology.impactOnHealth.energy
                  : 'Sincronize o ecossistema para captar o estado do momento.'}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/75 bg-white/76 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Estado da sincronização
              </p>
              <p className="mt-2 text-sm leading-7 text-foreground">
                {isSyncing
                  ? 'Sincronizando leituras reais para refinar o plano.'
                  : syncError
                    ? syncError
                    : 'Sinais disponíveis já consolidados para esta leitura.'}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/75 bg-white/76 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Persistência
              </p>
              <p className="mt-2 text-sm leading-7 text-foreground">
                O plano é salvo de forma real em `ai_plans` no MySQL desta
                instância.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {!plan ? (
        <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.9))]">
          <CardContent className="grid gap-5 p-6 md:grid-cols-3">
            <div className="rounded-[26px] border border-primary/12 bg-primary/6 p-5">
              <div className="flex size-12 items-center justify-center rounded-[18px] bg-primary/12 text-primary">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                IA local e determinística
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                A geração usa a função local `generate-ai-plan`, sem mock visual
                e sem plano fictício.
              </p>
            </div>

            <div className="rounded-[26px] border border-cosmic/12 bg-cosmic/6 p-5">
              <div className="flex size-12 items-center justify-center rounded-[18px] bg-cosmic/12 text-cosmic">
                <Moon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Astrologia viva
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                O céu do momento vem do motor astrológico local e influencia a
                síntese do protocolo.
              </p>
            </div>

            <div className="rounded-[26px] border border-golden/12 bg-golden/6 p-5">
              <div className="flex size-12 items-center justify-center rounded-[18px] bg-golden/12 text-golden">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Persistência real
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Assim que você gerar, o resultado fica salvo e pode ser lido
                novamente sem simulação.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={firstPillarKey} className="w-full space-y-6">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-3 rounded-[28px] border border-border/60 bg-white/82 p-3">
            {pillarEntries.map(([key, pillar]) => {
              const PillarIcon = IconMap[pillar.icon] || BrainCircuit;
              const tone = toneStyles[resolveTone(key)];

              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="rounded-full border border-transparent px-4 py-3 data-[state=active]:border-border/70 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <span
                    className={cn(
                      'mr-2 flex size-8 items-center justify-center rounded-full',
                      tone.icon
                    )}
                  >
                    <PillarIcon className="h-4 w-4" />
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
