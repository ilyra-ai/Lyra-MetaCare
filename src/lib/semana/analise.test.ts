import { describe, expect, it } from 'vitest';

import {
  avaliarMetas,
  formatarSono,
  perceber,
  praticaDoDia,
  resumir,
  type DiaDaSemana,
} from './analise';

describe('prática do dia', () => {
  it('não conta duas vezes a respiração, que já entra na meditação do dia', () => {
    // Sessão de 1 min registrada: meditation_minutes = 1 e respiração = 1.
    expect(praticaDoDia({ meditacaoMinutos: 1, respiracaoMinutos: 1 })).toBe(1);
    // Check-in informou o total (12) depois de 5 min de respiração guiada.
    expect(praticaDoDia({ meditacaoMinutos: 12, respiracaoMinutos: 5 })).toBe(
      12
    );
    expect(praticaDoDia({ meditacaoMinutos: null, respiracaoMinutos: 3 })).toBe(
      3
    );
    expect(praticaDoDia({ meditacaoMinutos: null, respiracaoMinutos: 0 })).toBe(
      0
    );
  });
});

function dia(parcial: Partial<DiaDaSemana> & { data: string }): DiaDaSemana {
  return {
    diaDaSemana: 'seg',
    prontidao: null,
    sonoMinutos: null,
    meditacaoMinutos: null,
    respiracaoMinutos: 0,
    reflexao: null,
    tara: null,
    metricas: {},
    ...parcial,
  };
}

const favoravel = {
  nome: 'Sampat',
  tema: 'prosperidade',
  qualidade: 'favoravel' as const,
};
const desfavoravel = {
  nome: 'Vipat',
  tema: 'obstáculos',
  qualidade: 'desfavoravel' as const,
};

describe('resumo da semana', () => {
  it('médias só com os dias medidos e variação só com dados nas duas semanas', () => {
    const semana = [
      dia({ data: '2026-10-09', prontidao: 70, sonoMinutos: 420 }),
      dia({ data: '2026-10-10', prontidao: 80 }),
      dia({ data: '2026-10-11' }),
      dia({ data: '2026-10-12', respiracaoMinutos: 5 }),
    ];
    const anterior = [
      dia({ data: '2026-10-02', prontidao: 60, sonoMinutos: 400 }),
      dia({ data: '2026-10-03', prontidao: 70 }),
    ];
    const resumo = resumir(semana, anterior);
    expect(resumo).toMatchObject({
      diasComRegistro: 3,
      prontidaoMedia: 75,
      prontidaoVariacao: 10,
      sonoMedioMinutos: 420,
      // Sono: só 1 noite em cada semana, sem comparação.
      sonoVariacaoMinutos: null,
      respiracaoMinutos: 5,
      reflexoes: 0,
      mediasDaReflexao: null,
    });
  });

  it('semana vazia não inventa números', () => {
    expect(resumir([dia({ data: '2026-10-09' })], [])).toMatchObject({
      diasComRegistro: 0,
      prontidaoMedia: null,
      prontidaoVariacao: null,
      sonoMedioMinutos: null,
    });
  });

  it('médias da reflexão com uma casa', () => {
    const r = (e: number, c: number, s: number) => ({
      emocional: e,
      corpo: c,
      espiritual: s,
      frase: null,
    });
    const resumo = resumir(
      [
        dia({ data: '2026-10-09', reflexao: r(4, 3, 5) }),
        dia({ data: '2026-10-10', reflexao: r(3, 3, 4) }),
      ],
      []
    );
    expect(resumo.mediasDaReflexao).toEqual({
      emocional: 3.5,
      corpo: 3,
      espiritual: 4.5,
    });
  });

  it('formata o sono em horas e minutos', () => {
    expect(formatarSono(432)).toBe('7 h 12');
    expect(formatarSono(480)).toBe('8 h');
  });
});

describe('metas dia a dia', () => {
  it('conta só dias com registro e respeita direção e escala', () => {
    const semana = [
      dia({
        data: '1',
        metricas: { sleep_duration_minutes: 450, weight_kg: null },
      }),
      dia({ data: '2', metricas: { sleep_duration_minutes: 400 } }),
      dia({ data: '3', metricas: {} }),
    ];
    expect(
      avaliarMetas(semana, [
        {
          titulo: 'Sono por noite: 7,5 h',
          coluna: 'sleep_duration_minutes',
          alvo: 7.5,
          escala: 1 / 60,
          direcao: 'up',
        },
        {
          titulo: 'Menos de 7 h',
          coluna: 'sleep_duration_minutes',
          alvo: 7,
          escala: 1 / 60,
          direcao: 'down',
        },
      ])
    ).toEqual([
      { titulo: 'Sono por noite: 7,5 h', diasCumpridos: 1, diasComRegistro: 2 },
      { titulo: 'Menos de 7 h', diasCumpridos: 1, diasComRegistro: 2 },
    ]);
  });
});

describe('percepções só quando os registros sustentam', () => {
  it('Tara favorável com prontidão maior em 2+ dias de cada lado', () => {
    const semana = [
      dia({ data: '1', tara: favoravel, prontidao: 80 }),
      dia({ data: '2', tara: favoravel, prontidao: 76 }),
      dia({ data: '3', tara: desfavoravel, prontidao: 60 }),
      dia({ data: '4', tara: desfavoravel, prontidao: 64 }),
    ];
    const [percepcao] = perceber(semana);
    expect(percepcao.texto).toBe(
      'Nos dias favoráveis do seu mapa (★), a sua prontidão média foi 78, contra 62 nos demais.'
    );
    expect(percepcao.base).toBe(
      '2 dias favoráveis no seu mapa e 2 dias sem, todos com prontidão registrada.'
    );
  });

  it('nada a dizer com 1 dia num dos grupos ou diferença pequena', () => {
    expect(
      perceber([
        dia({ data: '1', tara: favoravel, prontidao: 90 }),
        dia({ data: '2', tara: desfavoravel, prontidao: 50 }),
        dia({ data: '3', tara: desfavoravel, prontidao: 52 }),
      ])
    ).toEqual([]);
    expect(
      perceber([
        dia({ data: '1', tara: favoravel, prontidao: 70 }),
        dia({ data: '2', tara: favoravel, prontidao: 72 }),
        dia({ data: '3', tara: desfavoravel, prontidao: 68 }),
        dia({ data: '4', tara: desfavoravel, prontidao: 70 }),
      ])
    ).toEqual([]);
  });

  it('diz também quando o padrão vai contra o esperado', () => {
    const [percepcao] = perceber([
      dia({ data: '1', sonoMinutos: 480, prontidao: 55 }),
      dia({ data: '2', sonoMinutos: 450, prontidao: 57 }),
      dia({ data: '3', sonoMinutos: 360, prontidao: 70 }),
      dia({ data: '4', sonoMinutos: 330, prontidao: 72 }),
    ]);
    expect(percepcao.texto).toContain('não vieram com prontidão maior');
  });

  it('prática e nota emocional da reflexão', () => {
    const r = (e: number) => ({
      emocional: e,
      corpo: 3,
      espiritual: 3,
      frase: null,
    });
    const [percepcao] = perceber([
      dia({ data: '1', respiracaoMinutos: 5, reflexao: r(5) }),
      dia({ data: '2', meditacaoMinutos: 10, reflexao: r(4) }),
      dia({ data: '3', reflexao: r(3) }),
      dia({ data: '4', reflexao: r(3) }),
      // Sem reflexão: não entra na comparação.
      dia({ data: '5', respiracaoMinutos: 5 }),
    ]);
    expect(percepcao.texto).toBe(
      'Nos dias com meditação ou respiração, a sua nota emocional na reflexão foi 4,5, contra 3,0 nos dias sem prática.'
    );
  });
});
