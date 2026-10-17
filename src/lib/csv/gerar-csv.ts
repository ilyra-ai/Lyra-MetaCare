/**
 * Geração de CSV para exportações administrativas (tarefa 57).
 *
 * - Separador `;` (padrão do Excel e do LibreOffice em pt-BR, onde a vírgula
 *   é o separador decimal) e quebra de linha CRLF (RFC 4180).
 * - Todo campo com separador, aspas, quebra de linha ou espaço nas pontas vai
 *   entre aspas, com as aspas internas duplicadas (antes só a vírgula era
 *   tratada, e uma quebra de linha num nome quebrava o arquivo).
 * - `null` e `undefined` viram campo vazio (antes, o texto "null").
 * - Neutraliza fórmulas (CWE-1236, "CSV injection"): um texto que começa com
 *   `=`, `+`, `-`, `@`, tab ou CR recebe um apóstrofo na frente, para a
 *   planilha não executá-lo.
 * - BOM UTF-8 no início, para o Excel abrir os acentos corretamente.
 */

export const SEPARADOR_DO_CSV = ';';
const QUEBRA = '\r\n';
const INICIO_DE_FORMULA = /^[=+\-@\t\r]/;

function textoDoValor(valor: unknown): string {
  if (valor === null || valor === undefined) return '';
  if (valor instanceof Date) return valor.toISOString();
  if (typeof valor === 'object') return JSON.stringify(valor);
  return String(valor);
}

export function campoDoCsv(valor: unknown): string {
  let texto = textoDoValor(valor);
  // Números são dados, não fórmulas: "-3" continua número.
  if (typeof valor !== 'number' && INICIO_DE_FORMULA.test(texto)) {
    texto = `'${texto}`;
  }
  const precisaAspas =
    texto.includes(SEPARADOR_DO_CSV) ||
    texto.includes('"') ||
    texto.includes('\n') ||
    texto.includes('\r') ||
    texto !== texto.trim();
  return precisaAspas ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/**
 * CSV de uma lista de objetos. As colunas são a união das chaves, na ordem
 * em que aparecem, para que uma linha com campo a mais não desalinhe as
 * outras.
 */
export function gerarCsv(linhas: ReadonlyArray<object>) {
  const mapas = linhas.map((linha) => new Map(Object.entries(linha)));
  const colunas: string[] = [];
  for (const mapa of mapas) {
    for (const chave of mapa.keys()) {
      if (!colunas.includes(chave)) colunas.push(chave);
    }
  }
  const cabecalho = colunas.map(campoDoCsv).join(SEPARADOR_DO_CSV);
  const corpo = mapas.map((mapa) =>
    colunas.map((coluna) => campoDoCsv(mapa.get(coluna))).join(SEPARADOR_DO_CSV)
  );
  return `﻿${[cabecalho, ...corpo].join(QUEBRA)}${QUEBRA}`;
}
