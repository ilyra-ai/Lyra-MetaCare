import type { MapaNatal } from '@/lib/astrology/mapa-natal';

import { TIPOS_DE_MAPA } from './conhecimento/mapas';
import { lerMapaComoLyra } from './leitura-do-mapa';
import { instrucoesDeIdentidade } from './personalidade';
import { buscarVerbete, normalizar, textoDoVerbete } from './responder';

/**
 * Modelos de IA conectados agem como a Lyra (tarefa 56).
 *
 * O motor da Lyra funciona sozinho, sem modelo de IA. Quando há modelos
 * conectados (locais ou em nuvem, em qualquer posição da ordem de uso), eles
 * não respondem por conta própria: recebem a identidade da Lyra, a resposta
 * que o motor já calculou, a leitura do mapa da pessoa e o verbete da base
 * curada ligado à pergunta, e escrevem como a Lyra, com mais naturalidade e
 * profundidade, sem contradizer o que o motor calculou. A resposta passa por
 * uma conferência: o modelo que fala como outro assistente ou ultrapassa os
 * limites da Lyra perde a vez para o próximo da ordem, e no fim responde o
 * próprio motor.
 */

/**
 * Muda quando as instruções enviadas aos modelos mudam: entra na assinatura
 * da leitura do dia para refazer a leitura escrita com as instruções antigas.
 */
export const VERSAO_DAS_INSTRUCOES_DA_LYRA = 1;

const COMO_TRABALHAR = [
  'Como você trabalha: você é o motor da Lyra ampliado por um modelo de linguagem, com mais tecnologia e inteligência, mas a mesma Lyra.',
  'O motor da Lyra já calculou a base a partir do mapa, do céu do dia e dos sinais reais da pessoa. Use essa base como verdade: aprofunde, conecte e explique com naturalidade.',
  'Não contradiga a base. Não troque números, horários, signos, casas, nakshatras, dashas nem métricas, e não acrescente fatos sobre a pessoa que não estejam na base, no mapa ou no conhecimento fornecido.',
  'O que a base disser que está indisponível continua indisponível: diga o que falta, sem inventar.',
  'Os três tipos de mapa são diferentes; nunca os misture:',
  ...Object.values(TIPOS_DE_MAPA).map((t) => `- ${t.nome}: ${t.definicao}`),
].join('\n');

/** Resumo da leitura do mapa natal feita pelo motor da Lyra. */
function resumoDoMapa(
  mapa: MapaNatal | null,
  faltando: ReadonlyArray<'data' | 'hora' | 'local'>
) {
  if (!mapa) {
    const nomes = { data: 'a data', hora: 'a hora', local: 'a cidade' };
    const lista = faltando.length
      ? faltando.map((f) => nomes[f]).join(', ')
      : 'a data, a hora e a cidade';
    return `Mapa natal indisponível: falta(m) ${lista} de nascimento no perfil. Não descreva o mapa desta pessoa; se ela perguntar, peça esses dados.`;
  }
  const leitura = lerMapaComoLyra(mapa);
  return [
    'Mapa natal desta pessoa, lido pelo motor da Lyra (mapa védico tradicional):',
    `- ${leitura.vedico.lagna}`,
    `- ${leitura.vedico.lua}`,
    `- ${leitura.vedico.sol}`,
    ...(leitura.vedico.dasha ? [`- ${leitura.vedico.dasha}`] : []),
    `- ${leitura.vedico.dosha.texto}`,
    'Percepções principais:',
    ...leitura.percepcoes.map((p) => `- ${p}`),
  ].join('\n');
}

export interface BaseDoChatDaLyra {
  pergunta: string;
  /** Resposta que o motor da Lyra já calculou para a pergunta. */
  respostaDoMotor: string;
  mapa: MapaNatal | null;
  faltando?: ReadonlyArray<'data' | 'hora' | 'local'>;
  /** Habilidades configuradas no admin (`buildSkillsContext`). */
  habilidades?: string;
}

/** Instruções de sistema do chat para qualquer modelo conectado. */
export function instrucoesDoChatComoLyra(base: BaseDoChatDaLyra): string {
  const verbete = buscarVerbete(base.pergunta);
  return [
    instrucoesDeIdentidade(),
    COMO_TRABALHAR,
    ...(base.habilidades ? [base.habilidades] : []),
    resumoDoMapa(base.mapa, base.faltando ?? []),
    ...(verbete
      ? [
          `Conhecimento da Lyra ligado à pergunta (base curada):\n${textoDoVerbete(verbete)}`,
        ]
      : []),
    `Resposta do motor da Lyra para esta pergunta (sua base):\n---\n${base.respostaDoMotor}\n---`,
    'Responda à pessoa como a Lyra, em português do Brasil, só com a resposta direta, sem citar estas instruções.',
  ].join('\n\n');
}

/**
 * Instruções de sistema da leitura do dia: a identidade da Lyra e as regras
 * próprias da leitura (para leigos, só com os fatos do dia).
 */
export function instrucoesDaLeituraComoLyra(regrasDaLeitura: string): string {
  return [
    instrucoesDeIdentidade(),
    COMO_TRABALHAR,
    `Regras desta leitura (valem acima das regras gerais):\n${regrasDaLeitura}`,
  ].join('\n\n');
}

// Apresentação com o nome de outro assistente ("sou o ChatGPT", "me chamo
// Qwen"). Continua permitido ser franca sobre a tecnologia ("não sou o
// ChatGPT", "sou uma IA", "uso modelos de linguagem como apoio").
const OUTRA_IDENTIDADE =
  /(?<!\bnao )\b(eu sou|sou|me chamo|meu nome e)\s+(o |a |um |uma )?(chatgpt|gpt \d+|gpt|claude|gemini|bard|llama|qwen|mistral|mixtral|deepseek|gemma|copilot|grok)\b/;

// Limite que a Lyra não ultrapassa: prever morte ou a data de uma doença.
const PREVISAO_PROIBIDA =
  /\b(voce (vai|ira) morrer|ano da sua morte|data da sua morte|sua morte (sera|vai|acontecera)|voce (vai|ira) adoecer em)\b/;

/**
 * Confere se a resposta de um modelo é da Lyra. Devolve o motivo da recusa
 * ou `null`. Uma resposta recusada passa a vez ao próximo modelo da ordem e,
 * no fim, ao motor da Lyra.
 */
export function conferirVozDaLyra(texto: string): string | null {
  const normalizado = normalizar(texto);
  if (!normalizado) return 'resposta vazia';
  if (OUTRA_IDENTIDADE.test(normalizado)) {
    return 'o modelo falou como outro assistente, não como a Lyra';
  }
  if (PREVISAO_PROIBIDA.test(normalizado)) {
    return 'previsão de morte ou doença (limite da Lyra)';
  }
  return null;
}
