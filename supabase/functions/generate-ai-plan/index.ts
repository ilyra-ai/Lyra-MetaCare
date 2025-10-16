// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Base plan structure and available recommendations
const allRecommendations = {
  nutrition: [
    { id: "protein_focus", title: "Foco em Proteína", details: "Aumente a ingestão para 1.2g/kg de peso corporal para suporte muscular e saciedade.", image: "protein" },
    { id: "fiber_increase", title: "Aumento de Fibras", details: "Consuma 30g de fibras por dia (vegetais, leguminosas) para saúde intestinal e controle glicêmico.", image: "fiber" },
    { id: "hydration_optimization", title: "Hidratação Otimizada", details: "Beba 35ml de água por kg de peso corporal, focando em eletrólitos após exercícios.", image: "hydration" },
  ],
  exercise: [
    { id: "strength_training", title: "Treino de Força (3x/semana)", details: "Sessões de 45 minutos focadas em exercícios compostos para manter a massa magra.", image: "strength" },
    { id: "aerobic_activity", title: "Atividade Aeróbica", details: "Mantenha 150 minutos de atividade moderada semanalmente (caminhada rápida, bicicleta).", image: "cardio" },
    { id: "reduce_sedentarism", title: "Reduzir Sedentarismo", details: "Faça uma pausa de 5 minutos a cada hora de trabalho sentado.", image: "sedentary" },
  ],
  sleep: [
    { id: "consistent_schedule", title: "Janela de Sono Consistente", details: "Vá para a cama e acorde no mesmo horário, mesmo nos fins de semana, para reduzir o Social Jetlag.", image: "regularity" },
    { id: "blue_light_block", title: "Bloqueio de Luz Azul", details: "Desligue telas 90 minutos antes de dormir para otimizar a produção de melatonina.", image: "light" },
    { id: "deep_sleep_optimization", title: "Otimizar Sono Profundo", details: "Evite cafeína após as 14h e faça exercícios leves no final da tarde.", image: "deep_sleep" },
  ],
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not found');

    // Fetch user profile to get their goals
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('goals')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // --- Simple AI Logic based on Goals ---
    const userGoals = profile.goals || [];
    const plan = {
      summary: "Seu plano de longevidade inicial, gerado com base em seus objetivos. Ele evoluirá à medida que você adicionar mais dados.",
      pillars: {
        nutrition: { title: "Nutrição", icon: "Utensils", color: "text-green-600", description: "Estratégias alimentares para otimizar o metabolismo.", items: [allRecommendations.nutrition[1]] },
        exercise: { title: "Exercícios", icon: "Dumbbell", color: "text-orange-600", description: "Rotina de atividades para força e resistência.", items: [allRecommendations.exercise[1]] },
        sleep: { title: "Sono", icon: "Moon", color: "text-indigo-600", description: "Otimização da higiene do sono e alinhamento circadiano.", items: [allRecommendations.sleep[0]] },
      }
    };

    // Add specific recommendations based on goals
    if (userGoals.includes('lose_weight') || userGoals.includes('gain_muscle')) {
      plan.pillars.nutrition.items.unshift(allRecommendations.nutrition[0]); // Add protein focus
    }
    if (userGoals.includes('improve_endurance') || userGoals.includes('meet_activity_guidelines')) {
        plan.pillars.exercise.items.unshift(allRecommendations.exercise[0]); // Add strength training
    }
    if (userGoals.includes('regulate_sleep_duration') || userGoals.includes('improve_sleep_efficiency')) {
        plan.pillars.sleep.items.push(allRecommendations.sleep[1]); // Add blue light blocking
    }

    // Save the generated plan to the database
    const { data: savedPlan, error: saveError } = await supabaseClient
      .from('ai_plans')
      .upsert({ user_id: user.id, plan_data: plan }, { onConflict: 'user_id' })
      .select()
      .single();

    if (saveError) throw saveError;

    return new Response(JSON.stringify(savedPlan.plan_data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})