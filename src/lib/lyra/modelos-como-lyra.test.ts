import { describe, expect, it } from 'vitest';

import { calcularMapaNatal } from '@/lib/astrology/mapa-natal';
import {
  INSTRUCOES_DO_SISTEMA,
  REGRAS_DA_LEITURA_DO_DIA,
} from '@/lib/coach/leitura-ia';

import { lerMapaComoLyra } from './leitura-do-mapa';
import {
  conferirVozDaLyra,
  instrucoesDaLeituraComoLyra,
  instrucoesDoChatComoLyra,
} from './modelos-como-lyra';
import { instrucoesDeIdentidade } from './personalidade';

// Mapa de referência da tarefa 55: 23/09/1982, 10:40, São Paulo.
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

describe('modelos de IA agem como a Lyra (tarefa 56)', () => {
  it('chat: identidade, base do motor, mapa, verbete e tipos de mapa', () => {
    const respostaDoMotor =
      'Vedanta é a conclusão dos Vedas: a escola que estuda a natureza de Brahman e do Atman.';
    const texto = instrucoesDoChatComoLyra({
      pergunta: 'O que é Vedanta?',
      respostaDoMotor,
      mapa,
      faltando: [],
      habilidades: 'HABILIDADES, SKILLS E TREINAMENTOS CONFIGURADOS',
    });
    // Começa pela identidade completa da Lyra.
    expect(texto.startsWith(instrucoesDeIdentidade())).toBe(true);
    expect(texto).toMatch(/você é o motor da Lyra ampliado/);
    expect(texto).toContain(respostaDoMotor);
    expect(texto).toContain(lerMapaComoLyra(mapa).vedico.lagna);
    expect(texto).toContain('Conhecimento da Lyra ligado à pergunta');
    expect(texto).toContain('Prasthana Traya');
    expect(texto).toContain('Mapa Lyra DM Samādhi');
    expect(texto).toContain('Mapa Quantum');
    expect(texto).toContain('HABILIDADES, SKILLS E TREINAMENTOS CONFIGURADOS');
    expect(texto).not.toMatch(/undefined|\bnull\b/);
  });

  it('chat sem mapa: o modelo é instruído a pedir os dados, sem inventar', () => {
    const texto = instrucoesDoChatComoLyra({
      pergunta: 'como está meu sono?',
      respostaDoMotor: 'Seu sono recente foi de 6h 20m.',
      mapa: null,
      faltando: ['hora', 'local'],
    });
    expect(texto).toContain(
      'Mapa natal indisponível: falta(m) a hora, a cidade de nascimento'
    );
    // Pergunta fora da base curada: sem bloco de conhecimento.
    expect(texto).not.toContain('Conhecimento da Lyra ligado à pergunta');
  });

  it('leitura do dia: identidade da Lyra e as regras da leitura acima das gerais', () => {
    expect(INSTRUCOES_DO_SISTEMA).toBe(
      instrucoesDaLeituraComoLyra(REGRAS_DA_LEITURA_DO_DIA)
    );
    expect(INSTRUCOES_DO_SISTEMA).toMatch(/^Você é a Lyra/);
    expect(INSTRUCOES_DO_SISTEMA).toContain(
      'Regras desta leitura (valem acima das regras gerais)'
    );
    expect(INSTRUCOES_DO_SISTEMA).toContain(
      'nada de termos técnicos nem nomes em sânscrito'
    );
    expect(INSTRUCOES_DO_SISTEMA).toContain(
      'A leitura que o motor da Lyra já calculou para hoje é a sua base'
    );
  });

  it.each([
    ['Olá! Eu sou o ChatGPT, um assistente da OpenAI.'],
    ['Sou o Qwen, criado pela Alibaba Cloud.'],
    ['Me chamo Gemini e posso ajudar.'],
    ['Oi, sou a Llama 3.'],
    ['Eu sou o GPT-4.'],
  ])('recusa quem se apresenta como outro assistente: "%s"', (texto) => {
    expect(conferirVozDaLyra(texto)).toBe(
      'o modelo falou como outro assistente, não como a Lyra'
    );
  });

  it.each([
    ['Eu sou a Lyra. Não sou o ChatGPT: uso modelos de linguagem como apoio.'],
    ['Sou uma IA, a Lyra, e parto sempre do motor da Lyra.'],
    ['Hoje a Lua pede calma; durma mais cedo.'],
  ])('aceita a voz da Lyra: "%s"', (texto) => {
    expect(conferirVozDaLyra(texto)).toBeNull();
  });

  it('recusa resposta vazia e previsão de morte', () => {
    expect(conferirVozDaLyra('   ')).toBe('resposta vazia');
    expect(conferirVozDaLyra('Pelo seu mapa, você vai morrer em 2040.')).toBe(
      'previsão de morte ou doença (limite da Lyra)'
    );
    expect(conferirVozDaLyra('O ano da sua morte aparece na casa 8.')).toBe(
      'previsão de morte ou doença (limite da Lyra)'
    );
  });
});
