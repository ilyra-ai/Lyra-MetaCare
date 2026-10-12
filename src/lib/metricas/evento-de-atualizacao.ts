/**
 * Aviso, dentro da aba, de que as métricas do dia mudaram (check-in salvo ou
 * sessão da pulseira gravada): painel, cartões e sincronização recarregam.
 */
export const EVENTO_METRICAS_ATUALIZADAS = 'lyra:metricas-atualizadas';

export function avisarMetricasAtualizadas() {
  window.dispatchEvent(new Event(EVENTO_METRICAS_ATUALIZADAS));
}

export function ouvirMetricasAtualizadas(ouvinte: () => void) {
  window.addEventListener(EVENTO_METRICAS_ATUALIZADAS, ouvinte);
  return () => window.removeEventListener(EVENTO_METRICAS_ATUALIZADAS, ouvinte);
}
