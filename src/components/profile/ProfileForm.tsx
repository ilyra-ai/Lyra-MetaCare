"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";

// --- Data Definitions ---
const goalsList = [
  { id: "lose_weight", label: "Perder Peso" },
  { id: "gain_muscle", label: "Ganhar Músculo" },
  { id: "improve_endurance", label: "Melhorar Resistência" },
  { id: "reduce_stress", label: "Reduzir Estresse" },
  { id: "eat_healthier", label: "Comer de Forma Saudável" },
];

const activityLevels = [
  "Sedentário",
  "Leve",
  "Moderado",
  "Ativo",
  "Muito Ativo",
];

// --- Zod Schema ---
const profileSchema = z.object({
  first_name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  last_name: z.string().min(2, "O sobrenome deve ter pelo menos 2 caracteres."),
  age: z.coerce
    .number({ required_error: "Idade é obrigatória." })
    .min(13, "Você deve ter pelo menos 13 anos.")
    .max(120, "Idade inválida."),
  gender: z.enum(["male", "female", "other", "prefer_not-to-say"], {
    required_error: "Por favor, selecione um gênero.",
  }),
  activity_level: z.number().min(1).max(5),
  goals: z.array(z.string()).optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

// --- Progress Chart Placeholder ---
const progressData = [
  { month: "Jan", weight: 85 },
  { month: "Feb", weight: 83 },
  { month: "Mar", weight: 81 },
  { month: "Apr", weight: 79 },
  { month: "May", weight: 78 },
  { month: "Jun", weight: 77 },
];

const chartConfig = {
  weight: {
    label: "Weight (kg)",
    color: "hsl(var(--chart-2))",
  },
};

function ProgressChart() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Progresso Longitudinal</CardTitle>
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <LineChart data={progressData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="weight"
              type="monotone"
              stroke="var(--color-weight)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          *Dados simulados. Conecte seu wearable para dados reais.
        </p>
      </CardContent>
    </Card>
  );
}

// --- Main Component ---
export function ProfileForm() {
  const { supabase, session } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      age: 18,
      gender: "prefer_not-to-say",
      activity_level: 3,
      goals: [],
    },
    mode: "onChange",
  });

  const fetchProfile = React.useCallback(async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, last_name, age, gender, activity_level, goals")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      // Only show error if it's not the expected 'row not found' error (PGRST116)
      if (error.code !== 'PGRST116') {
        toast.error("Erro ao carregar dados do perfil.");
      }
    } else if (data) {
      // Ensure activity_level is a number (it's stored as smallint/number)
      const profileData = {
        ...data,
        activity_level: data.activity_level || 3,
        goals: data.goals || [],
        // Ensure gender is correctly mapped if null or undefined
        gender: data.gender || "prefer_not-to-say",
      };
      form.reset(profileData);
    }
    setIsLoading(false);
  }, [session, supabase, form]);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onSubmit = async (data: ProfileValues) => {
    if (!session?.user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    if (error) {
      toast.error("Ocorreu um erro ao atualizar o perfil.", {
        description: error.message,
      });
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const userEmail = session?.user.email || "";
  const initial = form.getValues("first_name")?.charAt(0).toUpperCase() || userEmail.charAt(0).toUpperCase();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24 border-4 border-green-500 shadow-lg">
            {/* Avatar editável placeholder */}
            <AvatarFallback className="text-4xl bg-green-100 text-green-700">{initial}</AvatarFallback>
          </Avatar>
          <p className="text-lg font-semibold">{form.getValues("first_name")} {form.getValues("last_name")}</p>
          <p className="text-sm text-muted-foreground">{userEmail}</p>
          <Button variant="outline" size="sm">
            Mudar Avatar
          </Button>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu sobrenome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idade</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Sua idade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gênero</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                        <SelectItem value="prefer_not-to-say">
                          Prefiro não dizer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metas e Atividade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="activity_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Atividade: {activityLevels[field.value - 1]}</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Sedentário</span>
                      <span>Muito Ativo</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goals"
                render={() => (
                  <FormItem>
                    <FormLabel>Seus Objetivos</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {goalsList.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="goals"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...(field.value || []),
                                          item.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </Form>

      {/* Progress Chart (Página 5 requirement: Gráfico de progresso longitudinal) */}
      <ProgressChart />
    </div>
  );
}