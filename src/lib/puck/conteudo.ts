import type { LyraPuckData } from '@/lib/puck/types';

/**
 * Indica se o documento tem algum bloco publicado, na raiz (`content`) ou em
 * zonas legadas. Sem blocos, a superfície do Puck não é exibida: o root
 * mostraria só o cabeçalho técnico da superfície (chave, fonte e regras de
 * visibilidade), que é informação de edição e não de quem usa a página.
 *
 * Módulo sem dependência de runtime do Puck: decide antes de carregá-lo.
 */
export function documentoPuckTemBlocos(data: LyraPuckData): boolean {
  if (data.content.length > 0) {
    return true;
  }
  return Object.values(data.zones ?? {}).some((itens) => itens.length > 0);
}
