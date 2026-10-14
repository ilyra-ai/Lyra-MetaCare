import { describe, expect, it } from 'vitest';

import { getAstrologicalContext } from '@/lib/astrology/engine';
import { gerarBriefingLocal } from '@/lib/coach/gerador-local';

import { buildSkillsContext, generateLocalAssistantReply } from './chat-engine';

const ASTROLOGIA = getAstrologicalContext(new Date('2026-10-06T12:00:00Z'));

function responder(
  pergunta: string,
  extra: Partial<Parameters<typeof generateLocalAssistantReply>[1]> = {}
) {
  return generateLocalAssistantReply(pergunta, {
    profile: { first_name: 'Ana', goals: ['sono profundo'] },
    latestMetric: {
      steps: 5200,
      sleep_duration_minutes: 380,
      hrv_ms: 35,
      readiness_score: 61,
      blood_glucose_mgdl: 118,
    },
    astrology: ASTROLOGIA,
    ...extra,
  });
}

describe('assistente local', () => {
  it('reconhece saudações com acento, inclusive no fim da frase', () => {
    for (const saudacao of ['Olá', 'olá!', 'Oi', 'Bom dia', 'tudo bem?']) {
      expect(responder(saudacao)).toMatch(/^Olá, Ana!/);
    }
  });

  it('não confunde termos dentro de outras palavras', () => {
    // "lua" dentro de "evolua" e "oi" dentro de "dois" não são intenções.
    const resposta = responder('evolua dois pontos');
    expect(resposta).not.toMatch(/Neste instante astronômico/);
    expect(resposta).not.toMatch(/^Olá, Ana!/);
  });

  it('analisa sono curto, glicose alta e HRV baixa a partir das métricas', () => {
    expect(responder('Como está meu sono?')).toMatch(
      /6h 20m.*menos do que o mínimo recomendado/
    );
    expect(responder('minha glicose')).toMatch(
      /118 mg\/dL.*estresse oxidativo/
    );
    expect(responder('meu HRV')).toMatch(/35 ms e prontidão de 61\/100/);
    expect(responder('quero mais passos')).toMatch(/5200 passos.*NEAT/);
  });

  it('informa ausência de dados em vez de inventar valores', () => {
    const resposta = responder('resumo de hoje', { latestMetric: null });
    expect(resposta).toMatch(/Não encontrei métricas recentes/);
    expect(responder('meu sono', { latestMetric: null })).toMatch(
      /Ainda não tenho dados recentes do seu sono/
    );
  });

  it('o contexto astrológico usa o céu calculado', () => {
    const resposta = responder('o que diz a lua hoje?');
    expect(resposta).toContain(`Lua em ${ASTROLOGIA.moonSign}`);
    expect(resposta).toContain(ASTROLOGIA.nakshatra);
  });

  it('lista as skills configuradas quando perguntado', () => {
    const resposta = responder('Quais habilidades você tem?', {
      skills: [
        {
          title: 'Sono',
          category: 'protocolos',
          content: 'Orientar higiene do sono.',
        },
      ],
    });
    expect(resposta).toMatch(/1 habilidade configurada/);
    expect(resposta).toMatch(
      /Sono \(protocolos\) — Orientar higiene do sono\./
    );
    expect(responder('Quais habilidades você tem?')).toMatch(
      /ainda não há documentos de habilidade/
    );
  });

  it('cai no resumo determinístico quando não reconhece a intenção', () => {
    expect(responder('xyz')).toMatch(/^Ana, o motor de análise estruturou/);
  });
});

describe('contexto de skills', () => {
  it('vazio sem skills e numerado com elas', () => {
    expect(buildSkillsContext()).toBe('');
    expect(buildSkillsContext([])).toBe('');
    expect(
      buildSkillsContext([
        { title: 'A', category: '', content: '  conteúdo A ' },
        { title: 'B', category: 'cat', content: 'conteúdo B' },
      ])
    ).toBe(
      [
        'HABILIDADES, SKILLS E TREINAMENTOS CONFIGURADOS (siga estritamente):',
        '### Skill 1: A\nconteúdo A',
        '### Skill 2: B [cat]\nconteúdo B',
      ].join('\n\n')
    );
  });
});

describe('o dia de hoje no chat', () => {
  const SP = {
    rotulo: 'São Paulo, São Paulo, Brasil',
    latitude: -23.5475,
    longitude: -46.63611,
    fuso: 'America/Sao_Paulo',
  };
  const seuDia = gerarBriefingLocal({
    contexto: {
      userId: 'teste',
      data: '2026-10-14',
      perfil: {
        nascimento: { data: '1990-05-15', hora: '08:30', local: SP },
        moradia: SP,
        localDoDia: SP,
        faltando: [],
      },
      pessoa: { nome: 'Ana', objetivos: [], ciclo: null },
      hoje: null,
      historico: [],
    },
    agora: new Date('2026-10-14T09:00:00Z'),
  });

  it('responde com os períodos e focos do coach', () => {
    const resposta = responder('como vai ser meu dia?', { seuDia });
    expect(resposta).toContain(`Seu dia (São Paulo): ${seuDia.manchete}.`);
    for (const periodo of seuDia.periodos) {
      expect(resposta).toContain(`${periodo.nome} (${periodo.horario})`);
    }
    expect(resposta).toContain('"Meu dia"');
  });

  it('sem o briefing, explica o que falta no perfil', () => {
    expect(responder('como vai ser meu dia?', { seuDia: null })).toContain(
      'escolha no perfil a cidade onde você mora'
    );
  });
});
