import type { Verbete } from './tipos';

/**
 * Vedangas, os seis "membros" dos Vedas (tarefa 55): as disciplinas que
 * permitem preservar, entender e aplicar os Vedas. Fontes: Paniniya Shiksha,
 * Pingala Chandas Sutra, Ashtadhyayi de Panini, Nirukta de Yaska, Kalpa
 * Sutras (Shrauta, Grihya, Dharma e Shulba) e Vedanga Jyotisha de Lagadha.
 */
export const VEDANGAS: readonly Verbete[] = [
  {
    id: 'vedangas',
    area: 'vedanga',
    titulo: 'Os seis Vedangas',
    resumo:
      'Vedangas são as seis ciências de apoio aos Vedas: fonética, métrica, gramática, etimologia, ritual e astronomia do tempo.',
    pontos: [
      'Shiksha (fonética): o nariz dos Vedas.',
      'Chandas (métrica): os pés dos Vedas.',
      'Vyakarana (gramática): a boca dos Vedas.',
      'Nirukta (etimologia): os ouvidos dos Vedas.',
      'Kalpa (ritual): as mãos dos Vedas.',
      'Jyotisha (astronomia e tempo): os olhos dos Vedas.',
    ],
    pratica:
      'Cada uma ensina um cuidado: falar bem, respirar no ritmo, pensar com clareza, entender as palavras, agir com método e escolher o momento.',
    palavrasChave: ['vedanga', 'vedangas', 'membros dos vedas'],
    fonte: 'Paniniya Shiksha (a imagem do corpo dos Vedas)',
  },
  {
    id: 'shiksha',
    area: 'vedanga',
    titulo: 'Shiksha: a fonética',
    resumo:
      'Shiksha ensina a pronúncia correta das letras, a entonação e o ritmo do canto védico, porque no mantra o som carrega o sentido.',
    pontos: [
      'Cuida de seis pontos: letra (varna), entonação (svara), duração (matra), força (bala), ritmo (sama) e ligação (santana).',
      'Os três tons védicos: udatta (agudo), anudatta (grave) e svarita (deslizante).',
      'É a base para recitar mantras com atenção e clareza.',
    ],
    pratica:
      'Recite um mantra curto bem devagar, sentindo cada sílaba na boca e a vibração no peito.',
    palavrasChave: [
      'shiksha',
      'fonetica',
      'pronuncia',
      'entonacao',
      'recitacao',
    ],
    fonte: 'Paniniya Shiksha e Taittiriya Upanishad (Shiksha Valli)',
  },
  {
    id: 'chandas',
    area: 'vedanga',
    titulo: 'Chandas: a métrica',
    resumo:
      'Chandas é o estudo dos metros dos hinos védicos; o ritmo das sílabas organiza a respiração e a atenção.',
    pontos: [
      'Gayatri: 24 sílabas (3 linhas de 8), metro do Gayatri Mantra.',
      'Anushtubh: 32 sílabas (4 linhas de 8), base do shloka da Bhagavad Gita.',
      'Trishtubh: 44 sílabas (4 linhas de 11).',
      'Jagati: 48 sílabas (4 linhas de 12).',
      'Pingala, autor do Chandas Sutra, descreveu combinações de sílabas longas e curtas que antecipam o sistema binário.',
    ],
    pratica:
      'Use um ritmo para respirar: inspire contando 4, expire contando 8, como um verso que se completa.',
    palavrasChave: [
      'chandas',
      'metrica',
      'gayatri',
      'anushtubh',
      'ritmo',
      'pingala',
      'verso',
    ],
    fonte: 'Pingala, Chandas Sutra',
  },
  {
    id: 'vyakarana',
    area: 'vedanga',
    titulo: 'Vyakarana: a gramática',
    resumo:
      'Vyakarana é a gramática do sânscrito; ensina a construir e analisar as palavras para entender o sentido exato.',
    pontos: [
      'Panini compôs o Ashtadhyayi, cerca de 4 mil regras que descrevem toda a língua.',
      'Para os gramáticos, a palavra (shabda) tem um poder de revelar o sentido (sphota).',
      'Clareza de linguagem é vista como clareza de mente.',
    ],
    pratica:
      'Ao escrever uma intenção para o dia, use uma frase curta, no presente e afirmativa.',
    palavrasChave: [
      'vyakarana',
      'gramatica',
      'panini',
      'ashtadhyayi',
      'sanscrito',
      'sphota',
    ],
    fonte: 'Panini, Ashtadhyayi; Bhartrihari, Vakyapadiya',
  },
  {
    id: 'nirukta',
    area: 'vedanga',
    titulo: 'Nirukta: a etimologia',
    resumo:
      'Nirukta explica a origem e o sentido das palavras védicas, revelando o significado escondido nos termos.',
    pontos: [
      'Yaska escreveu o Nirukta, o mais antigo tratado de etimologia.',
      'Yoga vem de "yuj", unir.',
      'Dharma vem de "dhr", sustentar: o que mantém a vida em ordem.',
      'Ayurveda une "ayus" (vida) e "veda" (conhecimento).',
      'Samadhi une "sam" (junto), "a" (completamente) e "dha" (pôr, sustentar): pôr-se inteiro em unidade.',
      'Nakshatra é tradicionalmente lido como "o que não declina".',
    ],
    pratica:
      'Escolha uma palavra importante para você hoje e procure a raiz dela: o sentido original costuma trazer clareza.',
    palavrasChave: [
      'nirukta',
      'etimologia',
      'yaska',
      'origem da palavra',
      'significado da palavra',
      'raiz',
    ],
    fonte: 'Yaska, Nirukta',
  },
  {
    id: 'kalpa',
    area: 'vedanga',
    titulo: 'Kalpa: o ritual e a ordem',
    resumo:
      'Kalpa reúne os manuais de ritual e de conduta: como agir de modo ordenado em casa, na comunidade e nos ritos.',
    pontos: [
      'Shrauta Sutras: os grandes rituais do fogo.',
      'Grihya Sutras: os ritos da casa e as passagens da vida (samskaras).',
      'Dharma Sutras: ética e deveres.',
      'Shulba Sutras: a geometria dos altares, com construções equivalentes ao teorema de Pitágoras.',
    ],
    pratica:
      'Crie um pequeno ritual diário (acender uma vela, três respirações e uma intenção) sempre no mesmo horário.',
    palavrasChave: [
      'kalpa',
      'ritual',
      'rito',
      'grihya',
      'shrauta',
      'shulba',
      'samskara',
      'cerimonia',
    ],
    fonte: 'Kalpa Sutras (Shrauta, Grihya, Dharma e Shulba)',
  },
  {
    id: 'jyotisha',
    area: 'vedanga',
    titulo: 'Jyotisha: a ciência da luz e do tempo',
    resumo:
      'Jyotisha ("ciência da luz") nasceu para marcar o tempo certo dos rituais; daí vieram a astronomia e a astrologia védicas.',
    pontos: [
      'O Vedanga Jyotisha, de Lagadha, organiza o calendário pelo Sol, pela Lua e pelos nakshatras.',
      'Cinco membros do tempo (Panchanga): dia lunar (tithi), dia da semana (vara), mansão lunar (nakshatra), yoga e karana.',
      'A astrologia natal védica usa o zodíaco sideral, os nakshatras e os períodos (dashas), como no Brihat Parashara Hora Shastra.',
      'A Lyra calcula o mapa com a ayanamsha Lahiri e o Vimshottari Dasha.',
    ],
    pratica:
      'Escolha o melhor horário do dia, mostrado em "Meu dia", para a tarefa que mais importa.',
    palavrasChave: [
      'jyotisha',
      'jyotish',
      'astrologia vedica',
      'panchanga',
      'panchang',
      'lagadha',
      'tempo certo',
      'muhurta',
    ],
    fonte: 'Vedanga Jyotisha de Lagadha e Brihat Parashara Hora Shastra',
  },
];
