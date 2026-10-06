import { NextResponse } from 'next/server';
import { ZodError, type ZodType, prettifyError } from 'zod';

import { HttpError } from '@/lib/http-error';
import { registrarErroInterno } from '@/lib/observability/log-seguro';

/**
 * Utilitários comuns das Route Handlers.
 *
 * - `lerJson`: JSON malformado vira 400 (antes, o SyntaxError do
 *   `request.json()` chegava ao cliente como 500) e o corpo é validado pelo
 *   schema Zod da rota.
 * - `mensagemDeErro`/`statusDeErro`: erros esperados (HttpError, Zod, chave
 *   duplicada do MySQL) chegam ao cliente com status e mensagem úteis; erros
 *   inesperados são registrados no servidor e o cliente recebe só a mensagem
 *   genérica da rota, sem detalhes internos (SQL, caminhos, stack).
 */

export async function lerJson<T>(request: Request, schema: ZodType<T>) {
  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    throw new HttpError('Corpo da requisição não é um JSON válido.', 400);
  }
  return schema.parse(corpo);
}

/** Converte um parâmetro de busca JSON (ex.: `filters`) com validação. */
export function lerParametroJson<T>(
  valor: string | null,
  schema: ZodType<T>,
  nome: string,
  padrao: T
): T {
  if (valor === null) {
    return padrao;
  }
  let convertido: unknown;
  try {
    convertido = JSON.parse(valor);
  } catch {
    throw new HttpError(`Parâmetro ${nome} não é um JSON válido.`, 400);
  }
  return schema.parse(convertido);
}

function erroMysql(error: unknown): { code?: string } | null {
  return typeof error === 'object' && error !== null && 'code' in error
    ? (error as { code?: string })
    : null;
}

export function statusDeErro(error: unknown): number {
  if (error instanceof HttpError) {
    return error.statusCode;
  }
  if (error instanceof ZodError) {
    return 400;
  }
  const mysql = erroMysql(error);
  if (mysql?.code === 'ER_DUP_ENTRY') {
    return 409;
  }
  if (
    mysql?.code === 'ER_NO_REFERENCED_ROW_2' ||
    mysql?.code === 'ER_TRUNCATED_WRONG_VALUE' ||
    mysql?.code === 'ER_DATA_TOO_LONG' ||
    mysql?.code === 'ER_BAD_NULL_ERROR' ||
    mysql?.code === 'ER_NO_DEFAULT_FOR_FIELD' ||
    mysql?.code === 'WARN_DATA_TRUNCATED' ||
    mysql?.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD'
  ) {
    return 400;
  }
  return 500;
}

export function mensagemDeErro(error: unknown, padrao: string): string {
  if (error instanceof HttpError) {
    return error.message;
  }
  if (error instanceof ZodError) {
    return `Dados inválidos: ${prettifyError(error)}`;
  }
  const mysql = erroMysql(error);
  if (mysql?.code === 'ER_DUP_ENTRY') {
    return 'Já existe um registro com esses dados.';
  }
  if (statusDeErro(error) === 400) {
    return 'Valores inválidos para os campos informados.';
  }
  // Erro inesperado: detalhes só no log do servidor, sem SQL nem valores.
  registrarErroInterno(`api: ${padrao}`, error);
  return padrao;
}

function cabecalhosDeErro(error: unknown) {
  return error instanceof HttpError ? error.headers : undefined;
}

/** Resposta de erro no formato `{ error: string }`. */
export function respostaDeErro(error: unknown, padrao: string) {
  return NextResponse.json(
    { error: mensagemDeErro(error, padrao) },
    { status: statusDeErro(error), headers: cabecalhosDeErro(error) }
  );
}

/** Resposta de erro no formato do cliente de dados: `{ data, error: { message } }`. */
export function respostaDeErroDados(error: unknown, padrao: string) {
  return NextResponse.json(
    { data: null, error: { message: mensagemDeErro(error, padrao) } },
    { status: statusDeErro(error), headers: cabecalhosDeErro(error) }
  );
}
