"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, XCircle, Target as TargetIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type GoalStatus = "completed" | "in_progress" | "missed";

interface Goal {
  id: number;
  title: string;
  description: string;
  category: string;
  progress: number; // 0 to 100
  status: GoalStatus;
}

const mockGoals: Goal[] = [
  {
    id: 1,
    title: "Otimizar Ciclo de Sono",
    description: "Alcançar 7.5 horas de sono de qualidade por noite.",
    category: "Sono",
    progress: 85,
    status: "in_progress",
  },
  {
    id: 2,
    title: "Caminhada Diária",
    description: "Completar 8.000 passos por dia, 5 dias por semana.",
    category: "Exercício",
    progress: 100,
    status: "completed",
  },
  {
    id: 3,
    title: "Redução de Açúcar",
    description: "Limitar a ingestão de açúcares adicionados a 25g por dia.",
    category: "Nutrição",
    progress: 40,
    status: "in_progress",
  },
  {
    id: 4,
    title: "Meditação Matinal",
    description: "Praticar 10 minutos de atenção plena diariamente.",
    category: "Estresse",
    progress: 0,
    status: "missed",
  },
];

const statusMap: Record<GoalStatus, { icon: React.ElementType; color: string; label: string }> = {
  completed: { icon: CheckCircle, color: "text-green-600", label: "Concluída" },
  in_progress: { icon: Clock, color: "text-blue-600", label: "Em Progresso" },
  missed: { icon: XCircle, color: "text-red-600", label: "Atrasada" },
};

export function GoalTrackingContent() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TargetIcon className="h-6 w-6 mr-3 text-green-700" />
            Acompanhamento de Metas
          </CardTitle>
          <CardDescription>
            Visualize seu progresso nas metas de longevidade definidas pela IA.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockGoals.map((goal) => {
          const { icon: StatusIcon, color, label } = statusMap[goal.status];
          
          return (
            <Card key={goal.id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <Badge variant="secondary">{goal.category}</Badge>
                </div>
                <CardDescription>{goal.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <StatusIcon className={`h-4 w-4 ${color}`} />
                  <span className={color}>{label}</span>
                </div>
                
                <div className="space-y-1">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progresso</span>
                        <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                </div>

                <Button variant="outline" size="sm" className="w-full mt-2" disabled={goal.status === 'completed'}>
                    {goal.status === 'completed' ? 'Meta Concluída' : 'Atualizar Progresso'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}