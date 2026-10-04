'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Loader2,
  RefreshCw,
  Settings,
  Zap,
  HeartPulse,
  Moon,
  Activity,
  Apple,
  BrainCircuit,
  Sparkles,
  Server,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

const aiConfigSchema = z.object({
  mission: z.string().min(20, 'Descreva a missão com mais profundidade.'),
  key_objectives: z.string().min(20, 'Detalhe melhor os objetivos principais.'),
  weight_hrv: z.coerce.number<number | string>().min(0).max(100),
  weight_sleep: z.coerce.number<number | string>().min(0).max(100),
  weight_activity: z.coerce.number<number | string>().min(0).max(100),
  weight_nutrition: z.coerce.number<number | string>().min(0).max(100),
  model_name: z.string().min(1, 'Selecione um motor local.'),
});

type AIConfigRow = {
  id: string;
  mission: string;
  key_objectives: string;
  weight_hrv: number;
  weight_sleep: number;
  weight_activity: number;
  weight_nutrition: number;
  model_name: string | null;
};

type AIConfigInput = z.input<typeof aiConfigSchema>;
type AIConfigValues = z.output<typeof aiConfigSchema>;

export function AIConfigForm() {
  const { db } = useAuth();
  const [configId, setConfigId] = React.useState<string | null>(null);
  const [availableModels, setAvailableModels] = React.useState<
    Array<{ id: string; label: string }>
  >([]);
  const [isLoadingConfig, setIsLoadingConfig] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingModels, setIsLoadingModels] = React.useState(false);

  const form = useForm<AIConfigInput, unknown, AIConfigValues>({
    resolver: zodResolver(aiConfigSchema),
    defaultValues: {
      mission: '',
      key_objectives: '',
      weight_hrv: 30,
      weight_sleep: 30,
      weight_activity: 25,
      weight_nutrition: 15,
      model_name: '',
    },
  });

  // Carga inicial da configuração (o estado inicial já é "carregando").
  React.useEffect(() => {
    let active = true;

    const loadConfig = async () => {
      const { data, error } = await db
        .from('ai_config')
        .select('*')
        .limit(1)
        .single();

      if (!active) return;

      if (error || !data) {
        toast.error('Erro ao carregar configuração local de IA.', {
          description:
            error?.message || 'Registro de configuração não encontrado.',
        });
        setIsLoadingConfig(false);
        return;
      }

      const row = data as AIConfigRow;
      setConfigId(String(row.id));
      form.reset({
        mission: String(row.mission),
        key_objectives: String(row.key_objectives),
        weight_hrv: Number(row.weight_hrv),
        weight_sleep: Number(row.weight_sleep),
        weight_activity: Number(row.weight_activity),
        weight_nutrition: Number(row.weight_nutrition),
        model_name: String(row.model_name ?? ''),
      });

      if (row.model_name) {
        setAvailableModels([
          { id: String(row.model_name), label: String(row.model_name) },
        ]);
      }

      setIsLoadingConfig(false);
    };

    void loadConfig();

    return () => {
      active = false;
    };
  }, [form, db]);

  const loadLocalModels = async () => {
    setIsLoadingModels(true);
    const { data, error } = await db.functions.invoke<{
      success: boolean;
      models: Array<{ id: string; label: string }>;
      error?: string;
    }>('test-ai-connection');
    setIsLoadingModels(false);

    if (error || !data?.success) {
      toast.error('Falha ao consultar catálogo local.', {
        description:
          error?.message || data?.error || 'Motores locais indisponíveis.',
      });
      return;
    }

    setAvailableModels(data.models);
    if (data.models[0]) {
      form.setValue('model_name', data.models[0].id, { shouldValidate: true });
    }
    toast.success('Motores locais carregados.');
  };

  const onSubmit = async (values: AIConfigValues) => {
    if (!configId) {
      toast.error('Configuração principal não encontrada.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await db
      .from('ai_config')
      .update({
        ...values,
        updated_at: new Date().toISOString(),
      })
      .eq('id', configId);
    setIsSubmitting(false);

    if (error) {
      toast.error('Falha ao salvar configuração local.', {
        description: error.message,
      });
      return;
    }

    toast.success('Configuração local atualizada com sucesso.');
  };

  if (isLoadingConfig) {
    return (
      <div
        className="space-y-8"
        role="status"
        aria-label="Carregando configuração da IA"
      >
        <Skeleton className="h-32 w-full rounded-3xl border border-white/50 backdrop-blur-md" />
        <Skeleton className="h-96 w-full rounded-3xl border border-white/50 backdrop-blur-md" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
      <div className="lg:col-span-8 space-y-8">
        {/* Bloco 1: Seleção do Motor (Em destaque) */}
        <Card className="bg-white/70 backdrop-blur-xl border-white/60 shadow-sm rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <BrainCircuit className="w-32 h-32 text-primary" />
          </div>
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
              <div className="bg-primary/10 p-2 rounded-2xl text-primary shadow-inner">
                <Zap className="h-6 w-6" />
              </div>
              Motor de Orquestração
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Selecione e calibre o motor de IA responsável pelas inferências
              locais no backend MySQL.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <Form {...form}>
              <form
                className="space-y-8"
                onSubmit={form.handleSubmit(onSubmit)}
                id="ai-config-form"
              >
                <FormField
                  control={form.control}
                  name="model_name"
                  render={({ field }) => (
                    <FormItem className="bg-card/60 p-5 rounded-2xl border border-border/60 shadow-sm">
                      <FormLabel className="text-foreground font-semibold flex items-center gap-2">
                        <Server className="h-4 w-4 text-primary" />
                        Motor Local Ativo
                      </FormLabel>
                      <div className="flex flex-col sm:flex-row gap-4 mt-2">
                        <div className="flex-1">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl border-input bg-card shadow-sm focus:ring-primary/30">
                                <SelectValue placeholder="Selecione um motor local operante..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-border/60 shadow-xl">
                              {availableModels.map((model) => (
                                <SelectItem
                                  key={model.id}
                                  value={model.id}
                                  className="cursor-pointer focus:bg-primary/10 focus:text-primary rounded-lg my-1"
                                >
                                  {model.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={loadLocalModels}
                          disabled={isLoadingModels}
                          className="h-12 px-6 rounded-xl border-border hover:bg-secondary text-foreground transition-all active:scale-95"
                        >
                          {isLoadingModels ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4 text-primary" />
                          )}
                          Escanear Rede
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bloco 2: Diretrizes Comportamentais integrado no form */}
                <div className="space-y-6 pt-6 border-t border-border/50">
                  <h3 className="flex items-center gap-3 text-xl font-bold text-foreground">
                    <div className="bg-cosmic-light p-2 rounded-2xl text-cosmic shadow-inner">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    Diretrizes Comportamentais
                  </h3>

                  <FormField
                    control={form.control}
                    name="mission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">
                          Missão Operacional do Motor
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            className="resize-none rounded-2xl border-input bg-card/60 focus-visible:ring-cosmic/30 p-4 shadow-inner"
                            placeholder="Ex: Você é a IA médica da Lyra, especializada em integrar dados vitais e astrológicos para gerar protocolos de longevidade."
                            {...field}
                          />
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
                        <FormLabel className="text-foreground font-medium">
                          Objetivos-Chave da Análise (Separados por linha ou
                          vírgula)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            className="resize-none rounded-2xl border-input bg-card/60 focus-visible:ring-cosmic/30 p-4 shadow-inner"
                            placeholder="1. Maximizar a clareza nas explicações.&#10;2. Correlacionar HRV com o mapa astral."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Bloco 3: Pesos integrado no form */}
                <div className="space-y-6 pt-6 border-t border-border/50">
                  <h3 className="flex items-center gap-3 text-xl font-bold text-foreground">
                    <div className="bg-accent/10 p-2 rounded-2xl text-accent shadow-inner">
                      <Activity className="h-5 w-5" />
                    </div>
                    Calibração de Biomarcadores
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Ajuste o peso (multiplicador matemático) que cada métrica
                    tem no algoritmo preditivo do plano.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="weight_hrv"
                      render={({ field }) => (
                        <FormItem className="bg-card/70 p-4 rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md hover:border-accent/30">
                          <FormLabel className="text-foreground font-semibold flex items-center gap-2">
                            <HeartPulse className="h-4 w-4 text-accent" />
                            Peso HRV
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              className="h-12 rounded-xl text-lg font-medium text-foreground border-input focus-visible:ring-accent/30 bg-card"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weight_sleep"
                      render={({ field }) => (
                        <FormItem className="bg-card/70 p-4 rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md hover:border-info/30">
                          <FormLabel className="text-foreground font-semibold flex items-center gap-2">
                            <Moon className="h-4 w-4 text-info" />
                            Peso Sono
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              className="h-12 rounded-xl text-lg font-medium text-foreground border-input focus-visible:ring-info/30 bg-card"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weight_activity"
                      render={({ field }) => (
                        <FormItem className="bg-card/70 p-4 rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md hover:border-warning/30">
                          <FormLabel className="text-foreground font-semibold flex items-center gap-2">
                            <Activity className="h-4 w-4 text-warning" />
                            Peso Atividade
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              className="h-12 rounded-xl text-lg font-medium text-foreground border-input focus-visible:ring-warning/30 bg-card"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weight_nutrition"
                      render={({ field }) => (
                        <FormItem className="bg-card/70 p-4 rounded-2xl border border-border/60 shadow-sm transition-all hover:shadow-md hover:border-success/30">
                          <FormLabel className="text-foreground font-semibold flex items-center gap-2">
                            <Apple className="h-4 w-4 text-success" />
                            Peso Nutrição
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              className="h-12 rounded-xl text-lg font-medium text-foreground border-input focus-visible:ring-success/30 bg-card"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Direita: Estado Operacional e Botão de Ação */}
      <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
        {/* Botão de Submissão Principal */}
        <Card className="bg-gradient-teal text-white shadow-teal rounded-3xl border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_45%)] z-0"></div>
          <CardContent className="p-6 relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-md mb-2">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Salvar Configurações</h3>
              <p className="text-white/80 text-sm mt-1">
                Aplique todas as alterações feitas no motor e pesos na tabela
                ai_config.
              </p>
            </div>

            <Button
              type="submit"
              form="ai-config-form"
              disabled={isSubmitting}
              className="w-full bg-white text-primary hover:bg-white/90 h-14 rounded-2xl text-lg font-bold shadow-lg transition-transform active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <Settings className="mr-2 h-5 w-5" />
              )}
              {isSubmitting ? 'Sincronizando...' : 'Confirmar Atualização'}
            </Button>
          </CardContent>
        </Card>

        {/* Card de Status Operacional */}
        <Card className="bg-white/70 backdrop-blur-xl border-white/60 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">
              Estado Operacional
            </CardTitle>
            <CardDescription className="text-sm">
              Visão do ecossistema local do Next.js
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-card/60 rounded-2xl border border-border/60 p-4 transition-all hover:bg-card">
              <div className="font-bold text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                Processamento Local
              </div>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                Score e inferências calculadas internamente sobre as métricas
                persistidas, sem latência externa.
              </p>
            </div>
            <div className="bg-card/60 rounded-2xl border border-border/60 p-4 transition-all hover:bg-card">
              <div className="font-bold text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cosmic"></div>
                Planos em MySQL
              </div>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                Plano gerado é estruturado e salvo nativamente para garantia de
                privacidade dos seus dados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
