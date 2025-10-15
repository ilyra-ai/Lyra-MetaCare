"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface AIScores {
  longevityScore: number;
  readinessScore: number;
}

interface UseAIScoresResult {
  scores: AIScores | null;
  loading: boolean;
  refresh: () => void;
}

// URL da Edge Function (Substitua gmrxhgcuwtghjskikfug pelo seu Project ID)
const EDGE_FUNCTION_URL = "https://gmrxhgcuwtghjskikfug.supabase.co/functions/v1/calculate-longevity-score";

export function useAIScores(): UseAIScoresResult {
  const { session } = useAuth();
  const [scores, setScores] = useState<AIScores | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchScores = useCallback(async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const data: AIScores = await response.json();
      setScores(data);

    } catch (error) {
      console.error("Error fetching AI scores:", error);
      toast.error("Erro ao calcular scores de IA.", { description: (error as Error).message });
      setScores({ longevityScore: 5.0, readinessScore: 50 }); // Fallback
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  return { scores, loading, refresh: fetchScores };
}