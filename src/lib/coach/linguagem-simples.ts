import { TITHIS, YOGAS } from '@/lib/astrology/panchang';
import { NAKSHATRAS } from '@/lib/astrology/sideral';

import type { NaturezaDoNakshatra } from './conhecimento';
import type { Elemento } from './leitura-conhecimento';

/**
 * Linguagem simples do coach (tarefa 49): o que cada fato do mapa védico
 * significa para a vida da pessoa, sem termos técnicos nem nomes em
 * sânscrito. Os cálculos continuam os mesmos (Panchang, Tara Bala, Chandra
 * Bala, trânsitos e Vimshottari); muda só a forma de contar. Os nomes
 * tradicionais aparecem apenas no quadro "Nomes tradicionais", recolhido.
 */

// ------------------------------------------------------------ janelas do dia

/** Nome simples de cada Choghadiya (trecho de cerca de 1 h 30 do dia). */
export const NOME_DO_CHOGHADIYA: Record<string, string> = {
  Amrit: 'Ótimo para começar',
  Shubh: 'Bom para decidir',
  Labh: 'Bom para trabalho e estudo',
  Char: 'Bom para se mover',
  Udveg: 'Trecho agitado',
  Rog: 'Trecho de desgaste',
  Kaal: 'Trecho pesado',
};

/** Nome simples das janelas fixas do Panchang. */
export const NOME_DA_JANELA = {
  brahma_muhurta: 'Hora do silêncio',
  abhijit: 'Horário mais forte do dia',
  rahu_kalam: 'Pausa para começos',
  yamaganda: 'Horário de desgaste',
  gulika: 'Horário de repetição',
  troca_de_nakshatra: 'A Lua muda de clima',
} as const;

// -------------------------------------------------------------- a Lua do dia

/** Clima de cada natureza de nakshatra, em palavras do dia a dia. */
export const CLIMA_DA_NATUREZA: Record<
  NaturezaDoNakshatra,
  { clima: string; curto: string }
> = {
  dhruva: { clima: 'firme', curto: 'construir bases e rotinas' },
  chara: { clima: 'de movimento', curto: 'se mover e mudar de ares' },
  ugra: { clima: 'intenso', curto: 'encarar o que é difícil' },
  mishra: { clima: 'misto', curto: 'rotina e tarefas práticas' },
  kshipra: { clima: 'ágil', curto: 'aprender e resolver coisas rápidas' },
  mridu: { clima: 'suave', curto: 'autocuidado, arte e amizades' },
  tikshna: {
    clima: 'de limpeza e corte',
    curto: 'organizar e cortar excessos',
  },
};

/**
 * A Lua do dia contada a partir da Lua de nascimento: o tema curto (para a
 * manchete) de cada uma das 12 áreas do mapa.
 */
export const TEMA_DA_AREA: readonly string[] = [
  'cuidar de você',
  'cuidar da fala e do dinheiro',
  'resolver pendências com coragem',
  'cuidar da casa e da família',
  'criar, sem se cobrar demais',
  'vencer obstáculos e cuidar da saúde',
  'parcerias e acordos',
  'prudência',
  'estudar e refletir',
  'dar visibilidade ao seu trabalho',
  'colher resultados e encontrar amigos',
  'descansar e se recolher',
];

const PARES_QUE_COMBINAM: ReadonlyArray<[Elemento, Elemento]> = [
  ['fogo', 'ar'],
  ['terra', 'agua'],
];

/** Como a Lua de hoje conversa com o jeito de sentir da Lua de nascimento. */
export function sintoniaDosElementos(natal: Elemento, hoje: Elemento) {
  if (natal === hoje) {
    return 'está em sintonia com o seu jeito de sentir';
  }
  const combinam = PARES_QUE_COMBINAM.some(
    ([a, b]) => (a === natal && b === hoje) || (a === hoje && b === natal)
  );
  return combinam
    ? 'combina com o seu jeito de sentir'
    : 'pede um pouco mais de paciência com as próprias emoções';
}

// -------------------------------------------------------------- o corpo

/** Tendência do corpo (dosha do Ayurveda) em palavras simples. */
export const DOSHA_SIMPLES: Record<'vata' | 'pitta' | 'kapha', string> = {
  vata: 'leveza e agitação',
  pitta: 'calor e intensidade',
  kapha: 'peso e calma',
};

// -------------------------------------------------------------- datas

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** "março de 2027" (UTC: as fases da vida mudam em escala de meses). */
export function mesEAno(instante: Date) {
  return `${MESES[instante.getUTCMonth()]} de ${instante.getUTCFullYear()}`;
}

/** "6º dia da Lua crescente" a partir do índice do tithi (0 a 29). */
export function diaDaLua(indiceDoTithi: number) {
  const numero = (indiceDoTithi % 15) + 1;
  const crescente = indiceDoTithi < 15;
  if (numero === 15) return crescente ? 'Lua cheia' : 'Lua nova';
  return `${numero}º dia da Lua ${crescente ? 'crescente' : 'minguante'}`;
}

// ------------------------------------------------------- termos técnicos

/**
 * Termos técnicos e nomes em sânscrito que não podem aparecer nos textos do
 * coach (leitura, manchete, períodos, dicas). "Yoga" fica de fora porque a
 * prática de yoga é palavra do dia a dia; os nomes dos 27 yogas do Panchang
 * entram na lista.
 */
const TERMOS_TECNICOS = [
  'nakshatra',
  'tithi',
  'paksha',
  'tara',
  'dasha',
  'mahadasha',
  'antardasha',
  'muhurta',
  'rahu',
  'ketu',
  'kalam',
  'yamaganda',
  'gulika',
  'choghadiya',
  'chandrashtama',
  'karana',
  'vishti',
  'rikta',
  'ekadashi',
  'lagna',
  'kalapurusha',
  'agni',
  'bhakti',
  'svadhyaya',
  'seva',
  'japa',
  'sandhya',
  'pranayama',
  'shitali',
  'kapalabhati',
  'nadi shodhana',
  'gochara',
  'sade sati',
  'ashtama',
  'shani',
  'panchang',
  'jyotish',
  'vata',
  'pitta',
  'kapha',
  'dosha',
  'abhijit',
  'amrit',
  'shubh',
  'labh',
  'udveg',
  'kaal',
  'janma',
  'sampat',
  'vipat',
  'kshema',
  'pratyari',
  'sadhana',
  'naidhana',
  'parama mitra',
  'shukla',
  'krishna paksha',
  'purnima',
  'amavasya',
  'kimstughna',
  'shakuni',
  'chatushpada',
  'tikshna',
  'mridu',
  'kshipra',
  'dhruva',
  'chara',
  'ugra',
  'mishra',
  'ravivara',
  'somavara',
  'mangalavara',
  'budhavara',
  'guruvara',
  'shukravara',
  'shanivara',
  ...NAKSHATRAS.map((n) => n.toLowerCase()),
  ...TITHIS.map((t) => t.toLowerCase()),
  ...YOGAS.map((y) => y.toLowerCase()),
];

function escapar(termo: string) {
  return termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Fronteira de palavra que entende acentos (o \b do JavaScript não entende).
const PADRAO_DOS_TERMOS = new RegExp(
  `(?<![\\p{L}\\p{N}])(?:${[...new Set(TERMOS_TECNICOS)]
    .sort((a, b) => b.length - a.length)
    .map(escapar)
    .join('|')})(?![\\p{L}\\p{N}])|\\d+ª casa`,
  'iu'
);

/** Primeiro termo técnico encontrado no texto (ou null). */
export function termoTecnicoEm(texto: string): string | null {
  return texto.match(PADRAO_DOS_TERMOS)?.[0] ?? null;
}
