'use client';

import { useSyncExternalStore } from 'react';

/**
 * Preferências e recursos do navegador lidos sem efeitos e sem divergência de
 * hidratação: no servidor valem o padrão conservador (sem movimento reduzido,
 * recurso indisponível) e, no navegador, o valor real.
 */

const CONSULTA_DE_MOVIMENTO = '(prefers-reduced-motion: reduce)';

function assinarMovimento(aoMudar: () => void) {
  const consulta = window.matchMedia(CONSULTA_DE_MOVIMENTO);
  consulta.addEventListener('change', aoMudar);
  return () => consulta.removeEventListener('change', aoMudar);
}

/** `true` quando a pessoa pediu ao sistema para reduzir animações. */
export function useMovimentoReduzido() {
  return useSyncExternalStore(
    assinarMovimento,
    () => window.matchMedia(CONSULTA_DE_MOVIMENTO).matches,
    () => false
  );
}

function semAssinatura() {
  return () => {};
}

/** Vibração (Vibration API): Android; o iOS não oferece. */
export function useVibracaoDisponivel() {
  return useSyncExternalStore(
    semAssinatura,
    () => typeof navigator.vibrate === 'function',
    () => false
  );
}

/** Voz sintetizada (Web Speech API). */
export function useVozDisponivel() {
  return useSyncExternalStore(
    semAssinatura,
    () => 'speechSynthesis' in window,
    () => false
  );
}
