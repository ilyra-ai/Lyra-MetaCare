import { describe, expect, it } from 'vitest';

import { resumoDeErro } from './log-seguro';

describe('resumoDeErro', () => {
  it('não leva a consulta interpolada nem a mensagem com valores do MySQL', () => {
    const erro = Object.assign(
      new Error("Incorrect decimal value: 'glicose 180 mg/dL' for column 'x'"),
      {
        code: 'ER_PARSE_ERROR',
        errno: 1064,
        sqlState: '42000',
        sqlMessage: "Incorrect decimal value: 'glicose 180 mg/dL'",
        sql: "INSERT INTO daily_metrics (notes) VALUES ('glicose 180 mg/dL')",
      }
    );
    const resumo = resumoDeErro(erro);
    expect(resumo).toMatchObject({
      nome: 'Error',
      mensagem: 'Erro do MySQL ER_PARSE_ERROR',
      codigo: 'ER_PARSE_ERROR',
      errno: 1064,
      sqlState: '42000',
    });
    expect(JSON.stringify(resumo)).not.toContain('glicose');
    expect(String(resumo.pilha)).toMatch(/^\s+at /);
  });

  it('mantém mensagem e código de erros comuns', () => {
    const erro = Object.assign(new Error('falhou'), { code: 'ECONNREFUSED' });
    expect(resumoDeErro(erro)).toMatchObject({
      nome: 'Error',
      mensagem: 'falhou',
      codigo: 'ECONNREFUSED',
    });
  });

  it('não serializa valores que não são Error', () => {
    expect(resumoDeErro({ email: 'ana@lyra.local' })).toEqual({
      tipo: 'object',
    });
  });
});
