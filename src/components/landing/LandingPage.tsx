'use client';

import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  CreditCard,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Watch,
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

const pillars = [
  {
    title: 'Perfil, contexto e metas',
    description:
      'A jornada começa com onboarding, contexto pessoal e objetivos que ajudam o app a orientar o cuidado com clareza.',
    icon: HeartPulse,
  },
  {
    title: 'Monitoramento contínuo',
    description:
      'Wearables, métricas e sinais do dia entram na mesma narrativa para apoiar decisões mais consistentes.',
    icon: Watch,
  },
  {
    title: 'IA com uso real por plano',
    description:
      'Mensagens, planos gerados e recursos inteligentes respeitam quotas e capacidades do plano ativo.',
    icon: BrainCircuit,
  },
  {
    title: 'Agenda, billing e operação',
    description:
      'Consultas, assinatura, upgrade e retorno comercial aparecem como parte do produto, não como remendo.',
    icon: CreditCard,
  },
];

const modules = [
  {
    eyebrow: 'Dashboard',
    title: 'Score, métricas e leitura longitudinal',
    description:
      'Home executiva com visão diária de passos, sono, prontidão e sinais do cuidado em continuidade.',
    icon: Activity,
  },
  {
    eyebrow: 'Plano IA',
    title: 'Orquestração personalizada em uma única superfície',
    description:
      'O motor de IA transforma contexto e biomarcadores disponíveis em um plano persistido e reutilizável.',
    icon: Sparkles,
  },
  {
    eyebrow: 'Agenda clínica',
    title: 'Profissionais, consultas e continuidade assistida',
    description:
      'A plataforma já possui estrutura de agenda, cadastro de profissionais e acompanhamento do calendário.',
    icon: CalendarClock,
  },
  {
    eyebrow: 'Governança',
    title: 'Entitlements, quotas e segurança operacional',
    description:
      'Sessão protegida, recursos por plano e camada comercial auditável sustentam a maturidade da operação.',
    icon: ShieldCheck,
  },
];

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,77,86,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(242,122,82,0.18),_transparent_26%),linear-gradient(180deg,#f7fbfa_0%,#fffaf7_54%,#f4fbf8_100%)] text-slate-900">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_30px_120px_-60px_rgba(20,77,86,0.45)] backdrop-blur-xl">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:px-10 lg:py-10">
            <div className="space-y-6">
              <Badge className="rounded-full border-0 bg-teal-100 px-4 py-1.5 text-teal-800">
                Lyra MetaCare
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
                  Cuidado contínuo com IA, monitoramento e operação real em uma
                  única experiência.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  A MetaCare conecta contexto pessoal, sinais do dia, plano
                  inteligente, agenda clínica e assinatura em uma jornada clara,
                  premium e pronta para uso cotidiano.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => router.push('/login')}
                  size="lg"
                  className="rounded-full bg-teal-800 px-6 text-white hover:bg-teal-900"
                >
                  Entrar na plataforma
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() =>
                    document
                      .getElementById('modulos')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  size="lg"
                  variant="outline"
                  className="rounded-full border-slate-200 bg-white/70"
                >
                  Ver módulos do produto
                </Button>
              </div>
            </div>

            <Card className="border-white/70 bg-slate-950 text-white shadow-none">
              <CardHeader className="space-y-3">
                <Badge className="w-fit rounded-full border-0 bg-white/10 text-white">
                  Estrutura já existente no app
                </Badge>
                <CardTitle className="text-2xl tracking-[-0.03em]">
                  A landing precisa refletir o produto real
                </CardTitle>
                <CardDescription className="text-sm leading-7 text-slate-300">
                  O app já possui dashboard, IA, monitoramento, agenda clínica e
                  billing. A homepage precisa traduzir isso com clareza
                  empresarial, não com promessas vagas.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {pillars.map((pillar) => (
                  <div
                    key={pillar.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                        <pillar.icon className="h-5 w-5 text-teal-300" />
                      </div>
                      <p className="text-sm font-semibold">{pillar.title}</p>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="modulos" className="grid gap-4 lg:grid-cols-2">
          {modules.map((module) => (
            <Card
              key={module.title}
              className="rounded-[1.75rem] border-white/70 bg-white/80 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.35)]"
            >
              <CardHeader className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
                  <module.icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {module.eyebrow}
                  </p>
                  <CardTitle className="text-2xl tracking-[-0.03em] text-slate-950">
                    {module.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-7 text-slate-600">
                    {module.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
