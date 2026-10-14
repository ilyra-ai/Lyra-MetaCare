'use client';

import { useSyncExternalStore } from 'react';

/**
 * Relógio compartilhado da interface ("Agora" da linha do tempo do dia),
 * com resolução de 30 segundos. Um único intervalo atende todos os
 * componentes e para quando nenhum está montado.
 */

const RESOLUCAO_MS = 30_000;
const ouvintes = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  if (!timer) {
    timer = setInterval(() => {
      for (const avisar of ouvintes) avisar();
    }, RESOLUCAO_MS);
  }
  return () => {
    ouvintes.delete(ouvinte);
    if (ouvintes.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

// Arredondado à resolução: chamadas seguidas dentro da mesma janela devolvem
// o mesmo valor, como o useSyncExternalStore exige.
function instante() {
  return Math.floor(Date.now() / RESOLUCAO_MS) * RESOLUCAO_MS;
}

/** Milissegundos desde 1970 (0 na renderização do servidor). */
export function useAgora(): number {
  return useSyncExternalStore(assinar, instante, () => 0);
}
