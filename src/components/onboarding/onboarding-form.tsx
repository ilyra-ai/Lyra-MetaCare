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
import { Heart, ArrowRight, User, Activity, CheckCircle } from "lucide-react";
import { OnboardingNavigationDots } from "./OnboardingNavigationDots";

const goalsList = [
  { id: "lose_weight", label: "Perder Peso" },
  { id: "gain_muscle", label: "Ganhar Músculo" },
  { id: "improve_endurance", label: "Melhorar Resistência" },
  { id: "reduce_stress", label: "Reduzir Estresse" },
  { id: "eat_healthier", label: "Comer de Forma Saudável" },
];

const onboardingSchema = z.object({
  first_name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  last_name: z.string().min(2, "O sobrenome deve ter pelo menos 2 caracteres."),
  age: z.coerce
    .number({ required_error: "Idade é obrigatória." })
    .min(13, "Você deve ter pelo menos 13 anos.")
    .max(120, "Idade inválida."),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"], {
    required_error: "Por favor, selecione um gênero.",
  }),
  // REMOVED .default(3) to align type inference with useForm's defaultValues
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

const TOTAL_STEPS = 6;

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
      gender: "prefer_not_to_say",
      activity_level: 3, // Default value is provided here instead of in Zod schema
      goals: [],
      consent: false,
    },
  });

  const handleNext = async (
    fields: (keyof OnboardingValues)[] | keyof OnboardingValues
  ) => {
    const fieldsToValidate = Array.isArray(fields) ? fields : [fields];
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      api?.scrollNext();
    }
  };

  const onSubmit = async (data: OnboardingValues) => {
    if (!session?.user) {
      toast.error("Erro de autenticação. Por favor, faça login novamente.");
      return;
    }
    setIsSubmitting(true);
    const { consent, ...profileData } = data;

    const { error } = await supabase
      .from("profiles")
      .update({
        ...profileData,
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
            {/* Step 1: Welcome (Asymmetrical Layout) */}
            <CarouselItem>
              <Card className="h-[450px] flex flex-col">
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
              </Card>
            </CarouselItem>

            {/* Step 2: Name */}
            <CarouselItem>
              <Card className="h-[450px] flex flex-col">
                <CardHeader>
                  <CardTitle>Como podemos te chamar?</CardTitle>
                  <CardDescription>
                    Nos diga seu nome para uma experiência mais pessoal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6">
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="hidden md:flex justify-center items-center">
                    <User className="w-24 h-24 text-blue-500/70" />
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
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleNext(["first_name", "last_name"])}
                    >
                      Próximo
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </CarouselItem>

            {/* Step 3: Age & Gender */}
            <CarouselItem>
              <Card className="h-[450px] flex flex-col">
                <CardHeader>
                  <CardTitle>Sobre Você</CardTitle>
                  <CardDescription>
                    Essas informações nos ajudam a adaptar o conteúdo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6">
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              <SelectItem value="prefer_not_to_say">
                                Prefiro não dizer
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="hidden md:flex justify-center items-center">
                    <User className="w-24 h-24 text-blue-500/70" />
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
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleNext(["age", "gender"])}
                    >
                      Próximo
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </CarouselItem>

            {/* Step 4: Activity Level */}
            <CarouselItem>
              <Card className="h-[450px] flex flex-col">
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
                            <span>Leve</span>
                            <span>Moderado</span>
                            <span>Ativo</span>
                            <span>Muito Ativo</span>
                          </div>
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
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleNext("activity_level")}
                    >
                      Próximo
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </CarouselItem>

            {/* Step 5: Goals */}
            <CarouselItem>
              <Card className="h-[450px] flex flex-col">
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
                      Voltar
                    </Button>
                    <Button type="button" onClick={() => handleNext("goals")}>
                      Próximo
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </CarouselItem>

            {/* Step 6: Consent & Submit */}
            <CarouselItem>
              <Card className="h-[450px] flex flex-col">
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
                      Voltar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Salvando..." : "Finalizar"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </form>
    </Form>
  );
}