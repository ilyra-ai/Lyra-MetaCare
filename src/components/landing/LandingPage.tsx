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

// Mapeamento dinâmico de ícones para não estourar ao serializar JSON
const ICONS: Record<string, any> = {
  Brain,
  MoonStar,
  HeartPulse,
  Calendar,
  Sparkles,
  Bot,
  Star,
  Zap,
};

type FeatureItem = {
  icon: string;
  title: string;
  description: string;
  tone: string;
};

type FlowItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type LandingDataConfig = {
  hero?: {
    title: string;
    subtitle: string;
  };
  features?: {
    visible: boolean;
    items: FeatureItem[];
  };
  flow?: {
    visible: boolean;
    items: FlowItem[];
  };
  plans?: {
    visible: boolean;
  };
  faq?: {
    visible: boolean;
    items: FaqItem[];
  };
};

type PublicPlansPayload = {
  plans: PlanMatrixPlan[];
  error?: string;
};

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

  const [uiConfig, setUiConfig] = useState<LandingDataConfig | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/public/ui-config');
        const data = await res.json();
        if (data.config && data.config.landing) {
          setUiConfig(data.config.landing);
        }
      } catch (err) {
        console.error('Falha ao obter config', err);
      }
    }
    void fetchConfig();
  }, []);

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

  // Fallbacks para caso o JSON ainda não tenha carregado
  const heroTitle = uiConfig?.hero?.title || 'Carregando interface...';
  const heroSubtitle = uiConfig?.hero?.subtitle || '...';

  const showFeatures = uiConfig?.features?.visible !== false;
  const featuresItems = uiConfig?.features?.items || [];

  const showFlow = uiConfig?.flow?.visible !== false;
  const flowItems = uiConfig?.flow?.items || [];

  const showPlans = uiConfig?.plans?.visible !== false;

  const showFaq = uiConfig?.faq?.visible !== false;
  const faqItems = uiConfig?.faq?.items || [];

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
            {showFeatures && (
              <Button variant="ghost" asChild>
                <a href="#recursos">Recursos</a>
              </Button>
            )}
            {showFlow && (
              <Button variant="ghost" asChild>
                <a href="#fluxo">Fluxo</a>
              </Button>
            )}
            {showPlans && (
              <Button variant="ghost" asChild>
                <a href="#planos">Planos</a>
              </Button>
            )}
            {showFaq && (
              <Button variant="ghost" asChild>
                <a href="#faq">FAQ</a>
              </Button>
            )}
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
                {heroTitle}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg whitespace-pre-line">
                {heroSubtitle}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="xl" onClick={() => router.push('/login')}>
                  Entrar na experiencia completa
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {showPlans && (
                  <Button size="xl" variant="secondary" asChild>
                    <a href="#planos">Ver catalogo publicado</a>
                  </Button>
                )}
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
            </div>
          </div>
        </section>

        {showFeatures && featuresItems.length > 0 && (
          <section
            id="recursos"
            className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
          >
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
                {featuresItems.map((feature, i) => {
                  const Icon = ICONS[feature.icon] || Sparkles;
                  return (
                    <Card
                      key={`feature-${i}`}
                      className="border-border/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))]"
                    >
                      <CardHeader>
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.tone} text-foreground shadow-sm`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl">
                          {feature.title}
                        </CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {showFeatures && (
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
                      <Card
                        key={label}
                        className="border-border/70 bg-white/88"
                      >
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
        )}

        {showFlow && flowItems.length > 0 && (
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
                {flowItems.map((step) => {
                  const Icon = ICONS[step.icon] || Sparkles;
                  return (
                    <Card
                      key={step.id}
                      className="border-border/80 bg-white/90"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-semibold text-muted-foreground">
                            {step.id}
                          </span>
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
                            <Icon className="h-5 w-5" />
                          </span>
                        </div>
                        <CardTitle className="text-xl">{step.title}</CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {showPlans && (
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
                  Planos reais do produto com uma vitrine mais linda e
                  organizada.
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
                          <CardTitle className="text-3xl">
                            {plan.name}
                          </CardTitle>
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
        )}

        {showFaq && faqItems.length > 0 && (
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
                  A ideia aqui e manter a landing bonita, sincera e realmente
                  util desde o primeiro contato.
                </p>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {faqItems.map((item, index) => (
                  <AccordionItem key={item.question} value={`faq-${index}`}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}

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
                {showFeatures && (
                  <Button size="xl" variant="secondary" asChild>
                    <a href="#recursos">Explorar a experiencia</a>
                  </Button>
                )}
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
