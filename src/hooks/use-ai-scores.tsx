'use client';

import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { useAgora } from '@/hooks/use-agora';
import { useKeyedResource } from '@/hooks/use-keyed-resource';
import type { EscoresDoDia } from '@/lib/ai/score-engine';
import { ouvirMetricasAtualizadas } from '@/lib/metricas/evento-de-atualizacao';

interface UseAIScoresResult {
  scores: EscoresDoDia | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Escores do dia local (prontidão e recuperação gravadas pelo servidor a cada
 * check-in ou sessão da pulseira, e longevidade com a cobertura de métricas).
 * Recarrega quando as métricas mudam e na virada do dia.
 */
export function useAIScores(enabled = true): UseAIScoresResult {
  const { session, db } = useAuth();
  const agora = useAgora();
  const [versao, setVersao] = useState(0);
  // Os scores pertencem ao usuário autenticado; sem sessão ou com o recurso
  // desabilitado pelo plano não há cálculo.
  const userId = enabled && session ? session.user.id : null;
  const dia = agora === 0 ? null : format(agora, 'yyyy-MM-dd');

  useEffect(() => ouvirMetricasAtualizadas(() => setVersao((v) => v + 1)), []);

  const requestScores = useCallback(async (): Promise<EscoresDoDia | null> => {
    const response = await db.functions.invoke<EscoresDoDia>(
      'calculate-longevity-score',
      { body: { data: format(new Date(), 'yyyy-MM-dd') } }
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

  const { data, loading, refresh } = useKeyedResource<EscoresDoDia | null>(
    userId && dia ? `${userId}:${dia}:${versao}` : null,
    requestScores,
    notifyError,
    null
  );

  return { scores: data, loading, refresh };
}
