"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { Heart, ArrowRight, User, Activity, CheckCircle, ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import { OnboardingNavigationDots } from "./OnboardingNavigationDots";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { differenceInYears } from "date-fns";

const goalsList = [
  { id: "lose_weight", label: "Perder Peso" },
  { id: "gain_muscle", label: "Ganhar Músculo" },
  { id: "improve_endurance", label: "Melhorar Resistência" },
  { id: "reduce_stress", label: "Reduzir Estresse" },
  { id: "eat_healthier", label: "Comer de Forma Saudável" },
];

// --- Zod Schema ---
const onboardingSchema = z.object({
  first_name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  last_name: z.string().min(2, "O sobrenome deve ter pelo menos 2 caracteres."),
  
  // Novos campos de nascimento
  birth_date: z.date({ required_error: "Data de nascimento é obrigatória." }),
  birth_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)."),
  birth_location: z.string().min(3, "Local de nascimento é obrigatório."),

  // A idade é calculada, mas mantemos a validação
  age: z.coerce
    .number()
    .min(13, "Você deve ter pelo menos 13 anos.")
    .max(120, "Idade inválida."),
  gender: z.enum(["male", "female", "other", "prefer_not-to-say"], {
    required_error: "Por favor, selecione um gênero.",
  }),
  activity_level: z.number().min(1).max(5), 
  goals: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "Você precisa selecionar pelo menos um objetivo.",
    }),
  consent: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos.",
  }),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

// O número total de passos diminuiu de 6 para 5
const TOTAL_STEPS = 5; 

// Helper component for Carousel Item structure
const OnboardingStep: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <CarouselItem className={cn("animate-in fade-in duration-500", className)}>
        <Card className="h-[550px] flex flex-col"> {/* Aumentei a altura para acomodar mais campos */}
            {children}
        </Card>
    </CarouselItem>
);

export function OnboardingForm() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { supabase, session } = useAuth();

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      age: 18,
      gender: "prefer_not-to-say",
      activity_level: 3, 
      goals: [],
      consent: false,
      birth_time: "12:00", // Default time
      birth_location: "",
      birth_date: undefined, // Usar undefined para DatePicker vazio
    },
  });

  const birthDate = form.watch("birth_date");

  // Efeito para calcular a idade automaticamente
  React.useEffect(() => {
    if (birthDate) {
      const calculatedAge = differenceInYears(new Date(), birthDate);
      form.setValue("age", calculatedAge, { shouldValidate: true });
    }
  }, [birthDate, form]);


  const handleNext = async (
    fields: (keyof OnboardingValues)[] | keyof OnboardingValues
  ) => {
    const fieldsToValidate = Array.isArray(fields) ? fields : [fields];
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      api?.scrollNext();
    } else {
        toast.error("Por favor, preencha os campos obrigatórios corretamente antes de prosseguir.");
    }
  };

  const onSubmit = async (data: OnboardingValues) => {
    if (!session?.user) {
      toast.error("Erro de autenticação. Por favor, faça login novamente.");
      return;
    }
    setIsSubmitting(true);
    // Apenas desestruturamos 'consent' e o resto é 'profileData'
    const { consent, ...profileData } = data;

    // Format birth_date to ISO string (YYYY-MM-DD) for Supabase DATE type
    const formattedBirthDate = profileData.birth_date ? profileData.birth_date.toISOString().split('T')[0] : null;

    // Update profile data in Supabase
    const { error } = await supabase
      .from("profiles")
      .update({
        ...profileData,
        birth_date: formattedBirthDate,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    setIsSubmitting(false);

    if (error) {
      toast.error("Ocorreu um erro ao salvar seu perfil.", {
        description: error.message,
      });
    } else {
      toast.success("Perfil salvo com sucesso! Bem-vindo(a)!");
      router.push("/");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Carousel setApi={setApi} className="w-full max-w-2xl">
          <CarouselContent>
            {/* Step 1: Welcome */}
            <OnboardingStep>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Bem-vindo(a) à sua Jornada
                  </CardTitle>
                  <CardDescription>
                    Vamos personalizar sua experiência. Responda algumas
                    perguntas rápidas para começarmos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6">
                  <div className="md:col-span-2 space-y-4">
                    <p className="text-lg text-gray-700">
                      O Lyra MetaCare usa inteligência artificial para criar um
                      plano de longevidade exclusivo para você.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Clique em "Começar" para iniciar a configuração do seu perfil.
                    </p>
                  </div>
                  <div className="hidden md:flex justify-center items-center">
                    <Heart className="w-24 h-24 text-green-500 animate-pulse" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4">
                  <OnboardingNavigationDots api={api} count={TOTAL_STEPS} />
                  <Button type="button" onClick={() => api?.scrollNext()}>
                    Começar <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
            </OnboardingStep>

            {/* Step 2: Personal Data (Name, Birth Date, Age, Gender, Location, Time) - CONSOLIDADO */}
            <OnboardingStep>
                <CardHeader>
                  <CardTitle>Seus Dados Pessoais</CardTitle>
                  <CardDescription>
                    Nome, data de nascimento e gênero para personalização.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-6 space-y-6">
                  {/* Nome e Sobrenome */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>

                  {/* Data de Nascimento, Idade e Gênero */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="DD/MM/AAAA"
                            />
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
                          <FormLabel>Idade (Calculada)</FormLabel>
                          <FormControl>
                            <Input 
                                type="number" 
                                placeholder="Idade" 
                                {...field} 
                                disabled={!!birthDate} // Desabilita se a data de nascimento estiver preenchida
                                className={cn(!!birthDate && "bg-gray-100 cursor-not-allowed")}
                            />
                          </FormControl>
                          <FormDescription>
                            Calculada automaticamente.
                          </FormDescription>
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
                            defaultValue={field.value}
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
                  </div>

                  {/* Hora e Local de Nascimento */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="birth_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <Clock className="h-4 w-4 mr-1 inline-block align-text-bottom" /> Hora Exata (HH:MM)
                          </FormLabel>
                          <FormControl>
                            <Input type="time" placeholder="12:00" {...field} />
                          </FormControl>
                          <FormDescription>
                            Usado para cronobiologia.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="birth_location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <MapPin className="h-4 w-4 mr-1 inline-block align-text-bottom" /> Local de Nascimento
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade, País" {...field} />
                          </FormControl>
                          <FormDescription>
                            Usado para cálculos astrológicos/cronobiológicos.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4">
                  <OnboardingNavigationDots api={api} count={TOTAL_STEPS} />
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => api?.scrollPrev()}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleNext(["first_name", "last_name", "birth_date", "birth_time", "birth_location", "age", "gender"])}
                    >
                      Próximo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
            </OnboardingStep>

            {/* Step 3: Activity Level (Antigo Step 4) */}
            <OnboardingStep>
                <CardHeader>
                  <CardTitle>Nível de Atividade</CardTitle>
                  <CardDescription>
                    Quão ativo(a) você é no seu dia a dia?
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="activity_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nível Atual: {field.value}</FormLabel>
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
                            <span>Sedentário (1)</span>
                            <span>Muito Ativo (5)</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="hidden md:flex justify-center items-center">
                    <Activity className="w-24 h-24 text-orange-500/70" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4">
                  <OnboardingNavigationDots api={api} count={TOTAL_STEPS} />
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => api?.scrollPrev()}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleNext("activity_level")}
                    >
                      Próximo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
            </OnboardingStep>

            {/* Step 4: Goals (Antigo Step 5) */}
            <OnboardingStep>
                <CardHeader>
                  <CardTitle>Seus Objetivos</CardTitle>
                  <CardDescription>
                    O que você espera alcançar? (Selecione ao menos um)
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="goals"
                      render={() => (
                        <FormItem className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          <FormMessage className="col-span-full" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="hidden md:flex justify-center items-center">
                    <CheckCircle className="w-24 h-24 text-green-600/70" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4">
                  <OnboardingNavigationDots api={api} count={TOTAL_STEPS} />
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => api?.scrollPrev()}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <Button type="button" onClick={() => handleNext("goals")}>
                      Próximo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
            </OnboardingStep>

            {/* Step 5: Consent & Submit (Antigo Step 6) */}
            <OnboardingStep>
                <CardHeader>
                  <CardTitle>Quase lá!</CardTitle>
                  <CardDescription>
                    Revise e confirme para finalizar.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-6">
                  <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 w-full max-w-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Eu concordo com o processamento dos meus dados para
                            personalizar minha experiência.
                          </FormLabel>
                          <FormDescription>
                            Você pode gerenciar seus dados nas configurações a
                            qualquer momento.
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4">
                  <OnboardingNavigationDots api={api} count={TOTAL_STEPS} />
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => api?.scrollPrev()}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Salvando..." : "Finalizar"}
                    </Button>
                  </div>
                </CardFooter>
            </OnboardingStep>
          </CarouselContent>
        </Carousel>
      </form>
    </Form>
  );
}