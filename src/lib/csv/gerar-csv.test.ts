import { describe, expect, it } from 'vitest';

import { campoDoCsv, gerarCsv } from './gerar-csv';

describe('gerar CSV (tarefa 57)', () => {
  it('aspas só quando precisa, com aspas internas duplicadas', () => {
    expect(campoDoCsv('Ana')).toBe('Ana');
    expect(campoDoCsv('Silva; Souza')).toBe('"Silva; Souza"');
    expect(campoDoCsv('Ana "Nina"')).toBe('"Ana ""Nina"""');
    expect(campoDoCsv('linha 1\nlinha 2')).toBe('"linha 1\nlinha 2"');
    expect(campoDoCsv(' espaço ')).toBe('" espaço "');
  });

  it('nulo vira vazio e objeto vira JSON', () => {
    expect(campoDoCsv(null)).toBe('');
    expect(campoDoCsv(undefined)).toBe('');
    expect(campoDoCsv(['sono', 'foco'])).toBe('"[""sono"",""foco""]"');
    expect(campoDoCsv(true)).toBe('true');
  });

  it('neutraliza fórmulas, mas não números negativos', () => {
    expect(campoDoCsv('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(campoDoCsv('+55 11 99999')).toBe("'+55 11 99999");
    expect(campoDoCsv('@soma')).toBe("'@soma");
    expect(campoDoCsv(-3)).toBe('-3');
  });

  it('arquivo com BOM, CRLF e colunas unidas na ordem', () => {
    const csv = gerarCsv([
      { id: 1, nome: 'Ana' },
      { id: 2, nome: null, email: 'b@x.com' },
    ]);
    expect(csv).toBe('﻿id;nome;email\r\n1;Ana;\r\n2;;b@x.com\r\n');
  });
});
