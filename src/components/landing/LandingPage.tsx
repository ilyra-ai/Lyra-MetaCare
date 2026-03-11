"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BrainCircuit,
  Heart,
  Activity,
  Watch,
  Target,
  Star,
  Shield,
  ArrowRight,
  ChevronDown,
  Sparkles,
  LineChart,
  Calendar,
  Moon,
  Sun,
  Menu,
  X,
  Zap,
  Users,
  Clock,
  TrendingUp,
  Smartphone,
  MessageCircle,
  CheckCircle2,
  Leaf,
  Waves,
  Eye,
  Fingerprint,
  Globe,
} from "lucide-react";

// ─── Intersection Observer Hook for Scroll Animations ────────────────────────

function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isInView };
}

// ─── Animated Counter Component ──────────────────────────────────────────────

function AnimatedCounter({
  end,
  suffix = "",
  prefix = "",
  duration = 2000,
}: {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const { ref, isInView } = useInView();

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

// ─── Section Wrapper with Animation ──────────────────────────────────────────

function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isInView
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Feature Data ────────────────────────────────────────────────────────────

const features = [
  {
    icon: BrainCircuit,
    title: "Inteligência Artificial Avançada",
    description:
      "Algoritmos de IA de última geração analisam seus dados de saúde em tempo real, identificando padrões e gerando insights personalizados para otimizar seu bem-estar.",
    gradient: "from-violet-500 to-purple-600",
    span: "md:col-span-2",
  },
  {
    icon: Heart,
    title: "Score de Longevidade",
    description:
      "Métrica exclusiva que avalia sua saúde holística combinando dados biométricos, hábitos de vida e indicadores de vitalidade em um score dinâmico.",
    gradient: "from-rose-500 to-pink-600",
    span: "",
  },
  {
    icon: Activity,
    title: "Monitoramento Contínuo",
    description:
      "Acompanhe seus sinais vitais, padrões de sono, variabilidade cardíaca e níveis de estresse com dashboards interativos em tempo real.",
    gradient: "from-cyan-500 to-blue-600",
    span: "",
  },
  {
    icon: Watch,
    title: "Integração com Wearables",
    description:
      "Conecte Apple Watch, Fitbit, Garmin e outros dispositivos para uma visão unificada e completa dos seus dados de saúde.",
    gradient: "from-emerald-500 to-teal-600",
    span: "md:col-span-2",
  },
  {
    icon: Target,
    title: "Planos Personalizados",
    description:
      "Receba protocolos de saúde e bem-estar gerados por IA, adaptados ao seu perfil biológico, objetivos pessoais e rotina diária.",
    gradient: "from-amber-500 to-orange-600",
    span: "",
  },
  {
    icon: Star,
    title: "Integração Astrológica",
    description:
      "Uma abordagem única que combina astronomia computacional com dados de saúde, revelando correlações entre ciclos cósmicos e seu bem-estar.",
    gradient: "from-indigo-500 to-violet-600",
    span: "",
  },
  {
    icon: MessageCircle,
    title: "Assistente IA Dedicado",
    description:
      "Converse com uma IA especializada em saúde e bem-estar, disponível 24/7 para orientações, esclarecimentos e suporte na sua jornada.",
    gradient: "from-sky-500 to-cyan-600",
    span: "md:col-span-2",
  },
];

const steps = [
  {
    number: "01",
    icon: Smartphone,
    title: "Crie sua Conta",
    description:
      "Registre-se e complete seu perfil de saúde com informações sobre seu estilo de vida, objetivos e histórico.",
  },
  {
    number: "02",
    icon: Watch,
    title: "Conecte seus Dispositivos",
    description:
      "Integre seus wearables e dispositivos de monitoramento para que a Lyra colete dados automaticamente.",
  },
  {
    number: "03",
    icon: BrainCircuit,
    title: "IA Analisa seus Dados",
    description:
      "Nossa inteligência artificial processa seus dados, identifica padrões e gera insights exclusivos para você.",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Evolua Continuamente",
    description:
      "Acompanhe sua evolução com dashboards detalhados, ajuste seus planos e alcance seus objetivos de longevidade.",
  },
];

const pillars = [
  {
    icon: Leaf,
    title: "Sabedoria Ancestral",
    description: "Práticas milenares validadas pela ciência moderna",
  },
  {
    icon: Zap,
    title: "Tecnologia de Ponta",
    description: "IA e machine learning para análises preditivas",
  },
  {
    icon: Eye,
    title: "Visão Holística",
    description: "Corpo, mente e espírito integrados",
  },
  {
    icon: Fingerprint,
    title: "Personalização Total",
    description: "Cada recomendação é única para você",
  },
];

// ─── Main Landing Page Component ─────────────────────────────────────────────

export function LandingPage() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  }, []);

  const navigateToLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  const isDark = mounted && resolvedTheme === "dark";

  // ─── Navbar ──────────────────────────────────────────────────────────────

  const Navbar = () => (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-glass dark:shadow-glass-dark"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
              <div className="relative bg-gradient-to-br from-primary to-purple-600 p-2 rounded-xl">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-purple-400">
                Lyra MetaCare
              </span>
              <span className="text-[10px] text-muted-foreground -mt-1 tracking-widest uppercase">
                Seu Bem-Estar Orquestrado
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Recursos", id: "features" },
              { label: "Como Funciona", id: "how-it-works" },
              { label: "Pilares", id: "pillars" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Alternar tema"
              >
                {isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            )}

            <Button
              onClick={navigateToLogin}
              variant="ghost"
              className="hidden sm:inline-flex text-sm"
            >
              Entrar
            </Button>
            <Button
              onClick={navigateToLogin}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 text-sm"
            >
              Começar Agora
            </Button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 space-y-1 bg-background/95 backdrop-blur-xl border-b border-border/50">
          {[
            { label: "Recursos", id: "features" },
            { label: "Como Funciona", id: "how-it-works" },
            { label: "Pilares", id: "pillars" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="block w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={navigateToLogin}
            className="block w-full text-left px-4 py-3 text-sm font-medium text-primary hover:bg-muted/50 rounded-lg transition-colors"
          >
            Entrar na Plataforma
          </button>
        </div>
      </div>
    </nav>
  );

  // ─── Hero Section ────────────────────────────────────────────────────────

  const HeroSection = () => (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection>
          <Badge
            variant="outline"
            className="mb-6 px-4 py-1.5 text-sm font-medium border-primary/30 bg-primary/5 text-primary"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Plataforma de Saúde Inteligente
          </Badge>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70">
              Seu Bem-Estar
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-accent">
              Orquestrado por IA
            </span>
          </h1>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10">
            Combinamos{" "}
            <span className="text-foreground font-medium">
              sabedoria ancestral
            </span>{" "}
            com{" "}
            <span className="text-foreground font-medium">
              inteligência artificial de última geração
            </span>{" "}
            para criar uma jornada personalizada de longevidade e bem-estar que
            se adapta continuamente a você.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={navigateToLogin}
              size="lg"
              className="h-12 px-8 text-base bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-xl shadow-primary/25 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Comece sua Jornada
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => scrollToSection("features")}
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base border-border/50 hover:bg-muted/50"
            >
              Explorar Recursos
              <ChevronDown className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </AnimatedSection>

        {/* Hero Visual - Abstract Dashboard Preview */}
        <AnimatedSection delay={500} className="mt-16 sm:mt-20">
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-accent/20 rounded-2xl blur-2xl opacity-60" />
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
              {/* Mock Dashboard Header */}
              <div className="flex items-center gap-2 px-6 py-4 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                    app.lyrametacare.com
                  </div>
                </div>
              </div>
              {/* Mock Dashboard Content */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      label: "Longevity Score",
                      value: "87",
                      color: "text-emerald-500",
                      icon: Heart,
                    },
                    {
                      label: "Readiness",
                      value: "92",
                      color: "text-primary",
                      icon: Zap,
                    },
                    {
                      label: "Passos",
                      value: "8.4k",
                      color: "text-accent",
                      icon: Activity,
                    },
                    {
                      label: "Sono",
                      value: "7h42",
                      color: "text-violet-500",
                      icon: Moon,
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="bg-muted/30 rounded-xl p-4 border border-border/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <metric.icon
                          className={`h-4 w-4 ${metric.color}`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {metric.label}
                        </span>
                      </div>
                      <span
                        className={`text-2xl font-bold ${metric.color}`}
                      >
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Chart Area Placeholder */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30 h-32 flex items-end gap-1.5 overflow-hidden">
                    {[40, 55, 35, 65, 50, 75, 60, 80, 70, 90, 65, 85].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-primary/60 to-primary/20 rounded-t-sm transition-all duration-500"
                          style={{
                            height: `${h}%`,
                            animationDelay: `${i * 100}ms`,
                          }}
                        />
                      )
                    )}
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30 h-32 flex items-center justify-center">
                    <div className="relative w-20 h-20">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="3"
                          strokeDasharray="75 25"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="11"
                          fill="none"
                          stroke="hsl(var(--accent))"
                          strokeWidth="3"
                          strokeDasharray="60 40"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-foreground">87%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Scroll Indicator */}
        <div className="mt-12 flex justify-center animate-bounce">
          <ChevronDown className="h-6 w-6 text-muted-foreground/50" />
        </div>
      </div>
    </section>
  );

  // ─── Stats Bar ───────────────────────────────────────────────────────────

  const StatsBar = () => (
    <section className="relative py-16 border-y border-border/50 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            {
              value: 12,
              suffix: "+",
              label: "Métricas de Saúde Monitoradas",
              icon: LineChart,
            },
            {
              value: 24,
              suffix: "/7",
              label: "Monitoramento Contínuo",
              icon: Clock,
            },
            {
              value: 6,
              suffix: "+",
              label: "Dispositivos Compatíveis",
              icon: Watch,
            },
            {
              value: 100,
              suffix: "%",
              label: "Dados Protegidos e Criptografados",
              icon: Shield,
            },
          ].map((stat, index) => (
            <AnimatedSection
              key={stat.label}
              delay={index * 100}
              className="text-center"
            >
              <div className="flex justify-center mb-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );

  // ─── Features Bento Grid ─────────────────────────────────────────────────

  const FeaturesSection = () => (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-1.5 text-sm font-medium border-accent/30 bg-accent/5 text-accent"
          >
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            Recursos Premium
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Tecnologia que Cuida de{" "}
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Você
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Cada recurso foi projetado para oferecer uma experiência completa de
            monitoramento, análise e orientação personalizada para sua saúde.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <AnimatedSection
              key={feature.title}
              delay={index * 80}
              className={feature.span}
            >
              <Card className="group relative h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                {/* Gradient Accent */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );

  // ─── How It Works ────────────────────────────────────────────────────────

  const HowItWorksSection = () => (
    <section
      id="how-it-works"
      className="relative py-24 sm:py-32 bg-muted/30 border-y border-border/50"
    >
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-1.5 text-sm font-medium border-primary/30 bg-primary/5 text-primary"
          >
            <Globe className="h-3.5 w-3.5 mr-1.5" />
            Simples e Intuitivo
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Como a Lyra{" "}
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Funciona
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Em poucos passos, você terá acesso a uma plataforma completa de
            gestão de saúde e bem-estar movida por inteligência artificial.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <AnimatedSection key={step.number} delay={index * 120}>
              <div className="relative group">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-40px)] h-[2px] bg-gradient-to-r from-primary/30 to-transparent" />
                )}

                <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8 text-center hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                  {/* Step Number */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white text-xl font-bold mb-5 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="h-7 w-7" />
                  </div>

                  <div className="text-xs font-bold text-primary/60 tracking-widest uppercase mb-2">
                    Passo {step.number}
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );

  // ─── Pillars Section ─────────────────────────────────────────────────────

  const PillarsSection = () => (
    <section id="pillars" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <AnimatedSection>
            <Badge
              variant="outline"
              className="mb-4 px-4 py-1.5 text-sm font-medium border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
            >
              <Waves className="h-3.5 w-3.5 mr-1.5" />
              Nossa Filosofia
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Onde a Tradição
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">
                Encontra a Inovação
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              A Lyra MetaCare nasceu da convicção de que o verdadeiro bem-estar
              emerge da integração entre o conhecimento ancestral validado por
              milênios e as tecnologias mais avançadas da atualidade. Nossa
              plataforma não substitui a sabedoria — ela a amplifica com dados e
              inteligência artificial.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pillars.map((pillar, index) => (
                <AnimatedSection key={pillar.title} delay={index * 100}>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/20 transition-colors">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <pillar.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">
                        {pillar.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>

          {/* Right Visual */}
          <AnimatedSection delay={200}>
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-r from-primary/10 via-purple-500/10 to-accent/10 rounded-3xl blur-3xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {[
                  {
                    icon: Heart,
                    label: "Vitalidade",
                    value: "Excelente",
                    color: "from-rose-500 to-pink-500",
                    bg: "bg-rose-500/10",
                  },
                  {
                    icon: Activity,
                    label: "HRV",
                    value: "68ms",
                    color: "from-cyan-500 to-blue-500",
                    bg: "bg-cyan-500/10",
                  },
                  {
                    icon: Moon,
                    label: "Qualidade do Sono",
                    value: "94%",
                    color: "from-violet-500 to-purple-500",
                    bg: "bg-violet-500/10",
                  },
                  {
                    icon: Zap,
                    label: "Energia",
                    value: "Alta",
                    color: "from-amber-500 to-orange-500",
                    bg: "bg-amber-500/10",
                  },
                ].map((card, index) => (
                  <div
                    key={card.label}
                    className={`${
                      index % 2 === 1 ? "mt-8" : ""
                    } bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/20 transition-all duration-500 hover:shadow-lg`}
                  >
                    <div className={`p-2.5 rounded-xl ${card.bg} w-fit mb-4`}>
                      <card.icon
                        className={`h-5 w-5 bg-clip-text text-transparent bg-gradient-to-r ${card.color}`}
                        style={{
                          color: `var(--tw-gradient-from)`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {card.label}
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );

  // ─── Security & Privacy Section ──────────────────────────────────────────

  const SecuritySection = () => (
    <section className="relative py-24 sm:py-32 bg-muted/30 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-1.5 text-sm font-medium border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
          >
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Segurança e Privacidade
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Seus Dados,{" "}
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">
              Sua Privacidade
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Segurança não é um recurso — é a base de tudo que construímos.
            Seus dados de saúde são tratados com o mais alto nível de proteção.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: "Criptografia de Ponta a Ponta",
              description:
                "Todos os dados são criptografados em trânsito e em repouso utilizando protocolos de segurança de nível bancário.",
            },
            {
              icon: Fingerprint,
              title: "Autenticação Multifator",
              description:
                "Login seguro com OAuth 2.0, autenticação via Google e Apple, com suporte a verificação em duas etapas.",
            },
            {
              icon: Eye,
              title: "Controle Total de Acesso",
              description:
                "Row-Level Security (RLS) garante que apenas você tenha acesso aos seus dados. Nenhum terceiro pode visualizá-los.",
            },
          ].map((item, index) => (
            <AnimatedSection key={item.title} delay={index * 100}>
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-500 hover:shadow-lg">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 mb-5">
                    <item.icon className="h-7 w-7 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );

  // ─── Final CTA Section ───────────────────────────────────────────────────

  const CTASection = () => (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection>
          <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-8">
            <BrainCircuit className="h-10 w-10 text-primary" />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Comece Hoje sua Jornada
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-accent">
              Rumo à Longevidade
            </span>
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <p className="max-w-xl mx-auto text-lg text-muted-foreground leading-relaxed mb-10">
            Junte-se à plataforma que está redefinindo o cuidado com a saúde.
            Sua jornada personalizada de bem-estar começa com um clique.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={navigateToLogin}
              size="lg"
              className="h-14 px-10 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-xl shadow-primary/25 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Criar Conta Gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={400}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {[
              "Sem cartão de crédito",
              "Configuração em minutos",
              "Dados protegidos",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );

  // ─── Footer ──────────────────────────────────────────────────────────────

  const Footer = () => (
    <footer className="relative border-t border-border/50 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-gradient-to-br from-primary to-purple-600 p-2 rounded-xl">
                <BrainCircuit className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-purple-400">
                Lyra MetaCare
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
              Plataforma de saúde e bem-estar que combina sabedoria ancestral com
              inteligência artificial para uma jornada personalizada de
              longevidade.
            </p>
            <p className="text-xs text-muted-foreground/60">
              &copy; {new Date().getFullYear()} Lyra MetaCare. Todos os direitos
              reservados.
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4">
              Plataforma
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Recursos", action: () => scrollToSection("features") },
                {
                  label: "Como Funciona",
                  action: () => scrollToSection("how-it-works"),
                },
                { label: "Pilares", action: () => scrollToSection("pillars") },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Access Column */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4">Acesso</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={navigateToLogin}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Entrar
                </button>
              </li>
              <li>
                <button
                  onClick={navigateToLogin}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Criar Conta
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/60">
            Desenvolvido com dedicação para o seu bem-estar
          </p>
          <a
            href="https://www.dyad.sh/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Made with iLyra
          </a>
        </div>
      </div>
    </footer>
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <HowItWorksSection />
      <PillarsSection />
      <SecuritySection />
      <CTASection />
      <Footer />
    </div>
  );
}
