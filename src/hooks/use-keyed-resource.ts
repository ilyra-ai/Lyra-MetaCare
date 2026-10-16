'use client';

import { useCallback, useEffect, useState } from 'react';

import { paginaSaindo } from '@/lib/navegador/saida-da-pagina';

export interface KeyedResource<T> {
  data: T;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Carrega um recurso assíncrono identificado por uma chave (ex.: id do usuário
 * ou id + janela de dias) e o mantém associado a essa chave.
 *
 * - `key === null` desativa a carga (sem sessão, recurso desabilitado etc.) e
 *   devolve `fallback` sem estado de carregamento.
 * - Quando a chave muda, os dados anteriores deixam de ser expostos e o
 *   carregamento é derivado (dados ainda não carregados para a chave atual),
 *   sem setState síncrono dentro do efeito.
 * - Respostas de cargas obsoletas (chave antiga ou componente desmontado) são
 *   descartadas.
 * - `request` deve ser estável (useCallback) e lançar erro em caso de falha;
 *   `onError` recebe o erro e o recurso passa a valer `fallback`. A recusa
 *   que o navegador faz das buscas em andamento quando a página sai
 *   (navegação, recarga) não é falha e não chega a `onError`.
 * - `initialRequest` (opcional, também estável) substitui `request` só na
 *   carga automática, por exemplo para compartilhar a chamada entre vários
 *   componentes que montam juntos; `refresh` sempre usa `request`.
 */
export function useKeyedResource<T>(
  key: string | null,
  request: () => Promise<T>,
  onError: (error: unknown) => void,
  fallback: T,
  initialRequest: () => Promise<T> = request
): KeyedResource<T> {
  const [loaded, setLoaded] = useState<{ key: string; data: T } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (key === null) {
      return;
    }

    let active = true;
    initialRequest()
      .then((data) => {
        if (active) setLoaded({ key, data });
      })
      .catch((error: unknown) => {
        // Página saindo: o navegador cancelou a busca (não é falha).
        if (!active || paginaSaindo()) return;
        onError(error);
        setLoaded({ key, data: fallback });
      });

    return () => {
      active = false;
    };
  }, [fallback, initialRequest, key, onError]);

  const refresh = useCallback(async () => {
    if (key === null) {
      return;
    }

    setRefreshing(true);
    await request()
      .then((data) => setLoaded({ key, data }))
      .catch((error: unknown) => {
        if (paginaSaindo()) return;
        onError(error);
        setLoaded({ key, data: fallback });
      })
      .finally(() => setRefreshing(false));
  }, [fallback, key, onError, request]);

  const isCurrent = key !== null && loaded?.key === key;

  return {
    data: isCurrent ? loaded.data : fallback,
    loading: key !== null && (!isCurrent || refreshing),
    refresh,
  };
}
