'use client';

import { CSSProperties, SubmitEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Eye, EyeOff, Sparkles } from 'lucide-react';
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
import {
  LandingSectionKey,
  LandingPageConfig,
} from '@/lib/site-page-config/schema';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import {
  getBuilderIcon,
  getToneNumberClass,
  getToneSurfaceClass,
} from '@/lib/site-page-config/ui';
import { cn } from '@/lib/utils';

type PublicPlansPayload = {
  plans: PlanMatrixPlan[];
  error?: string;
};

type LandingPageProps = {
  overrideConfig?: LandingPageConfig;
  previewMode?: boolean;
};

function formatCurrency(value: number, currencyCode: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currencyCode || 'BRL',
  }).format(value);
}

function buildFluidFontSize(
  minRem: number,
  preferredRem: number,
  maxRem: number,
  scale: number
) {
  return `clamp(${(minRem * scale).toFixed(3)}rem, ${(preferredRem * scale).toFixed(3)}rem, ${(maxRem * scale).toFixed(3)}rem)`;
}

export function LandingPage({
  overrideConfig,
  previewMode = false,
}: LandingPageProps) {
  const router = useRouter();
  const { db } = useAuth();
  // Configuração publicada (carregada pelo hook compartilhado) ou o rascunho
  // em edição no Site Experience Builder (pré-visualização).
  const { config: publicConfig } = usePublicSitePageConfig('landing');
  const config: LandingPageConfig = overrideConfig ?? publicConfig;
  const [plans, setPlans] = useState<PlanMatrixPlan[]>([]);
  const [plansStatus, setPlansStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [plansError, setPlansError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const textStyles = {
    heroTitle: {
      fontSize: buildFluidFontSize(2.9, 4.3, 6.2, config.typography.heroTitle),
    } satisfies CSSProperties,
    heroBody: {
      fontSize: buildFluidFontSize(1.0, 1.08, 1.18, config.typography.heroBody),
    } satisfies CSSProperties,
    sectionTitle: {
      fontSize: buildFluidFontSize(
        1.85,
        2.35,
        3.1,
        config.typography.sectionTitle
      ),
    } satisfies CSSProperties,
    sectionBody: {
      fontSize: buildFluidFontSize(
        1,
        1.04,
        1.12,
        config.typography.sectionBody
      ),
    } satisfies CSSProperties,
    cardTitle: {
      fontSize: buildFluidFontSize(
        1.05,
        1.2,
        1.45,
        config.typography.cardTitle
      ),
    } satisfies CSSProperties,
    cardBody: {
      fontSize: buildFluidFontSize(
        0.92,
        0.98,
        1.05,
        config.typography.cardBody
      ),
    } satisfies CSSProperties,
    buttonLabel: {
      fontSize: buildFluidFontSize(
        0.92,
        0.98,
        1.04,
        config.typography.buttonLabel
      ),
    } satisfies CSSProperties,
  };

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

  function resolveMetricValue(source: string, customValue: string) {
    if (source === 'planCount') return String(plans.length);
    if (source === 'featureCount') return String(enabledCapabilities);
    if (source === 'categoryCount') return String(categories);
    if (source === 'checkoutCount') return String(checkoutReady);
    return customValue;
  }

  function navigateTo(href: string) {
    if (previewMode) {
      return;
    }

    if (href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    router.push(href);
  }

  async function handleQuickLogin(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (previewMode) {
      return;
    }
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

  function renderSection(sectionKey: LandingSectionKey) {
    switch (sectionKey) {
      case 'features':
        if (!config.features.visible) {
          return null;
        }

        return (
          <section
            id="recursos"
            className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
          >
            <div className="mx-auto max-w-7xl">
              <div className="max-w-3xl">
                <Badge className="rounded-full border-cosmic/20 bg-cosmic/10 px-4 py-1.5 text-cosmic">
                  {config.features.badgeText}
                </Badge>
                <h2
                  className="mt-5 font-display font-bold tracking-tight text-foreground"
                  style={textStyles.sectionTitle}
                >
                  {config.features.title}
                </h2>
                <p
                  className="mt-4 leading-8 text-muted-foreground"
                  style={textStyles.sectionBody}
                >
                  {config.features.description}
                </p>
              </div>

              <div className="mt-10 grid gap-5 lg:grid-cols-3">
                {config.features.items.map((feature) => {
                  const FeatureIcon = getBuilderIcon(feature.icon);

                  return (
                    <Card
                      key={feature.id}
                      className="border-border/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))]"
                    >
                      <CardHeader>
                        <div
                          className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br shadow-sm',
                            getToneSurfaceClass(feature.tone)
                          )}
                        >
                          <FeatureIcon className="h-5 w-5" />
                        </div>
                        <CardTitle style={textStyles.cardTitle}>
                          {feature.title}
                        </CardTitle>
                        <CardDescription style={textStyles.cardBody}>
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        );
      case 'metrics':
        if (!config.metrics.visible) {
          return null;
        }

        return (
          <section className="border-y border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,247,255,0.96))] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 max-w-3xl">
                <Badge className="rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary">
                  {config.metrics.badgeText}
                </Badge>
                <h2
                  className="mt-5 font-display font-bold tracking-tight text-foreground"
                  style={textStyles.sectionTitle}
                >
                  {config.metrics.title}
                </h2>
                <p
                  className="mt-4 leading-8 text-muted-foreground"
                  style={textStyles.sectionBody}
                >
                  {config.metrics.description}
                </p>
              </div>

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
                  : config.metrics.items.map((item) => (
                      <Card
                        key={item.id}
                        className="border-border/70 bg-white/88"
                      >
                        <CardHeader>
                          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                            {item.label}
                          </p>
                          <CardTitle
                            className={cn(
                              'font-mono text-4xl',
                              getToneNumberClass(item.tone)
                            )}
                          >
                            {resolveMetricValue(item.source, item.customValue)}
                          </CardTitle>
                          <CardDescription style={textStyles.cardBody}>
                            {item.note}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
              </div>
            </div>
          </section>
        );
      case 'flow':
        if (!config.flow.visible) {
          return null;
        }

        return (
          <section id="fluxo" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-7xl">
              <div className="max-w-3xl">
                <Badge className="rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary">
                  {config.flow.badgeText}
                </Badge>
                <h2
                  className="mt-5 font-display font-bold tracking-tight text-foreground"
                  style={textStyles.sectionTitle}
                >
                  {config.flow.title}
                </h2>
                <p
                  className="mt-4 leading-8 text-muted-foreground"
                  style={textStyles.sectionBody}
                >
                  {config.flow.description}
                </p>
              </div>

              <div className="mt-10 grid gap-5 lg:grid-cols-3">
                {config.flow.items.map((step) => {
                  const StepIcon = getBuilderIcon(step.icon);

                  return (
                    <Card
                      key={step.id}
                      className="border-border/80 bg-white/90"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-semibold text-muted-foreground">
                            {step.step}
                          </span>
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
                            <StepIcon className="h-5 w-5" />
                          </span>
                        </div>
                        <CardTitle style={textStyles.cardTitle}>
                          {step.title}
                        </CardTitle>
                        <CardDescription style={textStyles.cardBody}>
                          {step.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        );
      case 'plans':
        if (!config.plans.visible) {
          return null;
        }

        return (
          <section
            id="planos"
            className="border-y border-border/70 bg-[linear-gradient(180deg,#ffffff,rgba(249,248,252,0.96))] px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
          >
            <div className="mx-auto max-w-7xl">
              <div className="max-w-3xl">
                <Badge className="rounded-full border-accent/20 bg-accent/10 px-4 py-1.5 text-accent">
                  {config.plans.badgeText}
                </Badge>
                <h2
                  className="mt-5 font-display font-bold tracking-tight text-foreground"
                  style={textStyles.sectionTitle}
                >
                  {config.plans.title}
                </h2>
                <p
                  className="mt-4 leading-8 text-muted-foreground"
                  style={textStyles.sectionBody}
                >
                  {config.plans.description}
                </p>
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
                          <CardTitle style={textStyles.cardTitle}>
                            {plan.name}
                          </CardTitle>
                          <CardDescription className="text-sm font-medium text-foreground">
                            {plan.tagline}
                          </CardDescription>
                          <p
                            className="leading-7 text-muted-foreground"
                            style={textStyles.cardBody}
                          >
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
                            style={textStyles.buttonLabel}
                            variant={
                              plan.key === 'meta' ? 'default' : 'secondary'
                            }
                            onClick={() =>
                              navigateTo(config.hero.primaryCtaHref)
                            }
                            disabled={previewMode}
                          >
                            {config.plans.ctaLabel}
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
        );
      case 'faq':
        if (!config.faq.visible) {
          return null;
        }

        return (
          <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr]">
              <div>
                <Badge className="rounded-full border-cosmic/20 bg-cosmic/10 px-4 py-1.5 text-cosmic">
                  {config.faq.badgeText}
                </Badge>
                <h2
                  className="mt-5 font-display font-bold tracking-tight text-foreground"
                  style={textStyles.sectionTitle}
                >
                  {config.faq.title}
                </h2>
                <p
                  className="mt-4 leading-8 text-muted-foreground"
                  style={textStyles.sectionBody}
                >
                  {config.faq.description}
                </p>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {config.faq.items.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        );
      case 'finalCta':
        if (!config.finalCta.visible) {
          return null;
        }

        return (
          <section className="px-4 pb-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] border border-border/80 bg-[linear-gradient(135deg,rgba(49,155,142,0.12),rgba(139,92,246,0.16),rgba(240,101,67,0.12))] p-8 shadow-[0_26px_80px_-42px_rgba(22,21,48,0.32)] sm:p-10 lg:p-12">
              <div className="max-w-3xl">
                <Badge className="rounded-full border-white/70 bg-white/78 px-4 py-1.5 text-foreground">
                  {config.finalCta.badgeText}
                </Badge>
                <h2
                  className="mt-5 font-display font-bold tracking-tight text-foreground"
                  style={textStyles.sectionTitle}
                >
                  {config.finalCta.title}
                </h2>
                <p
                  className="mt-4 leading-8 text-foreground/80"
                  style={textStyles.sectionBody}
                >
                  {config.finalCta.description}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="xl"
                    style={textStyles.buttonLabel}
                    onClick={() => navigateTo(config.finalCta.primaryHref)}
                  >
                    {config.finalCta.primaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="xl"
                    variant="secondary"
                    style={textStyles.buttonLabel}
                    onClick={() => navigateTo(config.finalCta.secondaryHref)}
                  >
                    {config.finalCta.secondaryLabel}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        );
      default:
        return null;
    }
  }

  const orderedSections = Array.from(
    new Set<LandingSectionKey>([
      ...config.sectionOrder,
      'features',
      'metrics',
      'flow',
      'plans',
      'faq',
      'finalCta',
    ])
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background)),#ffffff_42%,#fbfbff_100%)] text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => {
              if (previewMode) {
                return;
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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
            <Button
              variant="ghost"
              style={textStyles.buttonLabel}
              onClick={() => navigateTo('#recursos')}
            >
              Recursos
            </Button>
            <Button
              variant="ghost"
              style={textStyles.buttonLabel}
              onClick={() => navigateTo('#fluxo')}
            >
              Fluxo
            </Button>
            <Button
              variant="ghost"
              style={textStyles.buttonLabel}
              onClick={() => navigateTo('#planos')}
            >
              Planos
            </Button>
            <Button
              variant="ghost"
              style={textStyles.buttonLabel}
              onClick={() => navigateTo('#faq')}
            >
              FAQ
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              style={textStyles.buttonLabel}
              onClick={() => navigateTo(config.hero.primaryCtaHref)}
            >
              {config.header.loginLabel}
            </Button>
            <Button
              style={textStyles.buttonLabel}
              onClick={() => navigateTo(config.hero.primaryCtaHref)}
            >
              {config.header.fullLoginLabel}
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-18 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
          <div className="pointer-events-none absolute inset-0">
            <div className="orchestrated-orb -left-32 -top-8 h-80 w-80 bg-primary/16" />
            <div className="orchestrated-orb -right-20 top-16 h-80 w-80 bg-cosmic/16" />
            <div className="orchestrated-orb -bottom-20 left-1/3 h-72 w-72 bg-accent/10" />
          </div>

          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-start">
            <div className="relative z-10">
              <Badge className="rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary shadow-sm">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                {config.hero.badgeText}
              </Badge>

              <h1
                className="mt-6 max-w-4xl font-display font-bold leading-[1.02] tracking-tight text-foreground"
                style={textStyles.heroTitle}
              >
                {config.hero.title}
                <span className="block text-gradient-aurora">
                  {config.hero.accentTitle}
                </span>
              </h1>

              <p
                className="mt-6 max-w-2xl leading-8 text-muted-foreground"
                style={textStyles.heroBody}
              >
                {config.hero.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="xl"
                  style={textStyles.buttonLabel}
                  onClick={() => navigateTo(config.hero.primaryCtaHref)}
                >
                  {config.hero.primaryCtaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="xl"
                  variant="secondary"
                  style={textStyles.buttonLabel}
                  onClick={() => navigateTo(config.hero.secondaryCtaHref)}
                >
                  {config.hero.secondaryCtaLabel}
                </Button>
              </div>
            </div>

            <div className="relative z-10 grid gap-4">
              <Card className="glass-card border-white/80 bg-white/76">
                <CardHeader>
                  <Badge className="w-fit rounded-full border-cosmic/20 bg-cosmic/10 px-3 py-1 text-cosmic">
                    {config.hero.quickAuthBadge}
                  </Badge>
                  <CardTitle style={textStyles.cardTitle}>
                    {config.hero.quickAuthTitle}
                  </CardTitle>
                  <CardDescription style={textStyles.cardBody}>
                    {config.hero.quickAuthDescription}
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
                        disabled={previewMode}
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
                          disabled={previewMode}
                        />
                        <button
                          type="button"
                          aria-label={
                            showPassword ? 'Ocultar senha' : 'Mostrar senha'
                          }
                          onClick={() => setShowPassword((current) => !current)}
                          disabled={previewMode}
                          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
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
                        style={textStyles.buttonLabel}
                        disabled={
                          previewMode ||
                          submitting ||
                          email.trim().length === 0 ||
                          password.trim().length === 0
                        }
                      >
                        {submitting
                          ? 'Entrando...'
                          : config.hero.quickAuthSubmitLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="flex-1"
                        style={textStyles.buttonLabel}
                        onClick={() => navigateTo(config.hero.primaryCtaHref)}
                        disabled={previewMode}
                      >
                        {config.hero.quickAuthSecondaryLabel}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-border/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,255,255,0.78))]">
                <CardHeader>
                  <Badge className="w-fit rounded-full border-border bg-white/85 px-3 py-1 text-foreground">
                    {config.hero.previewBadge}
                  </Badge>
                  <CardTitle style={textStyles.cardTitle}>
                    {config.hero.previewTitle}
                  </CardTitle>
                  <CardDescription style={textStyles.cardBody}>
                    {config.hero.previewDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 px-6 py-6 sm:grid-cols-3">
                  {config.hero.previewItems.map((item) => {
                    const ItemIcon = getBuilderIcon(item.icon);

                    return (
                      <div
                        key={item.id}
                        className="rounded-[24px] border border-border/70 bg-white/82 p-4 shadow-sm"
                      >
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br shadow-sm',
                            getToneSurfaceClass(item.tone)
                          )}
                        >
                          <ItemIcon className="h-4.5 w-4.5" />
                        </div>
                        <p
                          className="mt-4 font-display font-semibold text-foreground"
                          style={textStyles.cardTitle}
                        >
                          {item.title}
                        </p>
                        <p
                          className="mt-2 leading-6 text-muted-foreground"
                          style={textStyles.cardBody}
                        >
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {orderedSections.map((sectionKey) => (
          <div key={sectionKey}>{renderSection(sectionKey)}</div>
        ))}
      </main>

      <footer className="border-t border-border/70 bg-white/88 px-4 py-10 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-teal text-white shadow-teal">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-lg font-bold lowercase text-gradient-hero">
                {config.footer.brandLine}
              </p>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                landing editavel
              </p>
            </div>
          </div>
          <p className="text-muted-foreground" style={textStyles.cardBody}>
            {config.footer.note}
          </p>
        </div>
      </footer>
    </div>
  );
}
