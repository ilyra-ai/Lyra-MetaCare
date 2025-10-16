// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// This is a placeholder for a real LLM call.
async function getAIResponse(query: string, userContext: any) {
  // @ts-ignore
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

  if (!OPENAI_API_KEY) {
    // Return a helpful mock response if the API key is not set.
    return `(Modo de Demonstração) A chave da API da OpenAI não foi configurada. Para habilitar respostas reais, por favor, adicione a chave 'OPENAI_API_KEY' nas 'Secrets' da sua Edge Function no painel da Supabase. A sua pergunta foi: "${query}"`;
  }

  // Example of a real API call structure (this part won't run without a key)
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `Você é um assistente de saúde e longevidade. Use o seguinte contexto do usuário para personalizar suas respostas: ${JSON.stringify(userContext)}` },
        { role: 'user', content: query },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error.message}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query) {
      throw new Error('Query is required.');
    }

    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not found');

    // Fetch user context (profile and latest metrics) to provide to the AI
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('first_name, age, gender, goals')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    const { data: latestMetric, error: metricError } = await supabaseClient
      .from('daily_metrics')
      .select('steps, sleep_duration_minutes, hrv_ms, readiness_score')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    // Combine context, ignoring metric error if no metrics exist yet
    const userContext = {
      profile,
      latestMetric: metricError ? null : latestMetric,
    };

    const aiResponse = await getAIResponse(query, userContext);

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});