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

interface AIScores {
    longevityScore: number;
    readinessScore: number;
}

/**
 * Função placeholder para chamar a API de IA externa.
 * 
 * ESTE É O PONTO DE INTEGRAÇÃO REAL:
 * Substitua o bloco de SIMULAÇÃO pela chamada fetch() para o endpoint 
 * do seu modelo de IA (ex: OpenAI, Gemini, ou modelo customizado).
 * 
 * O modelo de IA deve receber as 'metrics' e retornar 'longevityScore' e 'readinessScore'.
 */
async function callExternalAI(metrics: DailyMetric): Promise<AIScores> {
    // --- INÍCIO DO BLOCO DE INTEGRAÇÃO COM API EXTERNA (SIMULAÇÃO) ---
    
    // Exemplo de como você enviaria os dados para a API externa:
    /*
    const externalApiKey = Deno.env.get('EXTERNAL_AI_KEY');
    const aiResponse = await fetch('https://api.external-ai.com/calculate', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${externalApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_metrics: metrics })
    });
    
    if (!aiResponse.ok) {
        throw new Error(`External AI API failed with status: ${aiResponse.status}`);
    }
    
    const result = await aiResponse.json();
    return { longevityScore: result.longevity, readinessScore: result.readiness };
    */

    // SIMULAÇÃO: Retornando valores fixos para manter a funcionalidade
    const simulatedLongevity = 7.8;
    const simulatedReadiness = 85;

    return {
        longevityScore: simulatedLongevity,
        readinessScore: simulatedReadiness,
    };
    
    // --- FIM DO BLOCO DE INTEGRAÇÃO COM API EXTERNA (SIMULAÇÃO) ---
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

    // 1. Autenticação Manual
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

    // 3. Chamar a API de IA externa (Ponto de delegação para o modelo de IA)
    const scores = await callExternalAI(metricsData as DailyMetric);

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