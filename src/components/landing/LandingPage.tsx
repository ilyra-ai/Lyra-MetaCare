'use client';

import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  Brain,
  Calendar,
  Check,
  ChevronRight,
  Globe,
  HeartPulse,
  Sparkles,
  Star,
  Target,
  Zap,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/* ================================================================
   DATA
   ================================================================ */

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
};

const features: Feature[] = [
  {
    icon: Activity,
    title: 'Métricas Vitais em Tempo Real',
    description:
      'HRV, frequência cardíaca, qualidade de sono e mais — sincronizados em tempo real com seus dispositivos wearable.',
    gradient: 'from-primary/10 to-primary/5',
    iconBg: 'bg-gradient-teal text-white',
  },
  {
    icon: Globe,
    title: 'Mapa Astral Personalizado',
    description:
      'Trânsitos planetários, ciclos lunares e insights astrológicos védicos conectados à sua saúde e bem-estar.',
    gradient: 'from-cosmic/10 to-cosmic/5',
    iconBg: 'bg-gradient-cosmic text-white',
  },
  {
    icon: Brain,
    title: 'IA Assistente Privada',
    description:
      'Assistente de IA que compreende seu contexto holístico — dados de saúde, mapa astral e objetivos pessoais.',
    gradient: 'from-accent/10 to-accent/5',
    iconBg: 'bg-gradient-coral text-white',
  },
  {
    icon: Target,
    title: 'Planos de Longevidade Inteligentes',
    description:
      'Planos personalizados de bem-estar gerados por IA, com metas acionáveis e acompanhamento contínuo.',
    gradient: 'from-info/10 to-info/5',
    iconBg: 'bg-info text-white',
  },
  {
    icon: Calendar,
    title: 'Agendamento de Consultas Premium',
    description:
      'Agende consultas com profissionais de saúde holística, visualize disponibilidade e gerencie sua agenda.',
    gradient: 'from-primary/10 to-primary/5',
    iconBg: 'bg-gradient-teal text-white',
  },
  {
    icon: HeartPulse,
    title: 'Rastreio de Metas de Saúde',
    description:
      'Defina e acompanhe metas de saúde com indicadores visuais de progresso e recomendações da IA.',
    gradient: 'from-accent/10 to-accent/5',
    iconBg: 'bg-gradient-coral text-white',
  },
];

type Step = {
  number: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: '01',
    title: 'Conecte',
    description:
      'Vincule seus dispositivos wearable e preencha seu perfil astral para uma experiência personalizada.',
  },
  {
    number: '02',
    title: 'Sincronize',
    description:
      'Seus dados de saúde e insights astrológicos se integram automaticamente para uma visão holística.',
  },
  {
    number: '03',
    title: 'Evolua',
    description:
      'Receba planos de IA personalizados, acompanhe metas e agende consultas para otimizar seu bem-estar.',
  },
];

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  cta: string;
  variant: 'outline' | 'default' | 'secondary';
};

const plans: Plan[] = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    description: 'Comece sua jornada de bem-estar com recursos essenciais.',
    features: [
      'Dashboard básico com métricas',
      'Chat IA limitado (10 msgs/dia)',
      'Mapa astral simplificado',
      'Rastreio de 2 metas',
    ],
    popular: false,
    cta: 'Comece Grátis',
    variant: 'outline',
  },
  {
    name: 'Estelar',
    price: 'R$ 29,90',
    period: '/mês',
    description: 'Para quem busca uma experiência completa de bem-estar.',
    features: [
      'Tudo do plano Gratuito',
      'Chat IA ilimitado',
      'Mapa astral completo + trânsitos',
      'Plano de longevidade IA',
      'Agendamento de consultas',
      'Monitoramento em tempo real',
      'Metas ilimitadas',
    ],
    popular: true,
    cta: 'Assinar Estelar',
    variant: 'default',
  },
  {
    name: 'Cósmico',
    price: 'R$ 59,90',
    period: '/mês',
    description: 'O máximo em wellness premium com suporte prioritário.',
    features: [
      'Tudo do plano Estelar',
      'IA com modelo avançado',
      'Relatórios de saúde detalhados',
      'Consultas com desconto',
      'Suporte prioritário 24/7',
      'Acesso antecipado a features',
      'API de dados pessoais',
    ],
    popular: false,
    cta: 'Assinar Cósmico',
    variant: 'outline',
  },
];

type Testimonial = {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    name: 'Mariana Costa',
    role: 'Praticante de Yoga',
    text: 'A Lyra transformou minha rotina de saúde. A combinação de dados reais com insights astrológicos me dá uma visão única do meu bem-estar.',
    rating: 5,
    avatar: 'MC',
  },
  {
    name: 'Rafael Mendes',
    role: 'Empresário',
    text: 'A IA da Lyra é impressionante. Ela realmente entende meu contexto e cria planos que fazem sentido para minha vida corrida.',
    rating: 5,
    avatar: 'RM',
  },
  {
    name: 'Ana Beatriz Silva',
    role: 'Nutricionista',
    text: 'Como profissional de saúde, aprecio a seriedade com que a Lyra trata os dados. A plataforma é sofisticada e confiável.',
    rating: 5,
    avatar: 'AS',
  },
];

/* ================================================================
   COMPONENT
   ================================================================ */

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ---- NAV ---- */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gradient-teal rounded-lg shadow-teal">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-display font-bold text-gradient-hero">
              lyra
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Button variant="ghost" asChild className="rounded-full text-sm">
              <a href="#features">Recursos</a>
            </Button>
            <Button variant="ghost" asChild className="rounded-full text-sm">
              <a href="#how-it-works">Como Funciona</a>
            </Button>
            <Button variant="ghost" asChild className="rounded-full text-sm">
              <a href="#pricing">Planos</a>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="rounded-full text-sm"
              onClick={() => router.push('/login')}
            >
              Entrar
            </Button>
            <Button
              className="rounded-full bg-gradient-teal text-white shadow-teal hover:shadow-md text-sm"
              onClick={() => router.push('/login')}
            >
              Comece Agora
            </Button>
          </div>
        </div>
      </nav>

      <main>
        {/* ---- HERO ---- */}
        <section className="relative overflow-hidden">
          {/* Decorative orbs */}
          <div className="cosmic-orb w-96 h-96 bg-primary/15 -top-32 -left-32" />
          <div className="cosmic-orb w-80 h-80 bg-accent/15 -top-20 right-0" />
          <div className="cosmic-orb w-64 h-64 bg-cosmic/15 top-1/2 left-1/3" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-6 rounded-full border-primary/20 bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Wellness Premium com Inteligência Artificial
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight">
                <span className="text-foreground">Seu Bem-Estar</span>
                <br />
                <span className="text-gradient-hero">Orquestrado</span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Onde a Sabedoria Ancestral Encontra a Inteligência Artificial.
                Métricas vitais, astrologia védica e IA em uma plataforma única
                de bem-estar holístico.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="rounded-full bg-gradient-teal text-white shadow-teal hover:shadow-md h-12 px-8 text-base"
                  onClick={() => router.push('/login')}
                >
                  Comece Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-12 px-8 text-base border-border"
                  asChild
                >
                  <a href="#features">
                    Saiba Mais
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </div>

              {/* Hero signals */}
              <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm border border-border">
                  <HeartPulse className="h-4 w-4 text-primary" />
                  Métricas em tempo real
                </div>
                <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm border border-border">
                  <Globe className="h-4 w-4 text-cosmic" />
                  Astrologia Védica
                </div>
                <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm border border-border">
                  <Zap className="h-4 w-4 text-accent" />
                  IA Personalizada
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---- FEATURES (Bento Grid) ---- */}
        <section
          id="features"
          className="py-20 sm:py-28 border-t border-border"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 rounded-full border-cosmic/20 bg-cosmic/10 text-cosmic px-4 py-1.5">
                Recursos
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                Tudo que você precisa para uma vida mais consciente
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Uma plataforma completa que integra saúde, consciência e
                tecnologia de ponta.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border border-border bg-card p-6 shadow hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                >
                  <div
                    className={`inline-flex p-3 rounded-xl ${feature.iconBg} mb-4 shadow-sm`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- HOW IT WORKS ---- */}
        <section
          id="how-it-works"
          className="py-20 sm:py-28 bg-gradient-aurora"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 rounded-full border-primary/20 bg-primary/10 text-primary px-4 py-1.5">
                Como Funciona
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                Três passos para transformar sua saúde
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Uma jornada simples e poderosa rumo ao seu melhor estado de
                bem-estar.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border shadow-sm mb-5">
                    <span className="text-2xl font-display font-bold text-gradient-hero">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- PRICING ---- */}
        <section id="pricing" className="py-20 sm:py-28 border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 rounded-full border-golden/20 bg-golden/10 text-golden px-4 py-1.5">
                <Star className="mr-1.5 h-3.5 w-3.5" />
                Planos
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                Escolha o plano ideal para você
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Comece gratuitamente e evolua quando estiver pronto.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border bg-card p-6 shadow transition-all duration-200 hover:shadow-md ${
                    plan.popular
                      ? 'border-primary shadow-teal scale-[1.02]'
                      : 'border-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="rounded-full bg-gradient-teal text-white border-0 px-4 py-1 shadow-teal">
                        Mais Popular
                      </Badge>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-display font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <div className="mt-3 flex items-baseline">
                      <span className="text-4xl font-display font-bold text-foreground tabular-nums">
                        {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">
                        {plan.period}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full rounded-xl h-11 ${
                      plan.popular
                        ? 'bg-gradient-teal text-white shadow-teal hover:shadow-md'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : plan.variant}
                    onClick={() => router.push('/login')}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- TESTIMONIALS ---- */}
        <section className="py-20 sm:py-28 bg-gradient-aurora">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 rounded-full border-accent/20 bg-accent/10 text-accent px-4 py-1.5">
                Depoimentos
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                O que nossos usuários dizem
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-border bg-card p-6 shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-golden text-golden"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-teal flex items-center justify-center text-white text-sm font-semibold">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- CTA FINAL ---- */}
        <section className="py-20 sm:py-28 border-t border-border">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
              Comece Sua Jornada Cósmica Hoje
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Junte-se a milhares de pessoas que já transformaram sua relação
              com a saúde e o autoconhecimento.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Button
                size="lg"
                className="flex-1 rounded-full bg-gradient-coral text-white shadow-coral hover:shadow-md h-12 text-base"
                onClick={() => router.push('/login')}
              >
                Quero Começar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ---- FOOTER ---- */}
      <footer className="border-t border-border bg-card py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-teal rounded-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-display font-bold text-gradient-hero">
                lyra
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a
                href="#features"
                className="hover:text-foreground transition-colors"
              >
                Recursos
              </a>
              <a
                href="#pricing"
                className="hover:text-foreground transition-colors"
              >
                Planos
              </a>
              <a
                href="#how-it-works"
                className="hover:text-foreground transition-colors"
              >
                Como Funciona
              </a>
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              Feito com
              <Sparkles className="h-3 w-3 text-golden" />
              por iLyra AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
