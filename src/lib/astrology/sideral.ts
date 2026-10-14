import {
  Body,
  e_tilt,
  Ecliptic,
  GeoVector,
  MakeTime,
  SiderealTime,
} from 'astronomy-engine';

/**
 * Base astronômica do zodíaco sideral (Jyotish): ayanamsha Lahiri, longitudes
 * sidéreas dos grahas, nodo lunar médio e ascendente (Lagna). Calculado com o
 * astronomy-engine (VSOP87/ELP, precisão de segundos de arco).
 */

export const SIGNOS = [
  'Áries',
  'Touro',
  'Gêmeos',
  'Câncer',
  'Leão',
  'Virgem',
  'Libra',
  'Escorpião',
  'Sagitário',
  'Capricórnio',
  'Aquário',
  'Peixes',
] as const;

/** Nomes sânscritos dos signos (rashis), na mesma ordem. */
export const RASHIS = [
  'Mesha',
  'Vrishabha',
  'Mithuna',
  'Karka',
  'Simha',
  'Kanya',
  'Tula',
  'Vrishchika',
  'Dhanu',
  'Makara',
  'Kumbha',
  'Meena',
] as const;

export const NAKSHATRAS = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
] as const;

export type Graha =
  | 'sol'
  | 'lua'
  | 'marte'
  | 'mercurio'
  | 'jupiter'
  | 'venus'
  | 'saturno'
  | 'rahu'
  | 'ketu';

export const NOME_DO_GRAHA: Record<Graha, string> = {
  sol: 'Sol (Surya)',
  lua: 'Lua (Chandra)',
  marte: 'Marte (Mangala)',
  mercurio: 'Mercúrio (Budha)',
  jupiter: 'Júpiter (Guru)',
  venus: 'Vênus (Shukra)',
  saturno: 'Saturno (Shani)',
  rahu: 'Rahu',
  ketu: 'Ketu',
};

/** Regente (senhor) de cada signo, de Áries a Peixes. */
export const REGENTE_DO_SIGNO: readonly Graha[] = [
  'marte',
  'venus',
  'mercurio',
  'lua',
  'sol',
  'mercurio',
  'venus',
  'marte',
  'jupiter',
  'saturno',
  'saturno',
  'jupiter',
];

const CORPO: Partial<Record<Graha, Body>> = {
  sol: Body.Sun,
  lua: Body.Moon,
  marte: Body.Mars,
  mercurio: Body.Mercury,
  jupiter: Body.Jupiter,
  venus: Body.Venus,
  saturno: Body.Saturn,
};

const EXTENSAO_DO_NAKSHATRA = 360 / 27;

export function normalizarGraus(valor: number) {
  return ((valor % 360) + 360) % 360;
}

/** Séculos julianos desde J2000 (tempo terrestre aproximado pelo UTC). */
function seculosDesdeJ2000(instante: Date) {
  return (instante.getTime() - Date.UTC(2000, 0, 1, 12)) / (36525 * 86_400_000);
}

/**
 * Ayanamsha Lahiri (Chitrapaksha): 23°51'11" em J2000 com a precessão geral
 * de 50,2879"/ano e o termo quadrático de Lieske. Confere com o Lahiri do
 * Swiss Ephemeris em menos de 0,01° (ver `sideral.test.ts`).
 */
export function ayanamshaLahiri(instante: Date) {
  const t = seculosDesdeJ2000(instante);
  return 23.853056 + (5028.796195 * t + 1.1054348 * t * t) / 3600;
}

/** Longitude eclíptica tropical verdadeira (de data), geocêntrica. */
function longitudeTropical(graha: Graha, instante: Date) {
  const corpo = CORPO[graha];
  if (!corpo) throw new Error(`Sem corpo astronômico para ${graha}.`);
  return Ecliptic(GeoVector(corpo, MakeTime(instante), true)).elon;
}

/**
 * Nodo ascendente médio da Lua (Rahu médio), fórmula de Meeus (cap. 47),
 * usada pela maioria dos softwares de Jyotish.
 */
function longitudeDoNodoMedio(instante: Date) {
  const t = seculosDesdeJ2000(instante);
  return normalizarGraus(
    125.0445479 -
      1934.1362891 * t +
      0.0020754 * t * t +
      (t * t * t) / 467441 -
      (t * t * t * t) / 60616000
  );
}

/** Longitude sideral (Lahiri) de um graha. */
export function longitudeSideral(graha: Graha, instante: Date) {
  const ayanamsha = ayanamshaLahiri(instante);
  if (graha === 'rahu') {
    return normalizarGraus(longitudeDoNodoMedio(instante) - ayanamsha);
  }
  if (graha === 'ketu') {
    return normalizarGraus(longitudeDoNodoMedio(instante) + 180 - ayanamsha);
  }
  return normalizarGraus(longitudeTropical(graha, instante) - ayanamsha);
}

/**
 * Ascendente (Lagna) sideral: ponto da eclíptica que nasce no horizonte leste
 * do local. RAMC = tempo sideral aparente de Greenwich + longitude.
 */
export function ascendenteSideral(
  instante: Date,
  latitude: number,
  longitude: number
) {
  const tempo = MakeTime(instante);
  const ramc = normalizarGraus(SiderealTime(tempo) * 15 + longitude);
  const obliquidade = (e_tilt(tempo).tobl * Math.PI) / 180;
  const r = (ramc * Math.PI) / 180;
  const fi = (latitude * Math.PI) / 180;
  const tropical = normalizarGraus(
    (Math.atan2(
      Math.cos(r),
      -(
        Math.sin(r) * Math.cos(obliquidade) +
        Math.tan(fi) * Math.sin(obliquidade)
      )
    ) *
      180) /
      Math.PI
  );
  return normalizarGraus(tropical - ayanamshaLahiri(instante));
}

export interface Posicao {
  longitude: number;
  /** Índice do signo (0 = Áries). */
  signo: number;
  nomeDoSigno: string;
  rashi: string;
  grauNoSigno: number;
  /** Índice do nakshatra (0 = Ashwini). */
  nakshatra: number;
  nomeDoNakshatra: string;
  /** Pada (quarto) do nakshatra, de 1 a 4. */
  pada: number;
}

export function posicao(longitude: number): Posicao {
  const normalizada = normalizarGraus(longitude);
  const signo = Math.floor(normalizada / 30);
  const nakshatra = Math.floor(normalizada / EXTENSAO_DO_NAKSHATRA);
  const dentroDoNakshatra = normalizada - nakshatra * EXTENSAO_DO_NAKSHATRA;
  return {
    longitude: normalizada,
    signo,
    nomeDoSigno: SIGNOS[signo],
    rashi: RASHIS[signo],
    grauNoSigno: normalizada - signo * 30,
    nakshatra,
    nomeDoNakshatra: NAKSHATRAS[nakshatra],
    pada: Math.floor(dentroDoNakshatra / (EXTENSAO_DO_NAKSHATRA / 4)) + 1,
  };
}

/** "12°34'" a partir de graus decimais. */
export function grausEMinutos(graus: number) {
  const inteiros = Math.floor(graus);
  let minutos = Math.round((graus - inteiros) * 60);
  let g = inteiros;
  if (minutos === 60) {
    g += 1;
    minutos = 0;
  }
  return `${g}°${String(minutos).padStart(2, '0')}'`;
}
