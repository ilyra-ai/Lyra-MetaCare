// /// <reference types="https://deno.land/std@0.190.0/http/server.ts" />
// /// <reference types="https://esm.sh/@supabase/supabase-js@2.45.0" />

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

// Função principal de cálculo (Simulação de IA Clínica)
function calculateScores(metrics: DailyMetric): { longevityScore: number, readinessScore: number } {
    // Valores padrão (se faltarem dados)
    let readinessScore = 50; // Base 50/100
    let longevityScore = 5.0; // Base 5.0/10.0

    // --- 1. CÁLCULO DO SCORE DE PRONTIDÃO (Readiness Score /100) ---
    
    // Pesos: HRV (40%), Sono Total (30%), FC Repouso (20%), Temp. Cutânea (10%)
    let readinessPoints = 0;

    // 1.1. HRV (40 pontos máx)
    const hrv = metrics.hrv_ms || 0;
    if (hrv >= 50) readinessPoints += 40;
    else if (hrv >= 30) readinessPoints += 25;
    else readinessPoints += 10;

    // 1.2. Sono Total (30 pontos máx)
    const sleepHours = (metrics.sleep_duration_minutes || 0) / 60;
    if (sleepHours >= 7.5) readinessPoints += 30;
    else if (sleepHours >= 6) readinessPoints += 20;
    else readinessPoints += 10;

    // 1.3. FC de Repouso (20 pontos máx)
    const restingHR = metrics.resting_heart_rate || 70; // Média 70
    if (restingHR <= 60) readinessPoints += 20;
    else if (restingHR <= 75) readinessPoints += 15;
    else readinessPoints += 5;

    // 1.4. Temperatura Cutânea (10 pontos máx) - Assumindo que o valor é o desvio do basal
    const tempDeviation = metrics.body_temperature_celsius || 0;
    if (Math.abs(tempDeviation) <= 0.3) readinessPoints += 10;
    else readinessPoints += 3;

    readinessScore = Math.round(Math.min(100, readinessPoints));


    // --- 2. CÁLCULO DO SCORE DE LONGEVIDADE (Longevity Score /10.0) ---
    
    // Pesos: HRR 1' (30%), Passos (25%), Proteína (25%), Meditação (20%)
    let longevityPoints = 0; // Base 0, máximo 100
    
    // 2.1. HRR 1' (30 pontos máx)
    const hrr = metrics.hrr_1min_bpm || 15; // Média 15
    if (hrr >= 30) longevityPoints += 30;
    else if (hrr >= 20) longevityPoints += 20;
    else longevityPoints += 10;

    // 2.2. Passos (25 pontos máx)
    const steps = metrics.steps || 0;
    if (steps >= 10000) longevityPoints += 25;
    else if (steps >= 5000) longevityPoints += 15;
    else longevityPoints += 5;

    // 2.3. Proteína (25 pontos máx) - Meta de 105g (1.5g/kg para 70kg)
    const protein = metrics.protein_grams || 0;
    if (protein >= 105) longevityPoints += 25;
    else if (protein >= 70) longevityPoints += 15;
    else longevityPoints += 5;

    // 2.4. Meditação (20 pontos máx)
    const meditation = metrics.meditation_minutes || 0;
    if (meditation >= 15) longevityPoints += 20;
    else if (meditation >= 5) longevityPoints += 10;
    else longevityPoints += 5;

    // Converter para escala /10.0
    longevityScore = parseFloat((longevityPoints / 10).toFixed(1));
    longevityScore = Math.min(9.9, longevityScore); // Limite superior

    return {
        longevityScore,
        readinessScore,
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
        // Retorna scores base se não houver dados
        return new Response(JSON.stringify({ longevityScore: 5.0, readinessScore: 50, message: "No data found" }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // 3. Calcular os scores usando a lógica de IA
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