'use client';

import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BellRing,
  BrainCircuit,
  CalendarClock,
  ChevronRight,
  CreditCard,
  HeartPulse,
  LayoutDashboard,
  LockKeyhole,
  type LucideIcon,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Workflow,
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
import { cn } from '@/lib/utils';

type HeroSignal = {
  title: string;
  description: string;
};

type ProductModule = {
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  icon: LucideIcon;
  accentClassName: string;
  iconClassName: string;
};

type JourneyStep = {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

type GovernanceItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const heroSignals: HeroSignal[] = [
  {
    title: 'Mobile-first sem perder densidade',
    description:
      'A experiência principal nasce no celular, com leitura objetiva, fluxo curto e tomada de decisão rápida.',
  },
  {
    title: 'Operação inteira na mesma jornada',
    description:
      'Dashboard, IA, monitoramento, agenda clínica e cobrança aparecem como partes do mesmo produto.',
  },
  {
    title: 'Governança real de planos e acessos',
    description:
      'Entitlements, quotas, upgrade e billing deixam de ser remendo e passam a sustentar a operação.',
  },
];

const productModules: ProductModule[] = [
  {
    eyebrow: 'Dashboard diário',
    title: 'Leitura longitudinal de sinais e prontidão',
    description:
      'A home do produto já consolida passos, sono, prontidão e indicadores de continuidade em visão executiva.',
    detail: 'Menos ruído operacional. Mais clareza para agir no dia certo.',
    icon: LayoutDashboard,
    accentClassName:
      'bg-[linear-gradient(180deg,rgba(97,55,173,0.12)_0%,rgba(255,255,255,0.96)_100%)]',
    iconClassName: 'bg-[#efe8ff] text-[#5f37ac]',
  },
  {
    eyebrow: 'Plano IA',
    title: 'Orquestração personalizada persistida no fluxo',
    description:
      'O motor de IA transforma contexto disponível e biomarcadores em um plano acionável, salvo e reutilizável.',
    detail:
      'A IA deixa de ser vitrine e passa a virar execução organizada dentro do app.',
    icon: BrainCircuit,
    accentClassName:
      'bg-[linear-gradient(180deg,rgba(255,185,0,0.16)_0%,rgba(255,255,255,0.96)_100%)]',
    iconClassName: 'bg-[#fff0c1] text-[#b87900]',
  },
  {
    eyebrow: 'Monitoramento',
    title: 'Sinais em tempo real com leitura contínua',
    description:
      'Eventos ao vivo, alertas locais e camada de acompanhamento transformam o monitoramento em recurso cotidiano.',
    detail:
      'O foco deixa de ser só coleta e passa a ser resposta com contexto e timing.',
    icon: Activity,
    accentClassName:
      'bg-[linear-gradient(180deg,rgba(236,72,153,0.10)_0%,rgba(255,255,255,0.96)_100%)]',
    iconClassName: 'bg-[#ffe4f1] text-[#c22974]',
  },
  {
    eyebrow: 'Agenda clínica',
    title: 'Consultas, profissionais e continuidade assistida',
    description:
      'Cadastro de profissionais, agenda, edição e acompanhamento do calendário fazem parte da jornada real.',
    detail:
      'O produto sustenta o cuidado com coordenação, não só com insights isolados.',
    icon: CalendarClock,
    accentClassName:
      'bg-[linear-gradient(180deg,rgba(20,184,166,0.11)_0%,rgba(255,255,255,0.96)_100%)]',
    iconClassName: 'bg-[#dff8f4] text-[#0f8a7d]',
  },
  {
    eyebrow: 'Billing e governança',
    title: 'Plano, quotas e evolução comercial dentro do produto',
    description:
      'Assinatura, consumo monitorado, upgrades e portal de cobrança entram na mesma superfície operacional.',
    detail:
      'A camada comercial ganha rastreabilidade sem quebrar a experiência do usuário.',
    icon: CreditCard,
    accentClassName:
      'bg-[linear-gradient(180deg,rgba(15,23,42,0.10)_0%,rgba(255,255,255,0.96)_100%)]',
    iconClassName: 'bg-[#e9edf5] text-[#1e293b]',
  },
];

const journeySteps: JourneyStep[] = [
  {
    step: '01',
    title: 'Captura do contexto',
    description:
      'O app organiza perfil, sinais do dia e condições do momento para entender a realidade da pessoa antes de sugerir qualquer ação.',
    icon: HeartPulse,
  },
  {
    step: '02',
    title: 'Leitura inteligente do próximo passo',
    description:
      'A camada de IA usa esse contexto para produzir prioridade, plano e foco de acompanhamento, sem dissociar análise de execução.',
    icon: Workflow,
  },
  {
    step: '03',
    title: 'Execução com acompanhamento e continuidade',
    description:
      'Monitoramento, agenda clínica e billing fecham o ciclo para que a jornada continue funcionando no dia seguinte.',
    icon: Stethoscope,
  },
];

const governanceItems: GovernanceItem[] = [
  {
    title: 'Autenticação e sessão protegida',
    description:
      'A entrada na plataforma já nasce conectada à sessão do usuário e ao fluxo real de login.',
    icon: LockKeyhole,
  },
  {
    title: 'Entitlements por plano',
    description:
      'Cada recurso é exposto com base no plano ativo, evitando promessa solta e liberando só o que foi realmente contratado.',
    icon: ShieldCheck,
  },
  {
    title: 'Cobrança auditável',
    description:
      'Upgrade, status de assinatura, consumo e portal de billing ficam visíveis como parte da operação do app.',
    icon: BadgeCheck,
  },
];

function PhonePreview({ onPrimaryAction }: { onPrimaryAction: () => void }) {
  return (
    <div className="relative z-10 mx-auto w-full max-w-[22rem] rounded-[2.2rem] border border-white/80 bg-white p-3 shadow-[0_40px_140px_-60px_rgba(42,16,92,0.55)]">
      <div className="overflow-hidden rounded-[1.8rem] bg-[#fcfaff]">
        <div className="relative flex h-[13.75rem] items-end justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,185,0,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(134,49,194,0.16),transparent_34%),linear-gradient(180deg,#ffffff_0%,#fbf6ff_100%)] px-6 pb-6 pt-8">
          <div className="absolute left-8 top-7 h-16 w-16 rounded-full bg-[#ffb900]/25 blur-2xl" />
          <div className="absolute right-8 top-10 h-20 w-20 rounded-full bg-[#9f3ed8]/20 blur-2xl" />
          <div className="absolute left-8 top-16 h-10 w-24 rounded-2xl bg-white/90 shadow-[0_16px_28px_-22px_rgba(76,45,145,0.55)]" />
          <div className="absolute right-10 top-20 h-12 w-20 rounded-2xl bg-white/80 shadow-[0_16px_28px_-22px_rgba(76,45,145,0.45)]" />

          <div className="relative flex h-[9.6rem] w-[7rem] items-center justify-center rounded-[1.7rem] border-[3px] border-[#5d37ac] bg-white shadow-[0_24px_40px_-22px_rgba(76,45,145,0.5)]">
            <div className="absolute top-2 h-1 w-10 rounded-full bg-[#ede6fb]" />
            <div className="flex w-full flex-col gap-2 px-3">
              <div className="h-2 rounded-full bg-[#8d35c7]" />
              <div className="h-2 rounded-full bg-[#efe8ff]" />
              <div className="rounded-2xl bg-[#faf5ff] px-3 py-4">
                <div className="flex items-center justify-center rounded-full bg-[#fff2c5] p-2 text-[#b87900]">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>
              <div className="h-2 rounded-full bg-[#efe8ff]" />
              <div className="h-2 rounded-full bg-[#8d35c7]" />
            </div>
          </div>

          <div className="absolute bottom-10 left-7 rounded-2xl bg-[#ffffffd9] px-3 py-2 shadow-[0_18px_36px_-26px_rgba(76,45,145,0.55)]">
            <div className="flex items-center gap-2 text-[0.68rem] font-semibold text-[#5f37ac]">
              <BellRing className="h-3.5 w-3.5" />
              acompanhamento ativo
            </div>
          </div>
        </div>

        <div className="rounded-t-[2rem] bg-[linear-gradient(180deg,#4d2d94_0%,#9537cf_100%)] px-5 pb-7 pt-6 text-white">
          <div className="space-y-2">
            <p className="text-[2rem] font-semibold tracking-[-0.06em]">
              Hi, MetaCare.
            </p>
            <p className="max-w-[16rem] text-sm leading-6 text-white/82">
              Um fluxo só para entender sinais, priorizar ação e sustentar
              continuidade.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3 text-xs font-medium text-white/82">
            <span className="h-px flex-1 bg-white/45" />
            cuidado diário em um só lugar
            <span className="h-px flex-1 bg-white/45" />
          </div>

          <div className="mt-4 rounded-[1.1rem] bg-white px-4 py-3 text-slate-900 shadow-[0_16px_30px_-24px_rgba(0,0,0,0.42)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efe8ff] text-[#5f37ac]">
                <MonitorSmartphone className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  fluxo mobile-first
                </p>
                <p className="text-sm font-semibold">
                  sinais, plano e agenda sem fricção
                </p>
              </div>
            </div>
          </div>

          <button
            className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#ffb900] px-5 text-sm font-semibold text-slate-950 shadow-[0_18px_34px_-22px_rgba(255,185,0,0.75)] transition-transform duration-200 hover:-translate-y-0.5"
            onClick={onPrimaryAction}
            type="button"
          >
            Entrar na plataforma
          </button>

          <div className="mt-4 flex items-center gap-3 text-xs font-medium text-white/82">
            <span className="h-px flex-1 bg-white/45" />
            ou continue lendo
            <span className="h-px flex-1 bg-white/45" />
          </div>

          <div className="mt-4 rounded-[1.1rem] border border-white/65 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  Sessão, plano e cobrança
                </p>
                <p className="mt-1 text-xs leading-5 text-white/80">
                  Segurança, entitlement e camada comercial dentro da mesma
                  jornada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function DesktopSurface() {
  return (
    <div className="hidden rounded-[2rem] border border-[#efe8ff] bg-white/92 p-5 shadow-[0_32px_110px_-68px_rgba(76,45,145,0.45)] lg:block">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7b5bb8]">
            leitura em desktop
          </p>
          <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">
            Centro operacional do cuidado
          </p>
        </div>
        <div className="rounded-2xl bg-[#f6f0ff] p-3 text-[#5f37ac]">
          <Workflow className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {[
          {
            title: 'Prioridades do dia',
            description:
              'Visão rápida do que exige ação agora, sem esconder a complexidade quando ela importa.',
          },
          {
            title: 'Coordenação clínica',
            description:
              'Agenda, profissionais e histórico permanecem acessíveis para leitura e acompanhamento no escritório.',
          },
          {
            title: 'Camada comercial visível',
            description:
              'Status do plano, quotas e decisões de upgrade aparecem em contexto operacional.',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-[1.35rem] border border-slate-100 bg-[linear-gradient(180deg,rgba(252,250,255,0.96)_0%,rgba(255,255,255,1)_100%)] p-4"
          >
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,185,0,0.18),transparent_20%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.16),transparent_25%),linear-gradient(180deg,#fffdf8_0%,#ffffff_44%,#fbf7ff_100%)] text-slate-900">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_40px_140px_-72px_rgba(76,45,145,0.42)] backdrop-blur-xl sm:rounded-[2.5rem]">
          <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-7 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] bg-[linear-gradient(180deg,#4d2d94_0%,#9537cf_100%)] text-white shadow-[0_16px_32px_-18px_rgba(76,45,145,0.58)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                  Lyra MetaCare
                </p>
                <p className="text-xs text-slate-500">
                  cuidado contínuo com leitura inteligente
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <Button
                asChild
                className="rounded-full bg-transparent px-4 text-slate-600 shadow-none hover:bg-slate-100 hover:text-slate-900"
                variant="ghost"
              >
                <a href="#produto">Produto</a>
              </Button>
              <Button
                asChild
                className="rounded-full bg-transparent px-4 text-slate-600 shadow-none hover:bg-slate-100 hover:text-slate-900"
                variant="ghost"
              >
                <a href="#jornada">Jornada</a>
              </Button>
              <Button
                asChild
                className="rounded-full bg-transparent px-4 text-slate-600 shadow-none hover:bg-slate-100 hover:text-slate-900"
                variant="ghost"
              >
                <a href="#governanca">Governança</a>
              </Button>
            </div>
          </div>

          <div className="grid gap-8 px-5 pb-6 pt-2 sm:px-7 sm:pb-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-10 lg:px-8 lg:pb-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge className="rounded-full border-0 bg-[#f3ecff] px-4 py-1.5 text-[#5f37ac]">
                  inspirado no ritmo visual do Astrology App, adaptado ao
                  produto real
                </Badge>
                <div className="space-y-4">
                  <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.08em] text-slate-950 sm:text-5xl lg:text-6xl">
                    A landing agora nasce no celular e escala com maturidade no
                    desktop.
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                    A MetaCare conecta sinais do dia, plano inteligente,
                    monitoramento, agenda clínica e camada comercial em uma
                    experiência mobile-first com leitura premium, clara e
                    operacional.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="h-12 rounded-full bg-[#ffb900] px-6 text-slate-950 shadow-[0_18px_34px_-22px_rgba(255,185,0,0.8)] hover:bg-[#f0ad00]"
                  onClick={() => router.push('/login')}
                  size="lg"
                >
                  Entrar na plataforma
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  asChild
                  className="h-12 rounded-full border-white bg-white/70 px-6 text-slate-700 shadow-sm hover:bg-white"
                  size="lg"
                  variant="outline"
                >
                  <a href="#produto">Ver módulos reais</a>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {heroSignals.map((signal) => (
                  <div
                    key={signal.title}
                    className="rounded-[1.35rem] border border-slate-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(249,244,255,0.96)_100%)] p-4 shadow-[0_18px_50px_-42px_rgba(76,45,145,0.55)]"
                  >
                    <p className="text-sm font-semibold text-slate-950">
                      {signal.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {signal.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <div className="flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 shadow-sm">
                  <HeartPulse className="h-4 w-4 text-[#5f37ac]" />
                  contexto e sinais do dia
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 shadow-sm">
                  <BrainCircuit className="h-4 w-4 text-[#5f37ac]" />
                  IA aplicada ao plano
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 shadow-sm">
                  <CreditCard className="h-4 w-4 text-[#5f37ac]" />
                  operação comercial integrada
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="lg:absolute lg:right-0 lg:top-10 lg:w-[22rem]">
                <DesktopSurface />
              </div>
              <div className="lg:pr-36">
                <PhonePreview onPrimaryAction={() => router.push('/login')} />
              </div>
            </div>
          </div>
        </section>

        <section
          className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,24rem)]"
          id="produto"
        >
          <Card className="overflow-hidden rounded-[2rem] border-white/80 bg-[linear-gradient(180deg,rgba(80,45,145,1)_0%,rgba(147,56,206,1)_100%)] text-white shadow-[0_30px_110px_-60px_rgba(76,45,145,0.7)]">
            <CardHeader className="space-y-4 p-6 sm:p-7">
              <Badge className="w-fit rounded-full border-0 bg-white/12 text-white">
                produto real, não promessa genérica
              </Badge>
              <CardTitle className="max-w-2xl text-3xl font-semibold tracking-[-0.05em] sm:text-[2.2rem]">
                Uma landing coerente com a estrutura que já existe no app.
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-7 text-white/82 sm:text-base">
                A proposta comercial agora conversa com o que a plataforma já
                entrega: leitura diária, IA persistida, monitoramento em tempo
                real, agenda clínica e governança por plano.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 p-6 pt-0 sm:grid-cols-2 sm:p-7 sm:pt-0">
              {[
                'Fluxo pensado para uso frequente no celular',
                'Leitura executiva mais ampla quando o usuário vai para o desktop',
                'CTA principal mais claro e mais forte visualmente',
                'Narrativa comercial alinhada ao produto real',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.35rem] border border-white/15 bg-white/8 px-4 py-4 text-sm leading-6 text-white/88"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white/88 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.35)]">
            <CardHeader className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-[#fff0c1] text-[#b87900]">
                <MonitorSmartphone className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl tracking-[-0.04em] text-slate-950">
                  Mobile-first de verdade
                </CardTitle>
                <CardDescription className="text-sm leading-7 text-slate-600">
                  A hierarquia visual prioriza o que precisa ser entendido e
                  acionado no celular, sem sacrificar leitura, governança ou
                  profundidade quando a sessão cresce no desktop.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="space-y-3 px-1">
            <Badge className="rounded-full border-0 bg-[#f3ecff] px-4 py-1.5 text-[#5f37ac]">
              frentes reais do produto
            </Badge>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-4xl">
              Cada bloco da landing explica uma capacidade concreta da
              plataforma.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Sem vitrine vazia: cada card abaixo traduz um módulo que já faz
              parte da jornada funcional do app.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {productModules.map((module, index) => (
              <Card
                key={module.title}
                className={cn(
                  'rounded-[1.8rem] border-white/75 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.32)]',
                  module.accentClassName,
                  index === 0 ? 'xl:col-span-2' : ''
                )}
              >
                <CardHeader className="space-y-4 p-6">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-[1rem]',
                      module.iconClassName
                    )}
                  >
                    <module.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {module.eyebrow}
                    </p>
                    <CardTitle className="text-2xl tracking-[-0.04em] text-slate-950">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-7 text-slate-600">
                      {module.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="rounded-[1.2rem] border border-white/80 bg-white/70 p-4 text-sm leading-6 text-slate-700">
                    {module.detail}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section
          className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
          id="jornada"
        >
          <Card className="rounded-[2rem] border-white/80 bg-white/88 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.35)]">
            <CardHeader className="space-y-4 p-6 sm:p-7">
              <Badge className="w-fit rounded-full border-0 bg-[#fff0c1] text-[#b87900]">
                jornada integrada
              </Badge>
              <div className="space-y-2">
                <CardTitle className="text-3xl tracking-[-0.05em] text-slate-950">
                  O produto funciona como ciclo, não como coleção de telas.
                </CardTitle>
                <CardDescription className="text-sm leading-7 text-slate-600">
                  A landing deixa explícito que o valor da MetaCare vem da
                  continuidade entre leitura, decisão e execução.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0 sm:p-7 sm:pt-0">
              <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,#4d2d94_0%,#9537cf_100%)] p-5 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/72">
                  síntese da proposta
                </p>
                <p className="mt-3 text-lg font-semibold tracking-[-0.03em]">
                  Entender o momento da pessoa, orientar o próximo passo e
                  sustentar essa jornada com coordenação real.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.35rem] border border-slate-100 bg-[#fcf9ff] p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Uso frequente no celular
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    CTA forte, leitura rápida e blocos curtos para o usuário
                    agir sem atrito.
                  </p>
                </div>
                <div className="rounded-[1.35rem] border border-slate-100 bg-[#fffdf7] p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Leitura ampliada no desktop
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Mais espaço para acompanhar governança, agenda e camadas
                    operacionais com conforto.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {journeySteps.map((step) => (
              <Card
                key={step.step}
                className="rounded-[1.8rem] border-white/80 bg-white/88 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.32)]"
              >
                <CardContent className="flex gap-4 p-5 sm:p-6">
                  <div className="flex h-14 w-14 flex-none items-center justify-center rounded-[1.2rem] bg-[#f3ecff] text-[#5f37ac]">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        etapa {step.step}
                      </span>
                    </div>
                    <p className="text-xl font-semibold tracking-[-0.03em] text-slate-950">
                      {step.title}
                    </p>
                    <p className="text-sm leading-7 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4" id="governanca">
          <div className="space-y-3 px-1">
            <Badge className="rounded-full border-0 bg-[#f3ecff] px-4 py-1.5 text-[#5f37ac]">
              governança do produto
            </Badge>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-4xl">
              A landing também precisa sustentar confiança operacional.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Segurança, regras por plano e camada comercial aparecem de forma
              objetiva porque fazem parte da percepção de maturidade do app.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {governanceItems.map((item) => (
              <Card
                key={item.title}
                className="rounded-[1.8rem] border-white/80 bg-white/88 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.32)]"
              >
                <CardHeader className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#f3ecff] text-[#5f37ac]">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl tracking-[-0.04em] text-slate-950">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-7 text-slate-600">
                      {item.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(244,235,255,0.96)_48%,rgba(255,245,209,0.88)_100%)] p-6 shadow-[0_30px_110px_-60px_rgba(76,45,145,0.42)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="space-y-3">
              <Badge className="rounded-full border-0 bg-[#4d2d94] px-4 py-1.5 text-white">
                pronto para entrada no app
              </Badge>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-4xl">
                Uma landing mais forte visualmente, mais honesta comercialmente
                e mais aderente ao produto.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                O novo desenho usa a linguagem clara do layout do Figma que você
                escolheu, mas traduzida para a MetaCare com coerência de
                negócio, contexto mobile-first e operação real.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button
                className="h-12 rounded-full bg-[#ffb900] px-6 text-slate-950 hover:bg-[#f0ad00]"
                onClick={() => router.push('/login')}
                size="lg"
              >
                Entrar agora
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                asChild
                className="h-12 rounded-full border-white bg-white/80 px-6 text-slate-700 hover:bg-white"
                size="lg"
                variant="outline"
              >
                <a href="#produto">
                  Explorar módulos
                  <ChevronRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
