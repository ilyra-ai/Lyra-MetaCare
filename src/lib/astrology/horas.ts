import type { Intervalo, Panchang } from './panchang';
import type { Graha } from './sideral';

/**
 * Horas planetárias (Hora) do dia védico: o dia (nascer ao pôr do sol) e a
 * noite (pôr do sol ao próximo nascer) são divididos em 12 partes iguais
 * cada. A primeira hora do dia é do regente do dia da semana; as seguintes
 * seguem a ordem caldeia (Saturno, Júpiter, Marte, Sol, Vênus, Mercúrio,
 * Lua) e a noite continua a mesma sequência (13ª hora em diante).
 */

const ORDEM_CALDEIA: readonly Graha[] = [
  'saturno',
  'jupiter',
  'marte',
  'sol',
  'venus',
  'mercurio',
  'lua',
];

/** Regente de cada dia da semana (domingo = 0). */
export const REGENTE_DO_DIA: readonly Graha[] = [
  'sol',
  'lua',
  'marte',
  'mercurio',
  'jupiter',
  'venus',
  'saturno',
];

export interface HoraPlanetaria extends Intervalo {
  graha: Graha;
  /** 1 a 24 a partir do nascer do sol. */
  numero: number;
  diurna: boolean;
}

function dividir(intervalo: Intervalo) {
  const passo = (intervalo.fim.getTime() - intervalo.inicio.getTime()) / 12;
  return Array.from({ length: 12 }, (_, i) => ({
    inicio: new Date(intervalo.inicio.getTime() + passo * i),
    fim: new Date(intervalo.inicio.getTime() + passo * (i + 1)),
  }));
}

export function horasDoDia(panchang: Panchang): HoraPlanetaria[] {
  const primeira = ORDEM_CALDEIA.indexOf(REGENTE_DO_DIA[panchang.vara.indice]);
  const partes = [
    ...dividir({ inicio: panchang.nascerDoSol, fim: panchang.porDoSol }),
    ...dividir({ inicio: panchang.porDoSol, fim: panchang.proximoNascerDoSol }),
  ];
  return partes.map((parte, i) => ({
    ...parte,
    graha: ORDEM_CALDEIA[(primeira + i) % 7],
    numero: i + 1,
    diurna: i < 12,
  }));
}
