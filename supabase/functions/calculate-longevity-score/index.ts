// @ts-ignore
/// <reference types="https://deno.land/std@0.190.0/http/server.ts" />
// @ts-ignore
/// <reference types="https://esm.sh/@supabase/supabase-js@2.45.0" />

// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Define a interface para as métricas que esperamos do banco de dados
interface DailyMetric {
    hrv_ms: number | null;
    sleep_duration_minutes: number;
    steps: number;
    recovery_score: number | null;
    readiness_score: number | null;
    resting_heart_rate: number | null;
    hrr_1min_bpm: number | null;
    body_temperature_celsius: number | null;
    spo2_average: number | null;
    protein_grams: number;
    carb_grams: number;
    fat_grams: number;
    water_liters: number;
    mood_score: number | null;
    meditation_minutes: number;
}

// Função principal de cálculo (Placeholder para a lógica de IA/Clínica)
function calculateScores(metrics: DailyMetric): { longevityScore: number, readinessScore: number } {
    // --- LÓGICA DE CÁLCULO DE LONGEVIDADE E PRONTIDÃO SERÁ INSERIDA AQUI ---
    
    // Exemplo de lógica simples (Placeholder)
    let longevityScore = 7.0;
    let readinessScore = 70;

    if (metrics.hrv_ms && metrics.hrv_ms > 50) {
        longevityScore += 0.5;
        readinessScore += 10;
    }
    if (metrics.sleep_duration_minutes > 450) {
        longevityScore += 0.3;
        readinessScore += 5;
    }
    if (metrics.steps > 10000) {
        longevityScore += 0.2;
    }

    return {
        longevityScore: Math.min(9.9, longevityScore),
        readinessScore: Math.min(100, readinessScore)
    };
}


serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // @ts-ignore
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // 1. Autenticação Manual (Verifica se o usuário está logado)
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Buscar as métricas mais recentes do usuário
    const { data: metricsData, error } = await supabaseClient
      .from('daily_metrics')
      .select(
        `
        hrv_ms, sleep_duration_minutes, steps, recovery_score, readiness_score,
        resting_heart_rate, hrr_1min_bpm, body_temperature_celsius, spo2_average,
        protein_grams, carb_grams, fat_grams, water_liters, mood_score, meditation_minutes
        `
      )
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error) {
        console.error("Database Error:", error);
        return new Response(JSON.stringify({ error: 'Failed to fetch metrics' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
    
    if (!metricsData) {
        return new Response(JSON.stringify({ longevityScore: 7.0, readinessScore: 70, message: "No data found" }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // 3. Calcular os scores
    const scores = calculateScores(metricsData as DailyMetric);

    // 4. Retornar o resultado
    return new Response(JSON.stringify(scores), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})