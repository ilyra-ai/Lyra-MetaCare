/**
 * Aviso, dentro da aba, de que a reflexão da noite foi gravada ou apagada:
 * a retrospectiva "Sua semana" recarrega.
 */
export const EVENTO_REFLEXAO_ATUALIZADA = 'lyra:reflexao-atualizada';

export function avisarReflexaoAtualizada() {
  window.dispatchEvent(new Event(EVENTO_REFLEXAO_ATUALIZADA));
}

export function ouvirReflexaoAtualizada(ouvinte: () => void) {
  window.addEventListener(EVENTO_REFLEXAO_ATUALIZADA, ouvinte);
  return () => window.removeEventListener(EVENTO_REFLEXAO_ATUALIZADA, ouvinte);
}
