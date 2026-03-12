'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface AIScores {
  longevityScore: number;
  readinessScore: number;
}

interface UseAIScoresResult {
  scores: AIScores | null;
  loading: boolean;
  refresh: () => void;
}

export function useAIScores(enabled = true): UseAIScoresResult {
  const { session, db } = useAuth();
  const [scores, setScores] = useState<AIScores | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchScores = useCallback(async () => {
    if (!enabled || !session?.access_token) {
      setScores(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await db.functions.invoke<AIScores>(
        'calculate-longevity-score'
      );

      if (response.error || !response.data) {
        throw new Error(response.error?.message || 'Falha no cálculo local.');
      }

      setScores(response.data);
    } catch (error) {
      console.error('Error fetching AI scores:', error);
      toast.error('Erro ao calcular scores de IA.', {
        description: (error as Error).message,
      });
      setScores(null);
    } finally {
      setLoading(false);
    }
  }, [enabled, session, db]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  return { scores, loading, refresh: fetchScores };
}
