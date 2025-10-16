"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface AITip {
  id: number;
  title: string;
  detail: string;
}

interface AITipsCardProps {
    className?: string;
}

export function AITipsCard({ className }: AITipsCardProps) {
  const { supabase } = useAuth();
  const [tip, setTip] = React.useState<AITip | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTip = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("ai_tips")
        .select("id, title, detail")
        .eq("is_active", true);

      if (error || !data || data.length === 0) {
        // Fallback para uma dica padrão se houver erro ou nenhuma dica for encontrada
        setTip({ id: 0, title: "Mantenha-se Hidratado", detail: "Beber água suficiente ao longo do dia é crucial para a sua energia e bem-estar geral." });
      } else {
        // Seleciona uma dica aleatória da lista
        const randomTip = data[Math.floor(Math.random() * data.length)];
        setTip(randomTip);
      }
      setLoading(false);
    };

    fetchTip();
  }, [supabase]);

  if (loading) {
    return <Skeleton className={cn("h-full w-full", className)} />;
  }

  if (!tip) {
    return null; // Não renderiza nada se não houver dica
  }

  return (
    <Card className={cn("bg-yellow-50 border-yellow-300 shadow-md hover:shadow-lg transition-shadow h-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-yellow-800 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2" />
          Insight de IA
        </CardTitle>
        <CardDescription className="text-yellow-700">
          Dica personalizada para o seu dia.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm font-medium text-gray-800">{tip.title}</p>
        <p className="text-sm text-gray-600">{tip.detail}</p>
        <Button asChild variant="link" className="p-0 h-auto text-yellow-700">
            <Link href="/plan">
                Ver Plano Completo
                <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}