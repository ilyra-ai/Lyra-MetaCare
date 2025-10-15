"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Settings, UploadCloud, Scale, ScrollText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
    Form, 
    FormControl, 
    FormDescription, // Adicionado FormDescription
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

// --- Zod Schema for AI Configuration ---
const aiConfigSchema = z.object({
    mission: z.string().min(10, "A missão deve ter pelo menos 10 caracteres."),
    key_objectives: z.string().min(10, "Os objetivos devem ser detalhados."),
    
    // Ponderação de Métricas (Weights)
    weight_hrv: z.coerce.number().min(0).max(100),
    weight_sleep: z.coerce.number().min(0).max(100),
    weight_activity: z.coerce.number().min(0).max(100),
    weight_nutrition: z.coerce.number().min(0).max(100),
    
    // Integração
    training_endpoint: z.string().url().optional().or(z.literal('')),
    service_key: z.string().optional(),
});

type AIConfigValues = z.infer<typeof aiConfigSchema>;

// Mock Logs for demonstration
const mockLogs = [
    { timestamp: "2024-07-25 10:30:01", level: "INFO", message: "Score calculation started for user: 12345..." },
    { timestamp: "2024-07-25 10:30:05", level: "SUCCESS", message: "External AI API call successful. Longevity Score: 7.8" },
    { timestamp: "2024-07-25 09:15:40", level: "WARNING", message: "Missing HRV data for user: 67890. Using default weight." },
    { timestamp: "2024-07-24 18:00:12", level: "ERROR", message: "Database connection failed during metric fetch." },
];

export function AIConfigForm() {
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<AIConfigValues>({
        resolver: zodResolver(aiConfigSchema),
        defaultValues: {
            mission: "O Lyra MetaCare tem a missão de otimizar a longevidade através da análise de dados biológicos e intervenções personalizadas.",
            key_objectives: "Aumentar HRV, Otimizar Sono Profundo, Manter FC de Repouso baixa, Melhorar aptidão cardiovascular.",
            weight_hrv: 30,
            weight_sleep: 30,
            weight_activity: 25,
            weight_nutrition: 15,
            training_endpoint: "",
            service_key: "",
        },
    });

    const onSubmit = (data: AIConfigValues) => {
        setIsLoading(true);
        toast.info("Iniciando Treinamento...", {
            description: "As novas premissas e ponderações estão sendo enviadas para o modelo de IA.",
        });

        // Simulate API call to update AI configuration
        setTimeout(() => {
            setIsLoading(false);
            console.log("Config Data:", data);
            toast.success("Configuração Salva e Modelo Treinado!", {
                description: "As configurações foram salvas e o modelo está pronto para uso.",
            });
        }, 3000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Coluna 1 & 2: Formulário de Configuração */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                        <Zap className="h-6 w-6 mr-2 text-green-600" />
                        Configuração do Modelo de IA
                    </CardTitle>
                    <CardDescription>
                        Defina a missão, objetivos e a ponderação das métricas para o cálculo do Índice de Longevidade.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            
                            {/* Premissas Centrais */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2 flex items-center text-primary">
                                    <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                                    Premissas Centrais
                                </h3>
                                
                                <FormField
                                    control={form.control}
                                    name="mission"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Missão do App</FormLabel>
                                            <FormControl>
                                                <Textarea rows={3} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="key_objectives"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Objetivos de Longevidade (Valores Chave)</FormLabel>
                                            <FormControl>
                                                <Textarea rows={4} {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Liste os fatores biológicos que a IA deve priorizar (ex: Aumentar HRV, Otimizar Sono Profundo).
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            {/* Ponderação de Métricas */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2 flex items-center text-primary">
                                    <Scale className="h-4 w-4 mr-2 text-muted-foreground" />
                                    Ponderação do Score (0-100)
                                </h3>
                                <p className="text-sm text-muted-foreground">Ajuste a importância relativa de cada pilar no cálculo do Índice de Longevidade.</p>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="weight_hrv"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>HRV & Recuperação</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="weight_sleep"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sono Profundo & REM</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="weight_activity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Atividade & Fitness</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="weight_nutrition"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nutrição & Hidratação</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Integração */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2 flex items-center text-primary">
                                    <UploadCloud className="h-4 w-4 mr-2 text-muted-foreground" />
                                    Integração de API Externa
                                </h3>
                                
                                <FormField
                                    control={form.control}
                                    name="training_endpoint"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Endpoint da API de Treinamento (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://api.external-ai.com/train" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="service_key"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Chave de Serviço (Service Key)</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="********************" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Esta chave é usada pela Edge Function para autenticar na API de IA.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Treinando Modelo...
                                    </>
                                ) : (
                                    "Salvar Configurações e Treinar Modelo"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Coluna 3: Logs da Edge Function */}
            <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex items-center">
                        <ScrollText className="h-5 w-5 mr-2 text-blue-600" />
                        Logs Recentes (Edge Function)
                    </CardTitle>
                    <CardDescription>
                        Monitoramento das chamadas de cálculo de score.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                    {mockLogs.map((log, index) => (
                        <div key={index} className="text-xs p-2 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between font-mono">
                                <span className="text-muted-foreground">{log.timestamp.split(' ')[1]}</span>
                                <span className={log.level === 'ERROR' ? 'text-red-500 font-bold' : log.level === 'SUCCESS' ? 'text-green-500' : 'text-blue-500'}>
                                    [{log.level}]
                                </span>
                            </div>
                            <p className="mt-1 break-words">{log.message}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}