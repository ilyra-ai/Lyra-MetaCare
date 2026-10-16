/**
 * Saída da página (tarefa 48).
 *
 * Quando a pessoa navega para outro endereço, recarrega ou fecha a aba, o
 * navegador dispara `pagehide` e, logo depois, recusa os `fetch` ainda em
 * andamento com `TypeError: Failed to fetch` (comprovado no Chromium em
 * navegação, troca de `location` e recarga). Isso não é falha de rede nem do
 * servidor: a página está indo embora e não há o que mostrar. Sem distinguir
 * os dois casos, as leituras do app registravam esse cancelamento como erro
 * no console.
 *
 * `pageshow` zera a marca quando a página volta do cache de ida e volta do
 * navegador (bfcache), em que o mesmo documento é reaproveitado.
 */

export interface DetectorDeSaida {
  /** `true` entre o `pagehide` e um eventual `pageshow` de volta. */
  saindo: () => boolean;
  /** Remove os ouvintes (para testes e limpeza). */
  desligar: () => void;
}

export function criarDetectorDeSaida(alvo: EventTarget): DetectorDeSaida {
  let saindo = false;
  const aoSair = () => {
    saindo = true;
  };
  const aoVoltar = () => {
    saindo = false;
  };
  alvo.addEventListener('pagehide', aoSair);
  alvo.addEventListener('pageshow', aoVoltar);
  return {
    saindo: () => saindo,
    desligar: () => {
      alvo.removeEventListener('pagehide', aoSair);
      alvo.removeEventListener('pageshow', aoVoltar);
    },
  };
}

// Instalado ao carregar o módulo no navegador, antes de qualquer `pagehide`;
// no servidor não há página para sair.
const detectorDaJanela =
  typeof window === 'undefined' ? null : criarDetectorDeSaida(window);

/** A página atual está saindo (navegação, recarga ou fechamento da aba). */
export function paginaSaindo() {
  return detectorDaJanela?.saindo() ?? false;
}
