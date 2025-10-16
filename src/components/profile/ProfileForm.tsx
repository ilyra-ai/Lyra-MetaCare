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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, TrendingUp, Calendar, Clock, MapPin, ListChecks, Scale } from "lucide-react";
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
import { DatePicker } from "@/components/ui/date-picker";
import { differenceInYears, parseISO, format } from "date-fns";
import { cn } from "@/lib/utils";
import { TimeInput } from "@/components/ui/time-input";
import { AvatarUploader } from "./AvatarUploader";
import { HabitList } from "./HabitList";
import { DailyMetric } from "@/hooks/use-daily-metrics"; // Importando o tipo DailyMetric

// --- Data Definitions ---
const goalsList = [
  { id: "lose_weight", label: "Perder Peso" },
  { id: "gain_muscle", label: "Ganhar Músculo" },
  { id: "improve_endurance", label: "Melhorar Resistência" },
  { id: "reduce_stress", label: "Reduzir Estresse Crônico" },
  { id: "eat_healthier", label: "Comer de Forma Saudável" },
  { id: "optimize_hrv", label: "Otimizar HRV (Resiliência)" },
  { id: "improve_readiness", label: "Melhorar Score de Prontidão" },
  { id: "regulate_sleep_duration", label: "Regular Duração do Sono" },
  { id: "increase_vo2max", label: "Aumentar VO₂max" },
  { id: "manage_blood_glucose", label: "Gerenciar Glicose Pós-Prandial" },
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
  
  birth_date: z.date().optional().nullable(),
  birth_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM).").optional().or(z.literal('')),
  birth_location: z.string().min(3, "Local de nascimento é obrigatório.").optional().or(z.literal('')),

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

// --- Progress Chart Component (Updated to fetch real data) ---
const chartConfig = {
  weight: {
    label: "Peso (kg)",
    color: "hsl(var(--chart-2))",
  },
};

function ProgressChart({ userId, supabase }: { userId: string, supabase: any }) {
    const [data, setData] = React.useState<{ date: string, weight: number }[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchWeightData = React.useCallback(async () => {
        setLoading(true);
        // Fetch last 6 months of weight data
        const sixMonthsAgo = format(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

        const { data: metrics, error } = await supabase
            .from("daily_metrics")
            .select("date, weight_kg")
            .eq("user_id", userId)
            .gte("date", sixMonthsAgo)
            .not("weight_kg", "is", null)
            .order("date", { ascending: true });

        if (error) {
            console.error("Error fetching weight data:", error);
            setData([]);
        } else {
            // Filter and map data for Recharts
            const chartData = (metrics as Pick<DailyMetric, 'date' | 'weight_kg'>[])
                .filter(m => m.weight_kg !== null)
                .map(m => ({
                    date: format(parseISO(m.date), 'MMM'), // Use month for X-axis label
                    weight: m.weight_kg as number,
                }));
            setData(chartData);
        }
        setLoading(false);
    }, [userId, supabase]);

    React.useEffect(() => {
        fetchWeightData();
    }, [fetchWeightData]);

    if (loading) {
        return <Skeleton className="h-[250px] w-full" />;
    }
    
    if (data.length === 0) {
        return (
            <Card className="col-span-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Progresso Longitudinal</CardTitle>
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="text-center p-8">
                    <p className="text-muted-foreground">Nenhum dado de peso encontrado nos últimos 6 meses.</p>
                    <p className="text-xs text-muted-foreground mt-2">Registre seu peso nas métricas diárias para visualizar o progresso.</p>
                </CardContent>
            </Card>
        );
    }


  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Progresso Longitudinal (Peso)</CardTitle>
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="weight"
              type="monotone"
              stroke="var(--color-weight)"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Exibindo dados de peso dos últimos 6 meses.
        </p>
      </CardContent>
    </Card>
  );
}

// --- Main Component ---
export function ProfileForm() {
  const { supabase, session } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null); // State for avatar URL

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      age: 18,
      gender: "prefer_not-to-say",
      activity_level: 3,
      goals: [],
      birth_date: null,
      birth_time: "",
      birth_location: "",
    },
    mode: "onChange",
  });

  const birthDateWatch = form.watch("birth_date");

  // Efeito para calcular a idade automaticamente
  React.useEffect(() => {
    if (birthDateWatch) {
      const calculatedAge = differenceInYears(new Date(), birthDateWatch);
      form.setValue("age", calculatedAge, { shouldValidate: true });
    }
  }, [birthDateWatch, form]);


  const fetchProfile = React.useCallback(async () => {
    if (!session?.user) return;

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("first_name, last_name, age, gender, activity_level, goals, birth_date, birth_time, birth_location, avatar_url") // Fetch avatar_url
      .eq("id", session.user.id)
      .limit(1)
      .single(); // Usando .single() para obter o objeto diretamente

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching profile:", error);
    } else if (profiles) {
      const data = profiles; // data já é o objeto do perfil
      
      // Parse birth_date string to Date object for the form
      // parseISO lida bem com o formato YYYY-MM-DD
      const parsedBirthDate = data.birth_date ? parseISO(data.birth_date) : null;
      setAvatarUrl(data.avatar_url); // Set avatar URL state

      const profileData: ProfileValues = {
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        age: data.age || 18,
        gender: (data.gender as ProfileValues['gender']) || "prefer_not-to-say",
        activity_level: data.activity_level || 3,
        goals: data.goals || [],
        // Se for null, passamos undefined para o DatePicker
        birth_date: parsedBirthDate && !isNaN(parsedBirthDate.getTime()) ? parsedBirthDate : undefined, 
        birth_time: data.birth_time || "",
        birth_location: data.birth_location || "",
      };
      
      // Resetar o formulário com os dados carregados
      form.reset(profileData);
    }
    setIsLoading(false);
  }, [session, supabase, form]);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onSubmit = async (data: ProfileValues) => {
    if (!session?.user) return;

    // Format birth_date to ISO string (YYYY-MM-DD) for Supabase DATE type
    const formattedBirthDate = data.birth_date ? format(data.birth_date, 'yyyy-MM-dd') : null;
    
    // Tratar birth_time: se for string vazia, enviar null para o DB
    const formattedBirthTime = data.birth_time === "" ? null : data.birth_time;


    const { error } = await supabase
      .from("profiles")
      .update({
        ...data,
        birth_date: formattedBirthDate,
        birth_time: formattedBirthTime,
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
        <Skeleton className="h-48 w-full" />
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
  const firstName = form.getValues("first_name") || "Usuário";
  const lastName = form.getValues("last_name") || "";

  return (
    <div className="flex flex-col gap-8"> {/* Layout vertical principal */}
      
      {/* Top Section: Avatar and Basic Info */}
      <Card className="w-full shadow-lg border-green-500/50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <User className="h-6 w-6 mr-2 text-green-600" />
            Informações Básicas
          </CardTitle>
          <CardDescription>Gerencie sua foto e dados de contato.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          
          {/* Avatar Uploader (Topo com avatar grande) */}
          <AvatarUploader 
            currentAvatarUrl={avatarUrl}
            firstName={firstName}
            onUploadSuccess={setAvatarUrl}
          />

          {/* User Details */}
          <div className="space-y-1 text-center md:text-left pt-4">
            <p className="text-2xl font-bold">{firstName} {lastName}</p>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 pt-2">
                Idade: {form.getValues("age")} | Nível de Atividade: {activityLevels[form.getValues("activity_level") - 1]}
            </p>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Middle Section: Asymmetrical Form (Personal Data & Chronobiology + Habits) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Coluna 1 & 2: Dados Pessoais e Cronobiologia (Campos à esquerda) */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Dados Pessoais e Cronobiologia</CardTitle>
                <CardDescription>Informações essenciais para a análise de IA.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nome e Sobrenome */}
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
                
                {/* Data de Nascimento */}
                <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="mb-2">
                          <Calendar className="h-4 w-4 mr-1 inline-block align-text-bottom" /> Data de Nascimento
                      </FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value || undefined}
                          onChange={field.onChange}
                          placeholder="DD/MM/AAAA"
                          id={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Idade (Calculada) */}
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idade (Calculada)</FormLabel>
                      <FormControl>
                        <Input 
                            type="number" 
                            placeholder="Idade" 
                            {...field} 
                            disabled={!!birthDateWatch}
                            className={cn(!!birthDateWatch && "bg-gray-100 cursor-not-allowed")}
                        />
                      </FormControl>
                      <FormDescription>
                          Calculada automaticamente pela data.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gênero */}
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
                
                {/* Hora de Nascimento */}
                <FormField
                  control={form.control}
                  name="birth_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                          <Clock className="h-4 w-4 mr-1 inline-block align-text-bottom" /> Hora Exata (HH:MM)
                      </FormLabel>
                      <FormControl>
                        <TimeInput placeholder="12:00" {...field} />
                      </FormControl>
                      <FormDescription>
                          Usado para cronobiologia.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Local de Nascimento */}
                <FormField
                  control={form.control}
                  name="birth_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                          <MapPin className="h-4 w-4 mr-1 inline-block align-text-bottom" /> Local de Nascimento
                      </FormLabel>
                      <FormControl>
                        <Input 
                            placeholder="Ex: São Paulo, SP, Brasil" 
                            {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                          Digite Cidade, Estado e País.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Coluna 3: Lista de Hábitos (Previews à direita) */}
            <div className="lg:col-span-1">
                <HabitList />
            </div>
          </div>

          {/* Bottom Section: Goals, Activity & Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Metas e Atividade</CardTitle>
              <CardDescription>Defina seus objetivos e nível de atividade.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Activity Level Slider */}
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

              {/* Goals Checkboxes */}
              <FormField
                control={form.control}
                name="goals"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center mb-2">
                        <ListChecks className="h-4 w-4 mr-1 inline-block align-text-bottom" /> Seus Objetivos de Longevidade
                    </FormLabel>
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
          
          {/* Progress Chart (Gráfico de progresso longitudinal) */}
          {session?.user && <ProgressChart userId={session.user.id} supabase={supabase} />}

          {/* Save Button (Base com botão "Salvar") */}
          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto">
            {form.formState.isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </Form>
    </div>
  );
}