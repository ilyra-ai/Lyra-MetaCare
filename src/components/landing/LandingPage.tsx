'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  ChevronRight,
  CreditCard,
  HeartPulse,
  LockKeyhole,
  Menu,
  Moon,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  Target,
  TrendingUp,
  Watch,
  Waves,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type NavSection = { id: string; label: string };
type SurfaceCard = {
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  span?: string;
  pills?: string[];
  featured?: boolean;
  items?: string[];
};

const sections: NavSection[] = [
  { id: 'visao-geral', label: 'Visão geral' },
  { id: 'jornada', label: 'Jornada' },
  { id: 'modulos', label: 'Módulos' },
  { id: 'planos', label: 'Planos' },
  { id: 'seguranca', label: 'Segurança' },
];

const highlights: SurfaceCard[] = [
  {
    label: 'Perfil vivo',
    title: 'Conta, hábitos e contexto',
    description:
      'A experiência acolhe a pessoa primeiro e organiza o cuidado desde o primeiro acesso.',
    icon: HeartPulse,
  },
  {
    label: 'Monitoramento',
    title: 'Wearables, métricas e rotina',
    description:
      'Dados entram como continuidade da jornada, com leitura limpa e sem excesso visual.',
    icon: Watch,
  },
  {
    label: 'Governança',
    title: 'Planos, quota e billing real',
    description:
      'A camada comercial aparece com clareza e maturidade, sem parecer um apêndice.',
    icon: CreditCard,
  },
];

const journey: SurfaceCard[] = [
  {
    label: 'Etapa 01',
    title: 'Comece pelo que importa',
    description:
      'Perfil, metas, hábitos e contexto formam uma base viva para personalizar o cuidado.',
    icon: HeartPulse,
  },
  {
    label: 'Etapa 02',
    title: 'Conecte sinais e rotina',
    description:
      'Métricas, wearables e agenda alimentam um fluxo contínuo alinhado à vida real.',
    icon: Activity,
  },
  {
    label: 'Etapa 03',
    title: 'Transforme dados em direção',
    description:
      'IA, score e leitura longitudinal ajudam a priorizar decisões sem perder clareza humana.',
    icon: BrainCircuit,
  },
  {
    label: 'Etapa 04',
    title: 'Sustente a operação inteira',
    description:
      'Planos, entitlements, upgrade e billing externo entram como parte coesa da experiência.',
    icon: TrendingUp,
  },
];

const modules: SurfaceCard[] = [
  {
    label: 'Cockpit longitudinal',
    title: 'Uma visão contínua da saúde, da rotina e do avanço da conta',
    description:
      'Dashboard, score, feed de IA e progresso clínico passam a se comportar como uma mesma narrativa.',
    icon: TrendingUp,
    span: 'lg:col-span-2',
    pills: ['Score inteligente', 'Leitura longitudinal', 'Prioridades em foco'],
  },
  {
    label: 'Perfil contextual',
    title: 'Dados pessoais que realmente orientam o cuidado',
    description:
      'Nascimento, hábitos, objetivos e histórico ajudam a plataforma a falar com contexto e acolhimento.',
    icon: Stethoscope,
  },
  {
    label: 'IA com quota real',
    title: 'Assistência inteligente conectada ao plano ativo',
    description:
      'Mensagens, geração de planos e capacidades seguem regras comerciais reais.',
    icon: BrainCircuit,
  },
  {
    label: 'Monitoramento elegante',
    title: 'Wearables, métricas e observação contínua na mesma camada',
    description:
      'Conexões, leituras e contexto operacional aparecem de forma limpa, sem intimidar quem chega agora.',
    icon: Watch,
    span: 'lg:col-span-2',
    pills: ['Bluetooth', 'Métricas em tempo real', 'Rotina assistida'],
  },
  {
    label: 'Agenda clínica',
    title: 'Profissionais, agenda e acompanhamento em continuidade',
    description:
      'A operação assistida acompanha assinatura, histórico e próximas ações sem fricção visual.',
    icon: CalendarClock,
  },
  {
    label: 'Billing preparado',
    title: 'Portal, checkout e retorno de assinatura com narrativa clara',
    description:
      'A camada comercial compõe a experiência principal do produto.',
    icon: CreditCard,
  },
];

const plans: SurfaceCard[] = [
  {
    label: 'Free',
    title: 'Primeiro contato com a jornada',
    description:
      'Entrada suave para conhecer score, perfil e o valor da plataforma sem ruído.',
    icon: CreditCard,
    items: [
      'Dashboard, score e perfil',
      '15 mensagens IA por mês',
      '1 plano IA por mês',
    ],
  },
  {
    label: 'Meta',
    title: 'Continuidade com mais automação',
    description:
      'A escolha mais equilibrada para contexto, monitoramento e IA recorrente.',
    icon: TrendingUp,
    featured: true,
    items: [
      'Wearables e monitoramento',
      '150 mensagens IA por mês',
      '12 planos IA por mês',
    ],
  },
  {
    label: 'Care',
    title: 'Cobertura premium integral',
    description:
      'Camada expandida para quem precisa de operação clínica e comercial completa.',
    icon: ShieldCheck,
    items: [
      'Matriz completa de recursos',
      '1000 mensagens IA por mês',
      'Operação clínica expandida',
    ],
  },
];

const trust: SurfaceCard[] = [
  {
    label: 'Sessão protegida',
    title: 'Sessão e backend protegidos',
    description:
      'Acesso sensível depende de validação no servidor com verificação explícita de papel e contexto.',
    icon: ShieldCheck,
  },
  {
    label: 'Governança',
    title: 'Capacidades concentradas por plano',
    description:
      'Entitlements, quotas e capacidades ficam centralizados na matriz SaaS.',
    icon: Target,
  },
  {
    label: 'Billing auditável',
    title: 'Webhook e sincronização rastreáveis',
    description:
      'Eventos comerciais e assinatura sustentam rastreabilidade real da operação.',
    icon: LockKeyhole,
  },
];

export function LandingPage() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  const goToLogin = () => router.push('/login');
  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileMenuOpen(false);
  };

  const navButtons = (
    <div className="grid gap-2.5">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollTo(section.id)}
          className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/70 px-4 py-3 text-left text-sm font-medium text-foreground/85 transition-all duration-300 hover:border-primary/20 hover:bg-card hover:text-foreground"
        >
          <span>{section.label}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background font-[family-name:var(--font-geist-sans)] text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_hsla(var(--accent),0.14),_transparent_26%),radial-gradient(circle_at_top_right,_hsla(var(--primary),0.16),_transparent_24%),linear-gradient(180deg,_transparent,_hsla(var(--background),0.96))]" />
        <div className="absolute left-[-120px] top-[120px] h-[340px] w-[340px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-80px] top-[220px] h-[300px] w-[300px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] border-r border-border/50 bg-background/72 px-5 py-5 backdrop-blur-2xl 2xl:flex 2xl:flex-col 2xl:gap-5">
        <div className="rounded-[30px] border border-border/60 bg-card/82 p-5 shadow-[0_24px_70px_-42px_hsla(var(--foreground),0.35)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">
                Lyra MetaCare
              </p>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Saúde orquestrada
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="mt-5 rounded-full border-primary/20 bg-primary/5 px-3.5 py-1.5 text-primary"
          >
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Landing 2026
          </Badge>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Base mobile-first, mas com presença editorial no desktop e mais
            coerência com o produto real.
          </p>
        </div>

        {navButtons}

        <div className="grid gap-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-[24px] border border-border/60 bg-card/82 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold tracking-tight">
                    {item.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto rounded-[30px] border border-primary/15 bg-[radial-gradient(circle_at_top_left,_hsla(var(--primary),0.15),_transparent_38%),linear-gradient(180deg,_hsla(var(--card),0.98),_hsla(var(--card),0.88))] p-5">
          <p className="text-sm font-semibold tracking-tight">
            Amplo no desktop, leve no mobile
          </p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            A lateral só aparece em telas realmente largas para não estrangular
            a composição principal.
          </p>
          <Button
            onClick={goToLogin}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-95"
          >
            Entrar na plataforma
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </aside>

      <div
        className={`fixed inset-0 z-50 2xl:hidden ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMobileMenuOpen(false)}
          className={`absolute inset-0 bg-slate-950/35 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          className={`absolute left-0 top-0 h-full w-[88vw] max-w-[340px] border-r border-border/60 bg-background/95 px-5 py-5 backdrop-blur-2xl transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Navegação
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight">
                Lyra MetaCare
              </p>
            </div>
            <button
              type="button"
              aria-label="Fechar navegação"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-card/70"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-6 space-y-5">
            {navButtons}
            <div className="grid gap-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[22px] border border-border/60 bg-card/82 p-4"
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold tracking-tight">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
            <Button
              onClick={goToLogin}
              className="w-full rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-95"
            >
              Entrar na plataforma
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative 2xl:pl-[280px]">
        <header
          className={`sticky top-0 z-40 px-4 py-4 transition-all duration-300 sm:px-6 lg:px-8 ${
            scrolled
              ? 'border-b border-border/60 bg-background/78 backdrop-blur-2xl'
              : 'bg-transparent'
          }`}
        >
          <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Abrir navegação"
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card/75 2xl:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground sm:text-xs">
                  Landing editorial
                </p>
                <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                  Lyra MetaCare
                </h1>
              </div>
            </div>

            <nav className="hidden items-center gap-2 xl:flex">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
                >
                  {section.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Badge
                variant="outline"
                className="hidden rounded-full border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-emerald-700 dark:text-emerald-300 md:inline-flex"
              >
                <Waves className="mr-2 h-3.5 w-3.5" />
                Elegante no desktop, clara no mobile
              </Badge>
              {mounted ? (
                <button
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card/75 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Alternar tema"
                >
                  {isDark ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
              ) : null}
              <Button
                variant="ghost"
                onClick={goToLogin}
                className="hidden rounded-full lg:inline-flex"
              >
                Entrar
              </Button>
              <Button
                onClick={goToLogin}
                className="hidden rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-95 sm:inline-flex"
              >
                Acessar conta
              </Button>
            </div>
          </div>
        </header>

        <main className="relative px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-24">
          <div className="mx-auto flex max-w-[1320px] flex-col gap-8 lg:gap-10">
            <section
              id="visao-geral"
              className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]"
            >
              <div className="space-y-6 rounded-[34px] border border-border/60 bg-card/82 p-6 shadow-[0_28px_110px_-54px_hsla(var(--foreground),0.4)] backdrop-blur-2xl sm:p-8 lg:p-10">
                <Badge
                  variant="outline"
                  className="rounded-full border-primary/20 bg-primary/5 px-4 py-1.5 text-primary"
                >
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Plataforma de cuidado contínuo em linguagem clara
                </Badge>
                <div className="space-y-4">
                  <h2 className="max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl 2xl:text-[4.4rem] 2xl:leading-[0.98]">
                    Cuidado contínuo,
                    <span className="block text-primary">
                      inteligente e acolhedor
                    </span>
                    para cada fase da sua saúde.
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                    A Lyra MetaCare organiza perfil, monitoramento, IA, agenda e
                    assinatura em uma experiência mais leve, elegante e
                    compreensível desde o primeiro contato.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={goToLogin}
                    size="lg"
                    className="h-12 rounded-full bg-gradient-to-r from-primary to-accent px-6 text-base text-primary-foreground hover:opacity-95 sm:flex-1"
                  >
                    Entrar na plataforma
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => scrollTo('jornada')}
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-border/60 bg-background/70 px-6 text-base sm:flex-1"
                  >
                    Entender a jornada
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[26px] border border-border/60 bg-background/72 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                            {item.label}
                          </p>
                          <p className="mt-1 text-sm font-semibold tracking-tight">
                            {item.title}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="overflow-hidden rounded-[34px] border-border/60 bg-card/82 shadow-[0_28px_110px_-54px_hsla(var(--foreground),0.45)]">
                <CardHeader className="space-y-5 border-b border-border/50 bg-[radial-gradient(circle_at_top_left,_hsla(var(--primary),0.16),_transparent_40%),radial-gradient(circle_at_top_right,_hsla(var(--accent),0.16),_transparent_30%)] p-6 sm:p-8 lg:p-10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge
                      variant="outline"
                      className="rounded-full border-primary/20 bg-primary/5 px-4 py-1.5 text-primary"
                    >
                      <Waves className="mr-2 h-3.5 w-3.5" />
                      Sala de cuidado
                    </Badge>
                    <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      Produto vivo + narrativa clara
                    </div>
                  </div>
                  <div className="space-y-3">
                    <CardTitle className="text-3xl tracking-[-0.03em]">
                      Desktop amplo, mobile limpo, a mesma lógica de produto
                    </CardTitle>
                    <CardDescription className="max-w-xl text-sm leading-7 text-muted-foreground">
                      A lateral só entra quando há espaço suficiente. Em telas
                      menores, a página respira melhor e o CTA certo continua em
                      destaque.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-6 sm:p-8 lg:p-10">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[28px] border border-border/60 bg-background/75 p-5">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                        Cuidado e contexto
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">
                        Perfil, score e direção
                      </p>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        A experiência explica o valor do produto sem parecer
                        técnica demais nem vaga demais.
                      </p>
                    </div>
                    <div className="rounded-[28px] border border-border/60 bg-background/75 p-5">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                        Operação comercial
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">
                        Planos, quota e billing
                      </p>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        A camada SaaS deixa de ser escondida e passa a comunicar
                        maturidade real.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-slate-900/10 bg-slate-950 p-5 text-slate-50">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                          Fluxo de valor
                        </p>
                        <p className="mt-2 text-xl font-semibold tracking-tight">
                          Acolhimento, monitoramento e governança na mesma
                          arquitetura
                        </p>
                      </div>
                      <HeartPulse className="h-8 w-8 text-teal-300" />
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {[
                        'Perfil vivo',
                        'Monitoramento contínuo',
                        'Billing integrado',
                      ].map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section
              id="jornada"
              className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]"
            >
              <Card className="rounded-[34px] border-border/60 bg-card/82 shadow-[0_24px_80px_-48px_hsla(var(--foreground),0.35)]">
                <CardHeader className="space-y-4 p-6 sm:p-8">
                  <Badge
                    variant="outline"
                    className="w-fit rounded-full border-primary/20 bg-primary/5 px-4 py-1.5 text-primary"
                  >
                    <Activity className="mr-2 h-3.5 w-3.5" />
                    Jornada do cuidado
                  </Badge>
                  <CardTitle className="text-3xl tracking-[-0.03em]">
                    Mobile-first sem sacrificar a presença do desktop
                  </CardTitle>
                  <CardDescription className="text-base leading-8 text-muted-foreground">
                    O fluxo visual agora prioriza leitura limpa em telas menores
                    e amplitude editorial quando o desktop comporta mais
                    densidade.
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {journey.map((item) => (
                  <Card
                    key={item.label}
                    className="rounded-[30px] border-border/60 bg-card/82 shadow-[0_20px_70px_-48px_hsla(var(--foreground),0.35)]"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20">
                          <item.icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-3">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                            {item.label}
                          </p>
                          <h3 className="text-xl font-semibold tracking-tight">
                            {item.title}
                          </h3>
                          <p className="text-sm leading-7 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section id="modulos" className="space-y-6">
              <div className="max-w-3xl space-y-4">
                <Badge
                  variant="outline"
                  className="rounded-full border-primary/20 bg-primary/5 px-4 py-1.5 text-primary"
                >
                  <BrainCircuit className="mr-2 h-3.5 w-3.5" />
                  Ecossistema MetaCare
                </Badge>
                <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  Módulos que trabalham juntos, não apenas lado a lado
                </h2>
                <p className="text-base leading-8 text-muted-foreground">
                  A organização continua inspirada no manus-lyra, mas com uma
                  visualidade mais suave, humana e coerente com saúde contínua.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {modules.map((item) => (
                  <Card
                    key={item.title}
                    className={`overflow-hidden rounded-[32px] border-border/60 bg-card/82 shadow-[0_24px_80px_-50px_hsla(var(--foreground),0.35)] ${item.span ?? ''}`}
                  >
                    <CardHeader className="space-y-5 bg-[radial-gradient(circle_at_top_left,_hsla(var(--primary),0.14),_transparent_44%),radial-gradient(circle_at_bottom_right,_hsla(var(--accent),0.12),_transparent_34%)] p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[22px] bg-primary/10 text-primary">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                          {item.label}
                        </p>
                        <CardTitle className="text-2xl tracking-[-0.03em]">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-7 text-muted-foreground">
                          {item.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    {item.pills ? (
                      <CardContent className="flex flex-wrap gap-2 p-6 pt-0">
                        {item.pills.map((pill) => (
                          <div
                            key={pill}
                            className="rounded-full border border-border/60 bg-background/72 px-3.5 py-2 text-xs font-medium text-muted-foreground"
                          >
                            {pill}
                          </div>
                        ))}
                      </CardContent>
                    ) : null}
                  </Card>
                ))}
              </div>
            </section>

            <section
              id="planos"
              className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]"
            >
              <Card className="rounded-[34px] border-border/60 bg-card/82 shadow-[0_24px_80px_-48px_hsla(var(--foreground),0.35)]">
                <CardHeader className="space-y-4 p-6 sm:p-8">
                  <Badge
                    variant="outline"
                    className="w-fit rounded-full border-primary/20 bg-primary/5 px-4 py-1.5 text-primary"
                  >
                    <CreditCard className="mr-2 h-3.5 w-3.5" />
                    Camada comercial
                  </Badge>
                  <CardTitle className="text-3xl tracking-[-0.03em]">
                    Planos e billing com aparência premium, mas baseados em
                    regras reais
                  </CardTitle>
                  <CardDescription className="text-base leading-8 text-muted-foreground">
                    A homepage deixa claro que a MetaCare já pensa em upgrade,
                    entitlements, assinatura externa e jornada de conta como
                    parte do produto.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-6 pb-6 sm:px-8 sm:pb-8">
                  {[
                    'Checkout com validação estrutural',
                    'Portal de billing e páginas de retorno',
                    'Upgrade integrado ao perfil da conta',
                    'Webhook e sincronização preparados',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-border/60 bg-background/72 px-4 py-3 text-sm text-muted-foreground"
                    >
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid gap-4 lg:grid-cols-3">
                {plans.map((item) => (
                  <Card
                    key={item.label}
                    className={`rounded-[32px] border-border/60 bg-card/82 shadow-[0_24px_80px_-50px_hsla(var(--foreground),0.35)] ${
                      item.featured
                        ? 'border-primary/20 bg-[radial-gradient(circle_at_top_left,_hsla(var(--primary),0.14),_transparent_40%),linear-gradient(180deg,_hsla(var(--card),0.98),_hsla(var(--card),0.9))]'
                        : ''
                    }`}
                  >
                    <CardHeader className="space-y-4 p-6">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                          Plano {item.label}
                        </p>
                        {item.featured ? (
                          <Badge className="rounded-full border-0 bg-primary/10 text-primary">
                            Mais equilibrado
                          </Badge>
                        ) : null}
                      </div>
                      <CardTitle className="text-2xl tracking-[-0.03em]">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-7 text-muted-foreground">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 p-6 pt-0">
                      {item.items?.map((planItem) => (
                        <div
                          key={planItem}
                          className="rounded-2xl border border-border/60 bg-background/72 px-4 py-3 text-sm text-muted-foreground"
                        >
                          {planItem}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section id="seguranca" className="space-y-6">
              <div className="max-w-3xl space-y-4">
                <Badge
                  variant="outline"
                  className="rounded-full border-primary/20 bg-primary/5 px-4 py-1.5 text-primary"
                >
                  <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                  Segurança e rastreabilidade
                </Badge>
                <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  Elegância na superfície, rigor na operação
                </h2>
                <p className="text-base leading-8 text-muted-foreground">
                  A confiança aqui não depende de promessa vaga. Ela se apoia em
                  sessão protegida, governança centralizada e trilha comercial
                  auditável.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {trust.map((item) => (
                  <Card
                    key={item.title}
                    className="rounded-[30px] border-border/60 bg-card/82 shadow-[0_24px_80px_-50px_hsla(var(--foreground),0.35)]"
                  >
                    <CardHeader className="space-y-4 p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[22px] bg-primary/10 text-primary">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                        {item.label}
                      </p>
                      <CardTitle className="text-2xl tracking-[-0.03em]">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-7 text-muted-foreground">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-[36px] border border-border/60 bg-[radial-gradient(circle_at_top_left,_hsla(var(--accent),0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_hsla(var(--primary),0.18),_transparent_28%),linear-gradient(180deg,_hsla(var(--card),0.98),_hsla(var(--card),0.88))] shadow-[0_28px_100px_-58px_hsla(var(--foreground),0.42)]">
              <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-end">
                <div className="space-y-4">
                  <Badge
                    variant="outline"
                    className="rounded-full border-primary/20 bg-primary/5 px-4 py-1.5 text-primary"
                  >
                    <Waves className="mr-2 h-3.5 w-3.5" />
                    Porta de entrada certa para a MetaCare
                  </Badge>
                  <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                    Uma landing mais bonita, mais clara e mais alinhada ao valor
                    real do produto.
                  </h2>
                  <p className="max-w-3xl text-base leading-8 text-muted-foreground">
                    A experiência agora prioriza acolhimento, hierarquia visual,
                    clareza comercial e consistência entre o que a MetaCare
                    promete e o que ela realmente entrega dentro da conta.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={goToLogin}
                    size="lg"
                    className="w-full rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-95"
                  >
                    Entrar na conta
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => scrollTo('visao-geral')}
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full bg-background/70"
                  >
                    Voltar ao topo
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
