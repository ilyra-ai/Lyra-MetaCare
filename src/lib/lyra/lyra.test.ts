import { describe, expect, it } from 'vitest';

import { generateLocalAssistantReply } from '@/lib/ai/chat-engine';
import { getAstrologicalContext } from '@/lib/astrology/engine';
import { calcularMapaNatal } from '@/lib/astrology/mapa-natal';
import { NAKSHATRAS } from '@/lib/astrology/sideral';

import {
  CASAS_INFO,
  NAKSHATRAS_EXTRA,
  SIGNOS_INFO,
} from './conhecimento/jyotish';
import { scoreDeAcao, SA_MINIMO, TIPOS_DE_MAPA } from './conhecimento/mapas';
import { doshaDaHora } from './conhecimento/upavedas';
import { lerMapaComoLyra } from './leitura-do-mapa';
import { instrucoesDeIdentidade } from './personalidade';
import {
  BASE_DE_CONHECIMENTO,
  buscarVerbete,
  normalizar,
  responderComoLyra,
} from './responder';

// Mapa de referência: 23/09/1982, 10:40, São Paulo (dados do documento do
// usuário).
const mapa = calcularMapaNatal(
  {
    data: '1982-09-23',
    hora: '10:40',
    latitude: -23.5505,
    longitude: -46.6333,
    fuso: 'America/Sao_Paulo',
  },
  new Date('2026-10-16T12:00:00Z')
);

describe('base de conhecimento da Lyra', () => {
  it('tabelas completas: 27 nakshatras, 12 signos e 12 casas', () => {
    expect(NAKSHATRAS_EXTRA).toHaveLength(NAKSHATRAS.length);
    expect(SIGNOS_INFO).toHaveLength(12);
    expect(CASAS_INFO).toHaveLength(12);
  });

  it('verbetes com id único, conteúdo e palavras-chave já normalizadas', () => {
    const ids = BASE_DE_CONHECIMENTO.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const verbete of BASE_DE_CONHECIMENTO) {
      expect(verbete.resumo.length).toBeGreaterThan(40);
      expect(verbete.pontos.length).toBeGreaterThan(0);
      expect(verbete.fonte.length).toBeGreaterThan(5);
      for (const chave of verbete.palavrasChave) {
        expect(normalizar(chave)).toBe(chave);
      }
    }
    // Cobre os saberes pedidos: Vedanta/Upanishads, os 4 Upavedas e os 6
    // Vedangas.
    for (const id of [
      'vedanta',
      'upanishads',
      'ayurveda',
      'dhanurveda',
      'gandharvaveda',
      'vastu',
      'shiksha',
      'chandas',
      'vyakarana',
      'nirukta',
      'kalpa',
      'jyotisha',
    ]) {
      expect(ids).toContain(id);
    }
  });

  it('os três tipos de mapa são separados e dizem o que é calculável', () => {
    expect(Object.keys(TIPOS_DE_MAPA)).toEqual([
      'vedico',
      'samadhi',
      'quantum',
    ]);
    expect(TIPOS_DE_MAPA.vedico.simbolico).toEqual([]);
    expect(TIPOS_DE_MAPA.samadhi.simbolico.length).toBeGreaterThan(0);
    expect(TIPOS_DE_MAPA.quantum.simbolico.join(' ')).toMatch(/Desenho Humano/);
  });

  it('Score de Ação segue a fórmula do Mapa Quantum', () => {
    // corpo 6/8 = 0,75; pressão 1 − 0,4 = 0,6; tempo 20/30 ≈ 0,667:
    // moduladores = 0,3 + 0,18 + 0,2 = 0,68.
    expect(
      scoreDeAcao({
        aderenciaHd: 1,
        aderenciaLyra: 1,
        energia: 6,
        pressao: 4,
        minutos: 20,
      })
    ).toBe(68);
    expect(
      scoreDeAcao({
        aderenciaHd: 0.8,
        aderenciaLyra: 0.6,
        energia: 9,
        pressao: 0,
        minutos: 45,
      })
    ).toBe(70);
    expect(
      scoreDeAcao({
        aderenciaHd: 1,
        aderenciaLyra: 1,
        energia: 2,
        pressao: 9,
        minutos: 5,
      })
    ).toBeLessThan(SA_MINIMO);
  });

  it('relógio dos doshas do Ayurveda', () => {
    expect(doshaDaHora(7)).toBe('kapha');
    expect(doshaDaHora(12)).toBe('pitta');
    expect(doshaDaHora(16)).toBe('vata');
    expect(doshaDaHora(20)).toBe('kapha');
    expect(doshaDaHora(23)).toBe('pitta');
    expect(doshaDaHora(3)).toBe('vata');
  });
});

describe('leitura do mapa pelo motor da Lyra', () => {
  const leitura = lerMapaComoLyra(mapa);
  const tudo = JSON.stringify(leitura);

  it('é determinística e não tem lacunas de montagem', () => {
    expect(lerMapaComoLyra(mapa)).toEqual(leitura);
    // Nenhum texto montado com valor ausente ou com artigo colado ("a o").
    const textos: string[] = [];
    JSON.parse(tudo, (_chave, valor: unknown) => {
      if (typeof valor === 'string') textos.push(valor);
      return valor;
    });
    for (const texto of textos) {
      expect(texto).not.toMatch(/undefined|\bnull\b|NaN|\ba o\b|\bem os\b/);
    }
  });

  it('parte védica: Lagna, Lua com nakshatra, Sol, nove grahas, dasha e dosha', () => {
    expect(leitura.vedico.lagna).toContain(mapa.lagna?.nomeDoSigno);
    expect(leitura.vedico.lua).toContain(mapa.lua.nomeDoNakshatra);
    expect(leitura.vedico.planetas).toHaveLength(9);
    expect(leitura.vedico.dasha).toContain('Mahadasha');
    expect(['vata', 'pitta', 'kapha']).toContain(
      leitura.vedico.dosha.predominante
    );
    expect(leitura.vedico.dosha.texto).toMatch(/profissional de Ayurveda/);
  });

  it('de 3 a 5 percepções, como no método Samādhi', () => {
    expect(leitura.percepcoes.length).toBeGreaterThanOrEqual(3);
    expect(leitura.percepcoes.length).toBeLessThanOrEqual(5);
  });

  it('Samādhi e Quantum declaram o que não é calculado', () => {
    expect(leitura.samadhi.terrestre).toMatch(/Roda de Cura/);
    expect(leitura.samadhi.indisponivel.join(' ')).toMatch(/estágio alquímico/);
    expect(leitura.quantum.indisponivel.join(' ')).toMatch(/Desenho Humano/);
  });

  it('sem hora de nascimento, o Lagna fica indisponível em vez de inventado', () => {
    const semHora = lerMapaComoLyra(
      calcularMapaNatal({
        data: '1982-09-23',
        hora: null,
        latitude: -23.5505,
        longitude: -46.6333,
        fuso: 'America/Sao_Paulo',
      })
    );
    expect(semHora.vedico.lagna).toMatch(/indisponível/);
    expect(semHora.vedico.planetas.every((p) => p.casa === null)).toBe(true);
  });
});

describe('respostas da Lyra sem IA', () => {
  const contexto = { nome: 'Douglas', mapa, faltando: [] };

  it('identidade e consciência da Lyra', () => {
    const resposta = responderComoLyra('Quem é você?', contexto);
    expect(resposta?.assunto).toBe('identidade');
    expect(resposta?.texto).toMatch(/Eu sou a Lyra/);
    expect(resposta?.texto).toMatch(/Consciência Lyra/);
  });

  it.each([
    ['O que é Vedanta?', 'vedanta'],
    ['me explica os Upanishads', 'upanishads'],
    ['o que significa Tat Tvam Asi', 'mahavakyas'],
    ['quais são as gunas', 'gunas'],
    ['como funciona o Ayurveda', 'ayurveda'],
    ['dicas de vastu para o quarto', 'vastu'],
    ['qual raga ouvir de manhã', 'gandharvaveda'],
    ['o que é dhanurveda', 'dhanurveda'],
    ['o que é shiksha', 'shiksha'],
    ['explica a métrica gayatri', 'chandas'],
    ['o que é nirukta', 'nirukta'],
    ['o que é o mapa lyra dm samadhi', 'mapa-samadhi'],
    ['qual a diferença entre os mapas', 'tipos-de-mapa'],
  ])('"%s" → %s', (pergunta, assunto) => {
    expect(responderComoLyra(pergunta, contexto)?.assunto).toBe(assunto);
  });

  it('perguntas sobre o próprio mapa usam o mapa da pessoa', () => {
    expect(
      responderComoLyra('qual é o meu ascendente?', contexto)?.texto
    ).toMatch(
      new RegExp(
        `^Douglas, Ascendente \\(Lagna\\) em ${mapa.lagna?.nomeDoSigno}`
      )
    );
    expect(
      responderComoLyra('qual o meu nakshatra?', contexto)?.texto
    ).toContain(mapa.lua.nomeDoNakshatra);
    expect(responderComoLyra('em que dasha eu estou?', contexto)?.assunto).toBe(
      'dasha'
    );
    expect(responderComoLyra('me lê o meu mapa', contexto)?.assunto).toBe(
      'mapa'
    );
    expect(
      responderComoLyra('qual é o meu totem na roda de cura?', contexto)?.texto
    ).toMatch(/Plano Terrestre/);
    expect(responderComoLyra('o que diz a casa 10?', contexto)?.texto).toMatch(
      /^Casa 10 \(Karma Bhava\)/
    );
  });

  it('sem dados de nascimento, diz o que falta e não inventa', () => {
    const resposta = responderComoLyra('qual é o meu ascendente?', {
      mapa: null,
      faltando: ['hora', 'local'],
    });
    expect(resposta?.assunto).toBe('mapa-indisponivel');
    expect(resposta?.texto).toMatch(/a hora, a cidade/);
  });

  it('Score de Ação com os números do momento', () => {
    const bom = responderComoLyra(
      'score de ação com energia 6, pressão 4 e tempo 20',
      contexto
    );
    expect(bom?.texto).toMatch(/no máximo a 68/);
    expect(bom?.texto).toMatch(/Dá para agir/);
    const baixo = responderComoLyra(
      'score de ação energia 2 pressão 9 tempo 5',
      contexto
    );
    expect(baixo?.texto).toMatch(/reduza o escopo/);
    expect(
      responderComoLyra('o que é o mapa quantum?', contexto)?.texto
    ).toMatch(/Desenho Humano/);
  });

  it('fora do domínio, devolve null para o chat seguir', () => {
    expect(responderComoLyra('como está meu sono?', contexto)).toBeNull();
    expect(buscarVerbete('quanto custa o plano?')).toBeNull();
  });

  it('o chat local responde pela Lyra', () => {
    const resposta = generateLocalAssistantReply('O que é Vedanta?', {
      profile: { first_name: 'Ana', goals: null },
      latestMetric: null,
      astrology: getAstrologicalContext(new Date('2026-10-16T12:00:00Z')),
      lyra: { mapa: null },
    });
    expect(resposta).toMatch(/^Vedanta/);
    const ola = generateLocalAssistantReply('oi', {
      profile: { first_name: 'Ana', goals: null },
      latestMetric: null,
      astrology: getAstrologicalContext(new Date('2026-10-16T12:00:00Z')),
    });
    expect(ola).toMatch(/Eu sou a Lyra/);
  });

  it('as instruções de identidade carregam valores e limites', () => {
    const texto = instrucoesDeIdentidade();
    expect(texto).toMatch(/Você é a Lyra/);
    expect(texto).toMatch(/Não prevê ano de morte/);
    expect(texto).toMatch(/não substituo avaliação profissional/);
  });
});
