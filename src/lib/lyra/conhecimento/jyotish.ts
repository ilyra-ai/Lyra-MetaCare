import type { Graha } from '@/lib/astrology/sideral';

/**
 * Jyotisha (astrologia védica), conhecimento curado do motor da Lyra
 * (tarefa 55). Fontes clássicas: Brihat Parashara Hora Shastra (BPHS) para
 * significações dos grahas, casas, dignidades e doshas dos signos; Phaladeepika
 * e Saravali para as combinações por casa; Muhurta Chintamani para os
 * nakshatras (complementa src/lib/coach/conhecimento.ts). Linguagem de
 * autoconhecimento: nada aqui é diagnóstico ou previsão determinista.
 */

export type Elemento = 'fogo' | 'terra' | 'ar' | 'agua';
export type Dosha = 'vata' | 'pitta' | 'kapha';

export const NOME_DO_ELEMENTO: Record<Elemento, string> = {
  fogo: 'Fogo (Agni)',
  terra: 'Terra (Prithvi)',
  ar: 'Ar (Vayu)',
  agua: 'Água (Jala)',
};

export interface InfoDoGraha {
  /** Significações principais (karakatva, BPHS cap. 3). */
  significa: string;
  /** O que pede para florescer bem. */
  florescer: string;
  /** Sombra quando está tenso. */
  sombra: string;
  natureza: 'benefico' | 'malefico' | 'neutro';
  /** Doshas do graha (BPHS cap. 3). */
  doshas: Dosha[];
  /** Signo de exaltação (índice) e debilitação (oposto). */
  exaltacao: number | null;
  /** Metal tradicional (alquimia e Jyotish concordam nos sete clássicos). */
  metal: string | null;
  /** Dia da semana regido (Vara). */
  dia: string | null;
  /** Pedra tradicional (Navaratna). */
  gema: string;
  /** Mantra-semente (bija) tradicional. */
  mantra: string;
}

export const GRAHAS_INFO: Record<Graha, InfoDoGraha> = {
  sol: {
    significa:
      'a alma (atma), a vitalidade, o pai, a autoridade, a confiança e o propósito',
    florescer: 'liderar com generosidade e assumir o próprio brilho',
    sombra: 'orgulho, rigidez e necessidade de reconhecimento',
    natureza: 'malefico',
    doshas: ['pitta'],
    exaltacao: 0,
    metal: 'ouro',
    dia: 'domingo',
    gema: 'rubi',
    mantra: 'Om Suryaya Namah',
  },
  lua: {
    significa:
      'a mente (manas), as emoções, a mãe, o cuidado, o sono e a memória',
    florescer: 'acolher o que sente, ter ritmo e se nutrir',
    sombra: 'oscilação de humor, apego e insegurança',
    natureza: 'benefico',
    doshas: ['vata', 'kapha'],
    exaltacao: 1,
    metal: 'prata',
    dia: 'segunda-feira',
    gema: 'pérola',
    mantra: 'Om Chandraya Namah',
  },
  marte: {
    significa:
      'a coragem, a energia de ação, a disciplina física, os irmãos e a proteção',
    florescer: 'canalizar a força em metas claras e no corpo',
    sombra: 'impulsividade, raiva e pressa',
    natureza: 'malefico',
    doshas: ['pitta'],
    exaltacao: 9,
    metal: 'ferro',
    dia: 'terça-feira',
    gema: 'coral vermelho',
    mantra: 'Om Mangalaya Namah',
  },
  mercurio: {
    significa:
      'o intelecto, a fala, o aprendizado, o comércio, o humor e a adaptação',
    florescer: 'estudar, escrever e comunicar com leveza',
    sombra: 'ansiedade mental, dispersão e excesso de análise',
    natureza: 'neutro',
    doshas: ['vata', 'pitta', 'kapha'],
    exaltacao: 5,
    metal: 'mercúrio',
    dia: 'quarta-feira',
    gema: 'esmeralda',
    mantra: 'Om Budhaya Namah',
  },
  jupiter: {
    significa:
      'a sabedoria, o mestre (guru), a fé, a expansão, a fortuna e os filhos',
    florescer: 'ensinar, aprender e agir com ética',
    sombra: 'excesso, otimismo sem chão e dogmatismo',
    natureza: 'benefico',
    doshas: ['kapha'],
    exaltacao: 3,
    metal: 'estanho',
    dia: 'quinta-feira',
    gema: 'safira amarela',
    mantra: 'Om Gurave Namah',
  },
  venus: {
    significa: 'o amor, a beleza, a arte, o prazer, os acordos e a parceria',
    florescer: 'cultivar vínculos, arte e prazer com medida',
    sombra: 'acomodação, indulgência e dependência afetiva',
    natureza: 'benefico',
    doshas: ['kapha', 'vata'],
    exaltacao: 11,
    metal: 'cobre',
    dia: 'sexta-feira',
    gema: 'diamante',
    mantra: 'Om Shukraya Namah',
  },
  saturno: {
    significa:
      'o tempo, a disciplina, a responsabilidade, o serviço, a paciência e a longevidade',
    florescer: 'construir devagar, com constância e humildade',
    sombra: 'medo, peso, isolamento e rigidez',
    natureza: 'malefico',
    doshas: ['vata'],
    exaltacao: 6,
    metal: 'chumbo',
    dia: 'sábado',
    gema: 'safira azul',
    mantra: 'Om Shanaye Namah',
  },
  rahu: {
    significa:
      'o desejo, a ambição, o novo, o estrangeiro, a tecnologia e o que atrai a mente',
    florescer: 'inovar com propósito, sem se perder no excesso',
    sombra: 'obsessão, confusão e insatisfação constante',
    natureza: 'malefico',
    doshas: ['vata'],
    exaltacao: null,
    metal: null,
    dia: null,
    gema: 'granada hessonita',
    mantra: 'Om Rahave Namah',
  },
  ketu: {
    significa:
      'o desapego, a intuição, a espiritualidade, a libertação (moksha) e os talentos de outras vidas',
    florescer: 'soltar o que pesa e confiar na intuição',
    sombra: 'distanciamento, confusão de foco e perdas por desatenção',
    natureza: 'malefico',
    doshas: ['pitta'],
    exaltacao: null,
    metal: null,
    dia: null,
    gema: 'olho de gato',
    mantra: 'Om Ketave Namah',
  },
};

export interface InfoDoSigno {
  elemento: Elemento;
  modalidade: 'movel' | 'fixo' | 'duplo';
  /** Dosha do signo (BPHS cap. 4: fogo pitta, terra vata, ar misto, água kapha). */
  dosha: Dosha | 'misto';
  /** Qualidades em linguagem simples. */
  qualidades: string;
}

export const SIGNOS_INFO: readonly InfoDoSigno[] = [
  {
    elemento: 'fogo',
    modalidade: 'movel',
    dosha: 'pitta',
    qualidades: 'iniciativa, coragem, pioneirismo e franqueza',
  },
  {
    elemento: 'terra',
    modalidade: 'fixo',
    dosha: 'vata',
    qualidades: 'estabilidade, sensualidade, constância e senso de valor',
  },
  {
    elemento: 'ar',
    modalidade: 'duplo',
    dosha: 'misto',
    qualidades: 'curiosidade, comunicação, versatilidade e troca',
  },
  {
    elemento: 'agua',
    modalidade: 'movel',
    dosha: 'kapha',
    qualidades: 'cuidado, memória afetiva, proteção e intuição',
  },
  {
    elemento: 'fogo',
    modalidade: 'fixo',
    dosha: 'pitta',
    qualidades: 'brilho, generosidade, liderança e criatividade',
  },
  {
    elemento: 'terra',
    modalidade: 'duplo',
    dosha: 'vata',
    qualidades: 'discernimento, serviço, método e atenção ao detalhe',
  },
  {
    elemento: 'ar',
    modalidade: 'movel',
    dosha: 'misto',
    qualidades: 'harmonia, diplomacia, estética e parceria',
  },
  {
    elemento: 'agua',
    modalidade: 'fixo',
    dosha: 'kapha',
    qualidades: 'profundidade, intensidade, transformação e lealdade',
  },
  {
    elemento: 'fogo',
    modalidade: 'duplo',
    dosha: 'pitta',
    qualidades: 'busca de sentido, fé, estudo e liberdade',
  },
  {
    elemento: 'terra',
    modalidade: 'movel',
    dosha: 'vata',
    qualidades: 'responsabilidade, ambição, estrutura e persistência',
  },
  {
    elemento: 'ar',
    modalidade: 'fixo',
    dosha: 'misto',
    qualidades: 'visão de futuro, coletividade, originalidade e ideal',
  },
  {
    elemento: 'agua',
    modalidade: 'duplo',
    dosha: 'kapha',
    qualidades: 'compaixão, imaginação, entrega e espiritualidade',
  },
];

export interface InfoDaCasa {
  nome: string;
  /** Significações (bhava karakatva, BPHS cap. 11 a 23). */
  temas: string;
  grupos: Array<'kendra' | 'trikona' | 'dusthana' | 'upachaya'>;
}

export const CASAS_INFO: readonly InfoDaCasa[] = [
  {
    nome: 'Tanu Bhava',
    temas: 'o corpo, a vitalidade, a personalidade e o jeito de começar',
    grupos: ['kendra', 'trikona'],
  },
  {
    nome: 'Dhana Bhava',
    temas: 'a família, a fala, os recursos, os valores e a alimentação',
    grupos: [],
  },
  {
    nome: 'Sahaja Bhava',
    temas: 'a coragem, o esforço próprio, a comunicação e os irmãos',
    grupos: ['upachaya'],
  },
  {
    nome: 'Sukha Bhava',
    temas: 'o lar, a mãe, a paz interior, o conforto e as raízes',
    grupos: ['kendra'],
  },
  {
    nome: 'Putra Bhava',
    temas:
      'a criatividade, os filhos, a inteligência, os mantras e o mérito de outras vidas',
    grupos: ['trikona'],
  },
  {
    nome: 'Ripu Bhava',
    temas:
      'a rotina, o serviço, a saúde do dia a dia, os desafios e a superação',
    grupos: ['dusthana', 'upachaya'],
  },
  {
    nome: 'Kalatra Bhava',
    temas: 'as parcerias, o casamento, os acordos e o outro',
    grupos: ['kendra'],
  },
  {
    nome: 'Ayur Bhava',
    temas:
      'as transformações, a longevidade, o que é oculto, as heranças e as crises que renovam',
    grupos: ['dusthana'],
  },
  {
    nome: 'Dharma Bhava',
    temas:
      'o propósito (dharma), a fé, os mestres, a sorte e as longas viagens',
    grupos: ['trikona'],
  },
  {
    nome: 'Karma Bhava',
    temas: 'a carreira, a ação no mundo, a reputação e a responsabilidade',
    grupos: ['kendra', 'upachaya'],
  },
  {
    nome: 'Labha Bhava',
    temas: 'os ganhos, os amigos, as redes e a realização dos desejos',
    grupos: ['upachaya'],
  },
  {
    nome: 'Vyaya Bhava',
    temas:
      'o desapego, o descanso, o sono, as despesas, o recolhimento e a libertação',
    grupos: ['dusthana'],
  },
];

export const GRUPO_DAS_CASAS = {
  kendra:
    'casa angular (1, 4, 7 e 10): pilares da vida, onde um planeta age com força',
  trikona:
    'casa de trígono (1, 5 e 9): fluxo de sorte e mérito, a mais auspiciosa',
  dusthana:
    'casa desafiadora (6, 8 e 12): onde a vida pede trabalho interior e cuidado',
  upachaya:
    'casa de crescimento (3, 6, 10 e 11): o que melhora com o tempo e o esforço',
} as const;

/** Tema de cada senhor de Mahadasha (Vimshottari), para leitura do período. */
export const TEMA_DO_DASHA: Record<Graha, string> = {
  sol: 'fase de afirmar quem você é, assumir lideranças e cuidar da vitalidade',
  lua: 'fase emocional e nutritiva: lar, vínculos, cuidado e sensibilidade em evidência',
  marte: 'fase de ação, coragem e conquista: energia alta que pede direção',
  mercurio: 'fase de estudo, comunicação, negócios e aprendizados práticos',
  jupiter: 'fase de expansão, ensino, fé e crescimento guiado por valores',
  venus: 'fase de relações, arte, prazer, beleza e acordos importantes',
  saturno:
    'fase de construção paciente: responsabilidade, maturidade e colheita do esforço',
  rahu: 'fase de desejo e novidade: grandes mudanças, ambição e terrenos desconhecidos',
  ketu: 'fase de desapego e interiorização: soltar o que não serve e aprofundar a espiritualidade',
};

export interface InfoExtraDoNakshatra {
  simbolo: string;
  gana: 'deva' | 'manushya' | 'rakshasa';
  /** Palavra-chave do nakshatra. */
  tema: string;
}

/** Símbolo, gana (temperamento) e tema dos 27 nakshatras. */
export const NAKSHATRAS_EXTRA: readonly InfoExtraDoNakshatra[] = [
  {
    simbolo: 'cabeça de cavalo',
    gana: 'deva',
    tema: 'cura rápida e iniciativa',
  },
  {
    simbolo: 'yoni (útero)',
    gana: 'manushya',
    tema: 'gestar, conter e transformar',
  },
  {
    simbolo: 'chama ou lâmina',
    gana: 'rakshasa',
    tema: 'purificar e discernir',
  },
  {
    simbolo: 'carro de boi',
    gana: 'manushya',
    tema: 'crescimento, beleza e fertilidade',
  },
  {
    simbolo: 'cabeça de cervo',
    gana: 'deva',
    tema: 'busca, curiosidade e delicadeza',
  },
  {
    simbolo: 'lágrima ou diamante',
    gana: 'manushya',
    tema: 'tempestade que limpa e renova',
  },
  {
    simbolo: 'aljava de flechas',
    gana: 'deva',
    tema: 'retorno, renovação e otimismo',
  },
  {
    simbolo: 'flor ou úbere da vaca',
    gana: 'deva',
    tema: 'nutrir, proteger e prosperar',
  },
  {
    simbolo: 'serpente enrolada',
    gana: 'rakshasa',
    tema: 'sabedoria profunda e magnetismo',
  },
  {
    simbolo: 'trono real',
    gana: 'rakshasa',
    tema: 'ancestralidade, honra e tradição',
  },
  {
    simbolo: 'pés da frente de uma cama',
    gana: 'manushya',
    tema: 'descanso, prazer e criatividade',
  },
  {
    simbolo: 'pés de trás de uma cama',
    gana: 'manushya',
    tema: 'compromisso, ajuda e amizade',
  },
  { simbolo: 'mão', gana: 'deva', tema: 'habilidade manual, cura e destreza' },
  { simbolo: 'joia brilhante', gana: 'rakshasa', tema: 'criar beleza e forma' },
  {
    simbolo: 'broto movido pelo vento',
    gana: 'deva',
    tema: 'independência e flexibilidade',
  },
  {
    simbolo: 'arco triunfal',
    gana: 'rakshasa',
    tema: 'propósito, foco e conquista',
  },
  {
    simbolo: 'flor de lótus',
    gana: 'deva',
    tema: 'devoção, amizade e cooperação',
  },
  {
    simbolo: 'amuleto ou brinco',
    gana: 'rakshasa',
    tema: 'proteção, responsabilidade e maturidade',
  },
  {
    simbolo: 'raízes amarradas',
    gana: 'rakshasa',
    tema: 'ir à raiz das coisas e recomeçar',
  },
  {
    simbolo: 'leque',
    gana: 'manushya',
    tema: 'vitória, purificação e convicção',
  },
  {
    simbolo: 'presa de elefante',
    gana: 'manushya',
    tema: 'vitória duradoura e ética',
  },
  { simbolo: 'orelha', gana: 'deva', tema: 'escuta, aprendizado e conexão' },
  { simbolo: 'tambor', gana: 'rakshasa', tema: 'ritmo, música e prosperidade' },
  {
    simbolo: 'círculo vazio',
    gana: 'rakshasa',
    tema: 'cura, mistério e independência',
  },
  {
    simbolo: 'espada de dois gumes',
    gana: 'manushya',
    tema: 'intensidade e transformação idealista',
  },
  {
    simbolo: 'serpente das profundezas',
    gana: 'manushya',
    tema: 'sabedoria serena e estabilidade',
  },
  {
    simbolo: 'peixe',
    gana: 'deva',
    tema: 'compaixão, proteção e travessia segura',
  },
];

export const NOME_DO_GANA = {
  deva: 'Deva (temperamento gentil e idealista)',
  manushya: 'Manushya (temperamento humano, prático e equilibrado)',
  rakshasa: 'Rakshasa (temperamento intenso, protetor e independente)',
} as const;

/** Dignidade de um graha num signo (exaltado, debilitado, próprio). */
export function dignidadeDoGraha(
  graha: Graha,
  signo: number,
  regenteDoSigno: Graha
): 'exaltado' | 'debilitado' | 'proprio' | null {
  const exaltacao = GRAHAS_INFO[graha].exaltacao;
  if (exaltacao !== null && signo === exaltacao) return 'exaltado';
  if (exaltacao !== null && signo === (exaltacao + 6) % 12) return 'debilitado';
  if (regenteDoSigno === graha) return 'proprio';
  return null;
}

export const SENTIDO_DA_DIGNIDADE = {
  exaltado: 'em exaltação: expressa o melhor da sua natureza com facilidade',
  debilitado:
    'em debilitação: pede consciência e prática para dar o seu melhor (é um ponto de aprendizado, não de falta)',
  proprio: 'no próprio signo: age com naturalidade e autonomia',
} as const;
