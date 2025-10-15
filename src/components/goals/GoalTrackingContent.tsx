"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, XCircle, Target as TargetIcon, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { UpdateGoalProgressModal } from "./UpdateGoalProgressModal";
import { Skeleton } from "@/components/ui/skeleton";

type GoalStatus = "completed" | "in_progress" | "missed";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  target_value: number | null;
  current_value: number;
  unit: string | null;
  status: string;
}

const statusMap: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  completed: { icon: CheckCircle, color: "text-green-600", label: "Concluída" },
  in_progress: { icon: Clock, color: "text-blue-600", label: "Em Progresso" },
  missed: { icon: XCircle, color: "text-red-600", label: "Atrasada" },
};

export function GoalTrackingContent() {
  const { supabase, session } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!session?.user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar metas.", { description: error.message });
      console.error(error);
      setGoals([]);
    } else {
      setGoals(data as Goal[]);
    }
    setLoading(false);
  }, [session, supabase]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <Card className="text-center p-10">
        <CardTitle className="text-xl mb-2">Nenhuma Meta Encontrada</CardTitle>
        <CardDescription>
          Suas metas de longevidade aparecerão aqui após serem definidas pelo Plano de IA.
        </CardDescription>
        {/* Placeholder for adding a goal manually, if needed later */}
        <Button variant="outline" className="mt-4" disabled>
            <Plus className="h-4 w-4 mr-2" /> Adicionar Meta Manualmente
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TargetIcon className="h-6 w-6 mr-3 text-green-700" />
            Acompanhamento de Metas
          </CardTitle>
          <CardDescription>
            Visualize e atualize seu progresso nas metas de longevidade.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const statusKey = goal.status in statusMap ? goal.status : 'in_progress';
          const { icon: StatusIcon, color, label } = statusMap[statusKey];
          
          const progressPercentage = goal.target_value
            ? Math.min(100, (goal.current_value / goal.target_value) * 100)
            : 0;

          return (
            <Card key={goal.id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <Badge variant="secondary">{goal.category || 'Geral'}</Badge>
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
                        <span>Progresso ({goal.current_value} {goal.unit || ''} / {goal.target_value} {goal.unit || ''})</span>
                        <span>{progressPercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                </div>

                <UpdateGoalProgressModal goal={goal} onUpdate={fetchGoals}>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                        Atualizar Progresso
                    </Button>
                </UpdateGoalProgressModal>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}