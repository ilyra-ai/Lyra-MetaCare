"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Dumbbell, Utensils, Moon, Zap, BrainCircuit, Heart, Leaf, Sun, Clock, Activity, RefreshCw, Droplet, Scale, Smile, Waves, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { generateHolisticPlan, UserMetrics } from "@/lib/ai/onDeviceEngine";
import { getAstrologicalContext } from "@/lib/astrology/engine";

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
    Utensils, Dumbbell, Moon, RefreshCw, Droplet, BrainCircuit,
    protein: Utensils, fiber: Leaf, hydration: Droplet,
    strength: Dumbbell, cardio: Heart, sedentary: Clock,
    breath: Waves, cold: Zap, strain: Activity,
    regularity: Sun, light: Moon, deep_sleep: BrainCircuit,
    glucose_control: Droplet, post_meal: Activity, tir: Scale,
    meditation: Smile, cognition: BrainCircuit, social: Heart,
    CheckCircle,
};

// --- PlanItem Component ---
const PlanItem: React.FC<{ item: PlanItemData; color: string }> = ({ item, color }) => {
    const ItemIcon = IconMap[item.image] || CheckCircle;
    return (
        <Card className="flex flex-col sm:flex-row justify-between p-4 hover:shadow-md transition-shadow duration-300">
            <div className="flex-1 space-y-2 pr-4">
                <h3 className={cn("font-bold text-lg", color)}>{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.details}</p>
            </div>
            <div className="w-full sm:w-24 h-24 flex items-center justify-center mt-4 sm:mt-0 bg-gray-50 dark:bg-gray-800 rounded-lg flex-shrink-0">
                <ItemIcon className={cn("h-10 w-10", color)} />
            </div>
        </Card>
    );
};

// --- Main Component ---
export function AIPlanContent() {
    const { supabase, session } = useAuth();
    const [plan, setPlan] = useState<PlanData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Web Worker ref para processamento de Machine Learning real
    const worker = useRef<Worker | null>(null);

    const fetchPlan = useCallback(async () => {
        if (!session?.user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("ai_plans")
            .select("plan_data")
            .eq("user_id", session.user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            toast.error("Erro ao carregar seu plano.", { description: error.message });
        } else if (data) {
            setPlan(data.plan_data as PlanData);
        }
        setLoading(false);
    }, [session, supabase]);

    useEffect(() => {
        fetchPlan();

        // Initialize Web Worker for ML
        worker.current = new Worker(new URL('../../lib/ai/worker.ts', import.meta.url), {
            type: 'module'
        });

        const onMessageReceived = (e: MessageEvent) => {
            switch (e.data.status) {
                case 'loading':
                    toast.info(e.data.message);
                    break;
                case 'ready':
                    toast.success(e.data.message);
                    break;
                case 'generating':
                    toast.info(e.data.message);
                    break;
                case 'complete':
                    // ML Generation complete
                    toast.success("Insights de ML On-Device gerados.");
                    // Neste ponto integraríamos o resultado do modelo (e.data.result)
                    // com a engine determinística.
                    break;
                case 'error':
                    toast.error("Erro no modelo On-Device: " + e.data.error);
                    break;
            }
        };

        worker.current.addEventListener('message', onMessageReceived);

        return () => {
            if (worker.current) {
                worker.current.removeEventListener('message', onMessageReceived);
                worker.current.terminate();
            }
        }
    }, [fetchPlan]);

    const handleGeneratePlan = async () => {
        if (!session?.user) return;
        setIsGenerating(true);
        toast.info("Processando dados e gerando plano on-device...");

        try {
            // Buscando métricas reais do banco
            const { data: metricsData } = await supabase
                .from("daily_metrics")
                .select("*")
                .eq("user_id", session.user.id)
                .order("date", { ascending: false })
                .limit(1)
                .single();

            const { data: profile } = await supabase
                .from("profiles")
                .select("goals")
                .eq("id", session.user.id)
                .single();

            const currentMetrics: UserMetrics = {
                hrv_ms: metricsData?.hrv_ms,
                sleep_duration_minutes: metricsData?.sleep_duration_minutes,
                steps: metricsData?.steps,
                goals: profile?.goals || []
            };

            const astroData = getAstrologicalContext(new Date());

            // Disparar o modelo de Machine Learning no Worker (não bloqueante)
            if (worker.current) {
                worker.current.postMessage({
                    prompt: `Gere um conselho curto de saúde considerando HRV de ${currentMetrics.hrv_ms || 50} e fase lunar ${astroData.moonSign}.`
                });
            }

            // Motor ON-DEVICE calculando a base sólida do plano! (Sem requests externos)
            const localGeneratedPlan = await generateHolisticPlan(currentMetrics, astroData);

            // Salvando o resultado no Supabase
            const { error: saveError } = await supabase
                .from('ai_plans')
                .upsert({ user_id: session.user.id, plan_data: localGeneratedPlan }, { onConflict: 'user_id' });

            if (saveError) throw saveError;

            toast.success("Seu plano foi gerado com sucesso pelo motor local!");
            setPlan(localGeneratedPlan as PlanData);
        } catch (error: any) {
             toast.error("Falha ao gerar o plano on-device.", { description: error.message });
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return <Skeleton className="h-[60vh] w-full" />;
    }

    if (!plan) {
        return (
            <Card className="text-center p-10 animate-in fade-in duration-500">
                <CardHeader>
                    <BrainCircuit className="h-16 w-16 mx-auto text-green-600" />
                    <CardTitle className="text-2xl mt-4">Pronto para sua Jornada de Longevidade?</CardTitle>
                    <CardDescription>
                        Nossa IA analisará seus dados e os ciclos astrológicos para criar um plano de ação personalizado para você on-device, mantendo seus dados seguros e processando sem latência externa.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGeneratePlan} disabled={isGenerating} size="lg">
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Analisando Metricas & Astros...
                            </>
                        ) : (
                            <>
                                <Zap className="mr-2 h-5 w-5" />
                                Gerar Meu Plano de IA (On-Device)
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <Card className="border-green-500/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-green-700 flex items-center justify-between">
                        <div className="flex items-center">
                            <Zap className="h-6 w-6 mr-3" />
                            Seu Plano de Longevidade Sincronizado
                        </div>
                        <Button onClick={handleGeneratePlan} disabled={isGenerating} variant="outline" size="sm">
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            <span className="ml-2 hidden sm:inline">Recalcular On-Device</span>
                        </Button>
                    </CardTitle>
                    <CardDescription>{plan.summary}</CardDescription>
                </CardHeader>
            </Card>

            <Tabs defaultValue={firstPillarKey} className="w-full">
                <TabsList className="grid w-full h-auto p-1 bg-gray-100 dark:bg-gray-800 grid-cols-3">
                    {Object.entries(pillars).map(([key, pillar]) => {
                        const PillarIcon = IconMap[pillar.icon] || BrainCircuit;
                        return (
                            <TabsTrigger key={key} value={key} className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 p-2 data-[state=active]:bg-white data-[state=active]:shadow-md">
                                <PillarIcon className={cn("h-4 w-4 mb-1 sm:mb-0", pillar.color)} />
                                <span>{pillar.title}</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {Object.entries(pillars).map(([key, pillar]) => (
                    <TabsContent key={key} value={key} className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className={cn("text-xl", pillar.color)}>{pillar.title}</CardTitle>
                                <CardDescription>{pillar.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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
