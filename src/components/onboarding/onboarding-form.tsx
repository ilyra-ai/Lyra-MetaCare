'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import {
  Heart,
  ArrowRight,
  User,
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Dumbbell,
  ShieldCheck,
  Scale,
  Moon,
  Utensils,
  Zap,
  Weight,
  Sun,
  Rss,
  Globe,
  Droplet,
  Footprints,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { OnboardingNavigationDots } from './OnboardingNavigationDots';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';
import { differenceInYears } from 'date-fns';
import { TimeInput } from '@/components/ui/time-input';

const goalsList = [
  { id: 'lose_weight', label: 'Perder Peso', icon: Weight },
  { id: 'gain_muscle', label: 'Ganhar Músculo', icon: Dumbbell },
  { id: 'improve_endurance', label: 'Melhorar Resistência', icon: Footprints },
  { id: 'reduce_stress', label: 'Reduzir Estresse Crônico', icon: Heart },
  { id: 'eat_healthier', label: 'Comer de Forma Saudável', icon: Utensils },
  { id: 'optimize_hrv', label: 'Otimizar HRV (Resiliência)', icon: Zap },
  {
    id: 'improve_readiness',
    label: 'Melhorar Score de Prontidão',
    icon: ShieldCheck,
  },
  {
    id: 'regulate_sleep_duration',
    label: 'Regular Duração do Sono',
    icon: Moon,
  },
  {
    id: 'improve_sleep_efficiency',
    label: 'Aumentar a Eficiência do Sono',
    icon: Sun,
  },
  {
    id: 'reduce_social_jetlag',
    label: 'Reduzir o Social Jetlag (Regularidade)',
    icon: Rss,
  },
  { id: 'increase_vo2max', label: 'Aumentar VO₂max', icon: TrendingUp },
  {
    id: 'meet_activity_guidelines',
    label: 'Cumprir Diretrizes de Atividade',
    icon: Activity,
  },
  {
    id: 'optimize_protein',
    label: 'Otimizar Ingestão de Proteínas',
    icon: Utensils,
  },
  {
    id: 'manage_blood_glucose',
    label: 'Gerenciar Picos de Glicose',
    icon: Droplet,
  },
];

const onboardingSchema = z.object({
  first_name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  last_name: z.string().min(2, 'O sobrenome deve ter pelo menos 2 caracteres.'),
  birth_date: z.date({
    error: (issue) =>
      issue.input === undefined
        ? 'Data de nascimento é obrigatória.'
        : undefined,
  }),
  birth_time: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (val === '' || val === undefined) return true;
      return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val);
    }, 'Formato de hora inválido (HH:MM).'),
  birth_location: z.string().min(3, 'Local de nascimento é obrigatório.'),
  // O input type="number" entrega string no onChange; a coerção converte.
  age: z.coerce
    .number<number | string>()
    .min(13, 'Você deve ter pelo menos 13 anos.')
    .max(120, 'Idade inválida.'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not-to-say'], {
    error: (issue) =>
      issue.input === undefined ? 'Por favor, selecione um gênero.' : undefined,
  }),
  activity_level: z.number().min(1).max(5).optional(),
  goals: z.array(z.string()).optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos.',
  }),
});

type OnboardingInput = z.input<typeof onboardingSchema>;
type OnboardingValues = z.output<typeof onboardingSchema>;

const TOTAL_STEPS = 5;

const OnboardingStep: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <CarouselItem className={cn('animate-fade-in', className)}>
    <Card className="min-h-[550px] flex flex-col rounded-2xl border-border shadow-md">
      {children}
    </Card>
  </CarouselItem>
);

export function OnboardingForm() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { db, session } = useAuth();

  const form = useForm<OnboardingInput, unknown, OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      age: 18,
      gender: 'prefer_not-to-say',
      activity_level: 3,
      goals: [],
      consent: false,
      birth_time: '12:00',
      birth_location: '',
      birth_date: undefined,
    },
  });

  // useWatch assina apenas este campo e é compatível com o React Compiler.
  const birthDate = useWatch({ control: form.control, name: 'birth_date' });

  React.useEffect(() => {
    if (birthDate) {
      const calculatedAge = differenceInYears(new Date(), birthDate);
      form.setValue('age', calculatedAge, { shouldValidate: true });
    }
  }, [birthDate, form]);

  React.useEffect(() => {
    if (session?.user) {
      const metadata = session.user.user_metadata;
      const currentFirstName = form.getValues('first_name');
      const currentLastName = form.getValues('last_name');

      if (!currentFirstName && metadata?.first_name) {
        form.setValue('first_name', metadata.first_name, {
          shouldValidate: true,
        });
      }
      if (!currentLastName && metadata?.last_name) {
        form.setValue('last_name', metadata.last_name, {
          shouldValidate: true,
        });
      }
      if ((!currentFirstName || !currentLastName) && metadata?.full_name) {
        const parts = metadata.full_name.split(' ');
        if (!currentFirstName && parts.length > 0) {
          form.setValue('first_name', parts[0], { shouldValidate: true });
        }
        if (!currentLastName && parts.length > 1) {
          form.setValue('last_name', parts.slice(1).join(' '), {
            shouldValidate: true,
          });
        }
      }
    }
  }, [session, form]);

  React.useEffect(() => {
    if (!api) return;
    const handleScrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    api.on('select', handleScrollToTop);
    return () => {
      api.off('select', handleScrollToTop);
    };
  }, [api]);

  const handleNext = async (
    fields: (keyof OnboardingValues)[] | keyof OnboardingValues
  ) => {
    const fieldsToValidate = Array.isArray(fields) ? fields : [fields];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      api?.scrollNext();
    } else {
      toast.error(
        'Por favor, preencha os campos obrigatórios corretamente antes de prosseguir.'
      );
    }
  };

  const onSubmit = async (data: OnboardingValues) => {
    if (!session?.user) {
      toast.error('Erro de autenticação. Por favor, faça login novamente.');
      return;
    }
    setIsSubmitting(true);

    const profileData = data;
    const formattedBirthDate = profileData.birth_date
      ? profileData.birth_date.toISOString().split('T')[0]
      : null;
    const ageInt = Math.floor(profileData.age);
    const formattedBirthTime =
      profileData.birth_time === '' ? null : profileData.birth_time;

    const updatePayload = {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      age: ageInt,
      gender: profileData.gender,
      activity_level: profileData.activity_level,
      goals:
        profileData.goals && profileData.goals.length > 0
          ? profileData.goals
          : null,
      birth_date: formattedBirthDate,
      birth_time: formattedBirthTime,
      birth_location: profileData.birth_location,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await db
      .from('profiles')
      .update(updatePayload)
      .eq('id', session.user.id);

    setIsSubmitting(false);

    if (error) {
      console.error('Erro ao atualizar perfil no MySQL:', error);
      toast.error('Ocorreu um erro ao salvar seu perfil.', {
        description: error.message,
      });
    } else {
      toast.success('Perfil salvo com sucesso! Bem-vindo(a)!');
      router.push('/');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Carousel
          setApi={setApi}
          className="w-full max-w-2xl"
          opts={{ watchDrag: false }}
        >
          <CarouselContent>
            {/* Step 1: Welcome */}
            <OnboardingStep>
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl font-display">
                  Bem-vindo(a) à sua Jornada
                </CardTitle>
                <CardDescription>
                  Vamos personalizar sua experiência. Responda algumas perguntas
                  rápidas para começarmos.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 overflow-y-auto">
                <div className="md:col-span-2 space-y-4">
                  <p className="text-base text-foreground leading-relaxed">
                    O Lyra MetaCare usa inteligência artificial para criar um
                    plano de longevidade exclusivo para você.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Clique em &ldquo;Começar&rdquo; para iniciar a configuração
                    do seu perfil.
                  </p>
                </div>
                <div className="flex justify-center items-center md:col-span-1">
                  <div className="p-5 bg-gradient-teal rounded-2xl shadow-teal">
                    <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-white" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t border-border pt-4">
                <OnboardingNavigationDots api={api} count={TOTAL_STEPS} />
                <Button
                  type="button"
                  onClick={() => api?.scrollNext()}
                  className="rounded-xl bg-gradient-teal text-white shadow-teal"
                >
                  Começar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </OnboardingStep>

            {/* Step 2: Personal Data */}
            <OnboardingStep>
              <CardHeader className="space-y-2">
                <CardTitle className="font-display">
                  Seus Dados Pessoais
                </CardTitle>
                <CardDescription>
                  Nome, data de nascimento e gênero para personalização.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-6 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-sm font-medium">
                          <User className="h-4 w-4 mr-1.5 text-primary" /> Nome
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Seu nome"
                            className="rounded-xl"
                            {...field}
                          />
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
                        <FormLabel className="flex items-center text-sm font-medium">
                          <User className="h-4 w-4 mr-1.5 text-primary" />{' '}
                          Sobrenome
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Seu sobrenome"
                            className="rounded-xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="mb-2 flex items-center text-sm font-medium">
                          <Calendar className="h-4 w-4 mr-1.5 text-primary" />{' '}
                          Data de Nascimento
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="DD/MM/AAAA"
                            id={field.name}
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
                        <FormLabel className="flex items-center text-sm font-medium">
                          <Scale className="h-4 w-4 mr-1.5 text-primary" />{' '}
                          Idade
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Idade"
                            className={cn(
                              'rounded-xl',
                              !!birthDate && 'bg-muted cursor-not-allowed'
                            )}
                            {...field}
                            disabled={!!birthDate}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
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
                        <FormLabel className="flex items-center text-sm font-medium">
                          <Globe className="h-4 w-4 mr-1.5 text-primary" />{' '}
                          Gênero
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="birth_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-sm font-medium">
                          <Clock className="h-4 w-4 mr-1.5 text-cosmic" /> Hora
                          Exata (HH:MM)
                        </FormLabel>
                        <FormControl>
                          <TimeInput placeholder="12:00" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Usado para cronobiologia. (Opcional)
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
                        <FormLabel className="flex items-center text-sm font-medium">
                          <MapPin className="h-4 w-4 mr-1.5 text-cosmic" />{' '}
                          Local de Nascimento
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: São Paulo, SP, Brasil"
                            className="rounded-xl"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Cidade, Estado e País.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t border-border pt-4">
                <OnboardingNavigationDots api={api} count={TOTAL_STEPS} />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => api?.scrollPrev()}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button
                    type="button"
                    className="rounded-xl bg-gradient-teal text-white shadow-teal"
                    onClick={() =>
                      handleNext([
                        'first_name',
                        'last_name',
                        'birth_date',
                        'birth_time',
                        'birth_location',
                        'age',
                        'gender',
                      ])
                    }
                  >
                    Próximo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </OnboardingStep>

            {/* Step 3: Activity Level */}
            <OnboardingStep>
              <CardHeader className="space-y-2">
                <CardTitle className="font-display">
                  Nível de Atividade
                </CardTitle>
                <CardDescription>
                  Quão ativo(a) você é no seu dia a dia?
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 overflow-y-auto">
                <div className="p-5 bg-gradient-coral rounded-2xl shadow-coral">
                  <Dumbbell className="w-12 h-12 md:w-16 md:h-16 text-white" />
                </div>

                <div className="w-full max-w-md">
                  <FormField
                    control={form.control}
                    name="activity_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-display font-semibold block text-center mb-4">
                          Nível Atual:{' '}
                          <span className="text-primary">{field.value}</span>
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={[field.value || 3]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground mt-3">
                          <span>Sedentário (1)</span>
                          <span>Muito Ativo (5)</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t border-border pt-4">
                <OnboardingNavigationDots api={api} count={TOTAL_STEPS} />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => api?.scrollPrev()}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button
                    type="button"
                    className="rounded-xl bg-gradient-teal text-white shadow-teal"
                    onClick={() => api?.scrollNext()}
                  >
                    Próximo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </OnboardingStep>

            {/* Step 4: Goals */}
            <OnboardingStep>
              <CardHeader className="space-y-2">
                <CardTitle className="font-display">Seus Objetivos</CardTitle>
                <CardDescription>
                  O que você espera alcançar? (Opcional)
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center p-6 overflow-y-auto">
                <div className="w-full max-w-xl">
                  <FormField
                    control={form.control}
                    name="goals"
                    render={() => (
                      <FormItem className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {goalsList.map((item) => {
                          const GoalIcon = item.icon;
                          return (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="goals"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 border border-border rounded-xl p-3 hover:bg-secondary transition-colors cursor-pointer">
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
                                  <div className="flex items-center space-x-2.5">
                                    <GoalIcon className="h-4 w-4 text-primary flex-shrink-0" />
                                    <FormLabel className="font-medium cursor-pointer text-sm">
                                      {item.label}
                                    </FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                          );
                        })}
                        <FormMessage className="col-span-full" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t border-border pt-4">
                <OnboardingNavigationDots api={api} count={TOTAL_STEPS} />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => api?.scrollPrev()}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button
                    type="button"
                    className="rounded-xl bg-gradient-teal text-white shadow-teal"
                    onClick={() => api?.scrollNext()}
                  >
                    Próximo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </OnboardingStep>

            {/* Step 5: Consent & Submit */}
            <OnboardingStep>
              <CardHeader className="space-y-2">
                <CardTitle className="font-display">Quase lá!</CardTitle>
                <CardDescription>
                  Revise e confirme para finalizar.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 overflow-y-auto">
                <div className="p-5 bg-gradient-cosmic rounded-2xl shadow-cosmic">
                  <ShieldCheck className="w-12 h-12 md:w-16 md:h-16 text-white" />
                </div>
                <FormField
                  control={form.control}
                  name="consent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-border p-4 w-full max-w-md">
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
                        <FormDescription className="text-xs">
                          Você pode gerenciar seus dados nas configurações a
                          qualquer momento.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t border-border pt-4">
                <OnboardingNavigationDots api={api} count={TOTAL_STEPS} />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => api?.scrollPrev()}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-gradient-coral text-white shadow-coral"
                  >
                    {isSubmitting ? 'Salvando...' : 'Finalizar'}
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
