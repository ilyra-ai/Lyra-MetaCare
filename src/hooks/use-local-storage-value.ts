'use client';

import { useCallback, useSyncExternalStore } from 'react';

// Evento disparado na própria aba quando um valor é gravado por este hook. O
// evento nativo `storage` só é emitido para as OUTRAS abas do mesmo domínio.
const LOCAL_STORAGE_EVENT = 'lyra:local-storage';

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(LOCAL_STORAGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(LOCAL_STORAGE_EVENT, onStoreChange);
  };
}

function readValue(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Navegação privada ou armazenamento bloqueado: trata como ausente.
    return null;
  }
}

/**
 * Lê e grava um valor do localStorage como store externo do React
 * (useSyncExternalStore). Todos os componentes que usam a mesma chave ficam
 * sincronizados, inclusive entre abas, e a renderização no servidor usa
 * `null`, evitando divergência de hidratação.
 */
export function useLocalStorageValue(key: string) {
  const value = useSyncExternalStore(
    subscribe,
    () => readValue(key),
    () => null
  );

  const setValue = useCallback(
    (nextValue: string | null) => {
      try {
        if (nextValue === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, nextValue);
        }
      } catch {
        // Sem localStorage disponível a preferência não é persistida.
      }
      window.dispatchEvent(new Event(LOCAL_STORAGE_EVENT));
    },
    [key]
  );

  return [value, setValue] as const;
}
