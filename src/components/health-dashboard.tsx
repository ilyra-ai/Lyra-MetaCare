"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Bot, User } from "lucide-react";

export function HealthDashboard() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // AI logic will go here
    setLoading(true);
    setResult("");
    // Simulate AI response for now
    setTimeout(() => {
      setResult(
        "Com base em seus dados, aqui está um plano de bem-estar sugerido para hoje:\n\n- Manhã: Caminhada leve de 30 minutos.\n- Almoço: Salada de quinoa com frango grelhado.\n- Tarde: Sessão de meditação de 10 minutos.\n- Jantar: Salmão assado com brócolis no vapor."
      );
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          Seu Painel de Longevidade
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
          Receba recomendações de bem-estar personalizadas com o poder da IA.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2" />
            Descreva seu dia ou faça uma pergunta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-4">
            <Textarea
              placeholder="Ex: 'Dormi 7 horas, me sinto um pouco cansado. O que devo comer no café da manhã?'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Gerando..." : "Gerar Plano de Bem-Estar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-2" />
              Recomendação da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert whitespace-pre-wrap">
              {result}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}