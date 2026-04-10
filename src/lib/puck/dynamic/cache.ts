type EntradaCacheDinamico<T> = {
  expiraEm: number;
  promessa: Promise<T>;
};

const cacheDinamicoLyra = new Map<string, EntradaCacheDinamico<unknown>>();

export function limparCacheDinamicoLyra(chave?: string) {
  if (typeof chave === 'string' && chave.length > 0) {
    cacheDinamicoLyra.delete(chave);
    return;
  }

  cacheDinamicoLyra.clear();
}

export function obterCacheDinamicoLyra<T>(
  chave: string,
  fornecedor: () => Promise<T>,
  ttlMs = 15_000
): Promise<T> {
  const agora = Date.now();
  const entradaExistente = cacheDinamicoLyra.get(chave);

  if (entradaExistente && entradaExistente.expiraEm > agora) {
    return entradaExistente.promessa as Promise<T>;
  }

  const promessa = fornecedor().catch((erro) => {
    cacheDinamicoLyra.delete(chave);
    throw erro;
  });

  cacheDinamicoLyra.set(chave, {
    expiraEm: agora + ttlMs,
    promessa,
  });

  return promessa;
}
