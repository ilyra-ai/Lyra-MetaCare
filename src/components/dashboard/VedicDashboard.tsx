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
    textColor: 'text-info',
    bgColor: 'bg-info-light',
  },
  pitta: {
    icon: Flame,
    label: 'Pitta',
    subtitle: 'Fogo + Água',
    textColor: 'text-warning',
    bgColor: 'bg-warning-light',
  },
  kapha: {
    icon: Leaf,
    label: 'Kapha',
    subtitle: 'Terra + Água',
    textColor: 'text-success',
    bgColor: 'bg-success-light',
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
        <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground">
          <span aria-hidden="true">🕉️ </span>Insights Védicos-Quânticos
        </h2>
        <p className="max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          Análise integrativa em tempo real — fusão de biomarcadores
          fisiológicos com astrologia védica, ayurveda e princípios quânticos.
        </p>
      </div>

      {history && history.length > 0 && (
        <Card className="min-w-0">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Sparkles aria-hidden="true" className="size-4 text-cosmic" />
              Tendência Quântica-Védica (7 Dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56 w-full px-5 pb-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={history}
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid hsl(var(--border))',
                    backgroundColor: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                  labelStyle={{
                    fontSize: '12px',
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
                  fill="hsl(var(--cosmic))"
                  fillOpacity={0.08}
                />
                <Area
                  type="monotone"
                  name="Prana"
                  dataKey="prana"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  fill="hsl(var(--success))"
                  fillOpacity={0.08}
                />
                <Area
                  type="monotone"
                  name="Kosha"
                  dataKey="kosha"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Card Dosha Ayurvédico */}
        <Card className="min-w-0">
          <CardHeader className="gap-4 p-5 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-2">
                <Badge variant="cosmic" className="self-start">
                  Dosha dinâmico
                </Badge>
                <CardTitle>{doshaConfig.label} Dominante</CardTitle>
                <CardDescription>{doshaConfig.subtitle}</CardDescription>
              </div>
              <div
                aria-hidden="true"
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full',
                  doshaConfig.bgColor,
                  doshaConfig.textColor
                )}
              >
                <DoshaIcon className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-5 pb-5">
            <p className="text-sm font-medium text-muted-foreground">
              Prakriti atual: {dosha.prakritiLabel}
            </p>
            <div className="grid gap-3">
              {(['vata', 'pitta', 'kapha'] as const).map((d) => (
                <div key={d} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize text-foreground">{d}</span>
                    <span className="font-display font-semibold text-foreground">
                      {dosha.percentages[d]}%
                    </span>
                  </div>
                  <Progress
                    aria-label={`Dosha ${d}`}
                    value={dosha.percentages[d]}
                    tone="astral"
                    className="h-1.5"
                  />
                </div>
              ))}
            </div>
            {dosha.astroInfluence ? (
              <div className="rounded-md border border-border bg-background p-4">
                <p className="flex items-start gap-2 text-sm leading-6 text-foreground/80">
                  <Moon
                    aria-hidden="true"
                    className="mt-1 h-3.5 w-3.5 shrink-0 text-cosmic"
                  />
                  {dosha.astroInfluence}
                </p>
              </div>
            ) : null}
            <div className="rounded-md border border-border p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Nutrição recomendada
              </p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/80">
                {dosha.recommendations.nutrition}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card Coerência Quântica */}
        <Card className="min-w-0">
          <CardHeader className="gap-4 p-5 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-2">
                <Badge variant={coherenceConfig.badge} className="self-start">
                  <span aria-hidden="true">{coherenceConfig.icon} </span>
                  Coerência Quântica
                </Badge>
                <CardTitle>
                  ICQ:{' '}
                  <span className="font-display text-4xl font-semibold tracking-[-0.03em]">
                    {coherence.index}
                  </span>
                  <span className="text-base font-medium text-muted-foreground">
                    /100
                  </span>
                </CardTitle>
                <CardDescription className="capitalize">
                  {coherence.level}
                </CardDescription>
              </div>
              <div
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cosmic-light text-cosmic"
              >
                <Atom className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-5 pb-5">
            <Progress
              aria-label={`Índice de Coerência Quântica: ${coherence.index} de 100`}
              value={coherence.index}
              tone="astral"
              className="h-1.5"
            />
            <p className="text-[15px] leading-relaxed text-foreground/80">
              {coherence.description}
            </p>
            <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
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
                    className="min-w-0 rounded-md border border-border p-4"
                  >
                    <p className="text-sm font-medium text-muted-foreground">
                      {labels[key]}
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-foreground">
                      {value}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="rounded-md bg-cosmic-light p-4">
              <p className="flex items-start gap-2 text-sm leading-6 text-cosmic-strong">
                <Sparkles
                  aria-hidden="true"
                  className="mt-1 h-3.5 w-3.5 shrink-0"
                />
                {coherence.recommendation}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card Pancha Koshas (Vedanta) */}
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader className="gap-4 p-5 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-2">
                <Badge variant="cosmic" className="self-start">
                  Vedanta & Dharma
                </Badge>
                <CardTitle>
                  Pancha Koshas: {koshas.overallScore}
                  <span className="text-base font-medium text-muted-foreground">
                    /100
                  </span>
                </CardTitle>
                <CardDescription>{koshas.overallStatus}</CardDescription>
              </div>
              <div
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cosmic-light text-cosmic"
              >
                <Layers className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-5 pb-5">
            <div className="rounded-md border border-border bg-background p-4">
              <p className="text-[15px] leading-relaxed text-foreground/80">
                {koshas.dharmaAlignment}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {koshas.koshas.map((k) => (
                <div
                  key={k.name}
                  className="flex min-w-0 flex-col gap-2 rounded-md border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {k.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {k.sanskrit}
                      </p>
                    </div>
                    <span className="font-display text-xl font-semibold text-cosmic-strong">
                      {k.score}
                    </span>
                  </div>
                  <Progress
                    aria-label={`${k.name}: ${k.score} de 100`}
                    value={k.score}
                    tone="astral"
                    className="h-1.5"
                  />
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {k.translation} -{' '}
                    <span className="text-foreground">{k.status}</span>
                  </p>
                  <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {k.insight}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card Chakras */}
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader className="gap-4 p-5 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-2">
                <Badge variant="cosmic" className="self-start">
                  Alinhamento energético
                </Badge>
                <CardTitle>
                  Chakras: {chakras.overallScore}
                  <span className="text-base font-medium text-muted-foreground">
                    /100
                  </span>
                </CardTitle>
                <CardDescription>{chakras.overallLabel}</CardDescription>
              </div>
              <div
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cosmic-light text-cosmic"
              >
                <Sun className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {chakras.chakras.map((c) => (
                <div
                  key={c.name}
                  className="flex min-w-0 flex-col items-center gap-2 rounded-md border border-border p-4 text-center"
                >
                  {/* A cor de cada chakra vem do motor (dado), por isso fica
                      no anel; o número usa a cor de texto do tema para manter
                      contraste ≥ 4,5:1 em qualquer chakra. */}
                  <div
                    className="flex size-10 items-center justify-center rounded-full border-[3px] bg-card font-display text-sm font-semibold text-foreground"
                    style={{ borderColor: c.color }}
                  >
                    {c.score}
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {c.name}
                  </p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {c.status}
                  </p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {c.insight.split('.')[0]}.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card Índice Pránico */}
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader className="gap-4 p-5 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-2">
                <Badge variant={pranaConfig.badge} className="self-start">
                  <span aria-hidden="true">{pranaConfig.icon} </span>
                  Energia Vital
                </Badge>
                <CardTitle>
                  Índice Pránico: {prana.index}
                  <span className="text-base font-medium text-muted-foreground">
                    /100
                  </span>
                </CardTitle>
                <CardDescription className="capitalize">
                  {prana.level}
                </CardDescription>
              </div>
              <div
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success-light text-success"
              >
                <Zap className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-5 pb-5">
            <p className="text-[15px] leading-relaxed text-foreground/80">
              {prana.description}
            </p>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {prana.vayus.map((v) => (
                <div
                  key={v.name}
                  className="flex min-w-0 flex-col gap-2 rounded-md border border-border p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 text-sm font-semibold text-foreground">
                      {v.name}
                    </p>
                    <span className="font-display text-xl font-semibold text-foreground">
                      {v.score}
                    </span>
                  </div>
                  <Progress
                    aria-label={`${v.name}: ${v.score} de 100`}
                    value={v.score}
                    tone="astral"
                    className="h-1.5"
                  />
                  <p className="text-xs text-muted-foreground">{v.domain}</p>
                </div>
              ))}
            </div>
            {prana.lunarInfluence ? (
              <div className="rounded-md border border-border bg-background p-4">
                <p className="flex items-start gap-2 text-sm leading-6 text-foreground/80">
                  <Brain
                    aria-hidden="true"
                    className="mt-1 h-3.5 w-3.5 shrink-0 text-cosmic"
                  />
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
