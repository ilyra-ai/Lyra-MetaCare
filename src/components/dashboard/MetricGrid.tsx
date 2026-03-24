'use client';

import { Card, Title, Text, Flex, Grid, Divider } from '@tremor/react';
import { DailyMetric } from '@/hooks/use-daily-metrics';
import {
  Activity,
  BedDouble,
  Brain,
  Droplet,
  RefreshCw,
  Smile,
  Utensils,
} from 'lucide-react';

const formatMinutesToHours = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

interface PillarMetric {
  title: string;
  value: string;
  description: string;
}

interface PillarConfig {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBackground: string;
  highlightColor: string;
  metrics: PillarMetric[];
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
        : 'Abaixo da Meta';

  const hrvStatus =
    (metrics.hrv_ms || 0) >= 50
      ? 'Ótimo'
      : (metrics.hrv_ms || 0) >= 30
        ? 'Bom'
        : 'Baixo';

  const readinessScore = metrics.readiness_score || metrics.recovery_score;
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
      ? 'Meta de 8k passos alcançada'
      : 'Continue se movendo';
  const sedentaryStatus = (metrics.sedentary_hours || 0) < 8 ? 'Baixo' : 'Alto';

  const tirStatus =
    (metrics.time_in_range_percent || 0) >= 70
      ? 'Meta alcançada'
      : 'Aumentar TIR';
  const cvStatus =
    (metrics.glycemic_variability_cv || 0) <= 36
      ? 'Estável'
      : 'Alta Variabilidade';
  const gmiStatus = (metrics.gmi_percent || 0) <= 6.5 ? 'Ótimo' : 'Monitorar';
  const peakStatus =
    (metrics.post_prandial_peak_mgdl || 0) <= 140 ? 'Normal' : 'Pico Elevado';
  const tbrStatus =
    (metrics.time_below_range_percent || 0) <= 4 ? 'Seguro' : 'Risco de Hipo';

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
      title: 'Recuperação e Resiliência',
      description: 'Capacidade de adaptação ao estresse e recuperação.',
      icon: RefreshCw,
      iconColor: 'text-primary',
      iconBackground: 'bg-primary/10',
      highlightColor: 'border-l-primary',
      metrics: [
        { title: 'HRV (rMSSD)', value: metrics.hrv_ms ? `${metrics.hrv_ms} ms` : 'N/A', description: `Resiliência: ${hrvStatus}` },
        { title: 'Prontidão', value: readinessScore ? `${readinessScore}/100` : 'N/A', description: recoveryStatus },
        { title: 'FC Repouso', value: metrics.resting_heart_rate ? `${metrics.resting_heart_rate} BPM` : 'N/A', description: 'Média da noite.' },
        { title: 'Recuperação FC', value: metrics.hrr_1min_bpm ? `${metrics.hrr_1min_bpm} bpm` : 'N/A', description: `Aptidão: ${hrrStatus}` },
        { title: 'Temp. Noturna', value: metrics.body_temperature_celsius ? `${metrics.body_temperature_celsius.toFixed(1)} °C` : 'N/A', description: 'Desvio da linha de base.' },
        { title: 'SpO₂ Noturna', value: metrics.spo2_average ? `${metrics.spo2_average.toFixed(1)}%` : 'N/A', description: `Oxigenação: ${spo2Status}` },
      ],
    },
    {
      title: 'Cardio e Atividade Física',
      description: 'Gasto energético, aptidão e carga de treino.',
      icon: Activity,
      iconColor: 'text-accent',
      iconBackground: 'bg-accent/10',
      highlightColor: 'border-l-accent',
      metrics: [
        { title: 'VO₂max', value: metrics.vo2_max ? `${metrics.vo2_max.toFixed(1)} mL/kg/min` : 'N/A', description: 'Principal indicador de aptidão.' },
        { title: 'Min. Mod/Vigorosa', value: `${metrics.active_minutes} min`, description: activeMinutesStatus },
        { title: 'Passos', value: `${metrics.steps.toLocaleString()}`, description: stepsStatus },
        { title: 'Carga (EPOC)', value: metrics.training_load_epoc ? `${metrics.training_load_epoc.toFixed(0)} UA` : 'N/A', description: 'Estresse fisiológico.' },
        { title: 'Strain Diário', value: metrics.daily_strain ? `${metrics.daily_strain.toFixed(1)} / 21` : 'N/A', description: 'Intensidade acumulada.' },
        { title: 'Sedentarismo', value: metrics.sedentary_hours ? `${metrics.sedentary_hours.toFixed(1)} h` : 'N/A', description: `Nível: ${sedentaryStatus}` },
      ],
    },
    {
      title: 'Sono e Cronobiologia',
      description: 'Qualidade e estrutura do descanso noturno.',
      icon: BedDouble,
      iconColor: 'text-info',
      iconBackground: 'bg-info/10',
      highlightColor: 'border-l-info',
      metrics: [
        { title: 'Duração', value: formatMinutesToHours(metrics.sleep_duration_minutes), description: `Qualidade: ${sleepQuality}` },
        { title: 'Eficiência', value: metrics.sleep_efficiency ? `${metrics.sleep_efficiency.toFixed(0)}%` : 'N/A', description: 'Sono vs. tempo na cama.' },
        { title: 'Regularidade (SRI)', value: metrics.sleep_regularity_index ? `${metrics.sleep_regularity_index}/100` : 'N/A', description: 'Consistência dos horários.' },
        { title: 'Social Jetlag', value: metrics.social_jetlag_hours ? `${metrics.social_jetlag_hours.toFixed(1)} h` : 'N/A', description: 'Diferença semana/fds.' },
        { title: 'Sono REM', value: formatMinutesToHours(metrics.rem_sleep_minutes), description: 'Memória e humor.' },
        { title: 'Sono Profundo', value: formatMinutesToHours(metrics.deep_sleep_minutes), description: 'Recuperação física.' },
      ],
    },
    {
      title: 'Metabolismo e Glicose',
      description: 'Controle glicêmico e estabilidade metabólica.',
      icon: Droplet,
      iconColor: 'text-destructive',
      iconBackground: 'bg-destructive/10',
      highlightColor: 'border-l-destructive',
      metrics: [
        { title: 'Tempo em Faixa', value: metrics.time_in_range_percent ? `${metrics.time_in_range_percent.toFixed(1)}%` : 'N/A', description: `Meta > 70%: ${tirStatus}` },
        { title: 'Variab. (CV)', value: metrics.glycemic_variability_cv ? `${metrics.glycemic_variability_cv.toFixed(1)}%` : 'N/A', description: `Meta < 36%: ${cvStatus}` },
        { title: 'GMI (A1c)', value: metrics.gmi_percent ? `${metrics.gmi_percent.toFixed(1)}%` : 'N/A', description: `Média: ${gmiStatus}` },
        { title: 'Pico Pós-Prandial', value: metrics.post_prandial_peak_mgdl ? `${metrics.post_prandial_peak_mgdl} mg/dL` : 'N/A', description: peakStatus },
        { title: 'Abaixo da Faixa', value: metrics.time_below_range_percent ? `${metrics.time_below_range_percent.toFixed(1)}%` : 'N/A', description: tbrStatus },
        { title: 'iAUC/Refeição', value: metrics.iauc_per_meal_mgdl_h ? `${metrics.iauc_per_meal_mgdl_h.toFixed(1)}` : 'N/A', description: 'Resposta alimentar.' },
      ],
    },
    {
      title: 'Nutrição e Composição',
      description: 'Composição corporal, macros e padrões alimentares.',
      icon: Utensils,
      iconColor: 'text-golden',
      iconBackground: 'bg-golden/10',
      highlightColor: 'border-l-golden',
      metrics: [
        { title: 'WHtR', value: metrics.whtr_ratio ? metrics.whtr_ratio.toFixed(2) : 'N/A', description: `Adiposidade: ${whtrStatus}` },
        { title: 'Proteína (g/kg)', value: metrics.protein_g_per_kg ? `${metrics.protein_g_per_kg.toFixed(2)}` : 'N/A', description: proteinStatus },
        { title: 'Fibras', value: metrics.dietary_fiber_grams ? `${metrics.dietary_fiber_grams} g` : 'N/A', description: `Meta > 25g: ${fiberStatus}` },
        { title: 'Janela Alimentar', value: metrics.eating_window_hours ? `${metrics.eating_window_hours.toFixed(1)} h` : 'N/A', description: eatingWindowStatus },
        { title: 'Na:K', value: metrics.sodium_potassium_ratio ? metrics.sodium_potassium_ratio.toFixed(2) : 'N/A', description: naKStatus },
        { title: 'Hidratação', value: metrics.hydration_ml_per_kg ? `${metrics.hydration_ml_per_kg.toFixed(0)} mL/kg` : 'N/A', description: hydrationStatus },
      ],
    },
    {
      title: 'Saúde Mental',
      description: 'Performance cognitiva, fadiga e equilíbrio emocional.',
      icon: Brain,
      iconColor: 'text-cosmic',
      iconBackground: 'bg-cosmic/10',
      highlightColor: 'border-l-cosmic',
      metrics: [
        { title: 'Reação (PVT)', value: metrics.reaction_time_pvt_ms ? `${metrics.reaction_time_pvt_ms} ms` : 'N/A', description: pvtStatus },
        { title: 'Lapsos PVT', value: metrics.pvt_lapses_count ? `${metrics.pvt_lapses_count}` : 'N/A', description: lapsesStatus },
        { title: 'Score Cognitivo', value: metrics.cognitive_test_score ? metrics.cognitive_test_score.toFixed(2) : 'N/A', description: cognitiveStatus },
        { title: 'Estresse (HRV)', value: metrics.hrv_stress_index ? metrics.hrv_stress_index.toFixed(1) : 'N/A', description: hrvStressStatus },
        { title: 'EDA Tônica', value: metrics.eda_tonic_microsiemens ? `${metrics.eda_tonic_microsiemens.toFixed(2)} µS` : 'N/A', description: edaStatus },
        { title: 'FA', value: metrics.afib_history_percent ? `${metrics.afib_history_percent.toFixed(1)}%` : 'N/A', description: afibStatus },
        { title: 'Humor', value: metrics.mood_score ? `${metrics.mood_score}/5` : 'N/A', description: moodStatus },
        { title: 'Meditação', value: `${metrics.meditation_minutes} min`, description: 'Foco e redução de estresse.' },
      ],
    },
    {
      title: 'Saúde Geral',
      description: 'Indicadores globais e composição corporal.',
      icon: Smile,
      iconColor: 'text-success',
      iconBackground: 'bg-success/10',
      highlightColor: 'border-l-success',
      metrics: [
        { title: 'Pressão Arterial', value: metrics.blood_pressure_systolic && metrics.blood_pressure_diastolic ? `${metrics.blood_pressure_systolic}/${metrics.blood_pressure_diastolic} mmHg` : 'N/A', description: bpStatus },
        { title: 'Peso', value: metrics.weight_kg ? `${metrics.weight_kg.toFixed(1)} kg` : 'N/A', description: 'Monitoramento.' },
        { title: 'Hidratação', value: `${metrics.water_liters.toFixed(1)} L`, description: 'Meta: 2.5 L.' },
        { title: 'Cal. Treino', value: metrics.workout_calories ? `${metrics.workout_calories.toFixed(0)} kcal` : 'N/A', description: 'Exercício.' },
        { title: 'Cal. Totais', value: metrics.calories_burned ? `${metrics.calories_burned.toFixed(0)} kcal` : 'N/A', description: 'Gasto diário.' },
      ],
    },
  ];

  return (
    <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-5">
      {pillars.map((pillar) => (
        <Card
          key={pillar.title}
          className={`space-y-3 rounded-2xl border border-border bg-card shadow hover:shadow-md transition-all duration-200 border-l-4 ${pillar.highlightColor}`}
        >
          <Flex justifyContent="between" alignItems="start" className="gap-4">
            <div>
              <Title className="text-sm font-display font-semibold text-foreground">
                {pillar.title}
              </Title>
              <Text className="mt-1 text-xs text-muted-foreground">
                {pillar.description}
              </Text>
            </div>
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${pillar.iconBackground} shrink-0`}
            >
              <pillar.icon className={`h-5 w-5 ${pillar.iconColor}`} />
            </span>
          </Flex>

          <Divider className="my-1 opacity-30" />

          <div className="space-y-2">
            {pillar.metrics.map((metric) => (
              <div
                key={`${pillar.title}-${metric.title}`}
                className="rounded-xl border border-border bg-secondary/50 p-3"
              >
                <Flex
                  justifyContent="between"
                  alignItems="start"
                  className="gap-3"
                >
                  <div>
                    <Text className="text-xs font-medium text-foreground">
                      {metric.title}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {metric.description}
                    </Text>
                  </div>
                  <Text className="font-semibold text-right text-foreground tabular-nums text-sm">
                    {metric.value}
                  </Text>
                </Flex>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </Grid>
  );
}
