/**
 * Lista de textos a partir de uma coluna JSON do MySQL.
 *
 * O mysql2 já entrega colunas JSON desserializadas (um array), mas valores
 * antigos ou gravados como texto chegam como string. `JSON.parse` aplicado
 * direto a um array falhava ("Unexpected token") e derrubava as rotas de IA
 * para todo usuário com objetivos cadastrados.
 */
export function listaDeTextos(valor: unknown): string[] {
  let bruto = valor;
  if (typeof bruto === 'string') {
    try {
      bruto = JSON.parse(bruto);
    } catch {
      return [];
    }
  }
  return Array.isArray(bruto)
    ? bruto.filter((item): item is string => typeof item === 'string')
    : [];
}
