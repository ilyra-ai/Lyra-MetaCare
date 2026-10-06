import { describe, expect, it, vi } from 'vitest';

import { requisicaoCompartilhada } from './requisicao-compartilhada';

describe('requisicaoCompartilhada', () => {
  it('reaproveita a chamada em andamento para a mesma chave', async () => {
    let liberar: (valor: number) => void = () => {};
    const executar = vi.fn(
      () =>
        new Promise<number>((resolve) => {
          liberar = resolve;
        })
    );

    const primeira = requisicaoCompartilhada('a', executar);
    const segunda = requisicaoCompartilhada('a', executar);
    liberar(42);

    await expect(primeira).resolves.toBe(42);
    await expect(segunda).resolves.toBe(42);
    expect(executar).toHaveBeenCalledTimes(1);
  });

  it('não guarda o resultado: depois de terminar, busca de novo', async () => {
    const executar = vi.fn(async () => 'novo');
    await requisicaoCompartilhada('b', executar);
    await requisicaoCompartilhada('b', executar);
    expect(executar).toHaveBeenCalledTimes(2);
  });

  it('chaves diferentes não se misturam e falhas também liberam a chave', async () => {
    const falha = vi.fn(async () => {
      throw new Error('erro de rede');
    });
    await expect(requisicaoCompartilhada('c', falha)).rejects.toThrow(
      'erro de rede'
    );
    const ok = vi.fn(async () => 'ok');
    await expect(requisicaoCompartilhada('c', ok)).resolves.toBe('ok');
    await expect(requisicaoCompartilhada('d', ok)).resolves.toBe('ok');
    expect(ok).toHaveBeenCalledTimes(2);
  });
});
