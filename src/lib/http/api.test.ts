import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { HttpError } from '@/lib/http-error';
import { mensagemDeErro, respostaDeErro, statusDeErro } from '@/lib/http/api';

function zodErroReal() {
  const parsed = z
    .object({ planKey: z.enum(['free', 'meta', 'care']) })
    .safeParse({ planKey: 'enterprise' });
  if (parsed.success) {
    throw new Error('O teste precisava produzir um ZodError real.');
  }
  return parsed.error;
}

describe('statusDeErro e mensagemDeErro', () => {
  it('preserva o status e a mensagem de HttpError', () => {
    const erro = new HttpError('Falha controlada', 418);
    expect(statusDeErro(erro)).toBe(418);
    expect(mensagemDeErro(erro, 'padrão')).toBe('Falha controlada');
  });

  it('mapeia ZodError para 400 com os campos', () => {
    const erro = zodErroReal();
    expect(statusDeErro(erro)).toBe(400);
    expect(mensagemDeErro(erro, 'padrão')).toContain('planKey');
  });

  it('mapeia chave duplicada do MySQL para 409 e erro de dado para 400', () => {
    expect(statusDeErro({ code: 'ER_DUP_ENTRY' })).toBe(409);
    expect(statusDeErro({ code: 'ER_DATA_TOO_LONG' })).toBe(400);
  });

  it('esconde o detalhe de erros inesperados (500 com mensagem genérica)', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const erro = new Error('SELECT * FROM users WHERE email = "x@y"');
      expect(statusDeErro(erro)).toBe(500);
      expect(mensagemDeErro(erro, 'Falha ao listar.')).toBe('Falha ao listar.');
      expect(log).toHaveBeenCalledTimes(1);
    } finally {
      log.mockRestore();
    }
  });
});

describe('respostaDeErro', () => {
  it('repassa os cabeçalhos do HttpError (ex.: Retry-After no 429)', async () => {
    const resposta = respostaDeErro(
      new HttpError('Muitas tentativas.', 429, { 'Retry-After': '60' }),
      'padrão'
    );
    expect(resposta.status).toBe(429);
    expect(resposta.headers.get('retry-after')).toBe('60');
    expect(await resposta.json()).toEqual({ error: 'Muitas tentativas.' });
  });
});
