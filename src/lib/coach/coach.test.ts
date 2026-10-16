import { describe, expect, it } from 'vitest';

import { calcularPanchang } from '@/lib/astrology/panchang';
import {
  diaVedicoDoPerfil,
  mapaDoPerfil,
  type PerfilAstrologico,
} from '@/lib/astrology/perfil-astrologico';
import { horaLocal, localParaUtc } from '@/lib/astrology/tempo';

import { NAKSHATRA_INFO } from './conhecimento';
import {
  COLUNAS_DO_COACH,
  type ContextoDoCoach,
  type MetricasDoCoach,
} from './contexto';
import { gerarBriefingLocal } from './gerador-local';
import { termoTecnicoEm } from './linguagem-simples';
import { calcularProntidao, type SinaisDaProntidao } from './prontidao';
import type { BriefingDoDia, Dica } from './tipos';

const SAO_PAULO = {
  rotulo: 'São Paulo, São Paulo, Brasil',
  latitude: -23.5475,
  longitude: -46.63611,
  fuso: 'America/Sao_Paulo',
};
const AGORA = new Date('2026-10-14T09:00:00Z');

function perfil(
  alteracoes: Partial<PerfilAstrologico['nascimento']> = {}
): ContextoDoCoach['perfil'] {
  return {
    nascimento: {
      data: '1990-05-15',
      hora: '08:30',
      local: SAO_PAULO,
      ...alteracoes,
    },
    moradia: SAO_PAULO,
    localDoDia: SAO_PAULO,
    faltando: [],
  };
}

function metricas(
  date: string,
  valores: Partial<Record<(typeof COLUNAS_DO_COACH)[number], number>> = {}
): MetricasDoCoach {
  const linha = { date, menstrual_flow: null } as MetricasDoCoach;
  for (const coluna of COLUNAS_DO_COACH)
    linha[coluna] = valores[coluna] ?? null;
  return linha;
}

function diasAntes(data: string, n: number) {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function contexto(alteracoes: Partial<ContextoDoCoach> = {}): ContextoDoCoach {
  return {
    userId: 'teste',
    data: '2026-10-14',
    perfil: perfil(),
    pessoa: { nome: 'Ana', objetivos: [], ciclo: null },
    hoje: null,
    historico: [],
    ...alteracoes,
  };
}

function todasAsDicas(b: BriefingDoDia): Dica[] {
  return [
    ...b.focos,
    ...b.cuidados,
    ...b.alertas,
    ...Object.values(b.recomendacoes).flat(),
  ];
}

describe('prontidão do dia', () => {
  const vazio: SinaisDaProntidao = {
    sleep_duration_minutes: null,
    hrv_ms: null,
    resting_heart_rate: null,
    energy_level: null,
    mood_score: null,
    stress_score: null,
  };

  it('sem dados ou com um só sinal fica sem valor (nunca um neutro inventado)', () => {
    expect(calcularProntidao(null, []).valor).toBeNull();
    const umSinal = calcularProntidao({ ...vazio, energy_level: 4 }, []);
    expect(umSinal.valor).toBeNull();
    expect(umSinal.base).toEqual(['Energia 4/5']);
  });

  it('compara VFC e FC de repouso com a linha de base pessoal quando ela existe', () => {
    const historico = Array.from({ length: 5 }, () => ({
      ...vazio,
      hrv_ms: 30,
      resting_heart_rate: 60,
    }));
    // 30 ms está abaixo da faixa populacional, mas é a média desta pessoa.
    const naMedia = calcularProntidao(
      { ...vazio, hrv_ms: 30, resting_heart_rate: 60 },
      historico
    );
    expect(naMedia.valor).toBe(85);
    expect(naMedia.base[0]).toBe('VFC 30 ms (sua média: 30 ms)');

    // Sem linha de base: VFC 30 vale 50 na faixa populacional e FC 60, 100;
    // (50 × 0,25 + 100 × 0,15) / 0,40 = 68,75.
    const semBase = calcularProntidao(
      { ...vazio, hrv_ms: 30, resting_heart_rate: 60 },
      []
    );
    expect(semBase.valor).toBe(69);
  });

  it('pondera só os componentes medidos', () => {
    const resultado = calcularProntidao(
      { ...vazio, sleep_duration_minutes: 480, stress_score: 100 },
      []
    );
    // Sono 100 (peso 0,30) e estresse 0 (peso 0,10): 75.
    expect(resultado.valor).toBe(75);
    expect(resultado.rotulo).toBe('Alta prontidão');
  });
});

describe('briefing do dia (motor local)', () => {
  it('monta os quatro períodos do relógio local, contíguos, com nota e sugestão', () => {
    const b = gerarBriefingLocal({ contexto: contexto(), agora: AGORA });
    expect(b.periodos.map((p) => p.chave)).toEqual([
      'madrugada',
      'manha',
      'tarde',
      'noite',
    ]);
    expect(b.periodos[0].inicio).toBe(
      localParaUtc('2026-10-14', '00:00', SAO_PAULO.fuso).toISOString()
    );
    expect(b.periodos[3].fim).toBe(
      localParaUtc('2026-10-15', '00:00', SAO_PAULO.fuso).toISOString()
    );
    for (let i = 1; i < b.periodos.length; i++) {
      expect(b.periodos[i].inicio).toBe(b.periodos[i - 1].fim);
    }
    for (const p of b.periodos) {
      expect(p.nota).toBeGreaterThanOrEqual(0);
      expect(p.nota).toBeLessThanOrEqual(100);
      expect(p.sugestao.length).toBeGreaterThan(20);
    }
  });

  it('usa os horários reais do Panchang e explica cada dica', () => {
    const b = gerarBriefingLocal({ contexto: contexto(), agora: AGORA });
    const panchang = calcularPanchang({ data: '2026-10-14', ...SAO_PAULO });
    const rahu = `${horaLocal(panchang.rahuKalam.inicio, SAO_PAULO.fuso)} e ${horaLocal(panchang.rahuKalam.fim, SAO_PAULO.fuso)}`;
    expect(b.cuidados[0].texto).toContain(rahu);
    expect(b.ceu.nascerDoSol).toBe(
      horaLocal(panchang.nascerDoSol, SAO_PAULO.fuso)
    );
    expect(b.ceu.nakshatra).toBe(panchang.nakshatra.nome);
    expect(b.focos).toHaveLength(3);
    for (const dica of todasAsDicas(b)) {
      expect(dica.texto.trim().length).toBeGreaterThan(5);
      expect(dica.porque.trim().length).toBeGreaterThan(5);
    }
  });

  it('sem check-in, não inventa prontidão e pede os dados', () => {
    const b = gerarBriefingLocal({ contexto: contexto(), agora: AGORA });
    expect(b.prontidao.valor).toBeNull();
    expect(b.completar.join(' ')).toContain('check-in');
    expect(b.recomendacoes.movimento[0].porque).toContain(
      'Sem dados de recuperação'
    );
  });

  function bemRecuperada(data: string) {
    return contexto({
      data,
      hoje: metricas(data, {
        sleep_duration_minutes: 480,
        hrv_ms: 60,
        resting_heart_rate: 55,
        energy_level: 5,
        mood_score: 5,
        stress_score: 15,
      }),
      historico: Array.from({ length: 7 }, (_, i) =>
        metricas(diasAntes(data, i + 1), {
          hrv_ms: 55,
          resting_heart_rate: 58,
          sleep_duration_minutes: 450,
        })
      ),
    });
  }

  function dataComNatureza(suave: boolean) {
    for (let i = 0; i < 30; i++) {
      const data = diasAntes('2026-11-15', i);
      const indice = calcularPanchang({ data, ...SAO_PAULO }).nakshatra.indice;
      if ((NAKSHATRA_INFO[indice].natureza === 'mridu') === suave) return data;
    }
    throw new Error('Nenhuma data encontrada no intervalo.');
  }

  it('com boa recuperação libera treino intenso', () => {
    const b = gerarBriefingLocal({
      contexto: bemRecuperada(dataComNatureza(false)),
      agora: AGORA,
    });
    expect(b.prontidao.valor).toBeGreaterThanOrEqual(75);
    expect(b.recomendacoes.movimento[0].texto).toContain('Treino intenso');
    expect(b.recomendacoes.sono[0].texto).toContain('Sono em dia');
    expect(b.dosha.base).toBe('metricas');
  });

  it('em nakshatra suave, corpo pronto não vira treino extenuante', () => {
    const b = gerarBriefingLocal({
      contexto: bemRecuperada(dataComNatureza(true)),
      agora: AGORA,
    });
    expect(b.prontidao.valor).toBeGreaterThanOrEqual(75);
    expect(b.recomendacoes.movimento[0].texto).toContain('dia suave');
    expect(b.recomendacoes.movimento[0].texto).not.toContain('Treino intenso');
  });

  it('com recuperação baixa o dia vira de atenção e pede calma', () => {
    const historico = Array.from({ length: 7 }, (_, i) =>
      metricas(diasAntes('2026-10-14', i + 1), {
        hrv_ms: 60,
        resting_heart_rate: 58,
        sleep_duration_minutes: 360,
      })
    );
    const b = gerarBriefingLocal({
      contexto: contexto({
        hoje: metricas('2026-10-14', {
          sleep_duration_minutes: 300,
          hrv_ms: 35,
          resting_heart_rate: 68,
          energy_level: 2,
          stress_score: 80,
        }),
        historico,
      }),
      agora: AGORA,
    });
    expect(b.prontidao.valor).toBeLessThan(40);
    expect(b.tom).toBe('atencao');
    expect(b.manchete).toBe('Seu corpo pede recuperação hoje');
    expect(b.recomendacoes.mente[0].texto).toContain('4-7-8');
    expect(b.recomendacoes.sono[0].texto).toContain('Débito de sono');
    expect(b.cuidados.map((c) => c.texto).join(' ')).toContain(
      'Não force o corpo'
    );
  });

  it('é determinístico para as mesmas entradas', () => {
    const a = gerarBriefingLocal({ contexto: contexto(), agora: AGORA });
    const b = gerarBriefingLocal({ contexto: contexto(), agora: AGORA });
    expect(a).toEqual(b);
  });

  it('sem cidade de nascimento, segue com o Panchang e pede o mapa natal', () => {
    const b = gerarBriefingLocal({
      contexto: contexto({ perfil: perfil({ local: null }) }),
      agora: AGORA,
    });
    expect(b.ceu.tara).toBeNull();
    expect(b.ceu.dasha).toBeNull();
    expect(b.completar[0]).toContain('cidade de nascimento');
  });

  it('sugere o Ekadashi só no 11º tithi', () => {
    let ekadashi: string | null = null;
    let comum: string | null = null;
    for (let i = 0; i < 30 && (!ekadashi || !comum); i++) {
      const data = diasAntes('2026-11-15', i);
      const tithi = calcularPanchang({ data, ...SAO_PAULO }).tithi.indice % 15;
      if (tithi === 10) ekadashi ??= data;
      else comum ??= data;
    }
    expect(ekadashi).not.toBeNull();
    const textos = (data: string) =>
      gerarBriefingLocal({ contexto: contexto({ data }), agora: AGORA })
        .recomendacoes.alimentacao.map((d) => d.texto)
        .join(' ');
    expect(textos(ekadashi as string)).toContain('11º dia da Lua');
    expect(textos(comum as string)).not.toContain('11º dia da Lua');
  });

  it('no Chandrashtama da pessoa o dia é de atenção, com alerta', () => {
    const p = perfil();
    const mapa = mapaDoPerfil(p, AGORA);
    let data: string | null = null;
    for (let i = 0; i < 31 && !data; i++) {
      const candidata = diasAntes('2026-11-14', i);
      if (
        diaVedicoDoPerfil(p, mapa, candidata)?.pessoal?.chandra.chandrashtama
      ) {
        data = candidata;
      }
    }
    expect(data).not.toBeNull();
    const b = gerarBriefingLocal({
      contexto: contexto({ data: data as string, perfil: p }),
      agora: AGORA,
    });
    expect(b.ceu.chandrashtama).toBe(true);
    expect(b.tom).toBe('atencao');
    expect(b.manchete).toBe(
      'Dia de prudência: a Lua passa pelo ponto mais sensível do seu mapa'
    );
    expect(b.alertas.map((a) => a.texto).join(' ')).toContain('prudência');
    expect(b.alertas.map((a) => a.porque).join(' ')).toContain(
      'ponto mais sensível do seu mapa'
    );
  });

  it('considera a fase do ciclo quando acompanhada e pede a data quando falta', () => {
    const comCiclo = gerarBriefingLocal({
      contexto: contexto({
        pessoa: {
          nome: 'Ana',
          objetivos: [],
          ciclo: {
            lastMenstrualPeriod: '2026-10-10',
            cycleLength: 28,
            periodLength: 5,
            lifeStage: 'ciclo_regular',
          },
        },
      }),
      agora: AGORA,
    });
    expect(comCiclo.ciclo).toEqual({ fase: 'Fase menstrual', dia: 5 });

    const semData = gerarBriefingLocal({
      contexto: contexto({
        pessoa: {
          nome: 'Ana',
          objetivos: [],
          ciclo: {
            lastMenstrualPeriod: null,
            cycleLength: null,
            periodLength: null,
            lifeStage: null,
          },
        },
      }),
      agora: AGORA,
    });
    expect(semData.ciclo).toBeNull();
    expect(semData.completar.join(' ')).toContain('última menstruação');
  });
});

/** Todos os textos que a pessoa lê no "Meu dia" (fora os nomes tradicionais). */
function textosParaAPessoa(b: BriefingDoDia): string[] {
  return [
    b.manchete,
    b.resumo,
    ...b.periodos.flatMap((p) => [
      p.sugestao,
      ...[...p.destaques, ...p.cuidados].flatMap((j) => [j.nome, j.sentido]),
    ]),
    ...todasAsDicas(b).flatMap((d) => [d.texto, d.porque]),
    ...b.completar,
    ...b.ceuSimples.itens.flatMap((i) => [i.termo, i.valor, i.detalhe ?? '']),
    b.dosha.simples,
    b.leitura.resumoGeral,
    ...b.leitura.periodos.flatMap((p) => [p.emocional, p.fisico, p.espiritual]),
    ...b.leitura.pontosPositivos,
    ...b.leitura.pontosNegativos,
    ...b.leitura.dicas.flatMap((d) => [d.texto, d.porque]),
  ];
}

describe('linguagem simples (tarefa 49)', () => {
  it('detecta termos técnicos com fronteira de palavra e acentos', () => {
    expect(termoTecnicoEm('Lua em Mula, nakshatra cortante')).toBe('Mula');
    expect(termoTecnicoEm('Evite o Rahu Kalam')).toBe('Rahu');
    expect(termoTecnicoEm('a Lua na 7ª casa')).toBe('7ª casa');
    expect(termoTecnicoEm('Yoga Shobhana sustenta o dia')).toBe('Shobhana');
    // Palavras comuns que contêm um termo não são confundidas com ele.
    expect(termoTecnicoEm('Faça yoga e alongamento, sem pressa.')).toBeNull();
    expect(termoTecnicoEm('Uma mulher caminha na praça.')).toBeNull();
    expect(termoTecnicoEm('Cuide da sua saúde com calma.')).toBeNull();
  });

  it('nenhum texto do dia usa termos técnicos, com e sem mapa, em 60 dias', () => {
    const perfis = [
      perfil(),
      perfil({ data: '1972-12-03', hora: '23:40' }),
      perfil({ local: null }),
    ];
    const achados: string[] = [];
    for (const [indice, p] of perfis.entries()) {
      for (let i = 0; i < 60; i++) {
        const data = diasAntes('2026-12-31', i);
        const b = gerarBriefingLocal({
          contexto: contexto({
            data,
            perfil: p,
            hoje: i % 2 === 0 ? bemRecuperadaHoje(data) : null,
          }),
          agora: AGORA,
        });
        for (const texto of textosParaAPessoa(b)) {
          const termo = termoTecnicoEm(texto);
          if (termo)
            achados.push(`perfil ${indice} ${data}: "${termo}" em "${texto}"`);
        }
      }
    }
    expect(achados).toEqual([]);
  });

  it('fala do mapa da pessoa: tom do dia, área do mapa, Lua de nascimento e fase da vida', () => {
    const b = gerarBriefingLocal({ contexto: contexto(), agora: AGORA });
    expect(b.leitura.resumoGeral).toContain('Para você, hoje é um dia de');
    expect(b.leitura.resumoGeral).toContain('A sua Lua de nascimento, em');
    expect(b.leitura.resumoGeral).toContain('Nesta fase da sua vida');
    expect(b.resumo).toContain('Para você, hoje é um dia de');
    const termos = b.ceuSimples.itens.map((i) => i.termo);
    expect(termos).toEqual(
      expect.arrayContaining([
        'Para você hoje',
        'Sua Lua de nascimento',
        'Seu ascendente',
        'Sua fase de vida',
      ])
    );
    // Os nomes tradicionais continuam disponíveis, à parte.
    expect(b.ceuSimples.tradicionais.map((i) => i.termo)).toEqual(
      expect.arrayContaining(['Nakshatra', 'Tithi', 'Tara Bala', 'Dasha'])
    );
  });

  it('a manchete diz para o que o dia é bom para a pessoa', () => {
    const b = gerarBriefingLocal({ contexto: contexto(), agora: AGORA });
    expect(b.manchete).not.toContain('escolha bem os horários');
    expect(b.manchete).toMatch(
      /bom para|com foco em|recuperação|cuidado|prudência/
    );
  });
});

function bemRecuperadaHoje(data: string) {
  return metricas(data, {
    sleep_duration_minutes: 470,
    hrv_ms: 58,
    resting_heart_rate: 56,
    energy_level: 4,
    mood_score: 4,
    stress_score: 30,
  });
}
