"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";

export interface DailyMetric {
  date: string;
  steps: number;
  sleep_duration_minutes: number;
  resting_heart_rate: number | null;
  calories_burned: number | null;
  hrv_ms: number | null;
  deep_sleep_minutes: number;
  
  // New 30+ Metrics
  resting_heart_rate_min: number | null;
  resting_heart_rate_max: number | null;
  spo2_average: number | null;
  respiratory_rate: number | null;
  body_temperature_celsius: number | null;
  total_distance_km: number;
  active_minutes: number;
  workout_calories: number;
  vo2_max: number | null;
  sleep_latency_minutes: number | null;
  rem_sleep_minutes: number;
  light_sleep_minutes: number;
  sleep_efficiency: number | null;
  sleep_score: number | null;
  protein_grams: number;
  carb_grams: number;
  fat_grams: number;
  water_liters: number;
  caffeine_mg: number;
  stress_score: number | null;
  recovery_score: number | null;
  readiness_score: number | null;
  blood_glucose_mgdl: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  weight_kg: number | null;
  mood_score: number | null;
  meditation_minutes: number;
  
  // New metric: Heart Rate Recovery 1 min
  hrr_1min_bpm: number | null;

  // NEW SLEEP METRICS
  sleep_regularity_index: number | null;
  social_jetlag_hours: number | null;
  waso_minutes: number | null;

  // NEW ACTIVITY METRICS
  training_load_epoc: number | null;
  daily_strain: number | null;
  sedentary_hours: number | null;
  sedentary_breaks: number | null;
}

interface UseDailyMetricsResult {
  metrics: DailyMetric[];
  todayMetrics: DailyMetric | null;
  loading: boolean;
  refresh: () => void;
}

const defaultMetricValues = {
    steps: 0,
    sleep_duration_minutes: 0,
    deep_sleep_minutes: 0,
    total_distance_km: 0,
    active_minutes: 0,
    workout_calories: 0,
    rem_sleep_minutes: 0,
    light_sleep_minutes: 0,
    protein_grams: 0,
    carb_grams: 0,
    fat_grams: 0,
    water_liters: 0,
    caffeine_mg: 0,
    meditation_minutes: 0,
    // Nullable fields default to null
    resting_heart_rate: null,
    calories_burned: null,
    hrv_ms: null,
    resting_heart_rate_min: null,
    resting_heart_rate_max: null,
    spo2_average: null,
    respiratory_rate: null,
    body_temperature_celsius: null,
    vo2_max: null,
    sleep_latency_minutes: null,
    sleep_efficiency: null,
    sleep_score: null,
    stress_score: null,
    recovery_score: null,
    readiness_score: null,
    blood_glucose_mgdl: null,
    blood_pressure_systolic: null,
    blood_pressure_diastolic: null,
    weight_kg: null,
    mood_score: null,
    // New metric default
    hrr_1min_bpm: null,
    // NEW SLEEP METRICS DEFAULTS
    sleep_regularity_index: null,
    social_jetlag_hours: null,
    waso_minutes: null,
    // NEW ACTIVITY METRICS DEFAULTS
    training_load_epoc: null,
    daily_strain: null,
    sedentary_hours: null,
    sedentary_breaks: null,
}

export function useDailyMetrics(days: number = 7): UseDailyMetricsResult {
  const { supabase, session } = useAuth();
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const startDate = format(subDays(new Date(), days - 1), 'yyyy-MM-dd');
    const endDate = format(new Date(), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from("daily_metrics")
      .select(`
        date, steps, sleep_duration_minutes, resting_heart_rate, calories_burned, hrv_ms, deep_sleep_minutes,
        resting_heart_rate_min, resting_heart_rate_max, spo2_average, respiratory_rate, body_temperature_celsius,
        total_distance_km, active_minutes, workout_calories, vo2_max, sleep_latency_minutes, rem_sleep_minutes,
        light_sleep_minutes, sleep_efficiency, sleep_score, protein_grams, carb_grams, fat_grams, water_liters,
        caffeine_mg, stress_score, recovery_score, readiness_score, blood_glucose_mgdl, blood_pressure_systolic,
        blood_pressure_diastolic, weight_kg, mood_score, meditation_minutes,
        hrr_1min_bpm,
        sleep_regularity_index, social_jetlag_hours, waso_minutes,
        training_load_epoc, daily_strain, sedentary_hours, sedentary_breaks
      `)
      .eq("user_id", session.user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar métricas diárias.", { description: error.message });
      console.error("Error fetching daily metrics:", error);
      setMetrics([]);
    } else {
      // Ensure all 'days' are present, filling missing days with defaults for chart consistency
      const dateMap = new Map(data.map(m => [m.date, m]));
      const completeMetrics: DailyMetric[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const existingData = dateMap.get(date);
        
        completeMetrics.push({
          date,
          ...defaultMetricValues,
          ...existingData,
        } as DailyMetric);
      }
      
      setMetrics(completeMetrics);
    }
    setLoading(false);
  }, [session, supabase, days]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const todayMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : null;

  return { metrics, todayMetrics, loading, refresh: fetchMetrics };
}