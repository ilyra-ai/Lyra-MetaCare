"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { User, TrendingUp, Calendar, Clock, MapPin, LogOut } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { DatePicker } from "@/components/ui/date-picker";
import { differenceInYears, parseISO, format } from "date-fns";
import { cn } from "@/lib/utils";
import { TimeInput } from "@/components/ui/time-input";
import { AvatarUploader } from "./AvatarUploader";
import { HabitList } from "./HabitList";
import { DailyMetric } from "@/hooks/use-daily-metrics";

// --- Data Definitions ---
const activityLevels = [
  "Sedentário",
  "Leve",
  "Moderado",
  "Ativo",
  "Muito Ativo",
];

// --- Zod Schema ---
export const profileSchema = z.object({
  first_name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  last_name: z.string().min(2, "O sobrenome deve ter pelo menos 2 caracteres."),
  
  birth_date: z.date().optional().nullable(),
  birth_time: z.string().optional().or(z.literal('')).refine(val => {
    if (val === '' || val === undefined) return true;
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val);
  }, "Formato de hora inválido (HH:MM)."),
  birth_location: z.string().optional().or(z.literal('')),

  age: z.coerce
    .number({ required_error: "Idade é obrigatória." })
    .min(13, "Você deve ter pelo menos 13 anos.")
    .max(120, "Idade inválida."),
  gender: z.enum(["male", "female", "other", "prefer_not-to-say"], {
    required_error: "Por favor, selecione um gênero.",
  }),
});

export type ProfileValues = z.infer<typeof profileSchema>;

// --- Progress Chart Component ---
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
            const chartData = (metrics as Pick<DailyMetric, 'date' | 'weight_kg'>[])
                .filter(m => m.weight_kg !== null)
                .map(m => ({
                    date: format(parseISO(m.date), 'MMM'),
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
                    <p className="text-xs text-muted-foreground mt-2">Registre seu peso para visualizar o progresso.</p>
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
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      age: 18,
      gender: "prefer_not-to-say",
      birth_date: null,
      birth_time: "",
      birth_location: "",
    },
    mode: "onChange",
  });

  const birthDateWatch = form.watch("birth_date");

  React.useEffect(() => {
    if (birthDateWatch) {
      const calculatedAge = differenceInYears(new Date(), birthDateWatch);
      form.setValue("age", calculatedAge, { shouldValidate: true });
    }
  }, [birthDateWatch, form]);

  const fetchProfile = React.useCallback(async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, last_name, age, gender, birth_date, birth_time, birth_location, avatar_url")
      .eq("id", session.user.id)
      .maybeSingle();

    if (error) {
      toast.error("Erro ao carregar perfil.", { description: error.message });
    } else if (data) {
      const parsedBirthDate = data.birth_date ? parseISO(data.birth_date) : null;
      const validBirthDate = parsedBirthDate && !isNaN(parsedBirthDate.getTime()) ? parsedBirthDate : undefined;
      
      setAvatarUrl(data.avatar_url);

      form.reset({
        first_name: data.first_name ?? "",
        last_name: data.last_name ?? "",
        age: data.age ?? 18,
        gender: (data.gender as ProfileValues['gender']) ?? "prefer_not-to-say",
        birth_date: validBirthDate,
        birth_time: data.birth_time ?? "",
        birth_location: data.birth_location ?? "",
      });
    }
    setIsLoading(false);
  }, [session, supabase, form]);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onSubmit = async (data: ProfileValues) => {
    if (!session?.user) return;

    const formattedBirthDate = data.birth_date ? format(data.birth_date, 'yyyy-MM-dd') : null;
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const firstName = form.getValues("first_name") || "Usuário";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais e Cronobiologia</CardTitle>
                <CardDescription>Informações essenciais para a análise de IA.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="first_name" render={({ field }) => (
                  <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Seu nome" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="last_name" render={({ field }) => (
                  <FormItem><FormLabel>Sobrenome</FormLabel><FormControl><Input placeholder="Seu sobrenome" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="birth_date" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel className="mb-2"><Calendar className="h-4 w-4 mr-1 inline-block align-text-bottom" /> Data de Nascimento</FormLabel><FormControl><DatePicker value={field.value || undefined} onChange={field.onChange} placeholder="DD/MM/AAAA" id={field.name} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem><FormLabel>Idade (Calculada)</FormLabel><FormControl><Input type="number" placeholder="Idade" {...field} disabled={!!birthDateWatch} className={cn(!!birthDateWatch && "bg-gray-100 cursor-not-allowed")} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem><FormLabel>Gênero</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Masculino</SelectItem><SelectItem value="female">Feminino</SelectItem><SelectItem value="other">Outro</SelectItem><SelectItem value="prefer_not-to-say">Prefiro não dizer</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="birth_time" render={({ field }) => (
                  <FormItem><FormLabel><Clock className="h-4 w-4 mr-1 inline-block align-text-bottom" /> Hora Exata (HH:MM)</FormLabel><FormControl><TimeInput placeholder="12:00" {...field} /></FormControl><FormDescription>Opcional.</FormDescription><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="birth_location" render={({ field }) => (
                  <FormItem><FormLabel><MapPin className="h-4 w-4 mr-1 inline-block align-text-bottom" /> Local de Nascimento</FormLabel><FormControl><Input placeholder="Ex: São Paulo, SP, Brasil" {...field} /></FormControl><FormDescription>Opcional.</FormDescription><FormMessage /></FormItem>
                )} />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
        {session?.user && <ProgressChart userId={session.user.id} supabase={supabase} />}
      </div>

      <div className="lg:col-span-1 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Ações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <AvatarUploader 
              currentAvatarUrl={avatarUrl}
              firstName={firstName}
              onUploadSuccess={setAvatarUrl}
            />
            <Button variant="outline" onClick={handleSignOut} className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sair do App
            </Button>
          </CardContent>
        </Card>
        <HabitList />
      </div>
    </div>
  );
}