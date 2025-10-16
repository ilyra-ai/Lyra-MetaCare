"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Dumbbell, Utensils, Moon, Zap, BrainCircuit, Heart, Leaf, Sun, ChevronRight, Clock, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// --- Mock Data: Estrutura de Plano Gerado por IA ---
const mockPlanData = {
  summary: "Seu plano de longevidade focado em otimizar o sono e aumentar a resistência cardiovascular, baseado em seus objetivos de 'Melhorar Resistência' e 'Reduzir Estresse'.",
  lastUpdated: "25 de Julho, 2024",
  
  categories: {
    nutrition: {
      title: "Nutrição",
      icon: Utensils,
      color: "text-green-600",
      description: "Estratégias alimentares para otimizar o metabolismo e a saúde intestinal.",
      items: [
        { id: 1, title: "Dieta Mediterrânea", details: "Foco em vegetais, azeite de oliva e peixes. Reduza carnes vermelhas e processados.", image: "/globe.svg" },
        { id: 2, title: "Janela Alimentar 10h", details: "Limite a ingestão de alimentos a uma janela de 10 horas (ex: 9h às 19h).", image: "/clock.svg" },
        { id: 3, title: "Aumento de Fibras", details: "Consuma 30g de fibras por dia para saúde intestinal e controle glicêmico.", image: "/leaf.svg" },
      ]
    },
    exercise: {
      title: "Exercícios",
      icon: Dumbbell,
      color: "text-orange-600",
      description: "Rotina de atividades para força, resistência e saúde cardiovascular.",
      items: [
        { id: 4, title: "Treino de Força (2x/semana)", details: "Sessões de 45 minutos focadas em exercícios compostos (agachamento, supino).", image: "/dumbbell.svg" },
        { id: 5, title: "Caminhada Rápida Diária", details: "30 minutos de caminhada rápida para atingir 8.000 passos.", image: "/footprints.svg" },
        { id: 6, title: "HIIT (1x/semana)", details: "Sessão curta de alta intensidade para otimizar o VO₂max.", image: "/zap.svg" },
      ]
    },
    mental_health: {
      title: "Saúde Mental",
      icon: BrainCircuit,
      color: "text-blue-600",
      description: "Práticas para reduzir o estresse, melhorar o foco e a qualidade do sono.",
      items: [
        { id: 7, title: "Meditação Matinal", details: "10 minutos de mindfulness logo após acordar para definir o tom do dia.", image: "/sun.svg" },
        { id: 8, title: "Rotina de Relaxamento Noturno", details: "Desligue telas 1 hora antes de dormir e leia um livro.", image: "/moon.svg" },
        { id: 9, title: "Diário de Gratidão", details: "Escreva 3 coisas pelas quais você é grato antes de dormir.", image: "/heart.svg" },
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
    return (
        <Card className="flex flex-col sm:flex-row justify-between p-4 hover:shadow-md transition-shadow duration-300 animate-in fade-in scale-up-95">
            <div className="flex-1 space-y-2 pr-4">
                <h3 className={cn("font-bold text-lg", color)}>{title}</h3>
                <p className="text-sm text-muted-foreground">{details}</p>
                <Button variant="link" className="p-0 h-auto text-xs text-gray-500">
                    Ver Detalhes <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
            </div>
            {/* Imagem/Ícone (Simulando layout assimétrico com imagem à direita) */}
            <div className="w-full sm:w-24 h-24 flex items-center justify-center mt-4 sm:mt-0 bg-gray-50 dark:bg-gray-800 rounded-lg flex-shrink-0">
                {/* Usando Lucide Icons como placeholders para as imagens mockadas */}
                {image.includes("globe") && <Leaf className="h-10 w-10 text-green-500" />}
                {image.includes("clock") && <Clock className="h-10 w-10 text-indigo-500" />}
                {image.includes("leaf") && <Utensils className="h-10 w-10 text-green-500" />}
                {image.includes("dumbbell") && <Dumbbell className="h-10 w-10 text-orange-500" />}
                {image.includes("footprints") && <Zap className="h-10 w-10 text-orange-500" />}
                {image.includes("zap") && <Activity className="h-10 w-10 text-red-500" />}
                {image.includes("sun") && <Sun className="h-10 w-10 text-yellow-500" />}
                {image.includes("moon") && <Moon className="h-10 w-10 text-blue-500" />}
                {image.includes("heart") && <Heart className="h-10 w-10 text-pink-500" />}
            </div>
        </Card>
    );
}

export function AIPlanContent() {
  const categories = mockPlanData.categories;
  const firstCategoryKey = Object.keys(categories)[0];

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
      <Tabs defaultValue={firstCategoryKey} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-gray-100 dark:bg-gray-800">
          {Object.entries(categories).map(([key, category]) => (
            <TabsTrigger 
                key={key} 
                value={key}
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-foreground transition-all duration-300"
            >
                <category.icon className={cn("h-4 w-4", category.color)} />
                <span>{category.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Conteúdo das Tabs */}
        {Object.entries(categories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="mt-6 animate-in fade-in duration-500">
                <Card>
                    <CardHeader>
                        <CardTitle className={cn("text-xl", category.color)}>{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Lista de Itens (Generative Design / Asymmetrical Grid) */}
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                            {category.items.map((item) => (
                                <PlanItem 
                                    key={item.id}
                                    title={item.title}
                                    details={item.details}
                                    image={item.image}
                                    color={category.color}
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