// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IncomingPayload {
  metrics: {
    hrv_ms: number | null;
    sleep_duration_minutes: number | null;
    steps: number | null;
    blood_glucose_mgdl: number | null;
    weight_kg: number | null;
  };
  astrology: {
    moonPhase: number;
    moonSign: string;
    sunSign: string;
    nakshatra: string;
  };
  goals: string[];
}

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
    if (!user) {
      return new Response(JSON.stringify({ error: "Sessão não autenticada no Supabase." }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload: IncomingPayload = await req.json();

    // 1. Delegando a Inteligência para a IA Generativa Remota via API (ex: OpenAI GPT-4o / Claude 3.5 Sonnet)
    // Sem simuladores, mock ou if-else lógicos nesta camada.
    // @ts-ignore
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey || openAIApiKey === "SUA_CHAVE_OPENAI_AQUI") {
        console.error("ERRO CRÍTICO ESTRUTURAL: A chave de API 'OPENAI_API_KEY' não está configurada no ambiente da Edge Function (Deno).");
        return new Response(JSON.stringify({
            error: "Falha na Infraestrutura de IA: A chave da API responsável pelo processamento do plano de saúde não foi providenciada pelo administrador do sistema. A geração de planos simulados foi estritamente proibida."
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const systemPrompt = `Você é um motor de IA PhD Sênior Especialista em Saúde Preventiva Holística, Astrometria Védica e Longevidade Avançada.
Seu objetivo é gerar um plano de intervenção biológica e energética altamente restrito e direto ao ponto, estruturado em JSON e apenas JSON.
NUNCA explique os passos em markdown, devolva puramente o objeto JSON. Não crie placeholders ou simulações.

Estrutura JSON Obrigatória:
{
  "summary": "Resumo clínico-astrológico com no máximo 2 frases do contexto atual.",
  "pillars": {
    "nutrition": { "title": "string", "icon": "Utensils", "color": "text-teal-600", "description": "string", "items": [{"id": "uuid()", "title": "string", "details": "string", "image": "protein/fiber/hydration"}] },
    "exercise": { "title": "string", "icon": "Dumbbell", "color": "text-rose-600", "description": "string", "items": [{"id": "uuid()", "title": "string", "details": "string", "image": "strength/cardio/strain/sedentary"}] },
    "sleep": { "title": "string", "icon": "Moon", "color": "text-indigo-600", "description": "string", "items": [{"id": "uuid()", "title": "string", "details": "string", "image": "moon/light/deep_sleep"}] }
  }
}

DIRETRIZ CLÍNICA:
Analise as métricas e a astrologia do paciente fornecidos e calcule as sinergias. Por exemplo, se a HRV for < 40 e a fase lunar for próxima a 0 (Lua Nova), decrete máxima recuperação no exercício e indução do sono.`;

    const userPrompt = `DADOS BIOMÉTRICOS E ASTROMÉTRICOS DO PACIENTE EM TEMPO REAL:
HRV (Variabilidade da Frequência Cardíaca): ${payload.metrics.hrv_ms ?? 'Não fornecido'} ms
Tempo de Sono Anteriores: ${payload.metrics.sleep_duration_minutes ?? 'Não fornecido'} minutos
Passos Atuais: ${payload.metrics.steps ?? 'Não fornecido'}
Peso Atual: ${payload.metrics.weight_kg ?? 'Não fornecido'} kg
Glicose (Mg/Dl): ${payload.metrics.blood_glucose_mgdl ?? 'Não fornecido'}

ASTROMETRIA (Trânsito Astrológico no Céu Agora):
Signo Lunar (Sideral): ${payload.astrology.moonSign}
Nakshatra Atual: ${payload.astrology.nakshatra}
Fase da Lua (0=Nova, 0.5=Cheia): ${payload.astrology.moonPhase.toFixed(2)}

METAS DO PACIENTE:
${payload.goals.join(', ') || 'Nenhuma meta declarada, focar em longevidade geral e anti-aging.'}

Calcule o plano estruturado e exato. Sem explicações, apenas o JSON.`;

    // Conexão Remota via Fetch Padrão Deno Edge Function para a LLM
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o", // Modelo de fronteira da Open AI em 2026 / 2024 para cálculo clínico textual rápido (assumindo que seja GPT-4o ou semelhante)
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1, // Precisão Clínica
        response_format: { type: "json_object" } // Garantindo output JSON robusto (disponível em novos modelos OpenAI)
      })
    });

    if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("ERRO DA API LLM (OPENAI):", errorText);
        throw new Error(`O modelo de inteligência artificial de fronteira recusou ou falhou na inferência: ${aiResponse.statusText}. Leia o console de Logs do Supabase para o trace completo.`);
    }

    const aiData = await aiResponse.json();

    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message || !aiData.choices[0].message.content) {
         throw new Error("A API da OpenAI retornou um payload malformado de predição.");
    }

    const generatedPlan = JSON.parse(aiData.choices[0].message.content);

    // 2. Persistir o Plano Gerado pela Inteligência Artificial Oficialmente
    const { data: savedPlan, error: saveError } = await supabaseClient
      .from('ai_plans')
      .upsert({ user_id: user.id, plan_data: generatedPlan }, { onConflict: 'user_id' })
      .select()
      .single();

    if (saveError) {
        console.error("Falha ao salvar plano no Supabase Database:", saveError);
        throw new Error(`O plano foi calculado pela inteligência artificial, porém a gravação no banco de dados isolou e falhou: ${saveError.message}`);
    }

    return new Response(JSON.stringify(savedPlan.plan_data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Falha sistêmica não tratada na Edge Function 'generate-ai-plan':", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
