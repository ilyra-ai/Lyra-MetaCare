"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Dumbbell, Utensils, Moon, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Mock data simulating AI-generated plan
const mockPlan = {
  summary: "Seu plano de longevidade focado em otimizar o sono e aumentar a resistência cardiovascular, baseado em seus objetivos de 'Melhorar Resistência' e 'Reduzir Estresse'.",
  priorityGoals: [
    { id: 1, title: "Otimizar Ciclo de Sono", description: "Alcançar 7.5 horas de sono de qualidade por noite.", category: "Sono" },
    { id: 2, title: "Caminhada Diária", description: "Completar 8.000 passos por dia, 5 dias por semana.", category: "Exercício" },
    { id: 3, title: "Redução de Açúcar", description: "Limitar a ingestão de açúcares adicionados a 25g por dia.", category: "Nutrição" },
  ],
  recommendations: [
    { icon: Utensils, title: "Nutrição: Dieta Mediterrânea", details: "Foco em vegetais, azeite de oliva e peixes. Reduza carnes vermelhas e processados." },
    { icon: Dumbbell, title: "Exercício: Treino de Força 2x/semana", details: "Inclua exercícios compostos (agachamento, supino) para manter a massa muscular." },
    { icon: Moon, title: "Sono: Rotina de Relaxamento", details: "Desligue telas 1 hora antes de dormir e pratique 10 minutos de meditação." },
    { icon: Zap, title: "Energia: Hidratação Otimizada", details: "Beba pelo menos 2.5 litros de água por dia para manter o metabolismo ativo." },
  ]
};

const categoryColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    "Sono": "secondary",
    "Exercício": "default",
    "Nutrição": "destructive",
    "Energia": "outline",
};

export function AIPlanContent() {
  return (
    <div className="space-y-8">
      <Card className="border-green-500/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-green-700 flex items-center">
            <Zap className="h-6 w-6 mr-3" />
            Seu Plano de Longevidade
          </CardTitle>
          <CardDescription>
            {mockPlan.summary}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Priority Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Metas Prioritárias (Próximos 30 dias)</CardTitle>
          <CardDescription>Foco nas ações que trarão o maior impacto imediato.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {mockPlan.priorityGoals.map((goal) => (
            <div key={goal.id} className="flex flex-col space-y-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{goal.title}</h3>
                <Badge variant={categoryColors[goal.category] || "default"}>{goal.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{goal.description}</p>
              <div className="flex items-center text-sm text-green-600 mt-2">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Acompanhar no Dashboard</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Detailed Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações Detalhadas</CardTitle>
          <CardDescription>Estratégias de longo prazo para cada pilar da sua saúde.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {mockPlan.recommendations.map((rec, index) => (
            <React.Fragment key={index}>
              <div className="flex items-start space-x-4">
                <rec.icon className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-base">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground">{rec.details}</p>
                </div>
              </div >
              {index < mockPlan.recommendations.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}