/**
 * Aviso, dentro da aba, de que o briefing do dia foi gerado ou refeito no
 * servidor: o sino recarrega as notificações ("Seu dia está pronto", alertas).
 */
export const EVENTO_COACH_ATUALIZADO = 'lyra:coach-atualizado';

export function avisarCoachAtualizado() {
  window.dispatchEvent(new Event(EVENTO_COACH_ATUALIZADO));
}

export function ouvirCoachAtualizado(ouvinte: () => void) {
  window.addEventListener(EVENTO_COACH_ATUALIZADO, ouvinte);
  return () => window.removeEventListener(EVENTO_COACH_ATUALIZADO, ouvinte);
}
