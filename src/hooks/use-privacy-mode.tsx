'use client';

import { useCallback, useEffect, useState } from 'react';

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
 * A preferência é persistida localmente (localStorage), sem ir ao servidor.
 */

const STORAGE_KEY = 'lyra_privacy_mode';

export function usePrivacyMode() {
  const [privacyMode, setPrivacyModeState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setPrivacyModeState(localStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      setPrivacyModeState(false);
    }
    setHydrated(true);
  }, []);

  const setPrivacyMode = useCallback((value: boolean) => {
    setPrivacyModeState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch {
      // Ambientes sem localStorage simplesmente não persistem a preferência.
    }
  }, []);

  const toggle = useCallback(() => {
    setPrivacyMode(!privacyMode);
  }, [privacyMode, setPrivacyMode]);

  return { privacyMode, setPrivacyMode, toggle, hydrated };
}
