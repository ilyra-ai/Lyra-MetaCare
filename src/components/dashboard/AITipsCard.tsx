"use client";

import * as React from "react";
import {
  Card,
  Title,
  Text,
  Flex,
  Badge,
  Button,
} from "@tremor/react";
import { Lightbulb, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

interface AITip {
  id: string | number;
  title: string;
  detail: string;
}

interface AITipsCardProps {
    className?: string;
}

export function AITipsCard({ className }: AITipsCardProps) {
  const router = useRouter();
  const { supabase } = useAuth();
  const [tip, setTip] = React.useState<AITip | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTip = async () => {
      setLoading(true);

      try {
        // 1. Obter o total de dicas ativas (query leve)
        const { count, error: countError } = await supabase
          .from("ai_tips")
          .select("*", { count: 'exact', head: true })
          .eq("is_active", true);

        if (countError || count === null || count === 0) {
          throw new Error("No tips found or error fetching count");
        }

        // 2. Selecionar um índice aleatório e buscar apenas essa linha
        const randomIndex = Math.floor(Math.random() * count);
        const { data, error } = await supabase
          .from("ai_tips")
          .select("id, title, detail")
          .eq("is_active", true)
          .range(randomIndex, randomIndex)
          .maybeSingle();

        if (error || !data) {
          throw new Error("Error fetching random tip");
        }

        setTip(data);
      } catch (err) {
        console.error("Error in fetchTip:", err);
        // Fallback para uma dica padrão se houver erro ou nenhuma dica for encontrada
        setTip({
          id: 0,
          title: "Mantenha-se Hidratado",
          detail: "Beber água suficiente ao longo do dia é crucial para a sua energia e bem-estar geral."
        });
      } finally {
        setLoading(false);
      }
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
    <Card
      className={cn(
        "h-full bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-100",
        className,
      )}
      decoration="top"
      decorationColor="amber"
    >
      <Flex justifyContent="start" className="gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200/80 dark:bg-amber-900/60">
          <Lightbulb className="h-5 w-5" />
        </span>
        <div>
          <Flex alignItems="center" className="gap-2">
            <Title>Insight de IA</Title>
            <Badge color="amber">Novo</Badge>
          </Flex>
          <Text className="text-sm text-amber-700 dark:text-amber-200">
            Dica personalizada para o seu dia.
          </Text>
        </div>
      </Flex>

      <div className="mt-6 space-y-3">
        <Text className="font-semibold text-amber-900 dark:text-amber-100">{tip.title}</Text>
        <Text className="text-sm text-amber-700 dark:text-amber-200">{tip.detail}</Text>
        <Button
          className="w-fit"
          size="sm"
          variant="secondary"
          icon={ChevronRight}
          iconPosition="right"
          onClick={() => router.push("/plan")}
        >
          Ver plano completo
        </Button>
      </div>
    </Card>
  );
}