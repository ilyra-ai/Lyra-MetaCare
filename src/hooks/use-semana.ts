'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { ouvirMetricasAtualizadas } from '@/lib/metricas/evento-de-atualizacao';
import { ouvirReflexaoAtualizada } from '@/lib/reflexao/evento';
import type { SemanaDaPessoa } from '@/lib/semana/servico';

import { useKeyedResource } from './use-keyed-resource';

async function lerSemana(): Promise<SemanaDaPessoa> {
  const resposta = await fetch('/api/semana', {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!resposta.ok) {
    const corpo = (await resposta.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(corpo?.error ?? 'Não foi possível montar a sua semana.');
  }
  return (await resposta.json()) as SemanaDaPessoa;
}

/** Retrospectiva da semana; recarrega quando a reflexão ou o check-in mudam. */
export function useSemana() {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [versao, setVersao] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const recarregar = () => setVersao((v) => v + 1);
    const pararReflexao = ouvirReflexaoAtualizada(recarregar);
    const pararMetricas = ouvirMetricasAtualizadas(recarregar);
    return () => {
      pararReflexao();
      pararMetricas();
    };
  }, []);

  const aoFalhar = useCallback((falha: unknown) => {
    setErro(
      falha instanceof Error ? falha.message : 'Sem conexão com o servidor.'
    );
  }, []);

  const { data, loading } = useKeyedResource<SemanaDaPessoa | null>(
    userId ? `semana:${userId}:${versao}` : null,
    lerSemana,
    aoFalhar,
    null
  );
  return { semana: data, carregando: loading, erro };
}
