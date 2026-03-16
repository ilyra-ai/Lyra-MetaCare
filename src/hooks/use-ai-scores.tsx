'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const isDisposedRef = useRef(false);

  const fetchScores = useCallback(async () => {
    if (!enabled || !session?.access_token) {
      if (!isDisposedRef.current) {
        setScores(null);
        setLoading(false);
      }
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

      if (!isDisposedRef.current) {
        setScores(response.data);
      }
    } catch (error) {
      if (!isDisposedRef.current) {
        console.error('Error fetching AI scores:', error);
        toast.error('Erro ao calcular scores de IA.', {
          description: (error as Error).message,
        });
        setScores(null);
      }
    } finally {
      if (!isDisposedRef.current) {
        setLoading(false);
      }
    }
  }, [db, enabled, session?.access_token]);

  useEffect(() => {
    isDisposedRef.current = false;
    fetchScores();

    return () => {
      isDisposedRef.current = true;
    };
  }, [fetchScores]);

  return { scores, loading, refresh: fetchScores };
}
