import type { Dosha } from './jyotish';
import type { Verbete } from './tipos';

/**
 * Upavedas, os quatro "Vedas auxiliares" (tarefa 55): Ayurveda (ligado ao
 * Atharva e ao Rig Veda), Dhanurveda (Yajur Veda), Gandharvaveda (Sama Veda)
 * e Sthapatyaveda, de onde vem o Vastu Shastra (Atharva Veda). Fontes:
 * Charaka Samhita, Sushruta Samhita e Ashtanga Hridayam (Ayurveda); Natya
 * Shastra e Sangita Ratnakara (música); Mayamata e Manasara (Vastu).
 * Orientações de bem-estar: não substituem avaliação profissional de saúde.
 */
export const UPAVEDAS: readonly Verbete[] = [
  {
    id: 'upavedas',
    area: 'upaveda',
    titulo: 'Os quatro Upavedas',
    resumo:
      'Upavedas são as ciências aplicadas que nasceram dos Vedas: a saúde (Ayurveda), a arte marcial (Dhanurveda), a música (Gandharvaveda) e a arquitetura (Sthapatyaveda).',
    pontos: [
      'Ayurveda, a ciência da vida, ligada ao Atharva Veda (e ao Rig Veda).',
      'Dhanurveda, a ciência do arco e da defesa, ligada ao Yajur Veda.',
      'Gandharvaveda, a ciência do som e da música, ligada ao Sama Veda.',
      'Sthapatyaveda, a ciência da construção e do espaço (Vastu), ligada ao Atharva Veda.',
    ],
    pratica:
      'Pense na sua semana pelas quatro: cuidado com o corpo, disciplina, som e o espaço onde você vive.',
    palavrasChave: ['upaveda', 'upavedas', 'vedas auxiliares'],
    fonte: 'Tradição dos Charanavyuha e comentários védicos',
  },
  {
    id: 'ayurveda',
    area: 'upaveda',
    titulo: 'Ayurveda: a ciência da vida',
    resumo:
      'Ayurveda ("conhecimento da vida") vê a saúde como equilíbrio entre os três doshas, um bom fogo digestivo (agni) e uma rotina alinhada à natureza.',
    pontos: [
      'Vata (ar e espaço): movimento, criatividade, sistema nervoso; desequilibrado traz ansiedade, frio e insônia.',
      'Pitta (fogo e água): digestão, foco, transformação; desequilibrado traz irritação, calor e acidez.',
      'Kapha (terra e água): estrutura, estabilidade, afeto; desequilibrado traz peso, lentidão e apego.',
      'Prakriti é a constituição de nascença; Vikriti é o desequilíbrio do momento.',
      'Agni (fogo digestivo) forte digere alimento e experiências; Ama são os resíduos mal digeridos.',
      'Sete tecidos (dhatus): plasma, sangue, músculo, gordura, osso, medula e tecido reprodutivo.',
    ],
    pratica:
      'Dinacharya, a rotina diária: acordar antes do sol, raspar a língua, beber água morna, mover o corpo, fazer a refeição principal perto do meio-dia e dormir cedo.',
    palavrasChave: [
      'ayurveda',
      'ayurvedica',
      'dosha',
      'doshas',
      'vata',
      'pitta',
      'kapha',
      'prakriti',
      'vikriti',
      'agni',
      'ama',
      'dinacharya',
      'dhatu',
    ],
    fonte: 'Charaka Samhita, Sushruta Samhita e Ashtanga Hridayam',
  },
  {
    id: 'ayurveda-relogio',
    area: 'upaveda',
    titulo: 'O relógio dos doshas',
    resumo:
      'O dia tem dois ciclos de três fases, cada uma regida por um dosha; viver em sintonia com elas facilita sono, digestão e foco.',
    pontos: [
      '6h às 10h e 18h às 22h: Kapha (estável e pesado), bom para exercício pela manhã e para desacelerar à noite.',
      '10h às 14h e 22h às 2h: Pitta (fogo), digestão mais forte ao meio-dia e reparo do corpo durante o sono.',
      '14h às 18h e 2h às 6h: Vata (movimento), criatividade à tarde e mente desperta antes do amanhecer.',
    ],
    pratica:
      'Faça a refeição mais completa entre 12h e 13h e procure deitar antes das 22h, ainda na fase de Kapha.',
    palavrasChave: [
      'relogio ayurvedico',
      'horario dos doshas',
      'relogio dos doshas',
      'rotina ayurveda',
    ],
    fonte: 'Ashtanga Hridayam, Sutrasthana (Dinacharya)',
  },
  {
    id: 'ayurveda-sabores',
    area: 'upaveda',
    titulo: 'Os seis sabores (rasas)',
    resumo:
      'O Ayurveda usa seis sabores para equilibrar os doshas: doce, ácido, salgado, picante, amargo e adstringente.',
    pontos: [
      'Doce, ácido e salgado acalmam Vata e aumentam Kapha.',
      'Doce, amargo e adstringente acalmam Pitta.',
      'Picante, amargo e adstringente acalmam Kapha.',
      'Uma refeição equilibrada tem um pouco de cada sabor.',
    ],
    pratica:
      'No prato de hoje, procure os seis sabores; se algum faltar, acrescente com uma especiaria ou erva.',
    palavrasChave: [
      'sabores',
      'rasa',
      'rasas',
      'seis sabores',
      'alimentacao ayurveda',
    ],
    fonte: 'Charaka Samhita, Sutrasthana 26',
  },
  {
    id: 'ayurveda-estacoes',
    area: 'upaveda',
    titulo: 'Ritucharya: a rotina das estações',
    resumo:
      'Cada estação acumula ou acalma um dosha; ajustar comida e ritmo ao clima previne desequilíbrios.',
    pontos: [
      'Calor intenso aumenta Pitta: prefira alimentos frescos e evite exagero de sol.',
      'Frio e vento aumentam Vata: prefira alimentos quentes, úmidos e rotina regular.',
      'Frio úmido e primavera mobilizam Kapha: alimentos leves, movimento e menos doce.',
    ],
    pratica:
      'Olhe o clima da semana e ajuste uma coisa na alimentação ou no sono de acordo com ele.',
    palavrasChave: [
      'ritucharya',
      'estacoes',
      'estacao do ano',
      'clima e dosha',
    ],
    fonte: 'Ashtanga Hridayam, Sutrasthana 3',
  },
  {
    id: 'dhanurveda',
    area: 'upaveda',
    titulo: 'Dhanurveda: a ciência do arco',
    resumo:
      'Dhanurveda é a arte marcial védica: além das técnicas, ensina foco, disciplina, controle do prana e ética de proteção.',
    pontos: [
      'O arqueiro ideal une corpo firme, respiração calma e mente num só ponto, como Arjuna mirando só o olho do pássaro.',
      'O Mundaka Upanishad usa a mesma imagem: o Om é o arco, o eu é a flecha e Brahman é o alvo.',
      'Herança viva em artes como o Kalaripayattu, do sul da Índia.',
      'A força serve para proteger (dharma), nunca para ferir à toa.',
    ],
    pratica:
      'Antes de uma tarefa difícil, fique de pé, firme, faça três respirações lentas e defina um único alvo para os próximos minutos.',
    palavrasChave: [
      'dhanurveda',
      'arco',
      'arte marcial',
      'kalaripayattu',
      'arjuna',
      'foco',
      'guerreiro',
    ],
    fonte: 'Tradição do Dhanurveda, Mahabharata e Mundaka Upanishad 2.2.4',
  },
  {
    id: 'gandharvaveda',
    area: 'upaveda',
    titulo: 'Gandharvaveda: a ciência do som',
    resumo:
      'Gandharvaveda é a música védica, nascida do canto do Sama Veda: o som organizado (nada) como caminho de harmonia interior.',
    pontos: [
      'Nada Yoga: o som primordial (Shabda Brahman) e a escuta como meditação.',
      'Sete notas (svaras): Sa, Re, Ga, Ma, Pa, Dha, Ni.',
      'Os ragas têm horários próprios ao longo do dia (prahara), em sintonia com o estado da natureza e da mente.',
      'Exemplos de horários tradicionais: Lalit antes do amanhecer, Bhairav ao amanhecer, Todi no fim da manhã, Sarang ao meio-dia, Multani à tarde, Yaman no começo da noite, Darbari perto da meia-noite e Malkauns na madrugada.',
    ],
    pratica:
      'Escolha uma música calma para o horário do dia e ouça com atenção total por alguns minutos, sem fazer outra coisa.',
    palavrasChave: [
      'gandharvaveda',
      'gandharva',
      'musica',
      'raga',
      'ragas',
      'nada yoga',
      'som',
      'svara',
      'sama veda',
      'mantra',
    ],
    fonte: 'Sama Veda, Natya Shastra e Sangita Ratnakara',
  },
  {
    id: 'vastu',
    area: 'upaveda',
    titulo: 'Sthapatyaveda e Vastu Shastra',
    resumo:
      'Sthapatyaveda é a ciência védica da construção; dela vem o Vastu Shastra, que organiza o espaço pelas direções e elementos para favorecer bem-estar.',
    pontos: [
      'O Vastu Purusha Mandala divide o espaço em uma grade regida por divindades das direções.',
      'Nordeste (Ishana): o mais leve e sagrado; bom para meditação, água e entrada de luz.',
      'Leste (Indra, o Sol): janelas e entrada da luz da manhã.',
      'Sudeste (Agni): o fogo; lugar da cozinha.',
      'Sul (Yama): estabilidade; paredes mais firmes e descanso.',
      'Sudoeste (Nirriti): o mais pesado; quarto principal e móveis maiores.',
      'Oeste (Varuna): estudo, refeições e água guardada.',
      'Noroeste (Vayu): movimento; quarto de hóspedes e ventilação.',
      'Norte (Kubera): prosperidade; espaço aberto e organizado.',
      'Centro (Brahmasthana): deve ficar livre, como o coração da casa.',
    ],
    pratica:
      'Deixe o canto nordeste do seu quarto ou sala limpo e leve, com uma planta ou um copo de água, e use-o para respirar alguns minutos.',
    palavrasChave: [
      'vastu',
      'sthapatyaveda',
      'sthapatya',
      'arquitetura',
      'casa',
      'quarto',
      'direcoes',
      'nordeste',
      'feng shui',
      'espaco',
    ],
    fonte: 'Mayamata, Manasara e Vishvakarma Vastu Shastra',
  },
];

/** Dosha que domina cada faixa do dia (relógio ayurvédico). */
export function doshaDaHora(hora: number): Dosha {
  const h = ((hora % 24) + 24) % 24;
  if ((h >= 6 && h < 10) || (h >= 18 && h < 22)) return 'kapha';
  if ((h >= 10 && h < 14) || h >= 22 || h < 2) return 'pitta';
  return 'vata';
}

export const CUIDADO_DO_DOSHA: Record<Dosha, string> = {
  vata: 'aquecer, desacelerar e manter rotina (alimentos mornos, óleo no corpo, sono regular)',
  pitta:
    'refrescar e suavizar (alimentos frescos, pausas, menos competição e menos calor)',
  kapha:
    'movimentar e aliviar (exercício, alimentos leves e especiarias, acordar cedo)',
};
