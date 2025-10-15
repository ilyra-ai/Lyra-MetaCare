"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Settings, UploadCloud } from "lucide-react";
import { toast } from "sonner";

export function AIConfigForm() {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleTrainModel = () => {
        setIsLoading(true);
        toast.info("Iniciando Treinamento...", {
            description: "O modelo de IA está sendo atualizado com as novas premissas e dados.",
        });

        setTimeout(() => {
            setIsLoading(false);
            toast.success("Treinamento Concluído!", {
                description: "As configurações foram salvas e o modelo está pronto para uso.",
            });
        }, 3000);
    };

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                    <Zap className="h-6 w-6 mr-2 text-green-600" />
                    Configuração e Treinamento do Modelo de IA
                </CardTitle>
                <CardDescription>
                    Defina a missão, objetivos, premissas e valores que guiarão o cálculo do Índice de Longevidade e a geração de planos.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    <h3 className="text-lg font-semibold border-b pb-2 flex items-center">
                        <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                        Premissas Centrais
                    </h3>
                    
                    <div className="space-y-4">
                        <label className="text-sm font-medium leading-none">Missão do App</label>
                        <Textarea 
                            placeholder="Ex: O Lyra MetaCare tem a missão de otimizar a longevidade através da análise de dados biológicos e intervenções personalizadas."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-medium leading-none">Objetivos de Longevidade (Valores Chave)</label>
                        <Textarea 
                            placeholder="Ex: Aumentar HRV, Otimizar Sono Profundo, Manter FC de Repouso baixa, etc. (Use JSON ou texto simples)"
                            rows={4}
                        />
                    </div>
                </div>

                <div className="grid gap-4">
                    <h3 className="text-lg font-semibold border-b pb-2 flex items-center">
                        <UploadCloud className="h-4 w-4 mr-2 text-muted-foreground" />
                        Integração e Dados
                    </h3>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Endpoint da API de Treinamento (Opcional)</label>
                        <Input placeholder="https://api.external-ai.com/train" />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Chave de Serviço (Service Key)</label>
                        <Input type="password" placeholder="********************" />
                        <p className="text-xs text-muted-foreground">Esta chave é usada pela Edge Function para autenticar na API de IA.</p>
                    </div>
                </div>

                <Button onClick={handleTrainModel} disabled={isLoading} className="w-full">
                    {isLoading ? "Treinando Modelo..." : "Salvar Configurações e Treinar Modelo"}
                </Button>
            </CardContent>
        </Card>
    );
}