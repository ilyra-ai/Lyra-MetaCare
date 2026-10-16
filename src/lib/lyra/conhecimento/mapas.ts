import type { Graha } from '@/lib/astrology/sideral';

import type { Elemento } from './jyotish';
import type { Verbete } from './tipos';

/**
 * Os três tipos de mapa que a Lyra lê, separados de forma explícita (tarefa
 * 55, pedido do usuário). Fontes: os documentos do usuário "Mapa Lyra DM
 * Samādhi" (66 páginas), "LIVRO MAPA LYRA DM SAMADHI" (37 páginas) e
 * "Mapa Quantum (Lyra e Arkático)" (6 páginas, versão 1.0 de 24/09/2025).
 *
 * Regra de verdade herdada dos próprios documentos: o que é calculável é
 * calculado; o que é simbólico é dito como simbólico; o que falta é dito como
 * "indisponível", sem inferência ("Quando faltar dado, marcar explicitamente
 * como indisponível; não inferir", Mapa Quantum §2.3).
 */

export type TipoDeMapa = 'vedico' | 'samadhi' | 'quantum';

export interface DefinicaoDoMapa {
  tipo: TipoDeMapa;
  nome: string;
  /** Uma frase: o que é. */
  definicao: string;
  finalidade: string;
  entradas: string;
  /** O que a Lyra calcula de verdade neste mapa. */
  calculavel: string[];
  /** O que é simbólico ou depende de percepção, e por isso não é inventado. */
  simbolico: string[];
  diferenca: string;
  fonte: string;
}

export const TIPOS_DE_MAPA: Record<TipoDeMapa, DefinicaoDoMapa> = {
  vedico: {
    tipo: 'vedico',
    nome: 'Mapa védico tradicional (Jyotish)',
    definicao:
      'O mapa natal da astrologia védica: o céu sideral do momento do nascimento, com o Lagna, os nove grahas nas doze casas, os 27 nakshatras e os períodos de vida (dashas).',
    finalidade:
      'Mostrar tendências de temperamento, de propósito (dharma) e de fases da vida (karma em curso), como base para escolhas conscientes.',
    entradas: 'data, hora e cidade de nascimento',
    calculavel: [
      'posições siderais dos grahas (ayanamsha Lahiri) e o Lagna',
      'signos, casas por signo inteiro, nakshatras e padas',
      'dignidades (exaltação, debilitação, signo próprio)',
      'Vimshottari Dasha (Mahadasha e Antardasha)',
      'tendência de dosha pelo signo do Lagna e da Lua (BPHS)',
    ],
    simbolico: [],
    diferenca:
      'É a base técnica: cada leitura parte de cálculo astronômico. É uma das camadas do Mapa Lyra DM Samādhi.',
    fonte: 'Brihat Parashara Hora Shastra e Vedanga Jyotisha',
  },
  samadhi: {
    tipo: 'samadhi',
    nome: 'Mapa Lyra DM Samādhi',
    definicao:
      '"Um diagrama multidimensional da essência e do destino": une a astrologia védica a outras sabedorias (xamanismo, alquimia, civilizações estelares, chakras) em três planos, do terrestre ao celestial, até o ponto de síntese, Samādhi.',
    finalidade:
      '"Servir como ferramenta de despertar e unificação": integrar corpo, mente e espírito; passado, presente e futuro; ciência e mística; Terra e cosmos.',
    entradas:
      'dados de nascimento (para a camada védica) e a percepção da própria pessoa (para os planos simbólicos)',
    calculavel: [
      'a camada de análise védica (o mapa natal)',
      'o elemento dominante do mapa e, por ele, a direção, o totem e o processo alquímico da Roda de Cura',
      'os metais dos planetas e as correspondências fixas descritas no método',
      'a ponte Mūla e o núcleo galáctico (único nakshatra com afinidade estelar definida no método)',
    ],
    simbolico: [
      'o totem pessoal, os guias e os arquétipos que "aparecem" na leitura',
      'o estágio alquímico atual (lido pelas imagens e cores que a pessoa reconhece)',
      'a afinidade com civilizações estelares, fora dos exemplos do método',
      'o Mapa dos Antepassados (depende da história da família)',
      'a camada quântica (usada como metáfora no método)',
    ],
    diferenca:
      'O mapa védico é uma camada dele. O Samādhi é multidimensional, cruza tradições e procura temas que se repetem entre camadas ("nenhum símbolo isolado se interpreta sozinho"); é evolutivo, pede revisões periódicas e lê de 3 a 5 percepções por vez.',
    fonte:
      'Documentos do usuário "Mapa Lyra DM Samādhi" e "LIVRO MAPA LYRA DM SAMADHI"',
  },
  quantum: {
    tipo: 'quantum',
    nome: 'Mapa Quantum (Lyra e Arkático)',
    definicao:
      '"Um protocolo técnico-operacional" que funde o Desenho Humano (HD), o Mapa Lyra DM Samādhi e o Mapa Arkático para transformar leituras em decisões práticas com métricas simples de coerência.',
    finalidade:
      'Escolher a próxima ação possível (ciclos de 5 a 15 minutos), reduzindo ruído mental e pressão interna, com registro e iteração.',
    entradas:
      'dados de nascimento, energia física e mental (0 a 10), pressão externa (0 a 10), tempo disponível (minutos) e o objetivo do ciclo (até 140 caracteres)',
    calculavel: [
      'o Score de Ação (SA), pela fórmula do §3.4',
      'os moduladores de corpo, pressão e tempo',
      'as métricas de coerência (taxa de micro-entregas, média de sensação, tempo por ciclo, desvio de escopo)',
    ],
    simbolico: [
      'a camada HD (o cálculo do mapa de Desenho Humano não existe na Lyra: fica indisponível)',
      'os módulos simbólicos Lyra/Arkático, usados como campos para gerar exercícios de atenção',
      'a resposta sacral (sensação do corpo), que só a pessoa pode sentir',
    ],
    diferenca:
      'É a evolução do Samādhi para a prática: em vez de uma leitura ampla, entrega uma ação de 5 a 15 minutos com Score de Ação, critério de parada e registro.',
    fonte: 'Documento do usuário "Mapa Quantum (Lyra e Arkático)", v1.0',
  },
};

/** Roda de Cura do Plano Terrestre (Mapa Lyra DM Samādhi, cap. 3 e 5). */
export const RODA_DE_CURA: Record<
  Elemento,
  { direcao: string; totem: string; processo: string; sentido: string }
> = {
  ar: {
    direcao: 'Leste',
    totem: 'Águia',
    processo: 'Sublimação',
    sentido: 'elevar e refinar: visão, clareza e novos começos',
  },
  fogo: {
    direcao: 'Sul',
    totem: 'Coiote ou Jaguar',
    processo: 'Calcinação',
    sentido: 'queimar impurezas e impulsionar a vontade',
  },
  agua: {
    direcao: 'Oeste',
    totem: 'Urso',
    processo: 'Dissolução',
    sentido:
      'soltar e sentir: introspecção e cura emocional (solve et coagula)',
  },
  terra: {
    direcao: 'Norte',
    totem: 'Búfalo',
    processo: 'Solidificação',
    sentido: 'estabilizar e sustentar: sabedoria prática e abundância',
  },
};

/** Estágios alquímicos (Plano Sutil), na ordem do método. */
export const ESTAGIOS_ALQUIMICOS = [
  {
    nome: 'Nigredo',
    cor: 'preto',
    sentido: 'morte do velho eu, encontro com a sombra',
  },
  {
    nome: 'Albedo',
    cor: 'branco',
    sentido: 'purificação, limpeza de mágoas e clareza interior',
  },
  { nome: 'Citrinitas', cor: 'amarelo', sentido: 'despertar' },
  {
    nome: 'Rubedo',
    cor: 'vermelho',
    sentido: 'iluminação, realização e serviço',
  },
] as const;

/**
 * Chakra associado a cada um dos 7 planetas clássicos. O método Samādhi
 * alinha "7 chakras com os 7 planetas sagrados védicos" e cita Vênus no
 * cardíaco e Mercúrio no laríngeo, sem dar a tabela completa; a Lyra adota a
 * correspondência tântrica que mantém esses dois pontos (Harish Johari,
 * "Tools for Tantra"), e diz isso quando a usa.
 */
export const CHAKRA_DO_GRAHA: Partial<Record<Graha, string>> = {
  saturno: 'Muladhara (raiz): segurança e chão',
  jupiter: 'Svadhisthana (sacral): criatividade e prazer',
  marte: 'Manipura (plexo solar): vontade e ação',
  venus: 'Anahata (cardíaco): amor e compaixão',
  mercurio: 'Vishuddha (laríngeo): expressão e verdade',
  lua: 'Ajna (terceiro olho), lado lunar: intuição',
  sol: 'Ajna (terceiro olho), lado solar: clareza e propósito',
};

/** Sentido dos três planos do Mapa Lyra DM Samādhi. */
export const PLANOS_DO_SAMADHI = [
  {
    nome: 'Plano Terrestre',
    dominio: 'manifestação física e ancestral',
    eu: 'eu inferior (personalidade, instintos e herança)',
    mapas: 'Mapa Xamânico (Roda de Cura) e Mapa dos Antepassados',
  },
  {
    nome: 'Plano Sutil',
    dominio: 'psique e energia',
    eu: 'eu médio ou psicológico',
    mapas: 'Mapa Alquímico e Mapa Astrológico (védico)',
  },
  {
    nome: 'Plano Celestial',
    dominio: 'consciência cósmica e espiritual',
    eu: 'eu superior, a centelha divina',
    mapas: 'Mapa Estelar e Mapa Arquetípico Divino',
  },
] as const;

/** Linhagens estelares e o papel de cada uma no método Samādhi. */
export const LINHAGENS_ESTELARES = [
  {
    nome: 'Lyra',
    papel:
      'origem: "a matriz cósmica de onde viemos"; coragem e criatividade ancestrais',
  },
  { nome: 'Plêiades', papel: 'amor fraterno e cura pelo coração' },
  {
    nome: 'Sírius',
    papel: 'mestre espiritual e amor devocional (Ísis, Thoth)',
  },
  { nome: 'Órion', papel: 'o guerreiro: lições de dualidade e equilíbrio' },
  { nome: 'Arcturus', papel: 'cura espiritual (o curador)' },
  { nome: 'Andrômeda', papel: 'visão de futuro e consciência expandida' },
] as const;

/**
 * Score de Ação do Mapa Quantum (§3.4 e §9.2):
 * SA = clamp(0, 100, 100 × (HD×0,5 + LA×0,5) × (0,4×corpo + 0,3×pressão + 0,3×tempo)),
 * com corpo = min(1, energia/8), pressão = 1 − min(1, pressão/10) e
 * tempo = min(1, minutos/30). HD e LA são aderências de 0 a 1 da ação aos
 * temas do Desenho Humano e ao módulo simbólico escolhido.
 */
export function scoreDeAcao(entrada: {
  aderenciaHd: number;
  aderenciaLyra: number;
  energia: number;
  pressao: number;
  minutos: number;
}): number {
  const limitar = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));
  const corpo = Math.min(1, limitar(entrada.energia, 0, 10) / 8);
  const pressao = 1 - Math.min(1, limitar(entrada.pressao, 0, 10) / 10);
  const tempo = Math.min(1, Math.max(0, entrada.minutos) / 30);
  const fusao =
    limitar(entrada.aderenciaHd, 0, 1) * 0.5 +
    limitar(entrada.aderenciaLyra, 0, 1) * 0.5;
  const moduladores = 0.4 * corpo + 0.3 * pressao + 0.3 * tempo;
  return Math.round(limitar(100 * fusao * moduladores, 0, 100));
}

/** Ação só é executada com SA de 60 ou mais (regra prática do §3.4). */
export const SA_MINIMO = 60;

export const VERBETES_DOS_MAPAS: readonly Verbete[] = [
  {
    id: 'tipos-de-mapa',
    area: 'mapa',
    titulo: 'Os três mapas da Lyra',
    resumo:
      'A Lyra lê três mapas diferentes: o mapa védico tradicional (Jyotish), o Mapa Lyra DM Samādhi e o Mapa Quantum, cada um com o seu método e o seu limite.',
    pontos: [
      `${TIPOS_DE_MAPA.vedico.nome}: ${TIPOS_DE_MAPA.vedico.definicao}`,
      `${TIPOS_DE_MAPA.samadhi.nome}: ${TIPOS_DE_MAPA.samadhi.diferenca}`,
      `${TIPOS_DE_MAPA.quantum.nome}: ${TIPOS_DE_MAPA.quantum.diferenca}`,
      'O que é calculado é dito como calculado; o que é simbólico, como simbólico; e o que falta, como indisponível.',
    ],
    pratica:
      'Use o mapa védico para entender tendências, o Samādhi para integrar o sentido e o Quantum para escolher a próxima ação.',
    palavrasChave: [
      'tipos de mapa',
      'diferenca entre os mapas',
      'diferenca entre mapa',
      'quais mapas',
      'tres mapas',
    ],
    fonte: 'Documentos do usuário e Brihat Parashara Hora Shastra',
  },
  {
    id: 'mapa-samadhi',
    area: 'mapa',
    titulo: 'Mapa Lyra DM Samādhi',
    resumo: TIPOS_DE_MAPA.samadhi.definicao,
    pontos: [
      'Nome: Lyra é a origem estelar, "a matriz cósmica de onde viemos"; DM é a Matriz Divina (Divine Matrix); Samādhi é "o estado divino para onde retornamos".',
      'Três pilares: base matemática (estrutura), base energética (dinâmica) e base espiritual (propósito).',
      'Quatro camadas de análise: védica, conhecimento ancestral, conhecimento quântico e integração (Samādhi), o "clique" final.',
      'Três planos: Terrestre (raízes), Sutil (psique e energia) e Celestial (consciência cósmica).',
      'Camadas concêntricas: o centro (Fonte, Samādhi), a mandala de integração (chakras, planetas e signos) e o limite cósmico (constelações).',
      'Leitura em cinco passos: Plano Terrestre, Plano Sutil, Plano Celestial, síntese e ação; de 3 a 5 percepções por vez.',
    ],
    pratica:
      'Leia de fora para dentro: raízes, psique e espírito; depois escreva uma frase que una os três e escolha uma ação concreta.',
    palavrasChave: [
      'samadhi',
      'lyra dm',
      'mapa lyra',
      'mapa samadhi',
      'lyra dm samadhi',
      'matriz divina',
      'planos de consciencia',
      'plano terrestre',
      'plano sutil',
      'plano celestial',
    ],
    fonte:
      'Documentos do usuário "Mapa Lyra DM Samādhi" e "LIVRO MAPA LYRA DM SAMADHI"',
  },
  {
    id: 'mapa-quantum',
    area: 'mapa',
    titulo: 'Mapa Quantum (Lyra e Arkático)',
    resumo: TIPOS_DE_MAPA.quantum.definicao,
    pontos: [
      'Três camadas: Desenho Humano (mecânica energética, autoridade e ritmo), Lyra DM Samādhi (leitura simbólica) e Arkático (narrativas, dons e sombras).',
      'Score de Ação: SA = 100 × (HD×0,5 + LA×0,5) × (0,4×corpo + 0,3×pressão + 0,3×tempo); só se executa com SA de 60 ou mais, reduzindo o escopo até chegar lá.',
      'Procedimento: objetivo do ciclo, autoavaliação (energia, pressão, tempo), três ações candidatas, resposta do corpo, cálculo do SA, micro-passo de 5 a 15 minutos com critério de parada e registro.',
      'Tripé de entrega: corpo (postura, respiração, água, pausa), mente (foco único, lista curta) e espírito (intenção, gratidão, 60 s de silêncio).',
      'Modo crise: ciclos de 5 minutos, corpo primeiro, uma frente por vez até a sensação chegar a 5.',
      'Regra de ouro: "a sensação corporal honesta prevalece sobre a ambição mental".',
    ],
    pratica:
      'Escolha uma ação de 5 a 15 minutos, defina quando ela está "suficiente", faça e anote como se sentiu de 0 a 10.',
    palavrasChave: [
      'mapa quantum',
      'quantum',
      'arkatico',
      'mapa arkatico',
      'desenho humano',
      'human design',
      'score de acao',
      'micro passo',
      'ciclo 5 15',
    ],
    fonte: 'Documento do usuário "Mapa Quantum (Lyra e Arkático)", v1.0',
  },
];
