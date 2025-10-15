"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface LocationResult {
  id: string;
  label: string; // Ex: 'São Paulo, SP, Brasil'
  city: string;
  state: string;
  country: string;
}

// --- Interfaces para tipagem do resultado do Supabase ---
interface PaisResult {
  nome_pt: string | null;
}

interface EstadoResult {
  uf: string | null; // State abbreviation
  pais: PaisResult[]; 
}

interface CidadeQueryResult {
  nome: string;
  uf: string | null; // UF da cidade (se existir)
  estado: EstadoResult[]; 
}
// -------------------------------------------------------

export function useLocationSearch() {
  const { supabase } = useAuth();
  const [loading, setLoading] = useState(false);

  const searchLocations = useCallback(async (query: string): Promise<LocationResult[]> => {
    if (!query || query.length < 3) {
      return [];
    }

    setLoading(true);
    const searchLower = query.toLowerCase();
    
    try {
      // A query aninhada agora deve funcionar corretamente, pois as FKs foram definidas.
      const { data, error: citiesError } = await supabase
        .from('cidade')
        .select(`
          nome,
          estado (
            uf, 
            pais (nome_pt)
          )
        `)
        .ilike('nome', `%${searchLower}%`)
        .limit(10);

      if (citiesError) {
        throw citiesError;
      }

      const citiesData = data as CidadeQueryResult[];

      const results: LocationResult[] = [];

      citiesData.forEach(city => {
        // Acessa o primeiro estado (se existir)
        const stateData = city.estado?.[0]; 
        // Acessa o primeiro país dentro do estado (se existir)
        const countryData = stateData?.pais?.[0];

        // Ajustando a lógica de acesso e garantindo fallbacks
        const state = stateData?.uf || 'N/A';
        const country = countryData?.nome_pt || 'N/A';
        
        results.push({
          id: `${city.nome}-${state}-${country}`,
          label: `${city.nome}, ${state}, ${country}`,
          city: city.nome,
          state: state,
          country: country,
        });
      });

      return results;

    } catch (error) {
      // Logando o erro de forma mais detalhada
      console.error("Error searching locations:", error);
      
      let errorMessage = "Erro desconhecido na busca de localização.";
      
      // Tentativa de extrair a mensagem de erro do Supabase
      if (error && typeof error === 'object' && 'message' in error) {
          errorMessage = (error as { message: string }).message;
      } else if (error instanceof Error) {
          errorMessage = error.message;
      }
      
      toast.error("Erro na busca de localização.", { description: errorMessage });
      
      // Retorna um array vazio em caso de erro para não quebrar a UI
      return [];
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return { searchLocations, loading };
}