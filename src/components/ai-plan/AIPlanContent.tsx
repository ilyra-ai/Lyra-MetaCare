'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useHealthOrchestrator } from '../../context/HealthOrchestratorContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CheckCircle,
  Dumbbell,
  Utensils,
  Moon,
  Zap,
  BrainCircuit,
  Heart,
  Leaf,
  Sun,
  Clock,
  Activity,
  RefreshCw,
  Droplet,
  Scale,
  Smile,
  Waves,
  Loader2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// --- Type Definitions ---
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

// --- Icon Mapping ---
const IconMap: Record<string, React.ElementType> = {
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
  sedentary: Clock,
  breath: Waves,
  cold: Zap,
  strain: Activity,
  regularity: Sun,
  light: Moon,
  deep_sleep: BrainCircuit,
  glucose_control: Droplet,
  post_meal: Activity,
  tir: Scale,
  meditation: Smile,
  cognition: BrainCircuit,
  social: Heart,
  CheckCircle,
};

// --- PlanItem Component ---
const PlanItem: React.FC<{ item: PlanItemData; color: string }> = ({
  item,
  color,
}) => {
  const ItemIcon = IconMap[item.image] || CheckCircle;
  return (
    <Card className="flex flex-col sm:flex-row justify-between p-4 hover:shadow-lg transition-shadow duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 ring-1 ring-gray-200 dark:ring-gray-700">
      <div className="flex-1 space-y-2 pr-4">
        <h3 className={cn('font-bold text-lg', color)}>{item.title}</h3>
        <p className="text-sm text-muted-foreground">{item.details}</p>
      </div>
      <div className="w-full sm:w-24 h-24 flex items-center justify-center mt-4 sm:mt-0 bg-gray-100/50 dark:bg-gray-900/50 rounded-xl flex-shrink-0 shadow-inner">
        <ItemIcon className={cn('h-10 w-10', color)} />
      </div>
    </Card>
  );
};

// --- Main Component ---
export function AIPlanContent() {
  const { db, session } = useAuth();
  const { vitals, isSyncing, syncError } = useHealthOrchestrator();
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchPlan = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    const { data, error } = await db
      .from('ai_plans')
      .select('plan_data')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.message !== 'Registro não encontrado.') {
      toast.error('Erro ao carregar seu plano do banco de dados principal.', {
        description: error.message,
      });
    } else if (data) {
      setPlan(data.plan_data as PlanData);
    }
    setLoading(false);
  }, [session, db]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const handleGeneratePlan = async () => {
    if (!session?.user) return;
    if (isSyncing) {
      toast.info('Aguarde a coleta nativa dos biomarcadores terminar.');
      return;
    }

    if (syncError) {
      toast.warning('Sincronização parcial', {
        description:
          'Nem todos os sensores biomédicos puderam ser lidos no seu dispositivo. O motor local usará apenas dados comprovadamente disponíveis.',
      });
    }

    setIsGenerating(true);
    toast.info(
      'Processando plano localmente com motor determinístico e persistência MySQL.'
    );

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

      const { data, error } = await db.functions.invoke('generate-ai-plan', {
        body: payload,
      });

      if (error) {
        console.error('Falha completa no motor local de orquestração:', error);
        throw new Error(
          error.message || 'A infraestrutura local de geração do plano falhou.'
        );
      }

      if (data && typeof data === 'object' && 'error' in data && data.error) {
        throw new Error(String(data.error));
      }

      toast.success(
        'O motor local concluiu o processamento cruzado astrológico-fisiológico.'
      );
      setPlan(data as PlanData);
    } catch (error) {
      toast.error('Processamento interrompido.', {
        description:
          error instanceof Error
            ? error.message
            : 'Falha desconhecida ao gerar o plano local.',
        duration: 10000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-[60vh] w-full rounded-2xl" />;
  }

  if (!plan) {
    return (
      <Card className="text-center p-10 animate-in fade-in duration-700 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-0 ring-1 ring-white/20 shadow-2xl">
        <CardHeader>
          <div className="mx-auto w-24 h-24 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center shadow-inner mb-6">
            <BrainCircuit className="h-12 w-12 text-teal-600 dark:text-teal-400" />
          </div>
          <CardTitle className="text-3xl font-light tracking-tight text-gray-900 dark:text-white mt-4">
            Pronto para sua Orquestração?
          </CardTitle>
          <CardDescription className="text-lg mt-2 font-medium">
            O motor local combinará seus sinais biológicos disponíveis com os
            ciclos astrométricos e persistirá o plano diretamente em MySQL.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-8">
          <Button
            onClick={handleGeneratePlan}
            disabled={isGenerating || isSyncing}
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full px-8 py-6 text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Modelando Sinergias Localmente...
              </>
            ) : isSyncing ? (
              <>
                <RefreshCw className="mr-3 h-6 w-6 animate-spin" />
                Coletando leituras fisiológicas e contexto astrológico...
              </>
            ) : (
              <>
                <Zap className="mr-3 h-6 w-6" />
                Orquestrar Seu Bem-Estar
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const pillars = plan.pillars;
  const firstPillarKey = Object.keys(pillars)[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Card className="border-0 ring-1 ring-teal-500/30 shadow-2xl bg-gradient-to-br from-teal-50/50 to-rose-50/10 dark:from-teal-900/20 dark:to-gray-900 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-3xl text-teal-700 dark:text-teal-400 flex items-center justify-between font-light tracking-tight">
            <div className="flex items-center">
              <Zap className="h-8 w-8 mr-4 text-rose-500" />
              Seu Plano Orquestrado
            </div>
            <Button
              onClick={handleGeneratePlan}
              disabled={isGenerating || isSyncing}
              variant="outline"
              size="sm"
              className="rounded-full border-teal-200 dark:border-teal-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
              ) : (
                <RefreshCw className="h-4 w-4 text-teal-600" />
              )}
              <span className="ml-2 hidden sm:inline text-teal-700 dark:text-teal-300">
                Re-orquestrar IA
              </span>
            </Button>
          </CardTitle>
          <CardDescription className="text-base text-gray-600 dark:text-gray-300">
            {plan.summary}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue={firstPillarKey} className="w-full">
        <TabsList className="grid w-full h-auto p-2 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md grid-cols-3 rounded-2xl shadow-inner border border-gray-100 dark:border-gray-700">
          {Object.entries(pillars).map(([key, pillar]) => {
            const PillarIcon = IconMap[pillar.icon] || BrainCircuit;
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-3 p-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
              >
                <PillarIcon
                  className={cn('h-5 w-5 mb-1 sm:mb-0', pillar.color)}
                />
                <span className="font-medium text-sm sm:text-base">
                  {pillar.title}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(pillars).map(([key, pillar]) => (
          <TabsContent
            key={key}
            value={key}
            className="mt-8 animate-in slide-in-from-bottom-4 duration-500"
          >
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="px-0">
                <CardTitle
                  className={cn(
                    'text-2xl font-medium tracking-tight',
                    pillar.color
                  )}
                >
                  {pillar.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {pillar.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-0 mt-4">
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {pillar.items.map((item) => (
                    <PlanItem key={item.id} item={item} color={pillar.color} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
