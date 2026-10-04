'use client';

/**
 * VedicDashboard — Lyra MetaCare
 *
 * Componente visual premium que renderiza os 4 motores védicos-quânticos:
 * - Dosha Ayurvédico Dinâmico
 * - Índice de Coerência Quântica
 * - Pancha Koshas (Vedanta)
 * - Alinhamento de Chakras
 * - Índice Pránico (Energia Vital)
 */

import {
  Atom,
  Brain,
  Flame,
  Leaf,
  Moon,
  Sparkles,
  Sun,
  Wind,
  Zap,
  Layers,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { useVedicInsights } from '@/hooks/use-vedic-insights';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const DOSHA_CONFIG = {
  vata: {
    icon: Wind,
    label: 'Vata',
    subtitle: 'Ar + Éter',
    gradient: 'from-info/15 to-cosmic/10',
    textColor: 'text-info',
    bgColor: 'bg-info/10',
  },
  pitta: {
    icon: Flame,
    label: 'Pitta',
    subtitle: 'Fogo + Água',
    gradient: 'from-accent/15 to-warning/10',
    textColor: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  kapha: {
    icon: Leaf,
    label: 'Kapha',
    subtitle: 'Terra + Água',
    gradient: 'from-success/15 to-primary/10',
    textColor: 'text-success',
    bgColor: 'bg-success/10',
  },
};

const COHERENCE_CONFIG = {
  dissonância: { badge: 'destructive' as const, icon: '🔴' },
  transição: { badge: 'warning' as const, icon: '🟡' },
  harmonia: { badge: 'success' as const, icon: '🟢' },
  'coerência plena': { badge: 'default' as const, icon: '💎' },
};

const PRANA_CONFIG = {
  desvitalizado: { badge: 'destructive' as const, icon: '🔋' },
  'em recuperação': { badge: 'warning' as const, icon: '⚡' },
  vital: { badge: 'success' as const, icon: '🌟' },
  radiante: { badge: 'default' as const, icon: '☀️' },
};

function LoadingVedicDashboard() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Skeleton className="h-72" />
      <Skeleton className="h-72" />
      <Skeleton className="h-80 xl:col-span-2" />
      <Skeleton className="h-64 xl:col-span-2" />
    </div>
  );
}

interface VedicDashboardProps {
  featureEnabled?: boolean;
}

export function VedicDashboard({ featureEnabled = true }: VedicDashboardProps) {
  const { dosha, coherence, chakras, prana, koshas, history, loading } =
    useVedicInsights(featureEnabled);

  if (loading) return <LoadingVedicDashboard />;

  const doshaConfig = DOSHA_CONFIG[dosha.dominant];
  const DoshaIcon = doshaConfig.icon;
  const coherenceConfig = COHERENCE_CONFIG[coherence.level];
  const pranaConfig = PRANA_CONFIG[prana.level];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-2xl font-bold tracking-tight text-gradient-hero">
          🕉️ Insights Védicos-Quânticos
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          Análise integrativa em tempo real — fusão de biomarcadores
          fisiológicos com astrologia védica, ayurveda e princípios quânticos.
        </p>
      </div>

      {history && history.length > 0 && (
        <Card className="border-border/60 bg-white/40 backdrop-blur-md mb-4 p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Tendência
              Quântica-Védica (7 Dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-48 w-full p-0 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={history}
                margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorIcq" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--cosmic))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--cosmic))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorPrana" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--success))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--success))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid hsl(var(--border))',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                  labelStyle={{
                    fontSize: '10px',
                    color: 'hsl(var(--muted-foreground))',
                    marginBottom: '4px',
                  }}
                />
                <Area
                  type="monotone"
                  name="ICQ"
                  dataKey="icq"
                  stroke="hsl(var(--cosmic))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIcq)"
                />
                <Area
                  type="monotone"
                  name="Prana"
                  dataKey="prana"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrana)"
                />
                <Area
                  type="monotone"
                  name="Kosha"
                  dataKey="kosha"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Card Dosha Ayurvédico */}
        <Card
          className={cn(
            'overflow-hidden border-border/70 bg-linear-to-br',
            doshaConfig.gradient
          )}
        >
          <CardHeader className="gap-4 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Badge variant="default">Dosha dinâmico</Badge>
                <CardTitle className="text-xl">
                  {doshaConfig.label} Dominante
                </CardTitle>
                <CardDescription>{doshaConfig.subtitle}</CardDescription>
              </div>
              <div
                className={cn(
                  'flex size-12 items-center justify-center rounded-2xl shadow-sm',
                  doshaConfig.bgColor,
                  doshaConfig.textColor
                )}
              >
                <DoshaIcon className="h-6 w-6" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Prakriti atual: {dosha.prakritiLabel}
            </p>
            <div className="grid gap-3">
              {(['vata', 'pitta', 'kapha'] as const).map((d) => (
                <div key={d} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize text-foreground">{d}</span>
                    <span className="font-mono text-muted-foreground">
                      {dosha.percentages[d]}%
                    </span>
                  </div>
                  <Progress value={dosha.percentages[d]} className="h-2" />
                </div>
              ))}
            </div>
            {dosha.astroInfluence ? (
              <div className="rounded-2xl border border-border/70 bg-white/60 p-3 backdrop-blur-xs">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Moon className="h-3.5 w-3.5" />
                  {dosha.astroInfluence}
                </p>
              </div>
            ) : null}
            <div className="rounded-2xl border border-border/70 bg-white/60 p-3 backdrop-blur-xs">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Nutrição recomendada
              </p>
              <p className="mt-1.5 text-sm leading-6 text-foreground">
                {dosha.recommendations.nutrition}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card Coerência Quântica */}
        <Card className="overflow-hidden border-cosmic/12 bg-[radial-gradient(circle_at_top_right,hsl(var(--cosmic)/0.1)_0%,rgba(255,255,255,0.96)_36%)]">
          <CardHeader className="gap-4 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Badge variant={coherenceConfig.badge}>
                  {coherenceConfig.icon} Coerência Quântica
                </Badge>
                <CardTitle className="text-xl">
                  ICQ: {coherence.index}/100
                </CardTitle>
                <CardDescription className="capitalize">
                  {coherence.level}
                </CardDescription>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-cosmic/12 text-cosmic shadow-sm">
                <Atom className="h-6 w-6" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {coherence.description}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(coherence.components).map(([key, value]) => {
                const labels: Record<string, string> = {
                  bioResonance: 'Bio-Ressonância',
                  cosmicAlignment: 'Alinhamento Cósmico',
                  consciousnessDepth: 'Profundidade',
                  rhythmicCoherence: 'Coerência Rítmica',
                };
                return (
                  <div
                    key={key}
                    className="rounded-xl border border-border/60 bg-white/60 p-3"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {labels[key]}
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold text-foreground">
                      {value}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="rounded-2xl border border-cosmic/10 bg-cosmic/5 p-3">
              <p className="flex items-center gap-2 text-xs text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-cosmic" />
                {coherence.recommendation}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card Pancha Koshas (Vedanta) */}
        <Card className="overflow-hidden border-border/70 xl:col-span-2">
          <CardHeader className="gap-4 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Badge
                  variant="outline"
                  className="text-cosmic border-cosmic/25 bg-cosmic-light"
                >
                  Vedanta & Dharma
                </Badge>
                <CardTitle className="text-xl">
                  Pancha Koshas: {koshas.overallScore}/100
                </CardTitle>
                <CardDescription>{koshas.overallStatus}</CardDescription>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-cosmic/10 text-cosmic shadow-sm">
                <Layers className="h-6 w-6" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {koshas.dharmaAlignment}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {koshas.koshas.map((k) => (
                <div
                  key={k.name}
                  className="flex flex-col gap-2 rounded-xl border border-border/60 bg-white/60 p-3 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {k.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {k.sanskrit}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-cosmic">
                      {k.score}
                    </span>
                  </div>
                  <Progress
                    value={k.score}
                    className="h-1.5 [&>div]:bg-cosmic"
                  />
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground mt-1">
                    {k.translation} -{' '}
                    <span className="text-foreground">{k.status}</span>
                  </p>
                  <p className="text-[10px] leading-snug text-muted-foreground mt-0.5 line-clamp-2">
                    {k.insight}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card Chakras */}
        <Card className="overflow-hidden border-border/70 xl:col-span-2">
          <CardHeader className="gap-4 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Badge variant="default">Alinhamento energético</Badge>
                <CardTitle className="text-xl">
                  Chakras: {chakras.overallScore}/100
                </CardTitle>
                <CardDescription>{chakras.overallLabel}</CardDescription>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-cosmic/10 text-cosmic shadow-sm">
                <Sun className="h-6 w-6" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {chakras.chakras.map((c) => (
                <div
                  key={c.name}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-white/60 p-4 text-center transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div
                    className="flex size-10 items-center justify-center rounded-full text-white text-sm font-bold"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.score}
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {c.name}
                  </p>
                  <p className="text-[10px] capitalize text-muted-foreground">
                    {c.status}
                  </p>
                  <p className="text-[10px] leading-4 text-muted-foreground">
                    {c.insight.split('.')[0]}.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card Índice Pránico */}
        <Card className="overflow-hidden border-success/12 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--success)/0.1)_0%,rgba(255,255,255,0.96)_40%)] xl:col-span-2">
          <CardHeader className="gap-4 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Badge variant={pranaConfig.badge}>
                  {pranaConfig.icon} Energia Vital
                </Badge>
                <CardTitle className="text-xl">
                  Índice Pránico: {prana.index}/100
                </CardTitle>
                <CardDescription className="capitalize">
                  {prana.level}
                </CardDescription>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-success/12 text-success shadow-sm">
                <Zap className="h-6 w-6" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {prana.description}
            </p>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {prana.vayus.map((v) => (
                <div
                  key={v.name}
                  className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-white/60 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">
                      {v.name}
                    </p>
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {v.score}
                    </span>
                  </div>
                  <Progress value={v.score} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground">
                    {v.domain}
                  </p>
                </div>
              ))}
            </div>
            {prana.lunarInfluence ? (
              <div className="rounded-2xl border border-success/10 bg-success/5 p-3">
                <p className="flex items-center gap-2 text-xs text-foreground">
                  <Brain className="h-3.5 w-3.5 text-success" />
                  {prana.lunarInfluence}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
