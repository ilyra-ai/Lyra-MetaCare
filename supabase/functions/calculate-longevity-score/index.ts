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

interface AIConfig {
    weight_hrv: number;
    weight_sleep: number;
    weight_activity: number;
    weight_nutrition: number;
    model_name: string | null;
}

interface AIScores {
    longevityScore: number;
    readinessScore: number;
}

/**
 * Função para buscar a configuração de IA usando a Service Role Key (ignora RLS).
 */
async function fetchAIConfig(serviceRoleSupabase: any): Promise<AIConfig | null> {
    const { data, error } = await serviceRoleSupabase
        .from('ai_config')
        .select(`weight_hrv, weight_sleep, weight_activity, weight_nutrition, model_name`)
        .limit(1)
        .single();

    if (error) {
        console.error("Error fetching AI config with Service Role:", error);
        return null;
    }
    return data as AIConfig;
}


/**
 * Função para chamar a API de IA externa de forma real.
 */
async function callExternalAI(metrics: DailyMetric, config: AIConfig): Promise<AIScores> {
    
    // @ts-ignore: Deno is available in the Edge Function runtime
    const externalApiKey = Deno.env.get('EXTERNAL_AI_KEY');
    // @ts-ignore: Deno is available in the Edge Function runtime
    const externalApiEndpoint = Deno.env.get('EXTERNAL_AI_ENDPOINT');
    
    if (!externalApiKey || !externalApiEndpoint || !config.model_name) {
        console.warn("External AI configuration missing (Key, Endpoint, or Model Name). Using simulated scores.");
        // Fallback de simulação
        return { longevityScore: 5.0, readinessScore: 50 };
    }

    try {
        const aiResponse = await fetch(externalApiEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${externalApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                user_metrics: metrics, 
                weights: {
                    hrv: config.weight_hrv,
                    sleep: config.weight_sleep,
                    activity: config.weight_activity,
                    nutrition: config.weight_nutrition,
                },
                model: config.model_name
            })
        });
        
        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error(`External AI API failed with status: ${aiResponse.status}. Response: ${errorText}`);
            // Retorna um score neutro em caso de falha da API externa
            return { longevityScore: 5.0, readinessScore: 50 };
        }
        
        const result = await aiResponse.json();
        
        // Assumindo que a API retorna { longevity: number, readiness: number }
        return { 
            longevityScore: result.longevity || 7.5, 
            readinessScore: result.readiness || 80 
        };

    } catch (e) {
        console.error("Error during external AI call:", e);
        // Em caso de falha na chamada, retorna um score neutro para não quebrar o app
        return { longevityScore: 5.0, readinessScore: 50 };
    }
}


serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // 1. Cliente Supabase com JWT do usuário (para RLS)
    // @ts-ignore
    const userSupabaseClient = createClient(
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
    
    // 2. Cliente Supabase com Service Role Key (para ignorar RLS e ler ai_config)
    // @ts-ignore
    const serviceRoleSupabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )


    // 3. Autenticação Manual
    const { data: { user } } = await userSupabaseClient.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Buscar a configuração de IA (usando Service Role)
    const aiConfig = await fetchAIConfig(serviceRoleSupabaseClient);
    
    // Se a configuração falhar, usamos valores padrão
    const config = aiConfig || {
        weight_hrv: 30,
        weight_sleep: 30,
        weight_activity: 25,
        weight_nutrition: 15,
        model_name: 'default-fallback-model',
    };


    // 5. Buscar as métricas mais recentes do usuário (usando JWT do usuário)
    const { data: metricsData, error } = await userSupabaseClient
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

    if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found (expected single row)
        console.error("Database Error:", error);
        // Se for um erro real de DB (não apenas 'sem dados'), retorna 500
        return new Response(JSON.stringify({ error: 'Failed to fetch metrics from DB' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
    
    if (!metricsData) {
        // Retorna scores base se não houver dados (Status 200 OK)
        return new Response(JSON.stringify({ longevityScore: 5.0, readinessScore: 50, message: "No data found" }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // 6. Chamar a API de IA externa, passando as métricas e a configuração
    const scores = await callExternalAI(metricsData as DailyMetric, config);

    // 7. Retornar o resultado
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