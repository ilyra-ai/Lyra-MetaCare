'use client';

/**
 * Hook useVedicInsights — Lyra MetaCare
 *
 * Integra os 4 motores védicos-quânticos em um único hook React:
 * 1. Dosha Ayurvédico Dinâmico
 * 2. Índice de Coerência Quântica
 * 3. Chakra Alignment Score
 * 4. Índice Pránico (Energia Vital)
 *
 * Consome dados do HealthOrchestratorContext e do hook useDailyMetrics
 * para alimentar os motores com biomarcadores reais.
 */

import { useMemo } from 'react';
import { useHealthOrchestrator } from '@/context/HealthOrchestratorContext';
import { useDailyMetrics, type DailyMetric } from '@/hooks/use-daily-metrics';
import {
  calculateDynamicDosha,
  type DoshaResult,
} from '@/lib/ayurveda/dosha-engine';
import {
  calculateQuantumCoherence,
  type QuantumCoherenceResult,
} from '@/lib/quantum/coherence-engine';
import {
  calculateChakraAlignment,
  type ChakraAlignmentResult,
} from '@/lib/chakra/alignment-engine';
import {
  calculatePranicIndex,
  type PranicIndexResult,
} from '@/lib/prana/prana-engine';

/** Resultado consolidado de todos os insights védicos. */
export interface VedicInsights {
  dosha: DoshaResult;
  coherence: QuantumCoherenceResult;
  chakras: ChakraAlignmentResult;
  prana: PranicIndexResult;
  loading: boolean;
}

/**
 * Extrai os biomarcadores do DailyMetric para os motores védicos.
 * Todos os campos são mapeados diretamente — sem hardcode nem simulação.
 */
function buildMetricSnapshot(metric: DailyMetric | null) {
  if (!metric) {
    return null;
  }

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

/**
 * Hook principal: calcula todos os insights védicos-quânticos
 * de forma reativa com base nos dados reais do dia.
 */
export function useVedicInsights(enabled = true): VedicInsights {
  const { astrology } = useHealthOrchestrator();
  const { todayMetrics, loading } = useDailyMetrics(7, enabled);

  const snapshot = useMemo(
    () => buildMetricSnapshot(todayMetrics),
    [todayMetrics]
  );

  const dosha = useMemo(() => {
    if (!snapshot) {
      return calculateDynamicDosha(
        {
          hrv_ms: null,
          resting_heart_rate: null,
          body_temperature_celsius: null,
          sleep_duration_minutes: null,
          deep_sleep_minutes: null,
          active_minutes: null,
          sedentary_hours: null,
          blood_glucose_mgdl: null,
          weight_kg: null,
          stress_score: null,
          water_liters: null,
          respiratory_rate: null,
          mood_score: null,
        },
        astrology
      );
    }
    return calculateDynamicDosha(snapshot, astrology);
  }, [snapshot, astrology]);

  const coherence = useMemo(() => {
    if (!snapshot) {
      return calculateQuantumCoherence(
        {
          hrv_ms: null,
          resting_heart_rate: null,
          sleep_duration_minutes: null,
          deep_sleep_minutes: null,
          rem_sleep_minutes: null,
          spo2_average: null,
          respiratory_rate: null,
          stress_score: null,
          mood_score: null,
          meditation_minutes: null,
          sleep_regularity_index: null,
        },
        astrology
      );
    }
    return calculateQuantumCoherence(snapshot, astrology);
  }, [snapshot, astrology]);

  const chakras = useMemo(() => {
    if (!snapshot) {
      return calculateChakraAlignment({
        weight_kg: null,
        sedentary_hours: null,
        deep_sleep_minutes: null,
        water_liters: null,
        mood_score: null,
        blood_glucose_mgdl: null,
        active_minutes: null,
        dietary_fiber_grams: null,
        hrv_ms: null,
        resting_heart_rate: null,
        spo2_average: null,
        respiratory_rate: null,
        sleep_regularity_index: null,
        cognitive_test_score: null,
        reaction_time_pvt_ms: null,
        rem_sleep_minutes: null,
        meditation_minutes: null,
        stress_score: null,
        hrv_stress_index: null,
      });
    }
    return calculateChakraAlignment(snapshot);
  }, [snapshot]);

  const prana = useMemo(() => {
    if (!snapshot) {
      return calculatePranicIndex(
        {
          spo2_average: null,
          respiratory_rate: null,
          meditation_minutes: null,
          dietary_fiber_grams: null,
          water_liters: null,
          hydration_ml_per_kg: null,
          blood_glucose_mgdl: null,
          body_temperature_celsius: null,
          eating_window_hours: null,
          mood_score: null,
          cognitive_test_score: null,
          reaction_time_pvt_ms: null,
          hrv_ms: null,
          resting_heart_rate: null,
          steps: null,
          active_minutes: null,
          vo2_max: null,
        },
        astrology
      );
    }
    return calculatePranicIndex(snapshot, astrology);
  }, [snapshot, astrology]);

  return { dosha, coherence, chakras, prana, loading };
}
