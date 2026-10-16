import type { Verbete } from './tipos';

/**
 * Filosofia e metafísica védica: Vedanta e Upanishads (tarefa 55). Fontes:
 * os Upanishads principais (Mukhya), a Bhagavad Gita e os Brahma Sutras (a
 * Prasthana Traya, os três pilares do Vedanta), com os comentários de
 * Shankara, Ramanuja e Madhva para as escolas.
 */
export const VEDANTA: readonly Verbete[] = [
  {
    id: 'vedanta',
    area: 'vedanta',
    titulo: 'Vedanta',
    resumo:
      'Vedanta significa "o fim (ou o ápice) dos Vedas": a parte filosófica que investiga quem somos, o que é real e como se libertar do sofrimento.',
    pontos: [
      'Apoia-se em três pilares (Prasthana Traya): os Upanishads, a Bhagavad Gita e os Brahma Sutras.',
      'Pergunta central: qual é a relação entre o eu individual (Atman) e a realidade última (Brahman)?',
      'O caminho é conhecer, refletir e meditar: ouvir o ensinamento (shravana), refletir sobre ele (manana) e contemplá-lo até virar vivência (nididhyasana).',
      'Escolas principais: Advaita (não dualidade, Shankara), Vishishtadvaita (não dualidade qualificada, Ramanuja) e Dvaita (dualidade, Madhva).',
    ],
    pratica:
      'Reserve alguns minutos por dia para observar quem percebe os pensamentos: o observador é estável enquanto os pensamentos passam.',
    palavrasChave: [
      'vedanta',
      'brahma sutra',
      'prasthana',
      'filosofia vedica',
      'metafisica',
    ],
    fonte: 'Upanishads, Bhagavad Gita e Brahma Sutras (Prasthana Traya)',
  },
  {
    id: 'brahman-atman',
    area: 'vedanta',
    titulo: 'Brahman e Atman',
    resumo:
      'Brahman é a realidade última, consciência infinita e base de tudo; Atman é o eu essencial em cada ser. Para o Advaita, os dois são o mesmo.',
    pontos: [
      'Brahman é descrito como Sat-Chit-Ananda: existência, consciência e plenitude.',
      'Atman não é o corpo, a mente nem a personalidade: é a consciência que testemunha tudo isso.',
      'O sofrimento nasce de se identificar só com o que muda (corpo, papéis, emoções).',
    ],
    pratica:
      'Quando uma emoção forte vier, diga por dentro: "isto está acontecendo em mim, mas não é tudo o que eu sou".',
    palavrasChave: [
      'brahman',
      'atman',
      'sat chit ananda',
      'satchitananda',
      'eu verdadeiro',
      'alma',
    ],
    fonte: 'Chandogya, Brihadaranyaka e Mandukya Upanishads',
  },
  {
    id: 'mahavakyas',
    area: 'vedanta',
    titulo: 'Os quatro Mahavakyas (grandes sentenças)',
    resumo:
      'Quatro frases dos Upanishads que resumem o ensinamento da unidade, uma de cada Veda.',
    pontos: [
      '"Prajnanam Brahma" (a consciência é Brahman), Aitareya Upanishad, do Rig Veda.',
      '"Aham Brahmasmi" (eu sou Brahman), Brihadaranyaka Upanishad, do Yajur Veda.',
      '"Tat Tvam Asi" (tu és Aquilo), Chandogya Upanishad, do Sama Veda.',
      '"Ayam Atma Brahma" (este Eu é Brahman), Mandukya Upanishad, do Atharva Veda.',
    ],
    pratica:
      'Escolha uma das frases e repita em silêncio durante a respiração, sentindo o sentido e não só as palavras.',
    palavrasChave: [
      'mahavakya',
      'tat tvam asi',
      'aham brahmasmi',
      'prajnanam',
      'ayam atma',
    ],
    fonte: 'Aitareya, Brihadaranyaka, Chandogya e Mandukya Upanishads',
  },
  {
    id: 'upanishads',
    area: 'vedanta',
    titulo: 'Upanishads principais',
    resumo:
      'Os Upanishads são os diálogos finais dos Vedas sobre a natureza do Ser. A tradição reconhece onze principais (Mukhya).',
    pontos: [
      'Isha: tudo é permeado pelo divino; agir sem apego ao fruto.',
      'Kena: o que faz a mente pensar não pode ser pensado pela mente.',
      'Katha: o diálogo de Nachiketa com Yama sobre a morte e o Ser imortal; a imagem da carruagem (corpo), cavalos (sentidos) e cocheiro (intelecto).',
      'Prashna: seis perguntas sobre a origem da vida, o prana e o Om.',
      'Mundaka: o conhecimento superior (para) e inferior (apara); dois pássaros na mesma árvore, um come o fruto, o outro só observa.',
      'Mandukya: os três estados (vigília, sonho, sono profundo) e o quarto, Turiya, a consciência pura; o Om como seu símbolo.',
      'Taittiriya: as cinco camadas do ser (Pancha Kosha) e "seja a mãe, o pai, o mestre e o hóspede um deus para ti".',
      'Aitareya: a criação e a consciência como Brahman.',
      'Chandogya: "Tat Tvam Asi", ensinado por Uddalaka a Shvetaketu.',
      'Brihadaranyaka: "neti, neti" (não é isto, não é isto) e a prece "do irreal leva-me ao real".',
      'Shvetashvatara: o divino pessoal e impessoal, e o caminho da meditação.',
    ],
    pratica:
      'Leia uma estrofe curta por dia, devagar, e anote o que ela desperta em você.',
    palavrasChave: [
      'upanishad',
      'upanixade',
      'isha',
      'kena',
      'katha',
      'nachiketa',
      'mundaka',
      'mandukya',
      'taittiriya',
      'chandogya',
      'brihadaranyaka',
      'shvetashvatara',
      'prashna',
      'aitareya',
    ],
    fonte: 'Os onze Mukhya Upanishads',
  },
  {
    id: 'pancha-kosha',
    area: 'vedanta',
    titulo: 'Pancha Kosha: as cinco camadas do ser',
    resumo:
      'O Taittiriya Upanishad descreve o ser humano em cinco camadas, da mais densa à mais sutil, todas envolvendo o Atman.',
    pontos: [
      'Annamaya: o corpo físico, feito de alimento.',
      'Pranamaya: a energia vital, a respiração.',
      'Manomaya: a mente, as emoções e os sentidos.',
      'Vijnanamaya: o intelecto que discerne e decide.',
      'Anandamaya: a camada de plenitude, sentida no sono profundo e na meditação.',
    ],
    pratica:
      'Faça um escaneamento curto: como está o corpo, a respiração, as emoções, a clareza de decisão e a sensação de paz?',
    palavrasChave: [
      'kosha',
      'koshas',
      'pancha kosha',
      'annamaya',
      'pranamaya',
      'manomaya',
      'vijnanamaya',
      'anandamaya',
      'camadas do ser',
    ],
    fonte: 'Taittiriya Upanishad (Brahmananda Valli)',
  },
  {
    id: 'turiya',
    area: 'vedanta',
    titulo: 'Os quatro estados de consciência e Turiya',
    resumo:
      'O Mandukya Upanishad ensina que vivemos três estados (vigília, sonho e sono profundo) e que a consciência que os atravessa é o quarto, Turiya.',
    pontos: [
      'Jagrat (vigília): a consciência voltada para fora.',
      'Svapna (sonho): a consciência voltada para dentro.',
      'Sushupti (sono profundo): repouso sem objetos.',
      'Turiya: a testemunha sempre presente, simbolizada pelo silêncio depois do Om (A-U-M).',
    ],
    pratica:
      'Entoe "Om" três vezes devagar e fique alguns segundos no silêncio que vem depois.',
    palavrasChave: [
      'turiya',
      'mandukya',
      'estados de consciencia',
      'om',
      'aum',
      'sono profundo',
    ],
    fonte: 'Mandukya Upanishad e a Karika de Gaudapada',
  },
  {
    id: 'maya',
    area: 'vedanta',
    titulo: 'Maya e Avidya',
    resumo:
      'Maya é o poder que faz o uno aparecer como muitos; Avidya é a ignorância pessoal que nos faz confundir o que muda com o que somos.',
    pontos: [
      'A imagem clássica: à meia-luz, uma corda parece uma serpente; o medo some quando a luz mostra a corda.',
      'O mundo não é "falso": é real na experiência, mas não é a realidade última.',
      'O antídoto é Viveka, o discernimento entre o permanente e o passageiro.',
    ],
    pratica:
      'Diante de um medo, pergunte: "isto é a corda ou a serpente?", e busque mais luz (informação, calma) antes de reagir.',
    palavrasChave: [
      'maya',
      'avidya',
      'ilusao',
      'corda e serpente',
      'ignorancia',
    ],
    fonte: 'Shankara, Vivekachudamani e comentário aos Brahma Sutras',
  },
  {
    id: 'gunas',
    area: 'vedanta',
    titulo: 'As três Gunas',
    resumo:
      'Toda a natureza (Prakriti) é tecida por três qualidades: Sattva (clareza), Rajas (movimento) e Tamas (inércia).',
    pontos: [
      'Sattva: leveza, lucidez, harmonia; cresce com sono regular, alimento fresco, natureza e meditação.',
      'Rajas: energia, desejo, inquietação; útil para agir, cansa quando domina.',
      'Tamas: peso, descanso, estabilidade; necessário para dormir, pesado quando vira apatia.',
      'A Bhagavad Gita (cap. 14) descreve como cada guna prende e como ir além delas.',
    ],
    pratica:
      'Observe qual guna domina agora e equilibre: com Rajas alto, desacelere; com Tamas alto, movimente o corpo e tome sol.',
    palavrasChave: ['guna', 'gunas', 'sattva', 'rajas', 'tamas', 'prakriti'],
    fonte: 'Bhagavad Gita, capítulos 14, 17 e 18; Samkhya Karika',
  },
  {
    id: 'purusharthas',
    area: 'vedanta',
    titulo: 'Os quatro objetivos da vida (Purusharthas)',
    resumo:
      'A tradição védica reconhece quatro metas legítimas: Dharma, Artha, Kama e Moksha.',
    pontos: [
      'Dharma: viver de acordo com o propósito e a ética (da raiz "dhr", sustentar).',
      'Artha: prosperidade e meios de vida.',
      'Kama: prazer, beleza e afeto.',
      'Moksha: libertação, a paz que não depende das circunstâncias.',
      'O equilíbrio vem quando Artha e Kama são buscados dentro do Dharma, com Moksha como horizonte.',
    ],
    pratica:
      'Pergunte-se no fim do dia qual dos quatro você nutriu e qual ficou esquecido.',
    palavrasChave: [
      'purushartha',
      'dharma',
      'artha',
      'kama',
      'moksha',
      'proposito',
      'objetivos da vida',
    ],
    fonte: 'Mahabharata e Dharma Shastras',
  },
  {
    id: 'sadhana-chatushtaya',
    area: 'vedanta',
    titulo: 'As quatro qualificações do buscador (Sadhana Chatushtaya)',
    resumo:
      'Shankara descreve quatro qualidades que preparam a mente para o autoconhecimento.',
    pontos: [
      'Viveka: discernir o permanente do passageiro.',
      'Vairagya: desapego, não depender dos frutos.',
      'Shat Sampatti: seis virtudes (calma da mente, domínio dos sentidos, retirada, paciência, fé e concentração).',
      'Mumukshutva: o desejo sincero de liberdade.',
    ],
    pratica:
      'Escolha uma das seis virtudes por semana e observe-a em pequenas situações.',
    palavrasChave: [
      'sadhana',
      'viveka',
      'vairagya',
      'mumukshutva',
      'shat sampatti',
      'discernimento',
      'desapego',
    ],
    fonte: 'Shankara, Vivekachudamani e Tattva Bodha',
  },
  {
    id: 'samadhi',
    area: 'vedanta',
    titulo: 'Samadhi',
    resumo:
      'Samadhi (literalmente "unificação") é o estado de absorção em que quem medita e o objeto da meditação se tornam um só; é o oitavo passo do Yoga de Patanjali.',
    pontos: [
      'Os oito passos (Ashtanga): Yama, Niyama, Asana, Pranayama, Pratyahara, Dharana, Dhyana e Samadhi.',
      'Patanjali distingue Samadhi com apoio (samprajnata) e sem apoio (asamprajnata).',
      'Não é algo que se force: amadurece com prática constante (abhyasa) e desapego (vairagya), com "perseverança serena".',
      'No Mapa Lyra DM Samādhi, Samādhi é a camada de integração, o ponto onde todas as leituras se unem.',
    ],
    pratica:
      'Comece com 5 minutos de atenção numa só coisa (a respiração ou um som) e volte, sem brigar, cada vez que a mente sair.',
    palavrasChave: [
      'samadhi',
      'patanjali',
      'ashtanga',
      'oito passos',
      'dhyana',
      'dharana',
      'meditacao profunda',
    ],
    fonte:
      'Yoga Sutras de Patanjali (I.2, I.17-18, III.3) e o livro do Mapa Lyra DM Samādhi',
  },
  {
    id: 'karma',
    area: 'vedanta',
    titulo: 'Karma e Karma Yoga',
    resumo:
      'Karma é ação e consequência; Karma Yoga, ensinado na Bhagavad Gita, é agir com dedicação sem se prender ao resultado.',
    pontos: [
      'Três tipos de karma: Sanchita (acumulado), Prarabdha (o que já está em curso nesta vida) e Kriyamana (o que criamos agora).',
      'Gita 2.47: "você tem direito à ação, nunca aos seus frutos".',
      'Na astrologia védica, o mapa mostra tendências (Prarabdha); o livre-arbítrio age no Kriyamana.',
    ],
    pratica:
      'Antes de uma tarefa, ofereça o esforço; depois, solte o resultado e observe o alívio.',
    palavrasChave: [
      'karma',
      'carma',
      'karma yoga',
      'prarabdha',
      'sanchita',
      'gita',
      'bhagavad',
    ],
    fonte: 'Bhagavad Gita, capítulos 2 a 5',
  },
];
