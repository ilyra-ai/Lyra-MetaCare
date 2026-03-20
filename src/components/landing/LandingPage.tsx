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
  Shield,
  Sparkles,
  Star,
  Target,
  Zap,
  type LucideIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type FeatureCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: string;
  span?: string;
};

type RitualStep = {
  index: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

type TrustSignal = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type CommercialPlan = {
  key: 'free' | 'meta' | 'care';
  name: string;
  tagline: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  highlight: string;
  accent: string;
  features: string[];
  featured?: boolean;
};

type FAQItem = {
  question: string;
  answer: string;
};

const featureCards: FeatureCard[] = [
  {
    icon: Brain,
    title: 'IA gentil, presente e contextual',
    description:
      'A Lyra cruza sinais do seu perfil, da sua rotina e dos seus fluxos de energia para sugerir proximos passos com delicadeza, sem ficar invasiva.',
    tone: 'from-primary/16 via-primary/8 to-white',
    span: 'lg:col-span-2',
  },
  {
    icon: Globe,
    title: 'Astrologia vedica com sensibilidade contemporanea',
    description:
      'Transitos, ciclos e leitura simbolica entram como contexto vivo da experiencia, com leveza visual e linguagem clara.',
    tone: 'from-cosmic/16 via-cosmic/8 to-white',
  },
  {
    icon: Activity,
    title: 'Sinais do corpo em uma leitura carinhosa',
    description:
      'Sono, energia, ritmo, historico e metas passam a conversar na mesma interface, com menos friccao mental e mais conforto visual.',
    tone: 'from-info/16 via-info/8 to-white',
  },
  {
    icon: Calendar,
    title: 'Agenda guiada para uma rotina mais leve',
    description:
      'Agendamentos, rituais, checkpoints e acompanhamento ficam em uma trilha suave, clara e gostosa de acompanhar no dia a dia.',
    tone: 'from-golden/18 via-golden/8 to-white',
  },
  {
    icon: Target,
    title: 'Planos personalizados com profundidade real',
    description:
      'Cada assinatura libera profundidade real de IA, monitoramento, metas e automacoes, sem prometer mais do que o produto entrega.',
    tone: 'from-accent/16 via-accent/8 to-white',
  },
  {
    icon: Shield,
    title: 'Privacidade, estrutura e confianca',
    description:
      'A plataforma foi desenhada com auth local, matriz de capacidades, billing real e base preparada para crescer sem perder consistencia.',
    tone: 'from-primary/14 via-cosmic/10 to-white',
    span: 'lg:col-span-2',
  },
];

const ritualSteps: RitualStep[] = [
  {
    index: '01',
    title: 'Abra o seu mapa de contexto',
    description:
      'Cadastre seu perfil, seus dados base e seus marcadores de rotina para a Lyra montar uma leitura inicial acolhedora e util.',
    icon: Sparkles,
  },
  {
    index: '02',
    title: 'Conecte sinais e preferencias',
    description:
      'Wearables, metas e historico entram como camadas reais da sua experiencia e alimentam a orquestracao com mais precisao.',
    icon: HeartPulse,
  },
  {
    index: '03',
    title: 'Receba orientacao com IA',
    description:
      'O plano, o chat e os proximos passos passam a refletir seu momento atual com linguagem clara, bonita e facil de acompanhar.',
    icon: Zap,
  },
  {
    index: '04',
    title: 'Volte sempre para recalibrar',
    description:
      'A jornada nao e estatica: ela se ajusta conforme seus sinais, seus ciclos e o nivel do plano ativo, sempre com suavidade visual.',
    icon: Star,
  },
];

const trustSignals: TrustSignal[] = [
  {
    title: 'Catalogo comercial real',
    description:
      'A landing espelha os planos publicados pela propria base do projeto: Free, Meta e Care.',
    icon: Check,
  },
  {
    title: 'Camada de IA ja integrada no produto',
    description:
      'O app possui rotas reais para plano gerado por IA, chat assistido e leituras contextuais orientadas por perfil.',
    icon: Brain,
  },
  {
    title: 'Arquitetura preparada para operacao',
    description:
      'Auth local, billing Stripe, MySQL, matriz de entitlements e App Router ja fazem parte da estrutura funcional do produto.',
    icon: Shield,
  },
  {
    title: 'Estetica clara, doce e simbolica',
    description:
      'A identidade visual foi direcionada para astrologia moderna luminosa, com mais acolhimento visual e sem pesar o ambiente.',
    icon: Sparkles,
  },
];

const commercialPlans: CommercialPlan[] = [
  {
    key: 'free',
    name: 'Free',
    tagline: 'Base confiavel para comecar com clareza.',
    description:
      'Acesso essencial ao ecossistema Lyra MetaCare, com visao inicial dos indicadores, perfil e automacoes fundamentais.',
    monthlyPrice: 0,
    annualPrice: 0,
    highlight: 'Sem custo para comecar',
    accent: 'from-primary to-emerald-400',
    features: [
      'Entrada no ecossistema Lyra',
      'Visao inicial do dashboard',
      'Perfil e configuracao basica',
      'Base segura para onboarding real',
    ],
  },
  {
    key: 'meta',
    name: 'Meta',
    tagline: 'Mais profundidade, dados e automacao orientada por IA.',
    description:
      'Plano intermediario com capacidades expandidas de IA, conexao de dispositivos e observabilidade operacional para rotina continua.',
    monthlyPrice: 79.9,
    annualPrice: 790,
    highlight: 'Mais inteligencia e automacao',
    accent: 'from-primary via-info to-cosmic',
    features: [
      'Mais profundidade de IA na rotina',
      'Conexao com dispositivos e sinais',
      'Observabilidade mais rica do uso',
      'Experiencia continua e escalavel',
    ],
    featured: true,
  },
  {
    key: 'care',
    name: 'Care',
    tagline: 'A experiencia mais completa e integral do produto.',
    description:
      'Plano premium com a matriz completa de capacidades, maxima profundidade de acompanhamento e governanca plena da experiencia.',
    monthlyPrice: 249.9,
    annualPrice: 2490,
    highlight: 'Experiencia integral Lyra',
    accent: 'from-accent via-golden to-cosmic',
    features: [
      'Matriz completa de capacidades',
      'Maior profundidade de acompanhamento',
      'Camada premium de operacao e controle',
      'Jornada mais ampla dentro do produto',
    ],
  },
];

const faqItems: FAQItem[] = [
  {
    question: 'A Lyra e um app de astrologia ou um app com IA?',
    answer:
      'Ela une as duas camadas. A astrologia vedica entra como contexto simbolico e interpretativo, enquanto a IA organiza recomendacoes, leitura de jornada e proximos passos.',
  },
  {
    question: 'O visual claro vai continuar sendo prioridade?',
    answer:
      'Sim. A direcao principal desta entrega e tema claro, etereo, luminoso e acolhedor. O sistema continua preparado para dark mode futuro, mas sem tirar o foco da experiencia clara.',
  },
  {
    question: 'Os planos mostrados aqui sao reais?',
    answer:
      'Sim. Free, Meta e Care seguem o catalogo semeado na base do projeto e representam a estrutura comercial ja prevista na aplicacao.',
  },
  {
    question: 'A IA depende de um fluxo externo escondido?',
    answer:
      'Nao. O produto ja possui rotas e motores internos para camadas de plano, leitura contextual e assistencia, com integracao real ao restante da arquitetura.',
  },
  {
    question: 'A landing promete recursos que nao existem?',
    answer:
      'Nao. Esta versao foi ajustada para comunicar apenas capacidades reais ja presentes na arquitetura e no escopo do produto.',
  },
];

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background)),#ffffff_42%,#fbfbff_100%)] text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-white/78 backdrop-blur-2xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 rounded-full px-1 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

          <nav className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" asChild>
              <a href="#recursos">Recursos</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#ritual">Fluxo</a>
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
            <Button onClick={() => router.push('/login')}>Comecar agora</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="cosmic-orb left-[-8rem] top-0 h-72 w-72 bg-primary/18" />
            <div className="cosmic-orb right-[-4rem] top-20 h-80 w-80 bg-cosmic/16" />
            <div className="cosmic-orb bottom-10 left-1/3 h-64 w-64 bg-accent/10" />
          </div>

          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="relative z-10">
              <Badge className="rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary shadow-sm">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                astrologia moderna, IA e um tema clarinho para respirar
              </Badge>

              <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-[4.5rem]">
                Um cantinho cosmico para o seu
                <span className="block text-gradient-aurora">
                  bem-estar ficar mais leve,
                </span>
                lindo e inteligente.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                A Lyra MetaCare transforma sinais, ciclos e contexto em uma
                experiencia clara e acolhedora: astrologia vedica contemporanea,
                IA aplicada com criterio e um visual etereo pensado para
                acompanhar voce com suavidade no dia a dia.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="xl" onClick={() => router.push('/login')}>
                  Abrir minha jornada
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="xl" variant="secondary" asChild>
                  <a href="#recursos">
                    Explorar a experiencia
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  'tema claro como linguagem principal',
                  'IA e contexto astral na mesma camada',
                  'uma experiencia mais gentil para voltar sempre',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[24px] border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-xl"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <div className="glass-card overflow-hidden rounded-[32px] p-4 sm:p-5">
                <div className="rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,247,255,0.92))] p-5 shadow-[0_24px_80px_-40px_rgba(22,21,48,0.35)]">
                  <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        painel luminoso
                      </p>
                      <p className="mt-2 font-display text-2xl font-semibold text-foreground">
                        Mapa vivo do seu momento
                      </p>
                    </div>
                    <Badge className="rounded-full border-cosmic/20 bg-cosmic/10 px-3 py-1 text-cosmic">
                      IA + simbolismo
                    </Badge>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-primary/12 bg-[linear-gradient(145deg,rgba(49,155,142,0.12),rgba(255,255,255,0.95))] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                        leitura atual
                      </p>
                      <p className="mt-3 font-display text-2xl font-semibold text-foreground">
                        Energia em alinhamento
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Corpo, foco e ritmo em conversa com sua agenda e com o
                        contexto do dia, sem sobrecarregar sua leitura.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-cosmic/12 bg-[linear-gradient(145deg,rgba(139,92,246,0.12),rgba(255,255,255,0.95))] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cosmic/80">
                        camada astral
                      </p>
                      <p className="mt-3 font-display text-2xl font-semibold text-foreground">
                        Janela simbolica ativa
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        A interface transforma ciclos e transitos em contexto
                        legivel, delicado e facil de sentir.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-accent/12 bg-[linear-gradient(145deg,rgba(240,101,67,0.12),rgba(255,255,255,0.95))] p-5 sm:col-span-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="rounded-full border-accent/20 bg-accent/10 px-3 py-1 text-accent">
                          plano guiado
                        </Badge>
                        <Badge className="rounded-full border-border bg-white px-3 py-1 text-muted-foreground">
                          sem atmosfera escura
                        </Badge>
                      </div>
                      <p className="mt-4 font-display text-2xl font-semibold text-foreground">
                        Uma estetica clara, fofa e sofisticada para um produto
                        profundo.
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        A experiencia foi redesenhada para parecer premium,
                        delicada, intuitiva, acolhedora e tecnologica ao mesmo
                        tempo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <Badge className="rounded-full border-cosmic/20 bg-cosmic/10 px-4 py-1.5 text-cosmic">
                Arquitetura da experiencia
              </Badge>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Astrologia moderna, camadas claras e uma presenca mais afetuosa.
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">
                O desenho da Lyra agora comunica exatamente o que o produto e:
                um ecossistema de bem-estar, leitura simbolica e suporte
                inteligente, com uma atmosfera mais calorosa e convidativa.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {featureCards.map((feature) => (
                <article
                  key={feature.title}
                  className={`group rounded-[28px] border border-border/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(255,255,255,0.72))] p-6 shadow-[0_18px_48px_-36px_rgba(22,21,48,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-32px_rgba(22,21,48,0.28)] ${feature.span ?? ''}`}
                >
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.tone} text-foreground shadow-sm`}
                  >
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,247,255,0.96))] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 lg:grid-cols-4">
              {trustSignals.map((signal) => (
                <article
                  key={signal.title}
                  className="rounded-[24px] border border-border/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
                    <signal.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-foreground">
                    {signal.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {signal.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="ritual" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <Badge className="rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary">
                Fluxo de entrada
              </Badge>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Uma jornada guiada para sincronizar sinais, simbolos e cuidado.
              </h2>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-4">
              {ritualSteps.map((step) => (
                <article
                  key={step.index}
                  className="relative rounded-[28px] border border-border/80 bg-white/88 p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-muted-foreground">
                      {step.index}
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
                      <step.icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="planos"
          className="border-y border-border/70 bg-[linear-gradient(180deg,#ffffff,rgba(249,248,252,0.96))] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <Badge className="rounded-full border-golden/20 bg-golden/10 px-4 py-1.5 text-golden">
                Catalogo publicado
              </Badge>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Planos reais do produto, com uma apresentacao mais bonita e
                clara.
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">
                Estes cards seguem a estrutura comercial semeada no proprio
                projeto. A camada visual foi elevada, mas o catalogo continua
                fiel ao que a aplicacao ja reconhece.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {commercialPlans.map((plan) => (
                <article
                  key={plan.key}
                  className={`relative overflow-hidden rounded-[30px] border bg-white/92 p-6 shadow-[0_18px_48px_-36px_rgba(22,21,48,0.35)] ${
                    plan.featured
                      ? 'border-primary/30 ring-1 ring-primary/10'
                      : 'border-border/80'
                  }`}
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${plan.accent}`}
                  />
                  {plan.featured ? (
                    <Badge className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-primary">
                      plano em destaque
                    </Badge>
                  ) : null}

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                      {plan.highlight}
                    </p>
                    <h3 className="mt-3 font-display text-3xl font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {plan.tagline}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mt-6 rounded-[24px] border border-border/70 bg-muted/45 p-5">
                    <div className="flex items-end gap-2">
                      <span className="font-display text-4xl font-bold text-foreground">
                        {formatBRL(plan.monthlyPrice)}
                      </span>
                      <span className="pb-1 text-sm text-muted-foreground">
                        /mes
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Anual: {formatBRL(plan.annualPrice)}
                    </p>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-foreground"
                      >
                        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/12 text-primary">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="leading-6">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="mt-8 w-full"
                    variant={plan.featured ? 'default' : 'secondary'}
                    onClick={() => router.push('/login')}
                  >
                    Entrar para ver minha jornada
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <Badge className="rounded-full border-accent/20 bg-accent/10 px-4 py-1.5 text-accent">
                FAQ
              </Badge>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Perguntas importantes antes de entrar no seu novo cantinho Lyra.
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                Esta secao foi escrita para esclarecer a proposta real do
                produto e alinhar expectativa, arquitetura e identidade visual.
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

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] border border-border/80 bg-[linear-gradient(135deg,rgba(49,155,142,0.12),rgba(139,92,246,0.16),rgba(240,101,67,0.12))] p-8 shadow-[0_26px_80px_-42px_rgba(22,21,48,0.35)] sm:p-10 lg:p-12">
            <div className="max-w-3xl">
              <Badge className="rounded-full border-white/70 bg-white/75 px-4 py-1.5 text-foreground">
                Orbita final
              </Badge>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Entre em uma experiencia clara, astral, acolhedora e realmente
                conectada ao produto.
              </h2>
              <p className="mt-4 text-base leading-8 text-foreground/80">
                A proposta aqui e simbolismo contemporaneo, delicadeza visual,
                inteligencia aplicada e uma interface clara o suficiente para
                convidar voce a voltar todos os dias com prazer.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="xl" onClick={() => router.push('/login')}>
                  Abrir Lyra agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="xl" variant="secondary" asChild>
                  <a href="#planos">Ver catalogo comercial</a>
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

          <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            <a
              href="#recursos"
              className="transition-colors hover:text-foreground"
            >
              Recursos
            </a>
            <a
              href="#ritual"
              className="transition-colors hover:text-foreground"
            >
              Fluxo
            </a>
            <a
              href="#planos"
              className="transition-colors hover:text-foreground"
            >
              Planos
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            Feito com intencao pela iLyra AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
