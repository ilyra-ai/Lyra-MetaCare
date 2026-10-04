'use client';

import { useCallback } from 'react';

import { useLocalStorageValue } from '@/hooks/use-local-storage-value';

/**
 * Modo Privacidade (IA Privacy-First / On-Device).
 *
 * Quando ativo:
 *  - Os índices de inteligência (idade biológica, detecção precoce, ciclo e
 *    ações proativas) são calculados no próprio dispositivo (já são, por
 *    natureza isomórfica dos motores) e a UI deixa isso explícito.
 *  - O chat NÃO envia a chave de modelo externo (BYOK); a conversa é atendida
 *    apenas pelo motor determinístico local, sem trafegar para LLMs externos.
 *
 * A preferência é persistida localmente (localStorage), sem ir ao servidor, e
 * compartilhada entre todos os componentes e abas abertas.
 */

const STORAGE_KEY = 'lyra_privacy_mode';

export function usePrivacyMode() {
  const [storedValue, setStoredValue] = useLocalStorageValue(STORAGE_KEY);
  const privacyMode = storedValue === '1';

  const setPrivacyMode = useCallback(
    (value: boolean) => {
      setStoredValue(value ? '1' : '0');
    },
    [setStoredValue]
  );

  const toggle = useCallback(() => {
    setPrivacyMode(!privacyMode);
  }, [privacyMode, setPrivacyMode]);

  return { privacyMode, setPrivacyMode, toggle };
}
