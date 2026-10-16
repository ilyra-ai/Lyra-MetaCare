import { Body, Observer, SearchRiseSet } from 'astronomy-engine';

import {
  longitudeSideral,
  NAKSHATRAS,
  normalizarGraus,
  posicao,
  SIGNOS,
} from './sideral';
import { localParaUtc, partesLocais } from './tempo';

/**
 * Panchang (os cinco membros do dia védico) e os períodos do dia para um
 * local: nascer e pôr do sol, vara, tithi, nakshatra, yoga e karana, Brahma
 * Muhurta, Abhijit Muhurta, Rahu Kalam, Yamaganda, Gulika Kalam e Choghadiya
 * do dia e da noite. O dia védico vai de um nascer do sol ao seguinte.
 */

export const VARAS = [
  'Domingo (Ravivara, Sol)',
  'Segunda (Somavara, Lua)',
  'Terça (Mangalavara, Marte)',
  'Quarta (Budhavara, Mercúrio)',
  'Quinta (Guruvara, Júpiter)',
  'Sexta (Shukravara, Vênus)',
  'Sábado (Shanivara, Saturno)',
] as const;

export const TITHIS = [
  'Pratipada',
  'Dvitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dwadashi',
  'Trayodashi',
  'Chaturdashi',
];

export const YOGAS = [
  'Vishkumbha',
  'Priti',
  'Ayushman',
  'Saubhagya',
  'Shobhana',
  'Atiganda',
  'Sukarma',
  'Dhriti',
  'Shula',
  'Ganda',
  'Vriddhi',
  'Dhruva',
  'Vyaghata',
  'Harshana',
  'Vajra',
  'Siddhi',
  'Vyatipata',
  'Variyana',
  'Parigha',
  'Shiva',
  'Siddha',
  'Sadhya',
  'Shubha',
  'Shukla',
  'Brahma',
  'Indra',
  'Vaidhriti',
] as const;

/** Yogas tradicionalmente desfavoráveis para começar coisas importantes. */
const YOGAS_DESFAVORAVEIS = new Set([
  'Vishkumbha',
  'Atiganda',
  'Shula',
  'Ganda',
  'Vyaghata',
  'Vajra',
  'Vyatipata',
  'Parigha',
  'Vaidhriti',
]);

const KARANAS_MOVEIS = [
  'Bava',
  'Balava',
  'Kaulava',
  'Taitila',
  'Gara',
  'Vanija',
  'Vishti (Bhadra)',
];

export type Qualidade = 'favoravel' | 'neutro' | 'desfavoravel';

export interface Intervalo {
  inicio: Date;
  fim: Date;
}

export interface PeriodoDoChoghadiya extends Intervalo {
  nome: string;
  qualidade: Qualidade;
  significado: string;
}

export interface MembroDoPanchang {
  indice: number;
  nome: string;
  /** Quando este membro termina (pode ser depois do dia védico). */
  termina: Date;
}

export interface Panchang {
  data: string;
  nascerDoSol: Date;
  porDoSol: Date;
  proximoNascerDoSol: Date;
  vara: { indice: number; nome: string };
  tithi: MembroDoPanchang & { paksha: 'Shukla Paksha' | 'Krishna Paksha' };
  nakshatra: MembroDoPanchang;
  yoga: MembroDoPanchang & { qualidade: Qualidade };
  karana: MembroDoPanchang & { qualidade: Qualidade };
  signoDaLua: { indice: number; nome: string };
  brahmaMuhurta: Intervalo;
  abhijitMuhurta: Intervalo & { valido: boolean };
  rahuKalam: Intervalo;
  yamaganda: Intervalo;
  gulikaKalam: Intervalo;
  choghadiyaDoDia: PeriodoDoChoghadiya[];
  choghadiyaDaNoite: PeriodoDoChoghadiya[];
}

// Parte (1 a 8) do dia, do nascer ao pôr do sol, por dia da semana (domingo
// = 0). Tabelas tradicionais do Panchang.
const PARTE_DO_RAHU = [8, 2, 7, 5, 6, 4, 3];
const PARTE_DO_YAMAGANDA = [5, 4, 3, 2, 1, 7, 6];
const PARTE_DO_GULIKA = [7, 6, 5, 4, 3, 2, 1];

const CHOGHADIYAS: Record<
  string,
  { qualidade: Qualidade; significado: string }
> = {
  Amrit: {
    qualidade: 'favoravel',
    significado: 'o melhor para qualquer começo',
  },
  Shubh: {
    qualidade: 'favoravel',
    significado: 'favorável, bom para cerimônias e decisões',
  },
  Labh: {
    qualidade: 'favoravel',
    significado: 'ganho, bom para trabalho e estudo',
  },
  Char: {
    qualidade: 'neutro',
    significado: 'movimento, bom para deslocamentos',
  },
  Udveg: {
    qualidade: 'desfavoravel',
    significado: 'agitação, evite começos importantes',
  },
  Kaal: { qualidade: 'desfavoravel', significado: 'perda, só o necessário' },
  Rog: { qualidade: 'desfavoravel', significado: 'desgaste, poupe o corpo' },
};
// Sequências fixas e o primeiro período de cada dia da semana (domingo = 0).
const SEQUENCIA_DO_DIA = [
  'Udveg',
  'Char',
  'Labh',
  'Amrit',
  'Kaal',
  'Shubh',
  'Rog',
];
const SEQUENCIA_DA_NOITE = [
  'Shubh',
  'Amrit',
  'Char',
  'Rog',
  'Kaal',
  'Labh',
  'Udveg',
];
const PRIMEIRO_DO_DIA = [
  'Udveg',
  'Amrit',
  'Rog',
  'Labh',
  'Shubh',
  'Char',
  'Kaal',
];
const PRIMEIRO_DA_NOITE = [
  'Shubh',
  'Char',
  'Kaal',
  'Udveg',
  'Amrit',
  'Rog',
  'Labh',
];

function fasesDoInstante(instante: Date) {
  const sol = longitudeSideral('sol', instante);
  const lua = longitudeSideral('lua', instante);
  return {
    sol,
    lua,
    // Ângulo Lua − Sol (o ayanamsha se cancela): tithi e karana.
    elongacao: normalizarGraus(lua - sol),
    // Soma Sol + Lua: yoga.
    soma: normalizarGraus(sol + lua),
  };
}

/**
 * Próximo instante em que `angulo(t)` (crescente, módulo 360) cruza `alvo`,
 * procurado em até `limiteHoras` horas por bissecção (precisão de 1 minuto).
 */
function proximaTransicao(
  angulo: (t: Date) => number,
  alvo: number,
  inicio: Date,
  limiteHoras = 72
) {
  const distancia = (t: Date) => normalizarGraus(alvo - angulo(t));
  let a = inicio.getTime();
  const fimDaBusca = a + limiteHoras * 3_600_000;
  const passo = 3_600_000;
  let anterior = distancia(new Date(a));
  let b = a + passo;
  // Avança até a distância "dar a volta" (cruzou o alvo).
  while (b <= fimDaBusca) {
    const atual = distancia(new Date(b));
    if (atual > anterior) break;
    anterior = atual;
    a = b;
    b += passo;
  }
  while (b - a > 60_000) {
    const meio = (a + b) / 2;
    if (distancia(new Date(meio)) > distancia(new Date(a))) b = meio;
    else a = meio;
  }
  return new Date(b);
}

function parteDoDia(nascer: Date, por: Date, parte: number): Intervalo {
  const oitavo = (por.getTime() - nascer.getTime()) / 8;
  return {
    inicio: new Date(nascer.getTime() + (parte - 1) * oitavo),
    fim: new Date(nascer.getTime() + parte * oitavo),
  };
}

function choghadiya(
  inicio: Date,
  fim: Date,
  primeiro: string,
  sequencia: string[]
): PeriodoDoChoghadiya[] {
  const oitavo = (fim.getTime() - inicio.getTime()) / 8;
  const partida = sequencia.indexOf(primeiro);
  return Array.from({ length: 8 }, (_, i) => {
    const nome = sequencia[(partida + i) % 7];
    return {
      nome,
      ...CHOGHADIYAS[nome],
      inicio: new Date(inicio.getTime() + i * oitavo),
      fim: new Date(inicio.getTime() + (i + 1) * oitavo),
    };
  });
}

export class LocalSemNascerDoSolError extends Error {
  constructor() {
    super(
      'Neste local e data o Sol não nasce ou não se põe (dia ou noite polar); o Panchang não se aplica.'
    );
    this.name = 'LocalSemNascerDoSolError';
  }
}

/**
 * Panchang do dia `data` (AAAA-MM-DD, calendário local do fuso) para o local.
 */
export function calcularPanchang(local: {
  data: string;
  latitude: number;
  longitude: number;
  fuso: string;
}): Panchang {
  const observador = new Observer(local.latitude, local.longitude, 0);
  const meiaNoite = localParaUtc(local.data, '00:00', local.fuso);
  const nascer = SearchRiseSet(Body.Sun, observador, +1, meiaNoite, 1.2);
  if (!nascer) throw new LocalSemNascerDoSolError();
  const por = SearchRiseSet(Body.Sun, observador, -1, nascer.date, 1);
  if (!por) throw new LocalSemNascerDoSolError();
  const proximo = SearchRiseSet(Body.Sun, observador, +1, por.date, 1);
  if (!proximo) throw new LocalSemNascerDoSolError();

  const nascerDoSol = nascer.date;
  const porDoSol = por.date;
  const proximoNascerDoSol = proximo.date;
  const diaDaSemana = partesLocais(nascerDoSol, local.fuso).diaDaSemana;

  const fases = fasesDoInstante(nascerDoSol);

  const indiceDoTithi = Math.floor(fases.elongacao / 12);
  const fimDoTithi = proximaTransicao(
    (t) => fasesDoInstante(t).elongacao,
    (indiceDoTithi + 1) * 12,
    nascerDoSol
  );
  const crescente = indiceDoTithi < 15;
  const numeroNoPaksha = indiceDoTithi % 15;
  const nomeDoTithi =
    numeroNoPaksha === 14
      ? crescente
        ? 'Purnima'
        : 'Amavasya'
      : TITHIS[numeroNoPaksha];

  const extensaoDoNakshatra = 360 / 27;
  const indiceDoNakshatra = Math.floor(fases.lua / extensaoDoNakshatra);
  const fimDoNakshatra = proximaTransicao(
    (t) => longitudeSideral('lua', t),
    (indiceDoNakshatra + 1) * extensaoDoNakshatra,
    nascerDoSol
  );

  const indiceDoYoga = Math.floor(fases.soma / extensaoDoNakshatra);
  const fimDoYoga = proximaTransicao(
    (t) => fasesDoInstante(t).soma,
    (indiceDoYoga + 1) * extensaoDoNakshatra,
    nascerDoSol
  );

  // 60 karanas por mês lunar: o 1º é Kimstughna, do 2º ao 57º os sete móveis
  // se repetem e os três últimos são Shakuni, Chatushpada e Naga.
  const indiceDoKarana = Math.floor(fases.elongacao / 6);
  const nomeDoKarana =
    indiceDoKarana === 0
      ? 'Kimstughna'
      : indiceDoKarana >= 57
        ? ['Shakuni', 'Chatushpada', 'Naga'][indiceDoKarana - 57]
        : KARANAS_MOVEIS[(indiceDoKarana - 1) % 7];
  const fimDoKarana = proximaTransicao(
    (t) => fasesDoInstante(t).elongacao,
    (indiceDoKarana + 1) * 6,
    nascerDoSol
  );

  const duracaoDoDia = porDoSol.getTime() - nascerDoSol.getTime();
  const muhurtaDoDia = duracaoDoDia / 15;
  const duracaoDaNoiteAnterior = Math.max(
    0,
    nascerDoSol.getTime() -
      (SearchRiseSet(
        Body.Sun,
        observador,
        -1,
        new Date(nascerDoSol.getTime() - 86_400_000),
        1
      )?.date.getTime() ?? nascerDoSol.getTime() - 43_200_000)
  );
  const muhurtaDaNoite = duracaoDaNoiteAnterior / 15;

  return {
    data: local.data,
    nascerDoSol,
    porDoSol,
    proximoNascerDoSol,
    vara: { indice: diaDaSemana, nome: VARAS[diaDaSemana] },
    tithi: {
      indice: indiceDoTithi,
      nome: nomeDoTithi,
      paksha: crescente ? 'Shukla Paksha' : 'Krishna Paksha',
      termina: fimDoTithi,
    },
    nakshatra: {
      indice: indiceDoNakshatra,
      nome: NAKSHATRAS[indiceDoNakshatra],
      termina: fimDoNakshatra,
    },
    yoga: {
      indice: indiceDoYoga,
      nome: YOGAS[indiceDoYoga],
      termina: fimDoYoga,
      qualidade: YOGAS_DESFAVORAVEIS.has(YOGAS[indiceDoYoga])
        ? 'desfavoravel'
        : 'favoravel',
    },
    karana: {
      indice: indiceDoKarana,
      nome: nomeDoKarana,
      termina: fimDoKarana,
      qualidade: nomeDoKarana.startsWith('Vishti') ? 'desfavoravel' : 'neutro',
    },
    signoDaLua: {
      indice: posicao(fases.lua).signo,
      nome: SIGNOS[posicao(fases.lua).signo],
    },
    // Brahma Muhurta: os dois muhurtas (de 1/15 da noite) antes do nascer do
    // sol, o primeiro deles.
    brahmaMuhurta: {
      inicio: new Date(nascerDoSol.getTime() - 2 * muhurtaDaNoite),
      fim: new Date(nascerDoSol.getTime() - muhurtaDaNoite),
    },
    // Abhijit: o 8º dos 15 muhurtas do dia (em torno do meio-dia solar); a
    // tradição não o considera às quartas-feiras.
    abhijitMuhurta: {
      inicio: new Date(nascerDoSol.getTime() + 7 * muhurtaDoDia),
      fim: new Date(nascerDoSol.getTime() + 8 * muhurtaDoDia),
      valido: diaDaSemana !== 3,
    },
    rahuKalam: parteDoDia(nascerDoSol, porDoSol, PARTE_DO_RAHU[diaDaSemana]),
    yamaganda: parteDoDia(
      nascerDoSol,
      porDoSol,
      PARTE_DO_YAMAGANDA[diaDaSemana]
    ),
    gulikaKalam: parteDoDia(
      nascerDoSol,
      porDoSol,
      PARTE_DO_GULIKA[diaDaSemana]
    ),
    choghadiyaDoDia: choghadiya(
      nascerDoSol,
      porDoSol,
      PRIMEIRO_DO_DIA[diaDaSemana],
      SEQUENCIA_DO_DIA
    ),
    choghadiyaDaNoite: choghadiya(
      porDoSol,
      proximoNascerDoSol,
      PRIMEIRO_DA_NOITE[diaDaSemana],
      SEQUENCIA_DA_NOITE
    ),
  };
}
