import { describe, expect, it } from 'vitest';

import {
  ciclosParaMinutos,
  duracaoCoerente,
  duracaoDoCiclo,
  minutosDaSessao,
  posicaoNaSessao,
  recomendarTecnica,
  sessaoDeRespiracaoSchema,
} from './tecnicas';

describe('técnicas de respiração', () => {
  it('tem a duração de ciclo de cada técnica', () => {
    expect(duracaoDoCiclo('4-7-8')).toBe(19);
    expect(duracaoDoCiclo('quadrada')).toBe(16);
    expect(duracaoDoCiclo('nadi_shodhana')).toBe(20);
  });

  it('converte minutos em ciclos completos (ao menos 1)', () => {
    expect(ciclosParaMinutos('nadi_shodhana', 5)).toBe(15);
    expect(ciclosParaMinutos('quadrada', 3)).toBe(11);
    expect(ciclosParaMinutos('4-7-8', 1)).toBe(3);
    expect(ciclosParaMinutos('4-7-8', 0)).toBe(1);
  });

  it('acompanha a fase pelo relógio, inclusive no meio de uma fase', () => {
    // 4-7-8: 0–4 inspira, 4–11 segura, 11–19 solta.
    expect(posicaoNaSessao('4-7-8', 4, 0)).toMatchObject({
      ciclo: 1,
      indiceDaFase: 0,
      restanteNaFase: 4,
      concluida: false,
    });
    expect(posicaoNaSessao('4-7-8', 4, 5.5)).toMatchObject({
      ciclo: 1,
      indiceDaFase: 1,
      decorridoNaFase: 1.5,
      restanteNaFase: 6,
    });
    expect(posicaoNaSessao('4-7-8', 4, 19)).toMatchObject({
      ciclo: 2,
      indiceDaFase: 0,
      ciclosCompletos: 1,
    });
    // Nadi Shodhana (20 s): 0–4 inspira esquerda, 4–10 solta direita.
    expect(posicaoNaSessao('nadi_shodhana', 3, 22).fase.instrucao).toBe(
      'Inspire pela narina esquerda'
    );
    const nadi = posicaoNaSessao('nadi_shodhana', 3, 24.2);
    expect(nadi.fase.instrucao).toBe('Solte pela narina direita');
    expect(nadi.ciclo).toBe(2);
  });

  it('termina no fim do último ciclo e não passa dele', () => {
    const fim = posicaoNaSessao('quadrada', 2, 999);
    expect(fim).toMatchObject({
      concluida: true,
      progresso: 1,
      ciclosCompletos: 2,
      restanteNaFase: 0,
    });
    expect(posicaoNaSessao('quadrada', 2, -5).progresso).toBe(0);
  });

  it('arredonda os minutos registrados com mínimo de 1', () => {
    expect(minutosDaSessao(30)).toBe(1);
    expect(minutosDaSessao(89)).toBe(1);
    expect(minutosDaSessao(90)).toBe(2);
    expect(minutosDaSessao(300)).toBe(5);
  });

  it('só aceita duração coerente com os ciclos feitos', () => {
    expect(duracaoCoerente('quadrada', 2, 32)).toBe(true);
    expect(duracaoCoerente('quadrada', 2, 45)).toBe(true);
    expect(duracaoCoerente('quadrada', 2, 49)).toBe(false);
    expect(duracaoCoerente('quadrada', 2, 20)).toBe(false);
  });

  it('valida a sessão enviada ao servidor', () => {
    expect(
      sessaoDeRespiracaoSchema.safeParse({
        tecnica: 'nadi_shodhana',
        ciclos: 15,
        segundos: 300,
      }).success
    ).toBe(true);
    for (const entrada of [
      { tecnica: 'kapalabhati', ciclos: 3, segundos: 60 },
      { tecnica: '4-7-8', ciclos: 0, segundos: 30 },
      { tecnica: '4-7-8', ciclos: 1, segundos: 19 },
      { tecnica: '4-7-8', ciclos: 2, segundos: 3600 },
      { tecnica: '4-7-8', ciclos: 2, segundos: 38.5 },
      { tecnica: '4-7-8', ciclos: 2, segundos: 38, extra: 1 },
    ]) {
      expect(sessaoDeRespiracaoSchema.safeParse(entrada).success).toBe(false);
    }
  });
});

describe('recomendação do momento', () => {
  it('estresse alto pede 4-7-8 e diz o valor registrado', () => {
    const r = recomendarTecnica({ hora: 15, estresse: 72, prontidao: 80 });
    expect(r.tecnica).toBe('4-7-8');
    expect(r.porque).toContain('72/100');
  });

  it('fase de Vata pede Nadi Shodhana', () => {
    const r = recomendarTecnica({ hora: 15, estresse: 20, prontidao: 80 });
    expect(r).toMatchObject({ tecnica: 'nadi_shodhana', minutos: 5 });
    expect(r.porque).toContain('14 h–18 h');
  });

  it('prontidão baixa fora de Vata pede a quadrada', () => {
    const r = recomendarTecnica({ hora: 11, estresse: null, prontidao: 40 });
    expect(r.tecnica).toBe('quadrada');
    expect(r.porque).toContain('40');
  });

  it('Kapha da manhã pede a quadrada e Pitta do meio-dia pede 4-7-8', () => {
    expect(
      recomendarTecnica({ hora: 7, estresse: null, prontidao: null }).tecnica
    ).toBe('quadrada');
    expect(
      recomendarTecnica({ hora: 12, estresse: null, prontidao: 70 }).tecnica
    ).toBe('4-7-8');
  });

  it('à noite nunca sugere algo que desperte, nem com prontidão baixa', () => {
    for (const hora of [18, 20, 21, 23, 0, 1]) {
      const r = recomendarTecnica({ hora, estresse: null, prontidao: 30 });
      expect(r.tecnica).toBe('4-7-8');
      expect(r.porque).toContain('prepara o sono');
    }
  });
});
