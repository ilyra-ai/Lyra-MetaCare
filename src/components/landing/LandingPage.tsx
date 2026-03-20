'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Bot,
  Brain,
  Calendar,
  Check,
  Eye,
  EyeOff,
  HeartPulse,
  MoonStar,
  Sparkles,
  Star,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { PlanMatrixPlan } from '@/types/subscription';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: string;
};

type Step = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

type Faq = {
  question: string;
  answer: string;
};

type PublicPlansPayload = {
  plans: PlanMatrixPlan[];
  error?: string;
};

const features: Feature[] = [
  {
    icon: Brain,
    title: 'IA com presenca gentil',
    description:
      'A tecnologia entra para organizar sua jornada com leveza, sem pesar a leitura nem roubar o protagonismo da experiencia.',
    tone: 'from-primary/16 via-primary/7 to-white',
  },
  {
    icon: MoonStar,
    title: 'Astrologia moderna e luminosa',
    description:
      'Ciclos e simbolismos aparecem com visual claro, sofisticado e atual, sem cair em uma estetica fria ou dura.',
    tone: 'from-cosmic/16 via-cosmic/8 to-white',
  },
  {
    icon: HeartPulse,
    title: 'Sinais do corpo com contexto',
    description:
      'Metrica, ritmo, sono e energia passam a conversar entre si numa interface mais organizada e acolhedora.',
    tone: 'from-accent/16 via-accent/8 to-white',
  },
  {
    icon: Calendar,
    title: 'Rotina com fluxo bonito',
    description:
      'Agenda, metas e rituais aparecem numa hierarquia mais clara, gostosa de usar e harmoniosa no dia a dia.',
    tone: 'from-golden/18 via-golden/8 to-white',
  },
];

const steps: Step[] = [
  {
    id: '01',
    title: 'Abra sua orbita',
    description:
      'Seu cadastro cria um espaco pessoal para sinais, preferencias e contexto simbolico.',
    icon: Sparkles,
  },
  {
    id: '02',
    title: 'Conecte seu contexto',
    description:
      'Rotina, sinais e preferencias alimentam uma leitura mais delicada e coerente.',
    icon: HeartPulse,
  },
  {
    id: '03',
    title: 'Receba orientacao com IA',
    description:
      'Chat, planos e proximos passos ganham presenca e clareza sem excessos visuais.',
    icon: Bot,
  },
  {
    id: '04',
    title: 'Volte com prazer',
    description:
      'A ideia e transformar constancia em algo leve, bonito e convidativo de acompanhar.',
    icon: Star,
  },
];

const faqs: Faq[] = [
  {
    question: 'A landing usa dados reais do produto?',
    answer:
      'Sim. O catalogo abaixo e carregado a partir de uma rota publica ligada ao MySQL desta instancia.',
  },
  {
    question: 'Existe login direto pela landing?',
    answer:
      'Sim. O card inicial permite entrada real sem sair da landing, mantendo a tela de login completa para quem preferir uma experiencia dedicada.',
  },
  {
    question: 'Por que nao ha depoimentos ficticios aqui?',
    answer:
      'Porque esta entrega segue a regra de nao simular prova social. Em vez disso, a pagina mostra evidencias reais do proprio ecossistema.',
  },
  {
    question: 'O foco continua sendo tema claro?',
    answer:
      'Sim. Toda a composicao foi refinada para ficar clara, doce, premium, serena e respiravel.',
  },
];

function formatCurrency(value: number, currencyCode: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currencyCode || 'BRL',
  }).format(value);
}

export function LandingPage() {
  const router = useRouter();
  const { db } = useAuth();
  const [plans, setPlans] = useState<PlanMatrixPlan[]>([]);
  const [plansStatus, setPlansStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [plansError, setPlansError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPlans() {
      try {
        const response = await fetch('/api/public/plans', {
          cache: 'no-store',
          signal: controller.signal,
        });
        const payload = (await response.json()) as PublicPlansPayload;

        if (!response.ok || !Array.isArray(payload.plans)) {
          throw new Error(
            payload.error || 'Falha ao carregar o catalogo publico.'
          );
        }

        setPlans(
          payload.plans.sort(
            (left, right) => left.displayOrder - right.displayOrder
          )
        );
        setPlansStatus('ready');
      } catch (error) {
        if (controller.signal.aborted) return;
        setPlans([]);
        setPlansStatus('error');
        setPlansError(
          error instanceof Error
            ? error.message
            : 'Falha ao carregar os planos.'
        );
      }
    }

    void loadPlans();
    return () => controller.abort();
  }, []);

  const enabledCapabilities = plans.reduce(
    (total, plan) =>
      total + plan.features.filter((feature) => feature.enabled).length,
    0
  );
  const checkoutReady = plans.filter(
    (plan) => plan.externalMonthlyPriceId || plan.externalAnnualPriceId
  ).length;
  const categories = new Set(
    plans.flatMap((plan) =>
      plan.features
        .filter((feature) => feature.enabled)
        .map((feature) => feature.category)
    )
  ).size;

  async function handleQuickLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const { error } = await db.auth.signInWithPassword({ email, password });

    setSubmitting(false);

    if (error) {
      toast.error('Nao foi possivel entrar agora.', {
        description: error.message,
      });
      return;
    }

    toast.success('Boas-vindas. Sua orbita foi aberta com sucesso.');
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background)),#ffffff_42%,#fbfbff_100%)] text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 rounded-full px-1 py-1 text-left"
            aria-label="Voltar ao topo da landing"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-teal text-white shadow-teal">
              <Sparkles className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-lg font-bold lowercase text-gradient-hero">
                lyra
              </span>
              <span className="block text-xs uppercase tracking-[0.28em] text-muted-foreground">
                astrologia + IA
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            <Button variant="ghost" asChild>
              <a href="#recursos">Recursos</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#fluxo">Fluxo</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#planos">Planos</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#faq">FAQ</a>
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Entrar
            </Button>
            <Button onClick={() => router.push('/login')}>Tela completa</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-18 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
          <div className="pointer-events-none absolute inset-0">
            <div className="cosmic-orb left-[-8rem] top-[-2rem] h-80 w-80 bg-primary/16" />
            <div className="cosmic-orb right-[-5rem] top-16 h-80 w-80 bg-cosmic/16" />
            <div className="cosmic-orb bottom-[-5rem] left-1/3 h-72 w-72 bg-accent/10" />
          </div>

          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-start">
            <div className="relative z-10">
              <Badge className="rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary shadow-sm">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                uma experiencia clarinha, organizada e muito mais acolhedora
              </Badge>

              <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-[4.4rem]">
                Seu bem-estar ganha uma casa
                <span className="block text-gradient-aurora">
                  mais linda, harmoniosa e inteligente.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                A Lyra MetaCare une astrologia vedica, IA e sinais da sua rotina
                numa interface clara, doce e premium, feita para parecer um
                lugar que acolhe em vez de cansar.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="xl" onClick={() => router.push('/login')}>
                  Entrar na experiencia completa
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="xl" variant="secondary" asChild>
                  <a href="#planos">Ver catalogo publicado</a>
                </Button>
              </div>
            </div>

            <div className="relative z-10 grid gap-4">
              <Card className="glass-card border-white/80 bg-white/76">
                <CardHeader>
                  <Badge className="w-fit rounded-full border-cosmic/20 bg-cosmic/10 px-3 py-1 text-cosmic">
                    entrada rapida
                  </Badge>
                  <CardTitle className="text-2xl">
                    Entrar direto pela landing
                  </CardTitle>
                  <CardDescription>
                    Uma entrada suave e organizada para quem ja quer cair direto
                    na propria orbita.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleQuickLogin}>
                    <div className="space-y-2">
                      <Label htmlFor="landing-email">Email</Label>
                      <Input
                        id="landing-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="landing-password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="landing-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className="pr-12"
                        />
                        <button
                          type="button"
                          aria-label={
                            showPassword ? 'Ocultar senha' : 'Mostrar senha'
                          }
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={
                          submitting ||
                          email.trim().length === 0 ||
                          password.trim().length === 0
                        }
                      >
                        {submitting ? 'Entrando...' : 'Entrar agora'}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => router.push('/login')}
                      >
                        Abrir tela completa
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-border/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,255,255,0.78))]">
                <CardContent className="grid gap-4 px-6 py-6 sm:grid-cols-2">
                  {[
                    {
                      icon: Brain,
                      title: 'IA gentil',
                      description:
                        'Tecnologia com presenca e sem ruir a delicadeza.',
                    },
                    {
                      icon: MoonStar,
                      title: 'Leitura simbolica',
                      description:
                        'Astrologia moderna em uma linguagem clara e atual.',
                    },
                    {
                      icon: HeartPulse,
                      title: 'Sinais do corpo',
                      description:
                        'Metricas mais organizadas e agradaveis de acompanhar.',
                    },
                    {
                      icon: Zap,
                      title: 'Fluxo bonito',
                      description:
                        'Uma jornada mais doce, limpa e sem bagunca visual.',
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[24px] border border-border/70 bg-white/82 p-4 shadow-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-foreground">
                        <item.icon className="h-4.5 w-4.5" />
                      </div>
                      <p className="mt-4 font-display text-lg font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="recursos" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <Badge className="rounded-full border-cosmic/20 bg-cosmic/10 px-4 py-1.5 text-cosmic">
                Recursos em destaque
              </Badge>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Menos peso visual, mais ternura, mais clareza e mais intencao.
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">
                O redesenho foi pensado para ficar harmonioso de verdade, com
                grid mais limpo, copy mais calorosa e uma sensacao de espaco
                bonito em vez de interface barulhenta.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-4">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="border-border/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))]"
                >
                  <CardHeader>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.tone} text-foreground shadow-sm`}
                    >
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,247,255,0.96))] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {plansStatus === 'loading'
                ? Array.from({ length: 4 }).map((_, index) => (
                    <Card
                      key={`metric-skeleton-${index}`}
                      className="border-border/70 bg-white/88"
                    >
                      <CardContent className="space-y-4 px-6 py-6">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-20" />
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))
                : [
                    ['planos publicados', String(plans.length)],
                    ['capacidades ativas', String(enabledCapabilities)],
                    ['categorias funcionais', String(categories)],
                    ['checkout conectado', String(checkoutReady)],
                  ].map(([label, value]) => (
                    <Card key={label} className="border-border/70 bg-white/88">
                      <CardHeader>
                        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                          {label}
                        </p>
                        <CardTitle className="font-mono text-4xl text-gradient-hero">
                          {value}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
            </div>
          </div>
        </section>

        <section id="fluxo" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <Badge className="rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary">
                Como a jornada se abre
              </Badge>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Tudo foi pensado para parecer um fluxo bonito e natural.
              </h2>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-4">
              {steps.map((step) => (
                <Card key={step.id} className="border-border/80 bg-white/90">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-muted-foreground">
                        {step.id}
                      </span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
                        <step.icon className="h-5 w-5" />
                      </span>
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          id="planos"
          className="border-y border-border/70 bg-[linear-gradient(180deg,#ffffff,rgba(249,248,252,0.96))] px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <Badge className="rounded-full border-accent/20 bg-accent/10 px-4 py-1.5 text-accent">
                Catalogo publico sincronizado
              </Badge>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Planos reais do produto com uma vitrine mais linda e organizada.
              </h2>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {plansStatus === 'loading'
                ? Array.from({ length: 3 }).map((_, index) => (
                    <Card
                      key={`plan-skeleton-${index}`}
                      className="border-border/80 bg-white/92"
                    >
                      <CardHeader className="space-y-4">
                        <Skeleton className="h-2 w-full rounded-full" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                      </CardContent>
                    </Card>
                  ))
                : plans.map((plan) => (
                    <Card
                      key={plan.key}
                      className={
                        plan.key === 'meta'
                          ? 'border-primary/30 ring-1 ring-primary/12 bg-white/92'
                          : 'border-border/80 bg-white/92'
                      }
                    >
                      <div
                        className="h-1.5 w-full"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${plan.accentFrom}, ${plan.accentTo})`,
                        }}
                      />
                      <CardHeader>
                        {plan.highlightText ? (
                          <Badge className="w-fit rounded-full border-border bg-white/88 px-3 py-1 text-foreground">
                            {plan.highlightText}
                          </Badge>
                        ) : null}
                        <CardTitle className="text-3xl">{plan.name}</CardTitle>
                        <CardDescription className="text-sm font-medium text-foreground">
                          {plan.tagline}
                        </CardDescription>
                        <p className="text-sm leading-7 text-muted-foreground">
                          {plan.description}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="rounded-[24px] border border-border/70 bg-muted/45 p-5">
                          <p className="font-display text-4xl font-bold text-foreground">
                            {formatCurrency(
                              plan.monthlyPrice,
                              plan.currencyCode
                            )}
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                              /mes
                            </span>
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            anual:{' '}
                            {formatCurrency(
                              plan.annualPrice,
                              plan.currencyCode
                            )}
                          </p>
                        </div>
                        <ul className="space-y-3">
                          {plan.features
                            .filter((feature) => feature.enabled)
                            .slice(0, 4)
                            .map((feature) => (
                              <li
                                key={`${plan.key}-${feature.key}`}
                                className="flex items-start gap-3 text-sm text-foreground"
                              >
                                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/12 text-primary">
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                                <span className="leading-6">
                                  {feature.name}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          variant={
                            plan.key === 'meta' ? 'default' : 'secondary'
                          }
                          onClick={() => router.push('/login')}
                        >
                          Entrar e continuar
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
            </div>

            {plansStatus === 'error' ? (
              <Card className="mt-6 border-destructive/20 bg-destructive/5 shadow-none">
                <CardContent className="px-6 py-5">
                  <p className="text-sm font-medium text-destructive">
                    Falha ao sincronizar o catalogo publico agora.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {plansError}
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </section>

        <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <Badge className="rounded-full border-cosmic/20 bg-cosmic/10 px-4 py-1.5 text-cosmic">
                FAQ
              </Badge>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Perguntas importantes antes de entrar.
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                A ideia aqui e manter a landing bonita, sincera e realmente util
                desde o primeiro contato.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((item, index) => (
                <AccordionItem key={item.question} value={`faq-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] border border-border/80 bg-[linear-gradient(135deg,rgba(49,155,142,0.12),rgba(139,92,246,0.16),rgba(240,101,67,0.12))] p-8 shadow-[0_26px_80px_-42px_rgba(22,21,48,0.32)] sm:p-10 lg:p-12">
            <div className="max-w-3xl">
              <Badge className="rounded-full border-white/70 bg-white/78 px-4 py-1.5 text-foreground">
                Orbita final
              </Badge>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Uma landing mais amiga, linda, organizada e pronta para receber.
              </h2>
              <p className="mt-4 text-base leading-8 text-foreground/80">
                O foco agora e beleza com sentido: mais harmonia, mais contexto
                e uma primeira impressao que abraca em vez de confundir.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="xl" onClick={() => router.push('/login')}>
                  Abrir Lyra agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="xl" variant="secondary" asChild>
                  <a href="#recursos">Explorar a experiencia</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 bg-white/88 px-4 py-10 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-teal text-white shadow-teal">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-lg font-bold lowercase text-gradient-hero">
                lyra
              </p>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                metacare
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Feito com leveza, intencao e tecnologia pela iLyra AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
