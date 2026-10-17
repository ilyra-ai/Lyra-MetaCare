'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Loader2,
  Settings,
  Zap,
  HeartPulse,
  Moon,
  Activity,
  Apple,
  BrainCircuit,
  Sparkles,
} from 'lucide-react';

import { ProvedorDeIa } from '@/components/admin/ProvedorDeIa';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

const aiConfigSchema = z.object({
  mission: z.string().min(20, 'Descreva a missão com mais profundidade.'),
  key_objectives: z.string().min(20, 'Detalhe melhor os objetivos principais.'),
  weight_hrv: z.coerce.number<number | string>().min(0).max(100),
  weight_sleep: z.coerce.number<number | string>().min(0).max(100),
  weight_activity: z.coerce.number<number | string>().min(0).max(100),
  weight_nutrition: z.coerce.number<number | string>().min(0).max(100),
});

type AIConfigRow = {
  id: string;
  mission: string;
  key_objectives: string;
  weight_hrv: number;
  weight_sleep: number;
  weight_activity: number;
  weight_nutrition: number;
};

type AIConfigInput = z.input<typeof aiConfigSchema>;
type AIConfigValues = z.output<typeof aiConfigSchema>;

export function AIConfigForm() {
  const { db } = useAuth();
  const [configId, setConfigId] = React.useState<string | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<AIConfigInput, unknown, AIConfigValues>({
    resolver: zodResolver(aiConfigSchema),
    defaultValues: {
      mission: '',
      key_objectives: '',
      weight_hrv: 30,
      weight_sleep: 30,
      weight_activity: 25,
      weight_nutrition: 15,
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
      });

      setIsLoadingConfig(false);
    };

    void loadConfig();

    return () => {
      active = false;
    };
  }, [form, db]);

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
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <div className="min-w-0 space-y-6 lg:col-span-8">
        {/* Bloco 1: modelo de IA da plataforma (local ou em nuvem). */}
        <ProvedorDeIa />

        {/* Bloco 2: diretrizes e calibração dos motores determinísticos. */}
        <Card>
          <CardHeader className="pb-4">
            <h2 className="flex items-center gap-3 font-display text-xl font-semibold leading-tight tracking-tight text-card-foreground">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cosmic-light text-cosmic"
                aria-hidden="true"
              >
                <BrainCircuit className="h-5 w-5" />
              </span>
              Diretrizes e calibração
            </h2>
            <CardDescription>
              Missão, objetivos e pesos dos biomarcadores usados pelos motores
              de score e de plano da Lyra.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                className="space-y-8"
                onSubmit={form.handleSubmit(onSubmit)}
                id="ai-config-form"
              >
                {/* Diretrizes Comportamentais */}
                <div className="space-y-5">
                  <h3 className="flex items-center gap-3 font-display text-lg font-semibold tracking-tight text-foreground">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cosmic-light text-cosmic"
                      aria-hidden="true"
                    >
                      <Sparkles className="h-4 w-4" />
                    </span>
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
                            className="resize-none leading-6"
                            placeholder="Ex.: Você é a Lyra, guia de bem-estar que une os sinais do dia e a astrologia védica para orientar a rotina, sem substituir avaliação profissional de saúde."
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
                            className="resize-none leading-6"
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
                <div className="space-y-5 border-t border-border pt-6">
                  <h3 className="flex items-center gap-3 font-display text-lg font-semibold tracking-tight text-foreground">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-primary"
                      aria-hidden="true"
                    >
                      <Activity className="h-4 w-4" />
                    </span>
                    Calibração de Biomarcadores
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Ajuste o peso (multiplicador matemático) que cada métrica
                    tem no algoritmo preditivo do plano.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="weight_hrv"
                      render={({ field }) => (
                        <FormItem className="rounded-md border border-border bg-background p-4">
                          <FormLabel className="flex items-center gap-2 font-semibold text-foreground">
                            <HeartPulse
                              className="h-4 w-4 text-destructive"
                              aria-hidden="true"
                            />
                            Peso HRV
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              className="font-display text-lg font-semibold"
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
                        <FormItem className="rounded-md border border-border bg-background p-4">
                          <FormLabel className="flex items-center gap-2 font-semibold text-foreground">
                            <Moon
                              className="h-4 w-4 text-info"
                              aria-hidden="true"
                            />
                            Peso Sono
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              className="font-display text-lg font-semibold"
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
                        <FormItem className="rounded-md border border-border bg-background p-4">
                          <FormLabel className="flex items-center gap-2 font-semibold text-foreground">
                            <Activity
                              className="h-4 w-4 text-warning"
                              aria-hidden="true"
                            />
                            Peso Atividade
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              className="font-display text-lg font-semibold"
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
                        <FormItem className="rounded-md border border-border bg-background p-4">
                          <FormLabel className="flex items-center gap-2 font-semibold text-foreground">
                            <Apple
                              className="h-4 w-4 text-success"
                              aria-hidden="true"
                            />
                            Peso Nutrição
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              className="font-display text-lg font-semibold"
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
      <div className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:col-span-4">
        {/* Botão de Submissão Principal */}
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-start gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-primary"
                aria-hidden="true"
              >
                <Settings className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  Salvar diretrizes
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Grava a missão, os objetivos e os pesos dos biomarcadores. O
                  modelo de IA é salvo no próprio cartão dele.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              form="ai-config-form"
              size="lg"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <Loader2
                  className="mr-2 h-5 w-5 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Zap className="mr-2 h-5 w-5" aria-hidden="true" />
              )}
              {isSubmitting ? 'Sincronizando...' : 'Confirmar Atualização'}
            </Button>
          </CardContent>
        </Card>

        {/* Card de Status Operacional */}
        <Card>
          <CardHeader>
            <CardTitle>Estado Operacional</CardTitle>
            <CardDescription>
              Visão do ecossistema local do Next.js
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-border bg-background p-4">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <span
                  className="h-2 w-2 rounded-full bg-success"
                  aria-hidden="true"
                ></span>
                Processamento Local
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Score e inferências calculadas internamente sobre as métricas
                persistidas, sem latência externa.
              </p>
            </div>
            <div className="rounded-md border border-border bg-background p-4">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <span
                  className="h-2 w-2 rounded-full bg-cosmic"
                  aria-hidden="true"
                ></span>
                Planos em MySQL
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
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
