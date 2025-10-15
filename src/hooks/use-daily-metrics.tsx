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
}

interface UseDailyMetricsResult {
  metrics: DailyMetric[];
  todayMetrics: DailyMetric | null;
  loading: boolean;
  refresh: () => void;
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
      .select("date, steps, sleep_duration_minutes, resting_heart_rate, calories_burned")
      .eq("user_id", session.user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar métricas diárias.", { description: error.message });
      console.error("Error fetching daily metrics:", error);
      setMetrics([]);
    } else {
      // Ensure all 'days' are present, filling missing days with 0s for chart consistency
      const dateMap = new Map(data.map(m => [m.date, m]));
      const completeMetrics: DailyMetric[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const existingData = dateMap.get(date);
        
        completeMetrics.push({
          date,
          steps: existingData?.steps || 0,
          sleep_duration_minutes: existingData?.sleep_duration_minutes || 0,
          resting_heart_rate: existingData?.resting_heart_rate || null,
          calories_burned: existingData?.calories_burned || null,
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