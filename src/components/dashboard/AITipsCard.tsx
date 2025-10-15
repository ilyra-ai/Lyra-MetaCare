"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock data for AI tips (simulando Hugging Face output)
const mockTips = [
  { id: 1, title: "Otimize o Sono Profundo", detail: "Seu padrão de sono sugere que 15 minutos de meditação antes de dormir podem aumentar o sono REM em 10%." },
  { id: 2, title: "Aumente a Proteína", detail: "Para suportar seus objetivos de massa muscular, adicione 20g de proteína no café da manhã." },
  { id: 3, title: "Alerta de Hidratação", detail: "Seu nível de atividade hoje exige 500ml extras de água para evitar fadiga." },
];

interface AITipsCardProps {
    className?: string;
}

export function AITipsCard({ className }: AITipsCardProps) {
  const currentTip = mockTips[Math.floor(Math.random() * mockTips.length)];

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
        <p className="text-sm font-medium text-gray-800">{currentTip.title}</p>
        <p className="text-sm text-gray-600">{currentTip.detail}</p>
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