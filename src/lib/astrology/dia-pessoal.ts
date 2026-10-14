import { NAKSHATRAS, SIGNOS } from './sideral';
import type { Qualidade } from './panchang';

/**
 * Como o céu do dia conversa com o mapa da pessoa: Tara Bala (nakshatra do
 * dia contado do nakshatra natal), Chandra Bala (signo da Lua do dia contado
 * da Lua natal) e Chandrashtama (Lua em trânsito na 8ª casa da Lua natal,
 * período tradicional de cautela).
 */

const TARAS: ReadonlyArray<{
  nome: string;
  qualidade: Qualidade;
  sentido: string;
}> = [
  {
    nome: 'Janma',
    qualidade: 'neutro',
    sentido: 'dia do seu nakshatra natal: sensibilidade maior, cuide do corpo',
  },
  {
    nome: 'Sampat',
    qualidade: 'favoravel',
    sentido: 'prosperidade: bom para avançar em metas',
  },
  {
    nome: 'Vipat',
    qualidade: 'desfavoravel',
    sentido: 'obstáculos: evite exageros e riscos',
  },
  {
    nome: 'Kshema',
    qualidade: 'favoravel',
    sentido: 'bem-estar: bom para rotina e cuidado',
  },
  {
    nome: 'Pratyari',
    qualidade: 'desfavoravel',
    sentido: 'resistências: escolha batalhas e preserve energia',
  },
  {
    nome: 'Sadhana',
    qualidade: 'favoravel',
    sentido: 'realização: bom para disciplina e prática',
  },
  {
    nome: 'Naidhana',
    qualidade: 'desfavoravel',
    sentido: 'desgaste: priorize recuperação e evite decisões grandes',
  },
  {
    nome: 'Mitra',
    qualidade: 'favoravel',
    sentido: 'amizade: bom para encontros e apoio',
  },
  {
    nome: 'Parama Mitra',
    qualidade: 'favoravel',
    sentido: 'grande aliado: um dos dias mais favoráveis do ciclo',
  },
];

// Casas (contadas da Lua natal) em que a Lua do dia é favorável.
const CASAS_FAVORAVEIS_DA_LUA = new Set([1, 3, 6, 7, 10, 11]);

export interface TaraBala {
  nome: string;
  qualidade: Qualidade;
  sentido: string;
  nakshatraDoDia: string;
}

export function taraBala(
  nakshatraNatal: number,
  nakshatraDoDia: number
): TaraBala {
  const contagem = ((nakshatraDoDia - nakshatraNatal + 27) % 27) + 1;
  const tara = TARAS[(contagem - 1) % 9];
  return { ...tara, nakshatraDoDia: NAKSHATRAS[nakshatraDoDia] };
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
