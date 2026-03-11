"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, RefreshCw, Settings, Zap } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const aiConfigSchema = z.object({
  mission: z.string().min(20, "Descreva a missão com mais profundidade."),
  key_objectives: z.string().min(20, "Detalhe melhor os objetivos principais."),
  weight_hrv: z.coerce.number().min(0).max(100),
  weight_sleep: z.coerce.number().min(0).max(100),
  weight_activity: z.coerce.number().min(0).max(100),
  weight_nutrition: z.coerce.number().min(0).max(100),
  model_name: z.string().min(1, "Selecione um motor local."),
});

type AIConfigValues = z.infer<typeof aiConfigSchema>;

export function AIConfigForm() {
  const { supabase } = useAuth();
  const [configId, setConfigId] = React.useState<string | null>(null);
  const [availableModels, setAvailableModels] = React.useState<Array<{ id: string; label: string }>>([]);
  const [isLoadingConfig, setIsLoadingConfig] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingModels, setIsLoadingModels] = React.useState(false);

  const form = useForm<AIConfigValues>({
    resolver: zodResolver(aiConfigSchema),
    defaultValues: {
      mission: "",
      key_objectives: "",
      weight_hrv: 30,
      weight_sleep: 30,
      weight_activity: 25,
      weight_nutrition: 15,
      model_name: "",
    },
  });

  const loadConfig = React.useCallback(async () => {
    setIsLoadingConfig(true);
    const { data, error } = await supabase
      .from("ai_config")
      .select("*")
      .limit(1)
      .single();

    if (error || !data) {
      toast.error("Erro ao carregar configuração local de IA.", {
        description: error?.message || "Registro de configuração não encontrado.",
      });
      setIsLoadingConfig(false);
      return;
    }

    setConfigId(String((data as { id: string }).id));
    form.reset({
      mission: String((data as { mission: string }).mission),
      key_objectives: String((data as { key_objectives: string }).key_objectives),
      weight_hrv: Number((data as { weight_hrv: number }).weight_hrv),
      weight_sleep: Number((data as { weight_sleep: number }).weight_sleep),
      weight_activity: Number((data as { weight_activity: number }).weight_activity),
      weight_nutrition: Number((data as { weight_nutrition: number }).weight_nutrition),
      model_name: String((data as { model_name: string | null }).model_name ?? ""),
    });

    if ((data as { model_name: string | null }).model_name) {
      setAvailableModels([
        {
          id: String((data as { model_name: string | null }).model_name),
          label: String((data as { model_name: string | null }).model_name),
        },
      ]);
    }

    setIsLoadingConfig(false);
  }, [form, supabase]);

  React.useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const loadLocalModels = async () => {
    setIsLoadingModels(true);
    const { data, error } = await supabase.functions.invoke<{
      success: boolean;
      models: Array<{ id: string; label: string }>;
      error?: string;
    }>("test-ai-connection");
    setIsLoadingModels(false);

    if (error || !data?.success) {
      toast.error("Falha ao consultar catálogo local.", {
        description: error?.message || data?.error || "Motores locais indisponíveis.",
      });
      return;
    }

    setAvailableModels(data.models);
    if (data.models[0]) {
      form.setValue("model_name", data.models[0].id, { shouldValidate: true });
    }
    toast.success("Motores locais carregados.");
  };

  const onSubmit = async (values: AIConfigValues) => {
    if (!configId) {
      toast.error("Configuração principal não encontrada.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase
      .from("ai_config")
      .update({
        ...values,
        updated_at: new Date().toISOString(),
      })
      .eq("id", configId);
    setIsSubmitting(false);

    if (error) {
      toast.error("Falha ao salvar configuração local.", { description: error.message });
      return;
    }

    toast.success("Configuração local atualizada com sucesso.");
  };

  if (isLoadingConfig) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Zap className="h-6 w-6 text-teal-600" />
            Configuração do Motor Local
          </CardTitle>
          <CardDescription>
            Ajuste a missão, os pesos de biomarcadores e o motor de orquestração utilizado pelo backend MySQL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="mission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Missão clínica-operacional</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
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
                    <FormLabel>Objetivos-chave</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="weight_hrv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso HRV</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
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
                      <FormLabel>Peso Sono</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
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
                      <FormLabel>Peso Atividade</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
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
                      <FormLabel>Peso Nutrição</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="model_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motor local ativo</FormLabel>
                    <div className="flex gap-3">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um motor local..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableModels.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" onClick={loadLocalModels} disabled={isLoadingModels}>
                        {isLoadingModels ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Atualizar Catálogo
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="bg-teal-700 hover:bg-teal-800">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                Salvar Configuração
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado Operacional</CardTitle>
          <CardDescription>
            O backend agora usa motor local, persistência MySQL e APIs internas do Next.js.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="rounded-xl border p-4">
            <p className="font-semibold">Processamento de score</p>
            <p className="text-muted-foreground">Executado internamente via cálculo local sobre métricas persistidas.</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="font-semibold">Geração de plano</p>
            <p className="text-muted-foreground">Plano estruturado, persistido em MySQL e sem dependência de Edge Function externa.</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="font-semibold">Assistente</p>
            <p className="text-muted-foreground">Respostas contextuais locais com leitura de perfil, métricas e astrologia atual.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
