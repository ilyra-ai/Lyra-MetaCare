'use client';

import type { ElementType } from 'react';
import {
  Activity,
  BedDouble,
  Brain,
  Droplet,
  RefreshCw,
  Smile,
  Utensils,
} from 'lucide-react';

import { DailyMetric } from '@/hooks/use-daily-metrics';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ToneKey =
  | 'primary'
  | 'accent'
  | 'info'
  | 'destructive'
  | 'golden'
  | 'cosmic'
  | 'success';

interface PillarMetric {
  title: string;
  value: string;
  description: string;
}

interface PillarConfig {
  title: string;
  description: string;
  icon: ElementType;
  tone: ToneKey;
  metrics: PillarMetric[];
}

const toneStyles: Record<
  ToneKey,
  {
    badge:
      | 'default'
      | 'warning'
      | 'destructive'
      | 'info'
      | 'golden'
      | 'cosmic'
      | 'success';
    icon: string;
    shell: string;
    metricGlow: string;
  }
> = {
  primary: {
    badge: 'default',
    icon: 'bg-primary/12 text-primary',
    shell:
      'border-primary/12 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12)_0%,rgba(255,255,255,0.96)_36%,rgba(255,255,255,0.92)_100%)]',
    metricGlow: 'border-primary/12',
  },
  accent: {
    badge: 'warning',
    icon: 'bg-accent/12 text-accent',
    shell:
      'border-accent/12 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.12)_0%,rgba(255,255,255,0.96)_36%,rgba(255,255,255,0.92)_100%)]',
    metricGlow: 'border-accent/12',
  },
  info: {
    badge: 'info',
    icon: 'bg-info/12 text-info',
    shell:
      'border-info/12 bg-[radial-gradient(circle_at_top_right,hsl(var(--info)/0.12)_0%,rgba(255,255,255,0.96)_36%,rgba(255,255,255,0.92)_100%)]',
    metricGlow: 'border-info/12',
  },
  destructive: {
    badge: 'destructive',
    icon: 'bg-destructive/10 text-destructive',
    shell:
      'border-destructive/10 bg-[radial-gradient(circle_at_top_right,hsl(var(--destructive)/0.08)_0%,rgba(255,255,255,0.96)_36%,rgba(255,255,255,0.92)_100%)]',
    metricGlow: 'border-destructive/10',
  },
  golden: {
    badge: 'golden',
    icon: 'bg-golden/12 text-golden',
    shell:
      'border-golden/12 bg-[radial-gradient(circle_at_top_right,hsl(var(--golden)/0.12)_0%,rgba(255,255,255,0.96)_36%,rgba(255,255,255,0.92)_100%)]',
    metricGlow: 'border-golden/12',
  },
  cosmic: {
    badge: 'cosmic',
    icon: 'bg-cosmic/12 text-cosmic',
    shell:
      'border-cosmic/12 bg-[radial-gradient(circle_at_top_right,hsl(var(--cosmic)/0.12)_0%,rgba(255,255,255,0.96)_36%,rgba(255,255,255,0.92)_100%)]',
    metricGlow: 'border-cosmic/12',
  },
  success: {
    badge: 'success',
    icon: 'bg-success/12 text-success',
    shell:
      'border-success/12 bg-[radial-gradient(circle_at_top_right,hsl(var(--success)/0.12)_0%,rgba(255,255,255,0.96)_36%,rgba(255,255,255,0.92)_100%)]',
    metricGlow: 'border-success/12',
  },
};

const hasMetricValue = (value: number | null | undefined): value is number =>
  value !== null && value !== undefined && Number.isFinite(value);

const formatMinutesToHours = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const formatNumber = (
  value: number | null | undefined,
  formatter: (input: number) => string
) => (hasMetricValue(value) ? formatter(value) : 'N/A');

const formatInteger = (value: number | null | undefined) =>
  formatNumber(value, (input) => Math.round(input).toLocaleString('pt-BR'));

const formatDecimal = (
  value: number | null | undefined,
  digits = 1,
  suffix = ''
) =>
  formatNumber(value, (input) => {
    const space = suffix ? ' ' : '';
    return `${input.toFixed(digits)}${space}${suffix}`.trim();
  });

const formatPercent = (value: number | null | undefined, digits = 1) =>
  formatNumber(value, (input) => `${input.toFixed(digits)}%`);

const formatScore = (
  value: number | null | undefined,
  total: number,
  digits = 0
) => formatNumber(value, (input) => `${input.toFixed(digits)}/${total}`);

function MetricTile({ metric, tone }: { metric: PillarMetric; tone: ToneKey }) {
  return (
    <div
      className={cn(
        'rounded-[22px] border bg-white/78 p-4 shadow-[0_12px_40px_-28px_rgba(22,21,48,0.45)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5',
        toneStyles[tone].metricGlow
      )}
    >
      <div className="flex h-full flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {metric.title}
          </p>
          <p className="font-mono text-2xl font-semibold tracking-[-0.03em] text-foreground">
            {metric.value}
          </p>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          {metric.description}
        </p>
      </div>
    </div>
  );
}

function PillarCard({ pillar }: { pillar: PillarConfig }) {
  const Icon = pillar.icon;
  const tone = toneStyles[pillar.tone];

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-[30px] border-white/70 shadow-[0_22px_60px_-32px_rgba(22,21,48,0.32)] backdrop-blur-xl',
        tone.shell
      )}
    >
      <CardHeader className="gap-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Badge variant={tone.badge}>Pilar vivo</Badge>
            <div className="space-y-2">
              <CardTitle className="text-xl">{pillar.title}</CardTitle>
              <CardDescription>{pillar.description}</CardDescription>
            </div>
          </div>
          <div
            className={cn(
              'flex size-12 shrink-0 items-center justify-center rounded-[18px] shadow-sm',
              tone.icon
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {pillar.metrics.map((metric) => (
          <MetricTile
            key={`${pillar.title}-${metric.title}`}
            metric={metric}
            tone={pillar.tone}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface MetricGridProps {
  metrics: DailyMetric;
}

export function MetricGrid({ metrics }: MetricGridProps) {
  const sleepQuality =
    metrics.sleep_duration_minutes >= 450
      ? 'Excelente'
      : metrics.sleep_duration_minutes >= 360
        ? 'Bom'
        : 'Abaixo da meta';

  const hrvStatus =
    (metrics.hrv_ms || 0) >= 50
      ? 'Ótimo'
      : (metrics.hrv_ms || 0) >= 30
        ? 'Bom'
        : 'Baixo';

  const readinessScore = metrics.readiness_score ?? metrics.recovery_score;
  const recoveryStatus =
    (readinessScore || 0) >= 80 ? 'Pronto para o dia' : 'Priorize o descanso';

  const moodStatus =
    metrics.mood_score === 5
      ? 'Excelente'
      : metrics.mood_score && metrics.mood_score >= 3
        ? 'Neutro'
        : 'Baixo';

  const hrrStatus = (metrics.hrr_1min_bpm || 0) >= 30 ? 'Excelente' : 'Atenção';
  const spo2Status = (metrics.spo2_average || 0) >= 95 ? 'Normal' : 'Monitorar';

  const moderateVigorousGoal = 150;
  const activeMinutesStatus =
    metrics.active_minutes >= moderateVigorousGoal
      ? 'Meta semanal alcançada'
      : 'Aumentar atividade';
  const stepsStatus =
    metrics.steps >= 8000
      ? 'Meta de 8 mil passos alcançada'
      : 'Continue se movendo';
  const sedentaryStatus = (metrics.sedentary_hours || 0) < 8 ? 'Baixo' : 'Alto';

  const tirStatus =
    (metrics.time_in_range_percent || 0) >= 70
      ? 'Meta alcançada'
      : 'Aumentar TIR';
  const cvStatus =
    (metrics.glycemic_variability_cv || 0) <= 36
      ? 'Estável'
      : 'Alta variabilidade';
  const gmiStatus = (metrics.gmi_percent || 0) <= 6.5 ? 'Ótimo' : 'Monitorar';
  const peakStatus =
    (metrics.post_prandial_peak_mgdl || 0) <= 140 ? 'Normal' : 'Pico elevado';
  const tbrStatus =
    (metrics.time_below_range_percent || 0) <= 4 ? 'Seguro' : 'Risco de hipo';

  const bpStatus =
    (metrics.blood_pressure_systolic || 0) < 120 &&
    (metrics.blood_pressure_diastolic || 0) < 80
      ? 'Ótima'
      : 'Atenção';

  const whtrStatus = (metrics.whtr_ratio || 0) <= 0.5 ? 'Saudável' : 'Atenção';
  const proteinStatus =
    (metrics.protein_g_per_kg || 0) >= 1.0 ? 'Adequada' : 'Aumentar';
  const fiberStatus =
    (metrics.dietary_fiber_grams || 0) >= 25 ? 'Adequada' : 'Aumentar';
  const eatingWindowStatus =
    (metrics.eating_window_hours || 0) <= 10 ? 'Restrita' : 'Normal';
  const naKStatus =
    (metrics.sodium_potassium_ratio || 0) <= 1.0 ? 'Ideal' : 'Atenção';
  const hydrationStatus =
    (metrics.hydration_ml_per_kg || 0) >= 30 ? 'Adequada' : 'Aumentar';

  const pvtStatus =
    (metrics.reaction_time_pvt_ms || 0) < 300 ? 'Excelente' : 'Monitorar';
  const lapsesStatus =
    (metrics.pvt_lapses_count || 0) === 0 ? 'Nenhum lapso' : 'Atenção à fadiga';
  const cognitiveStatus =
    (metrics.cognitive_test_score || 0) >= 0.5 ? 'Alto' : 'Monitorar';
  const hrvStressStatus =
    (metrics.hrv_stress_index || 0) < 10 ? 'Baixo' : 'Elevado';
  const edaStatus =
    (metrics.eda_tonic_microsiemens || 0) < 0.5 ? 'Normal' : 'Pico de estresse';
  const afibStatus =
    (metrics.afib_history_percent || 0) === 0
      ? 'Nenhuma FA detectada'
      : 'Monitorar';

  const pillars: PillarConfig[] = [
    {
      title: 'Recuperação e resiliência',
      description:
        'Capacidade de adaptação ao estresse, recuperação e estabilidade do sistema.',
      icon: RefreshCw,
      tone: 'primary',
      metrics: [
        {
          title: 'HRV (rMSSD)',
          value: formatDecimal(metrics.hrv_ms, 0, 'ms'),
          description: `Resiliência atual: ${hrvStatus}.`,
        },
        {
          title: 'Prontidão',
          value: formatScore(readinessScore, 100, 0),
          description: recoveryStatus,
        },
        {
          title: 'FC repouso',
          value: formatDecimal(metrics.resting_heart_rate, 0, 'bpm'),
          description: 'Média da noite e recuperação basal.',
        },
        {
          title: 'Recuperação FC',
          value: formatDecimal(metrics.hrr_1min_bpm, 0, 'bpm'),
          description: `Aptidão cardiovascular: ${hrrStatus}.`,
        },
        {
          title: 'Temperatura',
          value: formatDecimal(metrics.body_temperature_celsius, 1, '°C'),
          description: 'Desvio da linha de base noturna.',
        },
        {
          title: 'SpO₂ noturna',
          value: formatPercent(metrics.spo2_average, 1),
          description: `Oxigenação: ${spo2Status}.`,
        },
      ],
    },
    {
      title: 'Cardio e atividade física',
      description:
        'Gasto energético, aptidão e intensidade acumulada para manter ritmo com clareza.',
      icon: Activity,
      tone: 'accent',
      metrics: [
        {
          title: 'VO₂max',
          value: formatDecimal(metrics.vo2_max, 1, 'mL/kg/min'),
          description: 'Principal indicador de aptidão aeróbica.',
        },
        {
          title: 'Min. mod/vigorosa',
          value: formatDecimal(metrics.active_minutes, 0, 'min'),
          description: activeMinutesStatus,
        },
        {
          title: 'Passos',
          value: formatInteger(metrics.steps),
          description: stepsStatus,
        },
        {
          title: 'Carga (EPOC)',
          value: formatDecimal(metrics.training_load_epoc, 0, 'UA'),
          description: 'Estresse fisiológico acumulado.',
        },
        {
          title: 'Strain diário',
          value: formatScore(metrics.daily_strain, 21, 1),
          description: 'Intensidade total da jornada.',
        },
        {
          title: 'Sedentarismo',
          value: formatDecimal(metrics.sedentary_hours, 1, 'h'),
          description: `Nível de inatividade: ${sedentaryStatus}.`,
        },
      ],
    },
    {
      title: 'Sono e cronobiologia',
      description:
        'Estrutura do descanso, consistência dos horários e profundidade de recuperação.',
      icon: BedDouble,
      tone: 'info',
      metrics: [
        {
          title: 'Duração',
          value: formatMinutesToHours(metrics.sleep_duration_minutes),
          description: `Qualidade percebida: ${sleepQuality}.`,
        },
        {
          title: 'Eficiência',
          value: formatPercent(metrics.sleep_efficiency, 0),
          description: 'Relação entre sono efetivo e tempo na cama.',
        },
        {
          title: 'Regularidade (SRI)',
          value: formatScore(metrics.sleep_regularity_index, 100, 0),
          description: 'Consistência dos horários.',
        },
        {
          title: 'Social jetlag',
          value: formatDecimal(metrics.social_jetlag_hours, 1, 'h'),
          description: 'Diferença entre rotina da semana e do fim de semana.',
        },
        {
          title: 'Sono REM',
          value: formatMinutesToHours(metrics.rem_sleep_minutes),
          description: 'Memória, humor e integração emocional.',
        },
        {
          title: 'Sono profundo',
          value: formatMinutesToHours(metrics.deep_sleep_minutes),
          description: 'Recuperação física e restauração neural.',
        },
      ],
    },
    {
      title: 'Metabolismo e glicose',
      description:
        'Controle glicêmico, estabilidade metabólica e resposta alimentar do corpo.',
      icon: Droplet,
      tone: 'destructive',
      metrics: [
        {
          title: 'Tempo em faixa',
          value: formatPercent(metrics.time_in_range_percent, 1),
          description: `Meta > 70%: ${tirStatus}.`,
        },
        {
          title: 'Variabilidade (CV)',
          value: formatPercent(metrics.glycemic_variability_cv, 1),
          description: `Meta < 36%: ${cvStatus}.`,
        },
        {
          title: 'GMI (A1c)',
          value: formatPercent(metrics.gmi_percent, 1),
          description: `Leitura média: ${gmiStatus}.`,
        },
        {
          title: 'Pico pós-prandial',
          value: formatDecimal(metrics.post_prandial_peak_mgdl, 0, 'mg/dL'),
          description: peakStatus,
        },
        {
          title: 'Abaixo da faixa',
          value: formatPercent(metrics.time_below_range_percent, 1),
          description: tbrStatus,
        },
        {
          title: 'iAUC/refeição',
          value: formatDecimal(metrics.iauc_per_meal_mgdl_h, 1),
          description: 'Resposta glicêmica por refeição.',
        },
      ],
    },
    {
      title: 'Nutrição e composição',
      description:
        'Composição corporal, distribuição de macros e padrão de alimentação diária.',
      icon: Utensils,
      tone: 'golden',
      metrics: [
        {
          title: 'WHtR',
          value: formatNumber(metrics.whtr_ratio, (input) => input.toFixed(2)),
          description: `Adiposidade central: ${whtrStatus}.`,
        },
        {
          title: 'Proteína (g/kg)',
          value: formatNumber(metrics.protein_g_per_kg, (input) =>
            input.toFixed(2)
          ),
          description: `Consumo proteico: ${proteinStatus}.`,
        },
        {
          title: 'Fibras',
          value: formatDecimal(metrics.dietary_fiber_grams, 0, 'g'),
          description: `Meta > 25 g: ${fiberStatus}.`,
        },
        {
          title: 'Janela alimentar',
          value: formatDecimal(metrics.eating_window_hours, 1, 'h'),
          description: `Perfil atual: ${eatingWindowStatus}.`,
        },
        {
          title: 'Na:K',
          value: formatNumber(metrics.sodium_potassium_ratio, (input) =>
            input.toFixed(2)
          ),
          description: `Equilíbrio mineral: ${naKStatus}.`,
        },
        {
          title: 'Hidratação',
          value: formatDecimal(metrics.hydration_ml_per_kg, 0, 'mL/kg'),
          description: `Estado hídrico: ${hydrationStatus}.`,
        },
      ],
    },
    {
      title: 'Saúde mental e foco',
      description:
        'Clareza cognitiva, carga emocional, vigilância e estabilidade do sistema nervoso.',
      icon: Brain,
      tone: 'cosmic',
      metrics: [
        {
          title: 'Reação (PVT)',
          value: formatDecimal(metrics.reaction_time_pvt_ms, 0, 'ms'),
          description: `Velocidade cognitiva: ${pvtStatus}.`,
        },
        {
          title: 'Lapsos PVT',
          value: formatInteger(metrics.pvt_lapses_count),
          description: lapsesStatus,
        },
        {
          title: 'Score cognitivo',
          value: formatNumber(metrics.cognitive_test_score, (input) =>
            input.toFixed(2)
          ),
          description: `Performance atual: ${cognitiveStatus}.`,
        },
        {
          title: 'Estresse (HRV)',
          value: formatNumber(metrics.hrv_stress_index, (input) =>
            input.toFixed(1)
          ),
          description: `Carga de estresse: ${hrvStressStatus}.`,
        },
        {
          title: 'EDA tônica',
          value: formatDecimal(metrics.eda_tonic_microsiemens, 2, 'µS'),
          description: `Sinal autonômico: ${edaStatus}.`,
        },
        {
          title: 'FA',
          value: formatPercent(metrics.afib_history_percent, 1),
          description: afibStatus,
        },
        {
          title: 'Humor',
          value: formatScore(metrics.mood_score, 5, 0),
          description: `Estado emocional: ${moodStatus}.`,
        },
        {
          title: 'Meditação',
          value: formatDecimal(metrics.meditation_minutes, 0, 'min'),
          description: 'Espaço de regulação e presença.',
        },
      ],
    },
    {
      title: 'Saúde geral',
      description:
        'Camada ampla de monitoramento corporal com sinais de base e composição global.',
      icon: Smile,
      tone: 'success',
      metrics: [
        {
          title: 'Pressão arterial',
          value:
            hasMetricValue(metrics.blood_pressure_systolic) &&
            hasMetricValue(metrics.blood_pressure_diastolic)
              ? `${metrics.blood_pressure_systolic}/${metrics.blood_pressure_diastolic} mmHg`
              : 'N/A',
          description: `Leitura de pressão: ${bpStatus}.`,
        },
        {
          title: 'Peso',
          value: formatDecimal(metrics.weight_kg, 1, 'kg'),
          description: 'Acompanhamento contínuo do corpo.',
        },
        {
          title: 'Hidratação',
          value: formatDecimal(metrics.water_liters, 1, 'L'),
          description: 'Meta-base sugerida: 2,5 L.',
        },
        {
          title: 'Calorias treino',
          value: formatDecimal(metrics.workout_calories, 0, 'kcal'),
          description: 'Gasto de exercício realizado.',
        },
        {
          title: 'Calorias totais',
          value: formatDecimal(metrics.calories_burned, 0, 'kcal'),
          description: 'Energia total gasta no dia.',
        },
      ],
    },
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      {pillars.map((pillar) => (
        <PillarCard key={pillar.title} pillar={pillar} />
      ))}
    </div>
  );
}
