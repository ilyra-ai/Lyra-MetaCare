'use client';

import { useCallback, useEffect, useState } from 'react';

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
 *   `onError` recebe o erro e o recurso passa a valer `fallback`.
 */
export function useKeyedResource<T>(
  key: string | null,
  request: () => Promise<T>,
  onError: (error: unknown) => void,
  fallback: T
): KeyedResource<T> {
  const [loaded, setLoaded] = useState<{ key: string; data: T } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (key === null) {
      return;
    }

    let active = true;
    request()
      .then((data) => {
        if (active) setLoaded({ key, data });
      })
      .catch((error: unknown) => {
        if (!active) return;
        onError(error);
        setLoaded({ key, data: fallback });
      });

    return () => {
      active = false;
    };
  }, [fallback, key, onError, request]);

  const refresh = useCallback(async () => {
    if (key === null) {
      return;
    }

    setRefreshing(true);
    await request()
      .then((data) => setLoaded({ key, data }))
      .catch((error: unknown) => {
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
