import type { Graha } from '@/lib/astrology/sideral';

/**
 * Correspondências tradicionais do Jyotish e do Ayurveda usadas na leitura
 * védica do dia: o corpo do Kalapurusha por signo, o tom emocional da Lua em
 * cada signo, a natureza de cada graha e a prática espiritual da sua hora, o
 * relógio dos doshas e os trânsitos contados a partir da Lua natal (Gochara).
 * Linguagem de bem-estar e autoconhecimento: não substitui avaliação
 * profissional de saúde.
 */

export type Elemento = 'fogo' | 'terra' | 'ar' | 'agua';

export const SIGNO_INFO: ReadonlyArray<{
  elemento: Elemento;
  /** Região do corpo do Kalapurusha regida pelo signo (com artigo). */
  corpo: string;
  /** Tom emocional da Lua neste signo. */
  emocao: string;
}> = [
  {
    elemento: 'fogo',
    corpo: 'a cabeça e o rosto',
    emocao: 'impulso e entusiasmo, com pouca paciência',
  },
  {
    elemento: 'terra',
    corpo: 'a garganta, o pescoço e a voz',
    emocao: 'estabilidade, conforto e prazer sereno',
  },
  {
    elemento: 'ar',
    corpo: 'os ombros, os braços e os pulmões',
    emocao: 'curiosidade, mente inquieta e vontade de conversar',
  },
  {
    elemento: 'agua',
    corpo: 'o peito e o estômago',
    emocao: 'sensibilidade, cuidado e memória afetiva',
  },
  {
    elemento: 'fogo',
    corpo: 'o coração e a coluna',
    emocao: 'generosidade e desejo de reconhecimento',
  },
  {
    elemento: 'terra',
    corpo: 'os intestinos e a digestão',
    emocao: 'senso de ordem, análise e uma ponta de autocrítica',
  },
  {
    elemento: 'ar',
    corpo: 'os rins e a região lombar',
    emocao: 'busca de harmonia, sociabilidade e alguma indecisão',
  },
  {
    elemento: 'agua',
    corpo: 'os órgãos de eliminação e a região pélvica',
    emocao: 'intensidade, profundidade e desconfiança à flor da pele',
  },
  {
    elemento: 'fogo',
    corpo: 'os quadris e as coxas',
    emocao: 'otimismo, franqueza e busca de sentido',
  },
  {
    elemento: 'terra',
    corpo: 'os joelhos, os ossos e as articulações',
    emocao: 'seriedade, contenção e foco no dever',
  },
  {
    elemento: 'ar',
    corpo: 'as panturrilhas, os tornozelos e a circulação',
    emocao: 'independência, distanciamento e ideias para o coletivo',
  },
  {
    elemento: 'agua',
    corpo: 'os pés e o sistema linfático',
    emocao: 'empatia, imaginação e emoções porosas',
  },
];

export const ELEMENTO_INFO: Record<Elemento, { nome: string; corpo: string }> =
  {
    fogo: {
      nome: 'fogo',
      corpo: 'calor e energia em alta pedem hidratação e esforço sem exageros',
    },
    terra: {
      nome: 'terra',
      corpo:
        'o corpo fica mais firme e estável, bom para força, postura e rotina bem feita',
    },
    ar: {
      nome: 'ar',
      corpo:
        'o corpo fica mais leve e disperso; alongue, respire fundo e não pule refeições',
    },
    agua: {
      nome: 'água',
      corpo:
        'o corpo fica mais fluido e receptivo; hidratação, descanso e movimento suave',
    },
  };

export const GRAHA_INFO: Record<
  Graha,
  {
    nome: string;
    /** Nome com a preposição ("do Sol", "da Lua", "de Marte"). */
    de: string;
    natureza: 'benefico' | 'malefico';
    tema: string;
    corpo: string;
    pratica: string;
    mantra: string;
    cor: string;
  }
> = {
  sol: {
    nome: 'Sol',
    de: 'do Sol',
    natureza: 'malefico',
    tema: 'propósito, vitalidade e liderança',
    corpo: 'coração, olhos e vitalidade',
    pratica: 'saudação ao sol e um momento de gratidão pela própria luz',
    mantra: 'Om Suryaya Namah',
    cor: 'laranja e dourado',
  },
  lua: {
    nome: 'Lua',
    de: 'da Lua',
    natureza: 'benefico',
    tema: 'emoções, acolhimento e memória',
    corpo: 'fluidos, sono e estômago',
    pratica: 'silêncio, contemplação e cuidado com quem você ama',
    mantra: 'Om Chandraya Namah',
    cor: 'branco e prata',
  },
  marte: {
    nome: 'Marte',
    de: 'de Marte',
    natureza: 'malefico',
    tema: 'coragem, ação e decisão',
    corpo: 'músculos, sangue e energia física',
    pratica: 'disciplina consciente, com uma prática de força ou de foco total',
    mantra: 'Om Mangalaya Namah',
    cor: 'vermelho',
  },
  mercurio: {
    nome: 'Mercúrio',
    de: 'de Mercúrio',
    natureza: 'benefico',
    tema: 'intelecto, comunicação e aprendizado',
    corpo: 'sistema nervoso, pele e respiração',
    pratica:
      'a leitura de um texto inspirador e a repetição de uma frase que te fortaleça',
    mantra: 'Om Budhaya Namah',
    cor: 'verde',
  },
  jupiter: {
    nome: 'Júpiter',
    de: 'de Júpiter',
    natureza: 'benefico',
    tema: 'sabedoria, fé e expansão',
    corpo: 'fígado, gorduras e crescimento',
    pratica: 'estudo, ensino e gratidão aos seus mestres',
    mantra: 'Om Gurave Namah',
    cor: 'amarelo',
  },
  venus: {
    nome: 'Vênus',
    de: 'de Vênus',
    natureza: 'benefico',
    tema: 'harmonia, afeto e beleza',
    corpo: 'rins, pele e sistema reprodutivo',
    pratica: 'música, gratidão e um gesto de beleza',
    mantra: 'Om Shukraya Namah',
    cor: 'branco e rosa-claro',
  },
  saturno: {
    nome: 'Saturno',
    de: 'de Saturno',
    natureza: 'malefico',
    tema: 'disciplina, paciência e responsabilidade',
    corpo: 'ossos, articulações e resistência',
    pratica: 'ajudar alguém sem esperar retorno, silêncio e desapego',
    mantra: 'Om Shanaishcharaya Namah',
    cor: 'azul-escuro',
  },
  rahu: {
    nome: 'Rahu',
    de: 'de Rahu',
    natureza: 'malefico',
    tema: 'ambição, novidade e inquietação',
    corpo: 'sistema nervoso e ansiedade',
    pratica: 'discernimento: respirar antes de reagir e reduzir estímulos',
    mantra: 'Om Rahave Namah',
    cor: 'cinza-azulado',
  },
  ketu: {
    nome: 'Ketu',
    de: 'de Ketu',
    natureza: 'malefico',
    tema: 'desapego, intuição e interiorização',
    corpo: 'sistema nervoso e imunidade',
    pratica: 'meditação silenciosa e introspecção',
    mantra: 'Om Ketave Namah',
    cor: 'tons terrosos',
  },
};

/** Graha pelo nome exibido ("Lua", "Júpiter"). */
export function grahaPorNome(nome: string) {
  return Object.values(GRAHA_INFO).find((g) => g.nome === nome) ?? null;
}

/** Dia da semana por extenso (domingo = 0). */
export const DIA_DA_SEMANA: readonly string[] = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

/** Dosha predominante pelo relógio do Ayurveda (hora local). */
export function doshaDoRelogio(hora: number): {
  dosha: 'vata' | 'pitta' | 'kapha';
  faixa: string;
  sentido: string;
} {
  if (hora >= 2 && hora < 6) {
    return {
      dosha: 'vata',
      faixa: '2 h–6 h',
      sentido:
        'a mente fica leve e sutil, a melhor hora para acordar e meditar',
    };
  }
  if (hora >= 6 && hora < 10) {
    return {
      dosha: 'kapha',
      faixa: '6 h–10 h',
      sentido: 'o corpo tende a pesar se ficar parado, e o movimento desperta',
    };
  }
  if (hora >= 10 && hora < 14) {
    return {
      dosha: 'pitta',
      faixa: '10 h–14 h',
      sentido:
        'a digestão e o foco estão no auge, a hora da refeição principal',
    };
  }
  if (hora >= 14 && hora < 18) {
    return {
      dosha: 'vata',
      faixa: '14 h–18 h',
      sentido:
        'a energia oscila, boa para criar e conversar; um lanche morno ajuda',
    };
  }
  if (hora >= 18 && hora < 22) {
    return {
      dosha: 'kapha',
      faixa: '18 h–22 h',
      sentido: 'o corpo desacelera e começa a se preparar para dormir',
    };
  }
  return {
    dosha: 'pitta',
    faixa: '22 h–2 h',
    sentido: 'o corpo digere e se repara durante o sono',
  };
}

/**
 * A Lua do dia contada a partir da Lua natal (Chandra Gochara), em linguagem
 * simples: a área do mapa da pessoa por onde a Lua passa e o que isso pede.
 */
export const CASA_DA_LUA: ReadonlyArray<string> = [
  'a Lua passa pelo mesmo ponto em que estava quando você nasceu, o que aumenta a sensibilidade e pede cuidado com o corpo',
  'a Lua passa pela área do seu mapa ligada à fala, à família e ao dinheiro: cuidado com o que diz e com os gastos',
  'a Lua passa pela área do seu mapa ligada à coragem e à iniciativa: bom para resolver pendências',
  'a Lua passa pela área do seu mapa ligada ao lar: as emoções se voltam para a casa, com alguma inquietação',
  'a Lua passa pela área do seu mapa ligada à criatividade: a mente fica criativa, porém agitada',
  'a Lua passa pela área do seu mapa ligada a vencer obstáculos: força para resolver problemas e cuidar da saúde',
  'a Lua passa pela área do seu mapa ligada às parcerias: bom para encontros, conversas e acordos',
  'a Lua passa pelo ponto mais sensível do seu mapa (cerca de dois dias e meio por mês): prudência, sem confrontos nem riscos',
  'a Lua passa pela área do seu mapa ligada à fé e ao estudo: bom para aprender, em ritmo tranquilo',
  'a Lua passa pela área do seu mapa ligada ao trabalho e à imagem pública: o trabalho fica em evidência',
  'a Lua passa pela área do seu mapa ligada a ganhos e amizades: bom para colher resultados e encontrar amigos',
  'a Lua passa pela área do seu mapa ligada ao descanso: pede recolhimento, bom sono e atenção aos gastos',
];

/** Júpiter contado a partir da Lua natal (casas favoráveis: 2, 5, 7, 9, 11). */
export function transitoDeJupiter(casa: number) {
  const favoravel = [2, 5, 7, 9, 11].includes(casa);
  return {
    favoravel,
    sentido: favoravel
      ? 'Júpiter, o planeta do crescimento, está numa posição que apoia você neste ano: fase de boas oportunidades para crescer'
      : 'Júpiter, o planeta do crescimento, está numa posição mais neutra para você neste ano: o crescimento vem devagar, com paciência e estudo',
  };
}

/**
 * Saturno contado a partir da Lua natal: favorável nas casas 3, 6 e 11;
 * Sade Sati nas casas 12, 1 e 2; Ashtama Shani na 8ª. O texto conta cada
 * caso sem os nomes técnicos (tarefa 49).
 */
export function transitoDeSaturno(casa: number) {
  if ([12, 1, 2].includes(casa)) {
    return {
      favoravel: false,
      sentido:
        'Saturno, o planeta da disciplina, passa perto da sua Lua de nascimento, um ciclo de amadurecimento de cerca de sete anos e meio que pede disciplina, descanso e simplicidade',
    };
  }
  if (casa === 8) {
    return {
      favoravel: false,
      sentido:
        'Saturno, o planeta da disciplina, passa pelo ponto mais sensível do seu mapa (uma fase de cerca de dois anos e meio): cuidado redobrado com a saúde e com riscos',
    };
  }
  const favoravel = [3, 6, 11].includes(casa);
  return {
    favoravel,
    sentido: favoravel
      ? 'Saturno, o planeta da disciplina, está numa posição que recompensa o seu esforço: a constância traz resultado concreto'
      : 'Saturno, o planeta da disciplina, pede constância nas responsabilidades desta fase',
  };
}
