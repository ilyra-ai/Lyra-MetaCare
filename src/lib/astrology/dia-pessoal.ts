import { NAKSHATRAS, SIGNOS } from './sideral';
import type { Qualidade } from './panchang';

/**
 * Como o céu do dia conversa com o mapa da pessoa: Tara Bala (nakshatra do
 * dia contado do nakshatra natal), Chandra Bala (signo da Lua do dia contado
 * da Lua natal) e Chandrashtama (Lua em trânsito na 8ª casa da Lua natal,
 * período tradicional de cautela).
 */

// `tema` e `conselho` contam o Tara em linguagem simples (tarefa 49);
// `sentido` junta os dois ("tema: conselho").
const TARAS: ReadonlyArray<{
  nome: string;
  qualidade: Qualidade;
  tema: string;
  conselho: string;
}> = [
  {
    nome: 'Janma',
    qualidade: 'neutro',
    tema: 'sensibilidade',
    conselho:
      'a Lua volta ao ponto em que estava quando você nasceu; cuide do corpo e das emoções',
  },
  {
    nome: 'Sampat',
    qualidade: 'favoravel',
    tema: 'prosperidade',
    conselho: 'bom para avançar em metas',
  },
  {
    nome: 'Vipat',
    qualidade: 'desfavoravel',
    tema: 'obstáculos',
    conselho: 'evite exageros e riscos',
  },
  {
    nome: 'Kshema',
    qualidade: 'favoravel',
    tema: 'bem-estar',
    conselho: 'bom para rotina e cuidado',
  },
  {
    nome: 'Pratyari',
    qualidade: 'desfavoravel',
    tema: 'resistências',
    conselho: 'escolha suas batalhas e poupe energia',
  },
  {
    nome: 'Sadhana',
    qualidade: 'favoravel',
    tema: 'realização',
    conselho: 'bom para disciplina e prática',
  },
  {
    nome: 'Naidhana',
    qualidade: 'desfavoravel',
    tema: 'desgaste',
    conselho: 'priorize a recuperação e evite decisões grandes',
  },
  {
    nome: 'Mitra',
    qualidade: 'favoravel',
    tema: 'amizade',
    conselho: 'bom para encontros e apoio',
  },
  {
    nome: 'Parama Mitra',
    qualidade: 'favoravel',
    tema: 'grande apoio',
    conselho: 'um dos dias mais favoráveis do seu ciclo',
  },
];

// Casas (contadas da Lua natal) em que a Lua do dia é favorável.
const CASAS_FAVORAVEIS_DA_LUA = new Set([1, 3, 6, 7, 10, 11]);

export interface TaraBala {
  nome: string;
  qualidade: Qualidade;
  /** Tema do dia em uma ou duas palavras ("resistências"). */
  tema: string;
  /** O que fazer com ele ("escolha suas batalhas e poupe energia"). */
  conselho: string;
  /** "tema: conselho". */
  sentido: string;
  nakshatraDoDia: string;
}

export function taraBala(
  nakshatraNatal: number,
  nakshatraDoDia: number
): TaraBala {
  const contagem = ((nakshatraDoDia - nakshatraNatal + 27) % 27) + 1;
  const tara = TARAS[(contagem - 1) % 9];
  return {
    ...tara,
    sentido: `${tara.tema}: ${tara.conselho}`,
    nakshatraDoDia: NAKSHATRAS[nakshatraDoDia],
  };
}

export interface ChandraBala {
  /** Casa (1 a 12) da Lua do dia a partir da Lua natal. */
  casa: number;
  qualidade: Qualidade;
  chandrashtama: boolean;
  signoDaLuaDoDia: string;
}

export function chandraBala(
  signoDaLuaNatal: number,
  signoDaLuaDoDia: number
): ChandraBala {
  const casa = ((signoDaLuaDoDia - signoDaLuaNatal + 12) % 12) + 1;
  const chandrashtama = casa === 8;
  return {
    casa,
    chandrashtama,
    qualidade: chandrashtama
      ? 'desfavoravel'
      : CASAS_FAVORAVEIS_DA_LUA.has(casa)
        ? 'favoravel'
        : 'neutro',
    signoDaLuaDoDia: SIGNOS[signoDaLuaDoDia],
  };
}
