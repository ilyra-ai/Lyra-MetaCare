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
import type {
  LandingSectionKey,
  LandingPageConfig,
  ToneKey,
} from '@/lib/site-page-config/schema';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { getBuilderIcon } from '@/lib/site-page-config/ui';
import { cn } from '@/lib/utils';

// Visual "Lyra Clean": fundo suave chapado para o ícone de cada item. O
// violeta fica reservado ao tom astral/IA ("cosmic"); os demais usam o teal
// da marca, o dourado ou o neutro.
function corDoIconeTonal(tone: ToneKey): string {
  switch (tone) {
    case 'cosmic':
      return 'bg-cosmic-light text-cosmic-strong';
    case 'golden':
      return 'bg-golden-light text-golden';
    case 'soft':
      return 'bg-muted text-foreground';
    case 'primary':
    case 'accent':
      return 'bg-sidebar-accent text-sidebar-accent-foreground';
  }
}

// Cor do número de métrica, seguindo a mesma regra de tons.
function corDoNumero(tone: ToneKey): string {
  switch (tone) {
    case 'cosmic':
      return 'text-cosmic-strong';
    case 'golden':
      return 'text-golden';
    case 'soft':
      return 'text-foreground';
    case 'primary':
    case 'accent':
      return 'text-primary';
  }
}

// Rótulo curto acima do título de cada seção (sem caixa alta espaçada).
const rotuloDeSecaoClass = 'text-sm font-medium text-primary';

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
      fontSize: buildFluidFontSize(2.25, 3.25, 4, config.typography.heroTitle),
    } satisfies CSSProperties,
    heroBody: {
      fontSize: buildFluidFontSize(1.0, 1.08, 1.18, config.typography.heroBody),
    } satisfies CSSProperties,
    sectionTitle: {
      fontSize: buildFluidFontSize(
        1.5,
        1.875,
        2.25,
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
        1.0,
        1.125,
        1.25,
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
                <p className={rotuloDeSecaoClass}>
                  {config.features.badgeText}
                </p>
                <h2
                  className="mt-3 font-display font-semibold tracking-[-0.02em] text-foreground"
                  style={textStyles.sectionTitle}
                >
                  {config.features.title}
                </h2>
                <p
                  className="mt-4 leading-relaxed text-muted-foreground"
                  style={textStyles.sectionBody}
                >
                  {config.features.description}
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {config.features.items.map((feature) => {
                  const FeatureIcon = getBuilderIcon(feature.icon);

                  return (
                    <Card key={feature.id} className="min-w-0">
                      <CardHeader>
                        <div
                          className={cn(
                            'mb-2 flex h-11 w-11 items-center justify-center rounded-md',
                            corDoIconeTonal(feature.tone)
                          )}
                        >
                          <FeatureIcon className="h-5 w-5" aria-hidden />
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
          <section className="border-y border-border bg-card px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 max-w-3xl">
                <p className={rotuloDeSecaoClass}>{config.metrics.badgeText}</p>
                <h2
                  className="mt-3 font-display font-semibold tracking-[-0.02em] text-foreground"
                  style={textStyles.sectionTitle}
                >
                  {config.metrics.title}
                </h2>
                <p
                  className="mt-4 leading-relaxed text-muted-foreground"
                  style={textStyles.sectionBody}
                >
                  {config.metrics.description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-6">
                {plansStatus === 'loading'
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <Card
                        key={`metric-skeleton-${index}`}
                        className="bg-background"
                      >
                        <CardContent className="space-y-4 p-6">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-10 w-20" />
                          <Skeleton className="h-4 w-full" />
                        </CardContent>
                      </Card>
                    ))
                  : config.metrics.items.map((item) => (
                      <Card key={item.id} className="min-w-0 bg-background">
                        <CardHeader>
                          <p className="text-sm font-medium text-muted-foreground">
                            {item.label}
                          </p>
                          <CardTitle
                            className={cn(
                              'font-display text-4xl font-semibold',
                              corDoNumero(item.tone)
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
                <p className={rotuloDeSecaoClass}>{config.flow.badgeText}</p>
                <h2
                  className="mt-3 font-display font-semibold tracking-[-0.02em] text-foreground"
                  style={textStyles.sectionTitle}
                >
                  {config.flow.title}
                </h2>
                <p
                  className="mt-4 leading-relaxed text-muted-foreground"
                  style={textStyles.sectionBody}
                >
                  {config.flow.description}
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {config.flow.items.map((step) => {
                  const StepIcon = getBuilderIcon(step.icon);

                  return (
                    <Card key={step.id} className="min-w-0">
                      <CardHeader>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-display text-sm font-semibold text-primary">
                            {step.step}
                          </span>
                          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-muted text-foreground">
                            <StepIcon className="h-5 w-5" aria-hidden />
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
            className="border-y border-border bg-card px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
          >
            <div className="mx-auto max-w-7xl">
              <div className="max-w-3xl">
                <p className={rotuloDeSecaoClass}>{config.plans.badgeText}</p>
                <h2
                  className="mt-3 font-display font-semibold tracking-[-0.02em] text-foreground"
                  style={textStyles.sectionTitle}
                >
                  {config.plans.title}
                </h2>
                <p
                  className="mt-4 leading-relaxed text-muted-foreground"
                  style={textStyles.sectionBody}
                >
                  {config.plans.description}
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {plansStatus === 'loading'
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <Card
                        key={`plan-skeleton-${index}`}
                        className="bg-background"
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
                        className={cn(
                          'flex min-w-0 flex-col overflow-hidden bg-background',
                          plan.key === 'meta' &&
                            'border-primary ring-1 ring-primary'
                        )}
                      >
                        {/* Faixa com a cor de destaque cadastrada no plano
                            (cor chapada, sem gradiente). */}
                        <div
                          aria-hidden="true"
                          className="h-1 w-full"
                          style={{ backgroundColor: plan.accentFrom }}
                        />
                        <CardHeader>
                          {plan.highlightText ? (
                            <Badge className="w-fit">
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
                        <CardContent className="flex-1 space-y-5">
                          <div className="rounded-md border border-border bg-card p-5">
                            <p className="font-display text-4xl font-semibold tracking-tight text-foreground">
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
                                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-primary">
                                    <Check
                                      className="h-3.5 w-3.5"
                                      aria-hidden
                                    />
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
                            <ArrowRight className="h-4 w-4" aria-hidden />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
              </div>

              {plansStatus === 'error' ? (
                <Card className="mt-6 border-destructive/20 bg-destructive-light">
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
              <div className="min-w-0">
                <p className={rotuloDeSecaoClass}>{config.faq.badgeText}</p>
                <h2
                  className="mt-3 font-display font-semibold tracking-[-0.02em] text-foreground"
                  style={textStyles.sectionTitle}
                >
                  {config.faq.title}
                </h2>
                <p
                  className="mt-4 leading-relaxed text-muted-foreground"
                  style={textStyles.sectionBody}
                >
                  {config.faq.description}
                </p>
              </div>

              <Accordion
                type="single"
                collapsible
                className="min-w-0 space-y-3"
              >
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
            <div className="mx-auto max-w-7xl rounded-xl border border-border bg-card p-6 sm:p-10 lg:p-12">
              <div className="max-w-3xl">
                <p className={rotuloDeSecaoClass}>
                  {config.finalCta.badgeText}
                </p>
                <h2
                  className="mt-3 font-display font-semibold tracking-[-0.02em] text-foreground"
                  style={textStyles.sectionTitle}
                >
                  {config.finalCta.title}
                </h2>
                <p
                  className="mt-4 leading-relaxed text-foreground/80"
                  style={textStyles.sectionBody}
                >
                  {config.finalCta.description}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="xl"
                    className="h-auto min-h-12 whitespace-normal py-3 text-center"
                    style={textStyles.buttonLabel}
                    onClick={() => navigateTo(config.finalCta.primaryHref)}
                  >
                    {config.finalCta.primaryLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button
                    size="xl"
                    variant="secondary"
                    className="h-auto min-h-12 whitespace-normal py-3 text-center"
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => {
              if (previewMode) {
                return;
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex min-w-0 items-center gap-2.5 rounded-[10px] px-1 py-1 text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground"
              aria-hidden="true"
            >
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-xl font-semibold lowercase leading-tight tracking-tight text-foreground">
                lyra{' '}
              </span>
              <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                astrologia + IA
              </span>
              <span className="sr-only">: voltar ao topo</span>
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

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
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

      <main id={previewMode ? undefined : 'conteudo-principal'}>
        <section className="px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:items-start lg:gap-12">
            <div className="min-w-0">
              <Badge className="max-w-full px-3 py-1 text-sm">
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="min-w-0">{config.hero.badgeText}</span>
              </Badge>

              <h1
                className="mt-6 max-w-4xl break-words font-display font-semibold leading-[1.08] tracking-[-0.03em] text-foreground"
                style={textStyles.heroTitle}
              >
                {config.hero.title}
                <span className="block text-primary">
                  {config.hero.accentTitle}
                </span>
              </h1>

              <p
                className="mt-6 max-w-2xl leading-relaxed text-muted-foreground"
                style={textStyles.heroBody}
              >
                {config.hero.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="xl"
                  className="h-auto min-h-12 whitespace-normal py-3 text-center"
                  style={textStyles.buttonLabel}
                  onClick={() => navigateTo(config.hero.primaryCtaHref)}
                >
                  {config.hero.primaryCtaLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
                <Button
                  size="xl"
                  variant="secondary"
                  className="h-auto min-h-12 whitespace-normal py-3 text-center"
                  style={textStyles.buttonLabel}
                  onClick={() => navigateTo(config.hero.secondaryCtaHref)}
                >
                  {config.hero.secondaryCtaLabel}
                </Button>
              </div>
            </div>

            <div className="grid min-w-0 gap-4">
              <Card>
                <CardHeader>
                  <Badge variant="cosmic" className="w-fit">
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
                          className="pr-11"
                          disabled={previewMode}
                        />
                        <button
                          type="button"
                          aria-label={
                            showPassword ? 'Ocultar senha' : 'Mostrar senha'
                          }
                          onClick={() => setShowPassword((current) => !current)}
                          disabled={previewMode}
                          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-[10px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                        >
                          {showPassword ? (
                            <EyeOff className="h-[18px] w-[18px]" aria-hidden />
                          ) : (
                            <Eye className="h-[18px] w-[18px]" aria-hidden />
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
                        <ArrowRight className="h-4 w-4" aria-hidden />
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

              <Card>
                <CardHeader>
                  <Badge variant="outline" className="w-fit">
                    {config.hero.previewBadge}
                  </Badge>
                  <CardTitle style={textStyles.cardTitle}>
                    {config.hero.previewTitle}
                  </CardTitle>
                  <CardDescription style={textStyles.cardBody}>
                    {config.hero.previewDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 px-6 pb-6 sm:grid-cols-3">
                  {config.hero.previewItems.map((item) => {
                    const ItemIcon = getBuilderIcon(item.icon);

                    return (
                      <div
                        key={item.id}
                        className="min-w-0 rounded-md border border-border bg-background p-4"
                      >
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-md',
                            corDoIconeTonal(item.tone)
                          )}
                        >
                          <ItemIcon className="h-[18px] w-[18px]" aria-hidden />
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

      <footer className="border-t border-border bg-card px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground"
              aria-hidden="true"
            >
              <Sparkles className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold lowercase tracking-tight text-foreground">
                {config.footer.brandLine}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                landing editavel
              </p>
            </div>
          </div>
          <p
            className="min-w-0 leading-relaxed text-muted-foreground md:max-w-xl"
            style={textStyles.cardBody}
          >
            {config.footer.note}
          </p>
        </div>
      </footer>
    </div>
  );
}
