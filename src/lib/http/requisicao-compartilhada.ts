/**
 * Compartilha uma requisição em andamento entre chamadas simultâneas com a
 * mesma chave.
 *
 * Vários componentes da mesma página (cabeçalho, menu lateral, menu móvel e
 * conteúdo) carregam o mesmo recurso ao montar; antes cada um fazia a própria
 * chamada (`/api/public/page-config/app` saía 3 a 4 vezes por página e
 * `/api/account/subscription` 3 vezes). Aqui a primeira chamada é reutilizada
 * pelas demais enquanto estiver em andamento; ao terminar, a entrada é
 * removida, então nada fica em cache além do próprio voo e uma chamada
 * posterior sempre busca dados novos.
 */

const emAndamento = new Map<string, Promise<unknown>>();

export function requisicaoCompartilhada<T>(
  chave: string,
  executar: () => Promise<T>
): Promise<T> {
  const existente = emAndamento.get(chave);
  if (existente) {
    return existente as Promise<T>;
  }
  const promessa = executar().finally(() => {
    emAndamento.delete(chave);
  });
  emAndamento.set(chave, promessa);
  return promessa;
}
