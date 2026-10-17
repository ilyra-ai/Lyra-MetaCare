'use client';

/**
 * Hook useVedicInsights — Lyra MetaCare
 *
 * Integra os motores integrativos em um único hook React:
 * 1. Dosha Ayurvédico Dinâmico
 * 2. Índice de Coerência Quântica
 * 3. Alinhamento de Chakras
 * 4. Índice Pránico (Energia Vital)
 * 5. Pancha Koshas
 *
 * Consome dados do HealthOrchestratorContext e do hook useDailyMetrics.
 * Cada índice só é calculado quando uma parte mínima dos seus sinais foi
 * realmente medida no dia (tarefa 57, ver `lib/integrativo/cobertura`); sem
 * isso, o índice fica `null` e a tela mostra o que falta, em vez de um número
 * montado com valores de referência.
 */

import { useMemo } from 'react';
import { useHealthOrchestrator } from '@/context/HealthOrchestratorContext';
import { useDailyMetrics, type DailyMetric } from '@/hooks/use-daily-metrics';
import {
  calculateDynamicDosha,
  type DoshaResult,
} from '@/lib/ayurveda/dosha-engine';
import {
  calculateChakraAlignment,
  type ChakraAlignmentResult,
} from '@/lib/chakra/alignment-engine';
import {
  avaliarCobertura,
  type Cobertura,
  SINAIS_DA_COERENCIA,
  SINAIS_DO_DOSHA,
  SINAIS_DO_PRANA,
  SINAIS_DOS_CHAKRAS,
  SINAIS_DOS_KOSHAS,
} from '@/lib/integrativo/cobertura';
import {
  calculatePranicIndex,
  type PranicIndexResult,
} from '@/lib/prana/prana-engine';
import {
  calculateQuantumCoherence,
  type QuantumCoherenceResult,
} from '@/lib/quantum/coherence-engine';
import { calculateKoshas, type KoshaResult } from '@/lib/vedanta/kosha-engine';

/** Um índice integrativo e a cobertura dos sinais que o alimentaram. */
export interface IndiceIntegrativo<T> {
  /** `null` quando os sinais medidos não bastam para o índice. */
  resultado: T | null;
  cobertura: Cobertura;
}

/** Resultado consolidado de todos os insights védicos. */
export interface VedicInsights {
  /**
   * O dosha sempre tem leitura: com sinais suficientes, pelos sinais do corpo
   * e pelo céu (`base: 'metricas'`); sem eles, só pela tendência da Lua
   * (`base: 'lua'`), como no "Meu dia".
   */
  dosha: {
    resultado: DoshaResult;
    cobertura: Cobertura;
    base: 'metricas' | 'lua';
  };
  coherence: IndiceIntegrativo<QuantumCoherenceResult>;
  chakras: IndiceIntegrativo<ChakraAlignmentResult>;
  prana: IndiceIntegrativo<PranicIndexResult>;
  koshas: IndiceIntegrativo<KoshaResult>;
  /** Nos 7 dias, do mais antigo ao de hoje; null quando o dia não basta. */
  history: Array<{
    date: string;
    /** Data ISO (AAAA-MM-DD) do registro. */
    iso: string;
    icq: number | null;
    prana: number | null;
    kosha: number | null;
  }>;
  loading: boolean;
}

type Snapshot = ReturnType<typeof buildMetricSnapshot>;

/** Biomarcadores do DailyMetric para os motores, sem conversões. */
function buildMetricSnapshot(metric: DailyMetric) {
  return {
    hrv_ms: metric.hrv_ms,
    resting_heart_rate: metric.resting_heart_rate,
    body_temperature_celsius: metric.body_temperature_celsius,
    sleep_duration_minutes: metric.sleep_duration_minutes,
    deep_sleep_minutes: metric.deep_sleep_minutes,
    rem_sleep_minutes: metric.rem_sleep_minutes,
    active_minutes: metric.active_minutes,
    sedentary_hours: metric.sedentary_hours,
    blood_glucose_mgdl: metric.blood_glucose_mgdl,
    weight_kg: metric.weight_kg,
    stress_score: metric.stress_score,
    water_liters: metric.water_liters,
    respiratory_rate: metric.respiratory_rate,
    mood_score: metric.mood_score,
    spo2_average: metric.spo2_average,
    sleep_regularity_index: metric.sleep_regularity_index,
    cognitive_test_score: metric.cognitive_test_score,
    reaction_time_pvt_ms: metric.reaction_time_pvt_ms,
    meditation_minutes: metric.meditation_minutes,
    hrv_stress_index: metric.hrv_stress_index,
    dietary_fiber_grams: metric.dietary_fiber_grams,
    hydration_ml_per_kg: metric.hydration_ml_per_kg,
    eating_window_hours: metric.eating_window_hours,
    steps: metric.steps,
    vo2_max: metric.vo2_max,
  };
}

/** Snapshot só com ausências (para o dosha pela Lua, sem sinais do corpo). */
const SEM_SINAIS: Snapshot = {
  hrv_ms: null,
  resting_heart_rate: null,
  body_temperature_celsius: null,
  sleep_duration_minutes: null,
  deep_sleep_minutes: null,
  rem_sleep_minutes: null,
  active_minutes: null,
  sedentary_hours: null,
  blood_glucose_mgdl: null,
  weight_kg: null,
  stress_score: null,
  water_liters: null,
  respiratory_rate: null,
  mood_score: null,
  spo2_average: null,
  sleep_regularity_index: null,
  cognitive_test_score: null,
  reaction_time_pvt_ms: null,
  meditation_minutes: null,
  hrv_stress_index: null,
  dietary_fiber_grams: null,
  hydration_ml_per_kg: null,
  eating_window_hours: null,
  steps: null,
  vo2_max: null,
};

/**
 * Hook principal: calcula os insights integrativos de forma reativa com
 * base nos dados reais do dia.
 */
export function useVedicInsights(enabled = true): VedicInsights {
  const { astrology } = useHealthOrchestrator();
  const { metrics, todayMetrics, loading } = useDailyMetrics(7, enabled);

  // Sem registro hoje, nenhum sinal entra (nunca zeros).
  const snapshot = useMemo<Snapshot | null>(
    () => (todayMetrics?.registrado ? buildMetricSnapshot(todayMetrics) : null),
    [todayMetrics]
  );

  const dosha = useMemo(() => {
    const cobertura = avaliarCobertura(snapshot, SINAIS_DO_DOSHA);
    const base: 'metricas' | 'lua' = cobertura.suficiente ? 'metricas' : 'lua';
    return {
      resultado: calculateDynamicDosha(
        base === 'metricas' && snapshot ? snapshot : SEM_SINAIS,
        astrology
      ),
      cobertura,
      base,
    };
  }, [snapshot, astrology]);

  const coherence = useMemo(() => {
    const cobertura = avaliarCobertura(snapshot, SINAIS_DA_COERENCIA);
    return {
      resultado:
        cobertura.suficiente && snapshot
          ? calculateQuantumCoherence(snapshot, astrology)
          : null,
      cobertura,
    };
  }, [snapshot, astrology]);

  const chakras = useMemo(() => {
    const cobertura = avaliarCobertura(snapshot, SINAIS_DOS_CHAKRAS);
    return {
      resultado:
        cobertura.suficiente && snapshot
          ? calculateChakraAlignment(snapshot)
          : null,
      cobertura,
    };
  }, [snapshot]);

  const prana = useMemo(() => {
    const cobertura = avaliarCobertura(snapshot, SINAIS_DO_PRANA);
    return {
      resultado:
        cobertura.suficiente && snapshot
          ? calculatePranicIndex(snapshot, astrology)
          : null,
      cobertura,
    };
  }, [snapshot, astrology]);

  const koshas = useMemo(() => {
    const cobertura = avaliarCobertura(snapshot, SINAIS_DOS_KOSHAS);
    return {
      resultado:
        cobertura.suficiente && snapshot
          ? calculateKoshas(snapshot, astrology)
          : null,
      cobertura,
    };
  }, [snapshot, astrology]);

  // Tendência dos 7 dias em ordem cronológica. Só os sinais do corpo de cada
  // dia (o céu de hoje não se aplica aos dias passados) e só nos dias com
  // sinais suficientes para cada índice; os demais ficam nulos (lacuna).
  const history = useMemo(() => {
    return metrics.map((m) => {
      const date = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
        .format(new Date(`${m.date}T12:00:00`))
        .replace('.', '');
      const snap = m.registrado ? buildMetricSnapshot(m) : null;
      const vazio = { date, iso: m.date, icq: null, prana: null, kosha: null };
      if (!snap) return vazio;
      return {
        ...vazio,
        icq: avaliarCobertura(snap, SINAIS_DA_COERENCIA).suficiente
          ? calculateQuantumCoherence(snap).index
          : null,
        prana: avaliarCobertura(snap, SINAIS_DO_PRANA).suficiente
          ? calculatePranicIndex(snap).index
          : null,
        kosha: avaliarCobertura(snap, SINAIS_DOS_KOSHAS).suficiente
          ? calculateKoshas(snap).overallScore
          : null,
      };
    });
  }, [metrics]);

  return { dosha, coherence, chakras, prana, koshas, history, loading };
}
