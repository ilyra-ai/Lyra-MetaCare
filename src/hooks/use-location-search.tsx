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

// Ajustando a tipagem para refletir a relação: cidade -> estado
interface CidadeQueryResult {
  nome: string;
  // O Supabase retorna a relação como um array com o nome da tabela de destino ('estado')
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
      // Revertendo para a sintaxe padrão de aninhamento.
      // Agora que as FKs estão definidas, o PostgREST deve inferir a relação.
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

      // Usando a tipagem padrão
      const citiesData = data as CidadeQueryResult[];

      const results: LocationResult[] = [];

      citiesData.forEach(city => {
        // Acessa o primeiro estado (se existir)
        const stateData = city.estado?.[0]; 
        
        // Acessa o primeiro país dentro do estado (se existir)
        const countryData = stateData?.pais?.[0];

        // Se a relação falhar, stateData e countryData serão undefined, resultando em N/A.
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
      console.error("Error searching locations:", error);
      
      let errorMessage = "Erro desconhecido na busca de localização.";
      
      if (error && typeof error === 'object' && 'message' in error) {
          errorMessage = (error as { message: string }).message;
      } else if (error instanceof Error) {
          errorMessage = error.message;
      }
      
      toast.error("Erro na busca de localização.", { description: errorMessage });
      
      return [];
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return { searchLocations, loading };
}