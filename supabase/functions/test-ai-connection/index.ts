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

    console.log(`Attempting real connection test to: ${endpoint}`);
    
    // --- CHAMADA DE REDE REAL PARA O ENDPOINT FORNECIDO ---
    // Esta chamada simula a tentativa de listar modelos ou verificar o status da API de IA.
    
    let aiResponse: Response;
    try {
        aiResponse = await fetch(endpoint, {
            method: 'GET', // Assumindo que a listagem de modelos é um GET
            headers: { 
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
            },
        });
    } catch (networkError) {
        console.error("Network Error:", networkError);
        return new Response(JSON.stringify({ 
            success: false, 
            error: `Erro de rede ao tentar alcançar o endpoint: ${(networkError as Error).message}` 
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }

    if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error(`External AI API failed with status: ${aiResponse.status}. Response: ${errorText}`);
        
        return new Response(JSON.stringify({ 
            success: false, 
            error: `Falha na API externa. Status: ${aiResponse.status}. Mensagem: ${errorText.substring(0, 100)}...` 
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: aiResponse.status,
        });
    }
    
    // Se a chamada for bem-sucedida (status 200-299), retornamos os modelos mockados
    // (pois não podemos garantir o formato de resposta da API externa real).
    return new Response(JSON.stringify({ 
        success: true, 
        models: MOCK_MODELS,
        message: "Conexão HTTP bem-sucedida. Modelos mockados retornados."
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    });

  } catch (error) {
    console.error("Error in test-ai-connection:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})