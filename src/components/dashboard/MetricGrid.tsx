"use client";

import {
  Card,
  Title,
  Text,
  Flex,
  Grid,
  Divider,
} from "@tremor/react";
import { DailyMetric } from "@/hooks/use-daily-metrics";
import { Activity, BedDouble, Brain, Droplet, RefreshCw, Smile, Utensils } from "lucide-react";

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
  decorationColor:
    | "emerald"
    | "orange"
    | "indigo"
    | "rose"
    | "amber"
    | "violet";
  icon: React.ElementType;
  iconColor: string;
  iconBackground: string;
  metrics: PillarMetric[];
}

interface MetricGridProps {
  metrics: DailyMetric;
}

export function MetricGrid({ metrics }: MetricGridProps) {
  const sleepQuality =
    metrics.sleep_duration_minutes >= 450
      ? "Excelente"
      : metrics.sleep_duration_minutes >= 360
        ? "Bom"
        : "Abaixo da Meta";

  const hrvStatus =
    (metrics.hrv_ms || 0) >= 50
      ? "Ótimo"
      : (metrics.hrv_ms || 0) >= 30
        ? "Bom"
        : "Baixo";

  const readinessScore = metrics.readiness_score || metrics.recovery_score;
  const recoveryStatus =
    (readinessScore || 0) >= 80 ? "Pronto para o dia" : "Priorize o descanso";

  const moodStatus =
    metrics.mood_score === 5
      ? "Excelente"
      : metrics.mood_score && metrics.mood_score >= 3
        ? "Neutro"
        : "Baixo";

  const hrrStatus =
    (metrics.hrr_1min_bpm || 0) >= 30 ? "Excelente" : "Atenção";
  const spo2Status =
    (metrics.spo2_average || 0) >= 95 ? "Normal" : "Monitorar";

  const moderateVigorousGoal = 150;
  const activeMinutesStatus =
    metrics.active_minutes >= moderateVigorousGoal
      ? "Meta semanal alcançada"
      : "Aumentar atividade";
  const stepsStatus =
    metrics.steps >= 8000 ? "Meta de 8k passos alcançada" : "Continue se movendo";
  const sedentaryStatus =
    (metrics.sedentary_hours || 0) < 8 ? "Baixo" : "Alto";

  const tirStatus =
    (metrics.time_in_range_percent || 0) >= 70 ? "Meta alcançada" : "Aumentar TIR";
  const cvStatus =
    (metrics.glycemic_variability_cv || 0) <= 36
      ? "Estável"
      : "Alta Variabilidade";
  const gmiStatus =
    (metrics.gmi_percent || 0) <= 6.5 ? "Ótimo" : "Monitorar";
  const peakStatus =
    (metrics.post_prandial_peak_mgdl || 0) <= 140 ? "Normal" : "Pico Elevado";
  const tbrStatus =
    (metrics.time_below_range_percent || 0) <= 4 ? "Seguro" : "Risco de Hipo";

  const bpStatus =
    (metrics.blood_pressure_systolic || 0) < 120 &&
    (metrics.blood_pressure_diastolic || 0) < 80
      ? "Ótima"
      : "Atenção";

  const whtrStatus =
    (metrics.whtr_ratio || 0) <= 0.5 ? "Saudável" : "Atenção";
  const proteinStatus =
    (metrics.protein_g_per_kg || 0) >= 1.0 ? "Adequada" : "Aumentar";
  const fiberStatus =
    (metrics.dietary_fiber_grams || 0) >= 25 ? "Adequada" : "Aumentar";
  const eatingWindowStatus =
    (metrics.eating_window_hours || 0) <= 10 ? "Restrita" : "Normal";
  const naKStatus =
    (metrics.sodium_potassium_ratio || 0) <= 1.0 ? "Ideal" : "Atenção";
  const hydrationStatus =
    (metrics.hydration_ml_per_kg || 0) >= 30 ? "Adequada" : "Aumentar";

  const pvtStatus =
    (metrics.reaction_time_pvt_ms || 0) < 300 ? "Excelente" : "Monitorar";
  const lapsesStatus =
    (metrics.pvt_lapses_count || 0) === 0
      ? "Nenhum lapso"
      : "Atenção à fadiga";
  const cognitiveStatus =
    (metrics.cognitive_test_score || 0) >= 0.5 ? "Alto" : "Monitorar";
  const hrvStressStatus =
    (metrics.hrv_stress_index || 0) < 10 ? "Baixo" : "Elevado";
  const edaStatus =
    (metrics.eda_tonic_microsiemens || 0) < 0.5 ? "Normal" : "Pico de estresse";
  const afibStatus =
    (metrics.afib_history_percent || 0) === 0
      ? "Nenhuma FA detectada"
      : "Monitorar";

  const pillars: PillarConfig[] = [
    {
      title: "Recuperação e Resiliência Autonômica",
      description:
        "Métricas que avaliam a capacidade do seu corpo de se adaptar ao estresse e se recuperar.",
      decorationColor: "emerald",
      icon: RefreshCw,
      iconColor: "text-emerald-600",
      iconBackground: "bg-emerald-100 dark:bg-emerald-900/30",
      metrics: [
        {
          title: "HRV (rMSSD)",
          value: metrics.hrv_ms ? `${metrics.hrv_ms} ms` : "N/A",
          description: `Resiliência ao estresse: ${hrvStatus}`,
        },
        {
          title: "Score de Prontidão",
          value: readinessScore ? `${readinessScore}/100` : "N/A",
          description: recoveryStatus,
        },
        {
          title: "FC de Repouso",
          value: metrics.resting_heart_rate
            ? `${metrics.resting_heart_rate} BPM`
            : "N/A",
          description: "Média da noite.",
        },
        {
          title: "Recuperação da FC (1 min)",
          value: metrics.hrr_1min_bpm ? `${metrics.hrr_1min_bpm} bpm` : "N/A",
          description: `Sinal de aptidão cardiovascular: ${hrrStatus}`,
        },
        {
          title: "Temp. Cutânea Noturna",
          value: metrics.body_temperature_celsius
            ? `${metrics.body_temperature_celsius.toFixed(1)} °C`
            : "N/A",
          description: "Desvio da linha de base.",
        },
        {
          title: "SpO₂ Noturna (Média)",
          value: metrics.spo2_average
            ? `${metrics.spo2_average.toFixed(1)}%`
            : "N/A",
          description: `Oxigenação do sangue: ${spo2Status}`,
        },
      ],
    },
    {
      title: "Capacidade Cardiorrespiratória e Atividade Física",
      description:
        "Monitoramento do seu gasto energético, aptidão física e carga de estresse do treino.",
      decorationColor: "orange",
      icon: Activity,
      iconColor: "text-orange-600",
      iconBackground: "bg-orange-100 dark:bg-orange-900/30",
      metrics: [
        {
          title: "VO₂max Estimado",
          value: metrics.vo2_max
            ? `${metrics.vo2_max.toFixed(1)} mL/kg/min`
            : "N/A",
          description: "Principal indicador de aptidão.",
        },
        {
          title: "Minutos Mod/Vigorosa",
          value: `${metrics.active_minutes} min`,
          description: activeMinutesStatus,
        },
        {
          title: "Passos por Dia",
          value: `${metrics.steps.toLocaleString()} passos`,
          description: stepsStatus,
        },
        {
          title: "Carga de Treino (EPOC)",
          value: metrics.training_load_epoc
            ? `${metrics.training_load_epoc.toFixed(0)} UA`
            : "N/A",
          description: "Estresse fisiológico do exercício.",
        },
        {
          title: "Strain Diário",
          value: metrics.daily_strain
            ? `${metrics.daily_strain.toFixed(1)} / 21`
            : "N/A",
          description: "Intensidade acumulada do dia.",
        },
        {
          title: "Tempo Sedentário",
          value: metrics.sedentary_hours
            ? `${metrics.sedentary_hours.toFixed(1)} h`
            : "N/A",
          description: `Nível de sedentarismo: ${sedentaryStatus}`,
        },
      ],
    },
    {
      title: "Sono e Cronobiologia",
      description: "Análise da qualidade e estrutura do seu descanso noturno.",
      decorationColor: "indigo",
      icon: BedDouble,
      iconColor: "text-indigo-600",
      iconBackground: "bg-indigo-100 dark:bg-indigo-900/30",
      metrics: [
        {
          title: "Duração do sono",
          value: formatMinutesToHours(metrics.sleep_duration_minutes),
          description: `Qualidade: ${sleepQuality}`,
        },
        {
          title: "Eficiência do sono",
          value: metrics.sleep_efficiency
            ? `${metrics.sleep_efficiency.toFixed(0)}%`
            : "N/A",
          description: "Sono vs. tempo na cama.",
        },
        {
          title: "Regularidade do Sono (SRI)",
          value: metrics.sleep_regularity_index
            ? `${metrics.sleep_regularity_index}/100`
            : "N/A",
          description: "Consistência dos horários.",
        },
        {
          title: "Social Jetlag",
          value: metrics.social_jetlag_hours
            ? `${metrics.social_jetlag_hours.toFixed(1)} h`
            : "N/A",
          description: "Diferença entre semana e fim de semana.",
        },
        {
          title: "Sono REM",
          value: formatMinutesToHours(metrics.rem_sleep_minutes),
          description: "Importante para memória e humor.",
        },
        {
          title: "Sono Profundo",
          value: formatMinutesToHours(metrics.deep_sleep_minutes),
          description: "Crucial para recuperação física.",
        },
      ],
    },
    {
      title: "Metabolismo e Glicose (CGM)",
      description:
        "Métricas avançadas de controle glicêmico e estabilidade metabólica.",
      decorationColor: "rose",
      icon: Droplet,
      iconColor: "text-rose-600",
      iconBackground: "bg-rose-100 dark:bg-rose-900/30",
      metrics: [
        {
          title: "Tempo em Faixa (TIR)",
          value: metrics.time_in_range_percent
            ? `${metrics.time_in_range_percent.toFixed(1)}%`
            : "N/A",
          description: `Meta > 70%. Status: ${tirStatus}`,
        },
        {
          title: "Variabilidade Glicêmica (CV)",
          value: metrics.glycemic_variability_cv
            ? `${metrics.glycemic_variability_cv.toFixed(1)}%`
            : "N/A",
          description: `Meta < 36%. Status: ${cvStatus}`,
        },
        {
          title: "GMI (A1c Estimada)",
          value: metrics.gmi_percent
            ? `${metrics.gmi_percent.toFixed(1)}%`
            : "N/A",
          description: `Média glicêmica: ${gmiStatus}`,
        },
        {
          title: "Pico Pós-Prandial",
          value: metrics.post_prandial_peak_mgdl
            ? `${metrics.post_prandial_peak_mgdl} mg/dL`
            : "N/A",
          description: `Pico após refeição: ${peakStatus}`,
        },
        {
          title: "Tempo Abaixo da Faixa",
          value: metrics.time_below_range_percent
            ? `${metrics.time_below_range_percent.toFixed(1)}%`
            : "N/A",
          description: `Risco de hipoglicemia: ${tbrStatus}`,
        },
        {
          title: "iAUC por Refeição",
          value: metrics.iauc_per_meal_mgdl_h
            ? `${metrics.iauc_per_meal_mgdl_h.toFixed(1)} mg/dL·h`
            : "N/A",
          description: "Resposta alimentar quantificada.",
        },
      ],
    },
    {
      title: "Composição Corporal e Nutrição",
      description:
        "Marcadores de composição corporal, ingestão de macros e padrões alimentares.",
      decorationColor: "amber",
      icon: Utensils,
      iconColor: "text-amber-600",
      iconBackground: "bg-amber-100 dark:bg-amber-900/30",
      metrics: [
        {
          title: "Relação Cintura/Altura (WHtR)",
          value: metrics.whtr_ratio ? metrics.whtr_ratio.toFixed(2) : "N/A",
          description: `Adiposidade central: ${whtrStatus}`,
        },
        {
          title: "Proteína Diária (g/kg)",
          value: metrics.protein_g_per_kg
            ? `${metrics.protein_g_per_kg.toFixed(2)} g/kg`
            : "N/A",
          description: `Ingestão para longevidade: ${proteinStatus}`,
        },
        {
          title: "Fibras Dietéticas",
          value: metrics.dietary_fiber_grams
            ? `${metrics.dietary_fiber_grams} g`
            : "N/A",
          description: `Meta > 25g. Status: ${fiberStatus}`,
        },
        {
          title: "Janela Alimentar",
          value: metrics.eating_window_hours
            ? `${metrics.eating_window_hours.toFixed(1)} h`
            : "N/A",
          description: `Tempo de jejum: ${eatingWindowStatus}`,
        },
        {
          title: "Razão Sódio:Potássio",
          value: metrics.sodium_potassium_ratio
            ? metrics.sodium_potassium_ratio.toFixed(2)
            : "N/A",
          description: `Saúde cardiovascular: ${naKStatus}`,
        },
        {
          title: "Hidratação (mL/kg)",
          value: metrics.hydration_ml_per_kg
            ? `${metrics.hydration_ml_per_kg.toFixed(0)} mL/kg`
            : "N/A",
          description: `Nível de hidratação: ${hydrationStatus}`,
        },
      ],
    },
    {
      title: "Saúde Mental e Bem-Estar",
      description:
        "Avaliação da performance cognitiva, fadiga e equilíbrio emocional.",
      decorationColor: "violet",
      icon: Brain,
      iconColor: "text-violet-600",
      iconBackground: "bg-violet-100 dark:bg-violet-900/30",
      metrics: [
        {
          title: "Tempo de Reação (PVT)",
          value: metrics.reaction_time_pvt_ms
            ? `${metrics.reaction_time_pvt_ms} ms`
            : "N/A",
          description: `Fadiga/Alerta: ${pvtStatus}`,
        },
        {
          title: "Lapsos no PVT",
          value: metrics.pvt_lapses_count
            ? `${metrics.pvt_lapses_count} lapsos`
            : "N/A",
          description: `Queda de atenção: ${lapsesStatus}`,
        },
        {
          title: "Score Cognitivo",
          value: metrics.cognitive_test_score
            ? metrics.cognitive_test_score.toFixed(2)
            : "N/A",
          description: `Performance diária: ${cognitiveStatus}`,
        },
        {
          title: "Índice de Estresse (HRV)",
          value: metrics.hrv_stress_index
            ? metrics.hrv_stress_index.toFixed(1)
            : "N/A",
          description: `Carga estressora: ${hrvStressStatus}`,
        },
        {
          title: "EDA Tônica Média",
          value: metrics.eda_tonic_microsiemens
            ? `${metrics.eda_tonic_microsiemens.toFixed(2)} µS`
            : "N/A",
          description: `Ativação simpática: ${edaStatus}`,
        },
        {
          title: "Carga de FA",
          value: metrics.afib_history_percent
            ? `${metrics.afib_history_percent.toFixed(1)}%`
            : "N/A",
          description: `Risco de Fibrilação Atrial: ${afibStatus}`,
        },
        {
          title: "Score de Humor",
          value: metrics.mood_score ? `${metrics.mood_score}/5` : "N/A",
          description: `Bem-estar percebido: ${moodStatus}`,
        },
        {
          title: "Minutos de Meditação",
          value: `${metrics.meditation_minutes} min`,
          description: "Foco e redução de estresse.",
        },
      ],
    },
    {
      title: "Saúde Geral",
      description: "Indicadores de saúde globais e composição corporal.",
      decorationColor: "emerald",
      icon: Smile,
      iconColor: "text-emerald-600",
      iconBackground: "bg-emerald-100 dark:bg-emerald-900/30",
      metrics: [
        {
          title: "Pressão Arterial",
          value:
            metrics.blood_pressure_systolic && metrics.blood_pressure_diastolic
              ? `${metrics.blood_pressure_systolic}/${metrics.blood_pressure_diastolic} mmHg`
              : "N/A",
          description: `Saúde cardiovascular: ${bpStatus}`,
        },
        {
          title: "Peso Corporal",
          value: metrics.weight_kg ? `${metrics.weight_kg.toFixed(1)} kg` : "N/A",
          description: "Monitoramento de composição.",
        },
        {
          title: "Hidratação Total",
          value: `${metrics.water_liters.toFixed(1)} L`,
          description: "Meta diária sugerida: 2.5 L.",
        },
        {
          title: "Calorias do treino",
          value: metrics.workout_calories
            ? `${metrics.workout_calories.toFixed(0)} kcal`
            : "N/A",
          description: "Energia dedicada ao exercício.",
        },
        {
          title: "Calorias totais",
          value: metrics.calories_burned
            ? `${metrics.calories_burned.toFixed(0)} kcal`
            : "N/A",
          description: "Gasto energético diário.",
        },
      ],
    },
  ];

  return (
    <Grid
      numItemsSm={1}
      numItemsMd={2}
      numItemsLg={2}
      numItemsXl={3}
      className="gap-6"
    >
      {pillars.map((pillar) => (
        <Card
          key={pillar.title}
          decoration="top"
          decorationColor={pillar.decorationColor}
          className="space-y-4"
        >
          <Flex justifyContent="between" alignItems="start" className="gap-4">
            <div>
              <Title className="text-base font-semibold text-tremor-content-strong">
                {pillar.title}
              </Title>
              <Text className="mt-1 text-sm text-tremor-content-subtle">
                {pillar.description}
              </Text>
            </div>
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full ${pillar.iconBackground}`}
            >
              <pillar.icon className={`h-5 w-5 ${pillar.iconColor}`} />
            </span>
          </Flex>

          <Divider className="my-2" />

          <div className="space-y-3">
            {pillar.metrics.map((metric) => (
              <div
                key={`${pillar.title}-${metric.title}`}
                className="rounded-lg border border-tremor-border bg-tremor-background-muted p-3"
              >
                <Flex justifyContent="between" alignItems="start" className="gap-4">
                  <div>
                    <Text className="font-medium text-tremor-content-strong">
                      {metric.title}
                    </Text>
                    <Text className="text-sm text-tremor-content-subtle">
                      {metric.description}
                    </Text>
                  </div>
                  <Text className="font-semibold text-right text-tremor-content-strong">
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
