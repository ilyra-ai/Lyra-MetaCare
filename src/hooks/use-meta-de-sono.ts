'use client';

import { useCallback } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useKeyedResource } from '@/hooks/use-keyed-resource';
import { METRICAS_DAS_METAS } from '@/lib/metas/catalogo';

/**
 * Meta de sono da pessoa (tarefa 57). O card de sono do painel comparava o
 * sono de todos com 8 horas fixas; agora usa a meta automática "Sono por
 * noite" criada em /goals (a mais recente; o alvo é guardado em horas) e,
 * sem ela, a sugestão do próprio catálogo de metas, dizendo que é sugestão.
 */
export interface MetaDeSono {
  minutos: number;
  origem: 'meta' | 'sugestao';
}

interface LinhaDaMeta {
  target_value: number | string | null;
}

const SUGESTAO: MetaDeSono = {
  minutos: Math.round(METRICAS_DAS_METAS.sono.sugestao * 60),
  origem: 'sugestao',
};

function avisar(erro: unknown) {
  console.error('Falha ao ler a meta de sono:', erro);
}

export function useMetaDeSono(): { meta: MetaDeSono; loading: boolean } {
  const { db, session } = useAuth();
  const userId = session?.user?.id ?? null;

  const ler = useCallback(async (): Promise<MetaDeSono> => {
    if (!userId) return SUGESTAO;
    const { data, error } = await db
      .from('goals')
      .select('target_value')
      .eq('user_id', userId)
      .eq('metric_key', 'sono')
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw new Error(error.message);
    const linha = (data as LinhaDaMeta[] | null)?.[0];
    const horas = linha ? Number(linha.target_value) : Number.NaN;
    if (!Number.isFinite(horas) || horas <= 0) return SUGESTAO;
    return { minutos: Math.round(horas * 60), origem: 'meta' };
  }, [db, userId]);

  const { data, loading } = useKeyedResource(
    userId ? `meta-de-sono:${userId}` : null,
    ler,
    avisar,
    SUGESTAO
  );
  return { meta: data, loading };
}
