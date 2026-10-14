/**
 * Aviso, dentro da aba, de que o mapa natal mudou (cidade, data ou hora de
 * nascimento salvas): o cartão do mapa e o coach recalculam.
 */
export const EVENTO_MAPA_ATUALIZADO = 'lyra:mapa-atualizado';

export function avisarMapaAtualizado() {
  window.dispatchEvent(new Event(EVENTO_MAPA_ATUALIZADO));
}

export function ouvirMapaAtualizado(ouvinte: () => void) {
  window.addEventListener(EVENTO_MAPA_ATUALIZADO, ouvinte);
  return () => window.removeEventListener(EVENTO_MAPA_ATUALIZADO, ouvinte);
}
