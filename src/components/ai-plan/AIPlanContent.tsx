"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Dumbbell, Utensils, Moon, Zap, BrainCircuit, Heart, Leaf, Sun, ChevronRight, Clock, Activity, RefreshCw, Droplet, Scale, Smile, Waves } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// --- Mock Data: Estrutura de Plano Gerado por IA (6 Pilares) ---
const mockPlanData = {
  summary: "Seu plano de longevidade focado em otimizar o sono, aumentar a resiliência ao estresse e estabilizar o metabolismo, baseado em seus dados biológicos recentes.",
  lastUpdated: "25 de Julho, 2024",
  
  pillars: {
    nutrition: {
      title: "Nutrição",
      icon: Utensils,
      color: "text-green-600",
      description: "Estratégias alimentares para otimizar o metabolismo, composição corporal e saúde intestinal.",
      items: [
        { id: 1, title: "Otimizar Proteína", details: "Aumente a ingestão para 1.2g/kg de peso corporal para suporte muscular e saciedade.", image: "protein" },
        { id: 2, title: "Aumento de Fibras", details: "Consuma 30g de fibras por dia (vegetais, leguminosas) para saúde intestinal e controle glicêmico.", image: "fiber" },
        { id: 3, title: "Hidratação Otimizada", details: "Beba 35ml de água por kg de peso corporal, focando em eletrólitos após exercícios.", image: "hydration" },
      ]
    },
    exercise: {
      title: "Exercícios",
      icon: Dumbbell,
      color: "text-orange-600",
      description: "Rotina de atividades para força, resistência cardiovascular e longevidade muscular.",
      items: [
        { id: 4, title: "Treino de Força (3x/semana)", details: "Sessões de 45 minutos focadas em exercícios compostos (agachamento, supino) para manter a massa magra.", image: "strength" },
        { id: 5, title: "Atividade Aeróbica", details: "Mantenha 150 minutos de atividade moderada semanalmente (caminhada rápida, bicicleta).", image: "cardio" },
        { id: 6, title: "Reduzir Sedentarismo", details: "Faça uma pausa de 5 minutos a cada hora de trabalho sentado.", image: "sedentary" },
      ]
    },
    recovery: {
      title: "Recuperação & Estresse",
      icon: RefreshCw,
      color: "text-red-600",
      description: "Técnicas para melhorar a resiliência autonômica (HRV) e gerenciar a carga de estresse diária.",
      items: [
        { id: 7, title: "Respiração 4-7-8", details: "Pratique 5 minutos de respiração lenta (4s inspira, 7s segura, 8s expira) antes de dormir.", image: "breath" },
        { id: 8, title: "Exposição ao Frio", details: "Tome um banho frio de 30 segundos pela manhã para modular o sistema nervoso.", image: "cold" },
        { id: 9, title: "Monitorar Strain", details: "Mantenha seu Daily Strain abaixo de 15 para evitar overtraining.", image: "strain" },
      ]
    },
    sleep: {
      title: "Sono & Cronobiologia",
      icon: Moon,
      color: "text-indigo-600",
      description: "Otimização da higiene do sono, duração e alinhamento circadiano.",
      items: [
        { id: 10, title: "Janela de Sono Consistente", details: "Vá para a cama e acorde no mesmo horário, mesmo nos fins de semana, para reduzir o Social Jetlag.", image: "regularity" },
        { id: 11, title: "Bloqueio de Luz Azul", details: "Use óculos bloqueadores de luz azul ou desligue telas 90 minutos antes de dormir.", image: "light" },
        { id: 12, title: "Otimizar Sono Profundo", details: "Evite cafeína após as 14h e faça exercícios leves no final da tarde.", image: "deep_sleep" },
      ]
    },
    metabolism: {
      title: "Metabolismo & Glicose",
      icon: Droplet,
      color: "text-amber-600",
      description: "Recomendações para estabilizar a glicemia e otimizar a sensibilidade à insulina.",
      items: [
        { id: 13, title: "Priorizar Fibras no Café", details: "Comece o dia com fibras e proteínas para achatar a curva glicêmica.", image: "glucose_control" },
        { id: 14, title: "Caminhada Pós-Refeição", details: "Caminhe 10 minutos após as refeições principais para reduzir picos pós-prandiais.", image: "post_meal" },
        { id: 15, title: "Aumentar TIR", details: "Mantenha seu Tempo em Faixa (TIR) acima de 80% através de lanches inteligentes.", image: "tir" },
      ]
    },
    mental_health: {
      title: "Saúde Mental & Foco",
      icon: BrainCircuit,
      color: "text-blue-400",
      description: "Estratégias para melhorar o humor, a performance cognitiva e a gestão emocional.",
      items: [
        { id: 16, title: "Meditação Diária", details: "15 minutos de meditação para melhorar o Mood Score e reduzir o estresse percebido.", image: "meditation" },
        { id: 17, title: "Treino Cognitivo", details: "Use um aplicativo de treino cerebral por 10 minutos para manter o Score Cognitivo alto.", image: "cognition" },
        { id: 18, title: "Conexão Social", details: "Reserve tempo para interações sociais significativas (2x/semana) para bem-estar geral.", image: "social" },
      ]
    }
  }
};

// --- Componente de Item de Plano ---
interface PlanItemProps {
    title: string;
    details: string;
    image: string; // Usando string para mockar o caminho da imagem/ícone
    color: string;
}

const PlanItem: React.FC<PlanItemProps> = ({ title, details, image, color }) => {
    // Mapeamento de ícones para os novos itens mockados
    const IconMap: Record<string, React.ElementType> = {
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
    };
    const ItemIcon = IconMap[image] || CheckCircle;

    return (
        <Card className="flex flex-col sm:flex-row justify-between p-4 hover:shadow-md transition-shadow duration-300 animate-in fade-in scale-up-95">
            <div className="flex-1 space-y-2 pr-4">
                <h3 className={cn("font-bold text-lg", color)}>{title}</h3>
                <p className="text-sm text-muted-foreground">{details}</p>
                <Button variant="link" className="p-0 h-auto text-xs text-gray-500">
                    Ver Detalhes <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
            </div>
            {/* Ícone (Simulando layout assimétrico com imagem à direita) */}
            <div className="w-full sm:w-24 h-24 flex items-center justify-center mt-4 sm:mt-0 bg-gray-50 dark:bg-gray-800 rounded-lg flex-shrink-0">
                <ItemIcon className={cn("h-10 w-10", color)} />
            </div>
        </Card>
    );
}

export function AIPlanContent() {
  const pillars = mockPlanData.pillars;
  const firstPillarKey = Object.keys(pillars)[0];
  const totalPillars = Object.keys(pillars).length;

  // Ajusta o grid para 3 colunas em telas maiores, mantendo a responsividade
  const gridColsClass = totalPillars <= 3 ? "grid-cols-3" : "grid-cols-3 lg:grid-cols-6";

  return (
    <div className="space-y-8">
      {/* Resumo do Plano */}
      <Card className="border-green-500/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-green-700 flex items-center">
            <Zap className="h-6 w-6 mr-3" />
            Seu Plano de Longevidade Personalizado
          </CardTitle>
          <CardDescription>
            {mockPlanData.summary}
          </CardDescription>
          <p className="text-xs text-muted-foreground mt-2">
            Última atualização: {mockPlanData.lastUpdated}
          </p>
        </CardHeader>
      </Card>

      {/* Tabs de Navegação */}
      <Tabs defaultValue={firstPillarKey} className="w-full">
        <TabsList className={cn("grid w-full h-auto p-1 bg-gray-100 dark:bg-gray-800", gridColsClass)}>
          {Object.entries(pillars).map(([key, pillar]) => (
            <TabsTrigger 
                key={key} 
                value={key}
                className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 p-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-foreground transition-all duration-300 text-xs sm:text-sm"
            >
                <pillar.icon className={cn("h-4 w-4 mb-1 sm:mb-0", pillar.color)} />
                <span className="hidden sm:inline">{pillar.title}</span>
                <span className="sm:hidden">{pillar.title.split(' ')[0]}</span> {/* Abreviação para mobile */}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Conteúdo das Tabs */}
        {Object.entries(pillars).map(([key, pillar]) => (
            <TabsContent key={key} value={key} className="mt-6 animate-in fade-in duration-500">
                <Card>
                    <CardHeader>
                        <CardTitle className={cn("text-xl", pillar.color)}>{pillar.title}</CardTitle>
                        <CardDescription>{pillar.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Lista de Itens (Generative Design / Asymmetrical Grid) */}
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                            {pillar.items.map((item) => (
                                <PlanItem 
                                    key={item.id}
                                    title={item.title}
                                    details={item.details}
                                    image={item.image}
                                    color={pillar.color}
                                />
                            ))}
                        </div>
                        
                        <Separator className="my-4" />
                        
                        {/* Placeholder para Slider de Ajustes Manuais */}
                        <div className="space-y-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                            <h4 className="font-semibold flex items-center">
                                <Zap className="h-4 w-4 mr-2 text-yellow-600" />
                                Ajuste Manual (Feedback)
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Use o slider para indicar o quão desafiador este plano parece. A IA ajustará a intensidade na próxima geração.
                            </p>
                            {/* O componente Slider real do Shadcn/UI */}
                            <div className="pt-4">
                                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                    <span>Fácil</span>
                                    <span>Desafiador</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    defaultValue="5" 
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}