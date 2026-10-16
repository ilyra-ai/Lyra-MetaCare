import { describe, expect, it } from 'vitest';

import { criarDetectorDeSaida, paginaSaindo } from './saida-da-pagina';

describe('detector de saída da página', () => {
  it('marca a saída no pagehide e desmarca na volta pelo bfcache', () => {
    const janela = new EventTarget();
    const detector = criarDetectorDeSaida(janela);
    expect(detector.saindo()).toBe(false);
    janela.dispatchEvent(new Event('pagehide'));
    expect(detector.saindo()).toBe(true);
    janela.dispatchEvent(new Event('pageshow'));
    expect(detector.saindo()).toBe(false);
  });

  it('desligar remove os ouvintes', () => {
    const janela = new EventTarget();
    const detector = criarDetectorDeSaida(janela);
    detector.desligar();
    janela.dispatchEvent(new Event('pagehide'));
    expect(detector.saindo()).toBe(false);
  });

  it('no servidor (sem window) a página nunca está saindo', () => {
    expect(typeof window).toBe('undefined');
    expect(paginaSaindo()).toBe(false);
  });
});
