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
import { User, TrendingUp, Calendar, Clock, MapPin } from "lucide-react";
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
import { differenceInYears, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { TimeInput } from "@/components/ui/time-input";

// --- Data Definitions ---
const goalsList = [
  { id: "lose_weight", label: "Perder Peso" },
  { id: "gain_muscle", label: "Ganhar Músculo" },
  { id: "improve_endurance", label: "Melhorar Resistência" },
  { id: "reduce_stress", "label": "Reduzir Estresse" },
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
  
  // Novos campos de nascimento
  birth_date: z.date().optional().nullable(),
  // A validação Zod agora verifica o formato HH:MM
  birth_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM).").optional().or(z.literal('')),
  // birth_location agora é um campo de texto livre
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
      .select("first_name, last_name, age, gender, activity_level, goals, birth_date, birth_time, birth_location")
      .eq("id", session.user.id);

    if (error) {
      console.error("Error fetching profile:", error);
    } else if (profiles && profiles.length > 0) {
      const data = profiles[0];
      
      // Parse birth_date string to Date object for the form
      const parsedBirthDate = data.birth_date ? parseISO(data.birth_date) : null;

      const profileData = {
        ...data,
        activity_level: data.activity_level || 3,
        goals: data.goals || [],
        gender: data.gender || "prefer_not-to-say",
        // Se for null, passamos undefined para o DatePicker
        birth_date: parsedBirthDate || undefined, 
        birth_time: data.birth_time || "",
        birth_location: data.birth_location || "",
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

    // Format birth_date to ISO string (YYYY-MM-DD) for Supabase DATE type
    const formattedBirthDate = data.birth_date ? data.birth_date.toISOString().split('T')[0] : null;

    const { error } = await supabase
      .from("profiles")
      .update({
        ...data,
        birth_date: formattedBirthDate,
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
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Alterado para md:grid-cols-2 */}
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