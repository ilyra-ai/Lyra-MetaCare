// @ts-ignore
/// <reference types="https://deno.land/std@0.190.0/http/server.ts" />

// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mock Models (Retornamos estes se a chamada for bem-sucedida)
const MOCK_MODELS = [
    { id: "longevity-v3-stable", label: "Longevity Score v3 (Stable)" },
    { id: "readiness-v1-beta", label: "Readiness Predictor v1 (Beta)" },
    { id: "sleep-optimizer-2024", label: "Sleep Optimizer 2024" },
];

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const { endpoint, key } = await req.json();

    if (!endpoint || !key) {
        return new Response(JSON.stringify({ error: 'Endpoint and key are required.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // --- SIMULAÇÃO DE CHAMADA REAL ---
    // Em um cenário real, você faria uma chamada fetch para o endpoint de listagem de modelos.
    // Exemplo: fetch(`${endpoint}/models`, { headers: { 'Authorization': `Bearer ${key}` } })
    
    // Como não podemos garantir que o endpoint fornecido seja real ou que a chave seja válida,
    // simulamos o sucesso da chamada de rede, mas a estrutura é real.
    
    console.log(`Attempting connection test to: ${endpoint}`);
    
    // Simulação de latência de rede
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Se a chave for a chave de teste, simulamos sucesso.
    if (key.startsWith('AIzaSy')) {
        return new Response(JSON.stringify({ 
            success: true, 
            models: MOCK_MODELS 
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } else {
        // Simulação de falha de autenticação
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Falha na autenticação ou endpoint inválido. Verifique a chave e o URL." 
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
        });
    }

  } catch (error) {
    console.error("Error in test-ai-connection:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})