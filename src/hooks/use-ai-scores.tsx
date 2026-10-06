'use client';

import { useAuth } from '@/context/AuthContext';
import { useKeyedResource } from '@/hooks/use-keyed-resource';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface AIScores {
  longevityScore: number;
  readinessScore: number;
}

interface UseAIScoresResult {
  scores: AIScores | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useAIScores(enabled = true): UseAIScoresResult {
  const { session, db } = useAuth();
  // Os scores pertencem ao usuário autenticado; sem sessão ou com o recurso
  // desabilitado pelo plano não há cálculo.
  const userId = enabled && session ? session.user.id : null;

  const requestScores = useCallback(async (): Promise<AIScores | null> => {
    const response = await db.functions.invoke<AIScores>(
      'calculate-longevity-score'
    );

    if (response.error || !response.data) {
      throw new Error(response.error?.message || 'Falha no cálculo local.');
    }

    return response.data;
  }, [db]);

  const notifyError = useCallback((error: unknown) => {
    console.error('Erro ao calcular scores de IA:', error);
    toast.error('Erro ao calcular scores de IA.', {
      description:
        error instanceof Error ? error.message : 'Erro desconhecido.',
    });
  }, []);

  const { data, loading, refresh } = useKeyedResource<AIScores | null>(
    userId,
    requestScores,
    notifyError,
    null
  );

  return { scores: data, loading, refresh };
}
