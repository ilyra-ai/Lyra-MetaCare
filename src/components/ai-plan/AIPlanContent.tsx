"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Dumbbell, Utensils, Moon, Zap, BrainCircuit, Heart, Leaf, Sun, Clock, Activity, RefreshCw, Droplet, Scale, Smile, Waves, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
    }, [fetchPlan]);

    const handleGeneratePlan = async () => {
        setIsGenerating(true);
        toast.info("Gerando seu plano de IA personalizado...");

        const { data, error } = await supabase.functions.invoke('generate-ai-plan');

        if (error) {
            toast.error("Falha ao gerar o plano.", { description: error.message });
        } else {
            toast.success("Seu plano foi gerado com sucesso!");
            setPlan(data);
        }
        setIsGenerating(false);
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
                        Nossa IA analisará seus dados e objetivos para criar um plano de ação personalizado para você.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGeneratePlan} disabled={isGenerating} size="lg">
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Gerando Plano...
                            </>
                        ) : (
                            <>
                                <Zap className="mr-2 h-5 w-5" />
                                Gerar Meu Plano de IA
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
                            Seu Plano de Longevidade Personalizado
                        </div>
                        <Button onClick={handleGeneratePlan} disabled={isGenerating} variant="outline" size="sm">
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            <span className="ml-2 hidden sm:inline">Regerar</span>
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