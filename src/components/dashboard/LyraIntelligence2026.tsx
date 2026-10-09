'use client';

import * as React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  Droplets,
  HeartPulse,
  Hourglass,
  Lock,
  Moon,
  Settings2,
  ShieldCheck,
  Sparkles,
  Waves,
} from 'lucide-react';
import Link from 'next/link';

import type { DailyMetric } from '@/hooks/use-daily-metrics';
import type { ProfileSummary } from '@/hooks/use-profile';
import { usePrivacyMode } from '@/hooks/use-privacy-mode';
import {
  calculateBiologicalAge,
  type BiologicalAgeResult,
} from '@/lib/longevity/biological-age-engine';
import {
  evaluateEarlyWarning,
  type EarlyWarningMetric,
  type EarlyWarningResult,
} from '@/lib/health/early-warning-engine';
import {
  calculateMenstrualCycle,
  type MenstrualCycleResult,
} from '@/lib/cycle/menstrual-engine';
import {
  generateProactiveActions,
  type AgentAction,
  type AgentCategory,
} from '@/lib/ai/agent-engine';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';

interface LyraIntelligence2026Props {
  metrics: DailyMetric[];
  todayMetrics: DailyMetric | null;
  profile: ProfileSummary | null;
  chronologicalAge: number | null;
  isFemale: boolean;
  readinessScore: number | null;
}

const CATEGORY_STYLE: Record<
  AgentCategory,
  { label: string; badge: string; icon: React.ElementType }
> = {
  alerta: {
    label: 'Alerta',
    badge: 'bg-destructive/10 text-destructive',
    icon: AlertTriangle,
  },
  recuperacao: {
    label: 'Recuperação',
    badge: 'bg-accent/10 text-accent',
    icon: HeartPulse,
  },
  movimento: {
    label: 'Movimento',
    badge: 'bg-accent/10 text-accent',
    icon: Activity,
  },
  sono: { label: 'Sono', badge: 'bg-info/10 text-info', icon: Moon },
  nutricao: {
    label: 'Nutrição',
    badge: 'bg-golden/10 text-golden',
    icon: Sparkles,
  },
  hidratacao: {
    label: 'Hidratação',
    badge: 'bg-info/10 text-info',
    icon: Droplets,
  },
  mente: { label: 'Mente', badge: 'bg-cosmic/10 text-cosmic', icon: Waves },
  ciclo: { label: 'Ciclo', badge: 'bg-cosmic/10 text-cosmic', icon: Moon },
  longevidade: {
    label: 'Longevidade',
    badge: 'bg-primary/10 text-primary',
    icon: Hourglass,
  },
  equilibrio: {
    label: 'Equilíbrio',
    badge: 'bg-success/10 text-success',
    icon: ShieldCheck,
  },
};

function metricNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toEarlyWarningMetric(metric: DailyMetric | null): EarlyWarningMetric {
  if (!metric) return {};
  return {
    hrv_ms: metric.hrv_ms,
    resting_heart_rate: metric.resting_heart_rate,
    body_temperature_celsius: metric.body_temperature_celsius,
    spo2_average: metric.spo2_average,
    respiratory_rate: metric.respiratory_rate,
    sleep_duration_minutes: metric.sleep_duration_minutes,
  };
}

/* ============================ Cartão: Ações proativas (M1) =================== */
function ProactiveActionsCard({ actions }: { actions: AgentAction[] }) {
  return (
    <Card className="flex h-full flex-col border-primary/15 bg-[radial-gradient(circle_at_top_left,hsl(var(--cosmic)/0.10)_0%,hsl(var(--card))_45%)] lg:col-span-2">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="cosmic" className="w-fit">
            Assistente proativo
          </Badge>
          <BrainCircuit className="h-5 w-5 text-cosmic" />
        </div>
        <CardTitle className="text-2xl">Ações da Lyra para hoje</CardTitle>
        <CardDescription>
          Geradas automaticamente a partir dos seus sinais reais, priorizadas e
          categorizadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {actions.map((action) => {
          const style = CATEGORY_STYLE[action.category];
          const Icon = style.icon;
          return (
            <div
              key={action.id}
              className={cn(
                'flex flex-col gap-2 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm transition-colors sm:flex-row sm:items-start sm:gap-4',
                action.severity === 'critico' && 'border-destructive/30',
                action.severity === 'atencao' && 'border-accent/30'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                  style.badge
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold leading-snug text-foreground">
                    {action.title}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn('rounded-full text-[11px]', style.badge)}
                  >
                    {style.label}
                  </Badge>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {action.detail}
                </p>
                {action.cta ? (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-primary hover:bg-primary/10"
                  >
                    <Link href={action.cta.href}>{action.cta.label} →</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* ============================ Cartão: Idade biológica (M3) =================== */
function BiologicalAgeCard({ result }: { result: BiologicalAgeResult | null }) {
  if (!result) {
    return (
      <Card className="flex h-full flex-col border-border/70 bg-card/80">
        <CardHeader className="gap-2">
          <Badge variant="default" className="w-fit">
            Idade biológica
          </Badge>
          <CardTitle className="text-xl">Aguardando idade</CardTitle>
          <CardDescription>
            Informe sua idade ou data de nascimento no perfil para estimar sua
            idade biológica.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto">
          <Button asChild variant="outline" size="sm">
            <Link href="/profile">Completar perfil →</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const younger = result.ageDelta < 0;
  const DeltaIcon = younger ? ArrowDownRight : ArrowUpRight;

  return (
    <Card className="flex h-full flex-col border-primary/15 bg-card/85">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="default" className="w-fit">
            Idade biológica
          </Badge>
          <Hourglass className="h-5 w-5 text-primary" />
        </div>
        <div className="flex items-end gap-2">
          <span className="font-mono text-4xl font-semibold tracking-tight text-foreground">
            {result.biologicalAge.toFixed(0)}
          </span>
          <span className="pb-1 text-sm text-muted-foreground">anos</span>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 text-sm font-medium',
            younger ? 'text-success' : 'text-accent'
          )}
        >
          <DeltaIcon className="h-4 w-4" />
          {younger
            ? `${Math.abs(result.ageDelta).toFixed(1)} ano(s) mais jovem`
            : `${result.ageDelta.toFixed(1)} ano(s) acima`}{' '}
          <span className="text-muted-foreground">
            (real: {result.chronologicalAge})
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Vitalidade fenotípica</span>
            <span className="font-mono text-foreground">
              {result.vitalityScore}/100
            </span>
          </div>
          <Progress
            aria-label="Vitalidade fenotípica"
            value={result.vitalityScore}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Ritmo de envelhecimento</span>
            <span className="font-mono text-foreground">
              {result.paceOfAging.toFixed(2)}×
            </span>
          </div>
        </div>

        {result.drivers.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Principais fatores
            </p>
            {result.drivers.slice(0, 3).map((driver) => (
              <div
                key={driver.key}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="truncate text-foreground">{driver.label}</span>
                <span
                  className={cn(
                    'font-mono text-xs',
                    driver.impactYears < 0 ? 'text-success' : 'text-accent'
                  )}
                >
                  {driver.impactYears > 0 ? '+' : ''}
                  {driver.impactYears.toFixed(1)}a
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <p className="mt-auto text-[11px] leading-5 text-muted-foreground">
          {result.methodology} Confiança: {result.confidence} (
          {result.availableMarkers} biomarcadores).
        </p>
      </CardContent>
    </Card>
  );
}

/* ============================ Cartão: Detecção precoce (M2) ================== */
function EarlyWarningCard({ result }: { result: EarlyWarningResult }) {
  const severityStyle: Record<string, string> = {
    alerta: 'border-destructive/30 bg-destructive/5',
    atencao: 'border-accent/30 bg-accent/5',
    info: 'border-info/30 bg-info/5',
  };

  return (
    <Card className="flex h-full flex-col border-border/70 bg-card/85">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <Badge
            variant={result.overall === 'estavel' ? 'success' : 'warning'}
            className="w-fit"
          >
            Detecção precoce
          </Badge>
          <HeartPulse className="h-5 w-5 text-accent" />
        </div>
        <CardTitle className="text-xl">
          {result.overall === 'estavel'
            ? 'Sinais estáveis'
            : result.overall === 'observar'
              ? 'Vale observar'
              : 'Requer atenção'}
        </CardTitle>
        <CardDescription>
          Cruzamento de HRV, FC, temperatura, SpO₂ e respiração vs. sua linha de
          base.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {!result.hasBaseline ? (
          <p className="text-sm text-muted-foreground">
            Coletando sua linha de base ({result.baselineDays}/3 dias). Em breve
            os sinais precoces estarão ativos.
          </p>
        ) : result.signals.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-success/20 bg-success/5 p-5 text-center">
            <ShieldCheck className="h-8 w-8 text-success" />
            <p className="text-sm font-medium text-foreground">
              Tudo dentro do seu padrão
            </p>
            <p className="text-xs text-muted-foreground">
              Nenhum desvio relevante detectado hoje.
            </p>
          </div>
        ) : (
          result.signals.map((signal) => (
            <div
              key={signal.key}
              className={cn(
                'rounded-2xl border p-3.5',
                severityStyle[signal.severity] ?? severityStyle.info
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {signal.title}
                </p>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {signal.actionLabel}
                </Badge>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {signal.detail}
              </p>
              {signal.contributors.length ? (
                <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                  {signal.contributors.join(' • ')}
                </p>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

/* ============================ Cartão: Ciclo / Saúde da mulher (M4) =========== */
function CycleCard({ result }: { result: MenstrualCycleResult }) {
  return (
    <Card className="flex h-full flex-col border-cosmic/15 bg-[radial-gradient(circle_at_top_right,hsl(var(--cosmic)/0.10)_0%,hsl(var(--card))_45%)]">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="cosmic" className="w-fit">
            Saúde da mulher
          </Badge>
          <Moon className="h-5 w-5 text-cosmic" />
        </div>
        <CardTitle className="text-xl">
          {result.trackable
            ? `${result.phaseEmoji} ${result.phaseLabel}`
            : 'Ciclo & vitalidade'}
        </CardTitle>
        <CardDescription>
          {result.trackable
            ? result.summary
            : (result.note ?? 'Configure seu ciclo para ativar este painel.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {result.trackable && result.cycleDay ? (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Dia {result.cycleDay} de {result.cycleLength}
                </span>
                {result.isFertileToday ? (
                  <span className="font-medium text-cosmic">Janela fértil</span>
                ) : (
                  <span>
                    Próxima em {result.daysUntilNextPeriod} dia
                    {result.daysUntilNextPeriod === 1 ? '' : 's'}
                  </span>
                )}
              </div>
              <Progress
                aria-label={`Dia ${result.cycleDay} de ${result.cycleLength} do ciclo`}
                value={Math.round((result.cycleDay / result.cycleLength) * 100)}
              />
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Treino
                </p>
                <p className="mt-0.5 text-foreground">
                  {result.recommendation.training}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Nutrição
                </p>
                <p className="mt-0.5 text-foreground">
                  {result.recommendation.nutrition}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-auto">
            <Button asChild variant="outline" size="sm">
              <Link href="/profile">Configurar ciclo no perfil →</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================ Cartão: Privacidade on-device (M5) ============= */
function PrivacyCard({
  privacyMode,
  onToggle,
}: {
  privacyMode: boolean;
  onToggle: (value: boolean) => void;
}) {
  return (
    <Card className="flex h-full flex-col border-border/70 bg-card/85">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="default" className="w-fit">
            Privacidade
          </Badge>
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <CardTitle className="text-xl">IA no seu dispositivo</CardTitle>
        <CardDescription>
          Os índices desta seção são calculados localmente, no seu navegador.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/70 p-4">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              Modo Privacidade
            </p>
            <p className="text-xs text-muted-foreground">
              {privacyMode
                ? 'Ativo: conversas atendidas apenas pelo motor local.'
                : 'Inativo: o chat pode usar um modelo externo via BYOK.'}
            </p>
          </div>
          <Switch
            checked={privacyMode}
            onCheckedChange={onToggle}
            aria-label="Alternar modo privacidade"
          />
        </div>
        <ul className="mt-auto space-y-2 text-xs leading-5 text-muted-foreground">
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            Idade biológica, detecção precoce, ciclo e ações: 100% on-device.
          </li>
          <li className="flex items-start gap-2">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Com o modo ativo, nada do chat é enviado a modelos externos.
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}

/* ============================ Seção principal =============================== */
export function LyraIntelligence2026({
  metrics,
  todayMetrics,
  profile,
  chronologicalAge,
  isFemale,
  readinessScore,
}: LyraIntelligence2026Props) {
  const { privacyMode, setPrivacyMode } = usePrivacyMode();

  const biologicalAge = React.useMemo<BiologicalAgeResult | null>(() => {
    if (chronologicalAge === null || !todayMetrics) return null;
    return calculateBiologicalAge({
      chronologicalAge,
      hrv_ms: metricNumber(todayMetrics.hrv_ms),
      resting_heart_rate: metricNumber(todayMetrics.resting_heart_rate),
      vo2_max: metricNumber(todayMetrics.vo2_max),
      sleep_duration_minutes: metricNumber(todayMetrics.sleep_duration_minutes),
      sleep_efficiency: metricNumber(todayMetrics.sleep_efficiency),
      blood_glucose_mgdl: metricNumber(todayMetrics.blood_glucose_mgdl),
      spo2_average: metricNumber(todayMetrics.spo2_average),
      active_minutes: metricNumber(todayMetrics.active_minutes),
    });
  }, [chronologicalAge, todayMetrics]);

  const earlyWarning = React.useMemo<EarlyWarningResult>(() => {
    const history = metrics
      .slice(0, Math.max(0, metrics.length - 1))
      .map(toEarlyWarningMetric);
    return evaluateEarlyWarning(toEarlyWarningMetric(todayMetrics), history);
  }, [metrics, todayMetrics]);

  const cycle = React.useMemo<MenstrualCycleResult | null>(() => {
    if (!isFemale || !profile) return null;
    return calculateMenstrualCycle(new Date(), {
      lastMenstrualPeriod: profile.last_menstrual_period,
      cycleLength: profile.menstrual_cycle_length,
      periodLength: profile.menstrual_period_length,
      lifeStage: profile.menstrual_life_stage,
    });
  }, [isFemale, profile]);

  const actions = React.useMemo<AgentAction[]>(() => {
    return generateProactiveActions({
      firstName: profile?.first_name ?? null,
      readinessScore,
      earlyWarning,
      biologicalAge,
      cycle,
      today: {
        steps: metricNumber(todayMetrics?.steps),
        active_minutes: metricNumber(todayMetrics?.active_minutes),
        water_liters: metricNumber(todayMetrics?.water_liters),
        meditation_minutes: metricNumber(todayMetrics?.meditation_minutes),
        sleep_duration_minutes: metricNumber(
          todayMetrics?.sleep_duration_minutes
        ),
      },
    });
  }, [
    profile,
    readinessScore,
    earlyWarning,
    biologicalAge,
    cycle,
    todayMetrics,
  ]);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl font-bold tracking-tight text-gradient-hero">
            Inteligência Lyra 2026
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Assistente proativo, idade biológica, detecção precoce e saúde da
            mulher — calculados no seu dispositivo a partir de dados reais.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-2">
          <Settings2 className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">
            Modo Privacidade
          </span>
          <Switch
            checked={privacyMode}
            onCheckedChange={setPrivacyMode}
            aria-label="Alternar modo privacidade (atalho)"
          />
        </div>
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <ProactiveActionsCard actions={actions} />
        <BiologicalAgeCard result={biologicalAge} />
        <EarlyWarningCard result={earlyWarning} />
        {isFemale && cycle ? <CycleCard result={cycle} /> : null}
        <PrivacyCard privacyMode={privacyMode} onToggle={setPrivacyMode} />
      </div>
    </section>
  );
}
