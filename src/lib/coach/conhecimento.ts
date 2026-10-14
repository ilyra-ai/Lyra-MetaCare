/**
 * Conhecimento tradicional usado pelo coach, das fontes clássicas de Muhurta
 * (Muhurta Chintamani) e do Ayurveda, escrito em linguagem de bem-estar.
 * São orientações de autoconhecimento: não substituem avaliação profissional.
 */

export type NaturezaDoNakshatra =
  'dhruva' | 'chara' | 'ugra' | 'mishra' | 'kshipra' | 'mridu' | 'tikshna';

/** Natureza (gana de Muhurta) e divindade regente dos 27 nakshatras. */
export const NAKSHATRA_INFO: ReadonlyArray<{
  natureza: NaturezaDoNakshatra;
  divindade: string;
}> = [
  { natureza: 'kshipra', divindade: 'Ashwini Kumaras, os médicos celestes' },
  { natureza: 'ugra', divindade: 'Yama, guardião dos limites' },
  { natureza: 'mishra', divindade: 'Agni, o fogo que purifica' },
  { natureza: 'dhruva', divindade: 'Brahma (Prajapati), o criador' },
  { natureza: 'mridu', divindade: 'Soma, o néctar lunar' },
  { natureza: 'tikshna', divindade: 'Rudra, a tempestade que renova' },
  { natureza: 'chara', divindade: 'Aditi, a mãe ilimitada' },
  { natureza: 'kshipra', divindade: 'Brihaspati, o mestre' },
  { natureza: 'tikshna', divindade: 'Os Nagas, a sabedoria da serpente' },
  { natureza: 'ugra', divindade: 'Os Pitris, os ancestrais' },
  { natureza: 'ugra', divindade: 'Bhaga, a fortuna e o prazer' },
  { natureza: 'dhruva', divindade: 'Aryaman, a amizade e os acordos' },
  { natureza: 'kshipra', divindade: 'Savitar, o sol que inspira' },
  { natureza: 'mridu', divindade: 'Vishvakarma, o arquiteto divino' },
  { natureza: 'chara', divindade: 'Vayu, o vento e o prana' },
  { natureza: 'mishra', divindade: 'Indra e Agni, foco e ambição' },
  { natureza: 'mridu', divindade: 'Mitra, a amizade' },
  { natureza: 'tikshna', divindade: 'Indra, a liderança' },
  { natureza: 'tikshna', divindade: 'Nirriti, a dissolução' },
  { natureza: 'ugra', divindade: 'Apas, as águas' },
  { natureza: 'dhruva', divindade: 'Os Vishvadevas, as virtudes universais' },
  { natureza: 'chara', divindade: 'Vishnu, o que sustenta' },
  { natureza: 'chara', divindade: 'Os Vasus, a abundância' },
  { natureza: 'chara', divindade: 'Varuna, a cura e a ordem cósmica' },
  { natureza: 'ugra', divindade: 'Aja Ekapada, o fogo da transformação' },
  { natureza: 'dhruva', divindade: 'Ahir Budhnya, a serpente das profundezas' },
  { natureza: 'mridu', divindade: 'Pushan, o protetor dos caminhos' },
];

export const NATUREZA: Record<
  NaturezaDoNakshatra,
  { nome: string; favorece: string; evite: string }
> = {
  dhruva: {
    nome: 'Dhruva (fixo)',
    favorece:
      'construir bases: hábitos duradouros, planejamento de longo prazo e rotina',
    evite: 'mudanças bruscas de plano',
  },
  chara: {
    nome: 'Chara (móvel)',
    favorece:
      'movimento: deslocamentos, caminhadas, mudanças de ambiente e recomeços leves',
    evite: 'ficar parado o dia todo',
  },
  ugra: {
    nome: 'Ugra (intenso)',
    favorece: 'coragem e esforço concentrado em uma tarefa difícil',
    evite: 'começar coisas delicadas, discussões e excesso de intensidade',
  },
  mishra: {
    nome: 'Mishra (misto)',
    favorece: 'rotina e tarefas práticas do dia a dia',
    evite: 'decisões impulsivas',
  },
  kshipra: {
    nome: 'Kshipra (ágil)',
    favorece:
      'aprender, cuidar da saúde, tarefas rápidas e começar práticas curtas',
    evite: 'arrastar pendências',
  },
  mridu: {
    nome: 'Mridu (suave)',
    favorece: 'autocuidado, arte, amizades e práticas gentis',
    evite: 'treinos extenuantes e confrontos',
  },
  tikshna: {
    nome: 'Tikshna (cortante)',
    favorece:
      'encerrar hábitos ruins, organizar, cortar excessos e trabalho profundo',
    evite: 'começos importantes e exposição desnecessária',
  },
};

/** Grupos de tithi (1 a 15 em cada paksha). */
export function grupoDoTithi(numeroNoPaksha: number) {
  const resto = numeroNoPaksha % 5;
  if (resto === 1)
    return { nome: 'Nanda', sentido: 'alegria: bom para começar com leveza' };
  if (resto === 2)
    return {
      nome: 'Bhadra',
      sentido: 'saúde e prosperidade: bom para rotina e cuidado',
    };
  if (resto === 3)
    return { nome: 'Jaya', sentido: 'vitória: bom para enfrentar desafios' };
  if (resto === 4)
    return {
      nome: 'Rikta',
      sentido: 'vazio: evite começar projetos novos, conclua e organize',
    };
  return { nome: 'Purna', sentido: 'plenitude: bom para concluir e celebrar' };
}

/** Regente e orientação de cada dia da semana (domingo = 0). */
export const VARA_INFO: ReadonlyArray<{
  regente: string;
  corpo: string;
  pratica: string;
}> = [
  {
    regente: 'Sol',
    corpo: 'vitalidade e coração',
    pratica: 'pegue luz do sol cedo e cuide da postura e da energia vital',
  },
  {
    regente: 'Lua',
    corpo: 'emoções, fluidos e sono',
    pratica: 'hidrate-se bem, desacelere e acolha as emoções',
  },
  {
    regente: 'Marte',
    corpo: 'músculos e energia física',
    pratica: 'treino de força e coragem, sem buscar conflitos',
  },
  {
    regente: 'Mercúrio',
    corpo: 'sistema nervoso e comunicação',
    pratica: 'estudo, organização e conversas importantes',
  },
  {
    regente: 'Júpiter',
    corpo: 'fígado, crescimento e sabedoria',
    pratica: 'aprender, ensinar e planejar o crescimento',
  },
  {
    regente: 'Vênus',
    corpo: 'pele, rins e prazer',
    pratica: 'beleza, arte, relações e prazeres com equilíbrio',
  },
  {
    regente: 'Saturno',
    corpo: 'ossos, articulações e resistência',
    pratica: 'disciplina, alongamento, descanso e servir',
  },
];

/** Alimentação e práticas para equilibrar o dosha que está mais alto. */
export const DOSHA_INFO: Record<
  'vata' | 'pitta' | 'kapha',
  {
    nome: string;
    alimentacao: string;
    movimento: string;
    mente: string;
    evite: string;
  }
> = {
  vata: {
    nome: 'Vata (ar e éter)',
    alimentacao:
      'refeições mornas, cozidas e no horário: sopas, raízes, grãos integrais, ghee ou azeite e especiarias suaves como gengibre e canela',
    movimento:
      'yoga, caminhada e força em ritmo constante, sem excesso de impacto',
    mente:
      'rotina previsível e respiração lenta (expiração mais longa que a inspiração)',
    evite:
      'alimentos crus e gelados, jejuns longos, excesso de cafeína e de telas',
  },
  pitta: {
    nome: 'Pitta (fogo e água)',
    alimentacao:
      'pratos frescos e menos condimentados: folhas, pepino, coco, frutas doces, arroz e leguminosas',
    movimento:
      'natação, ciclismo leve ou yoga, evitando treinar no calor do meio-dia',
    mente: 'pausas sem competição e respiração refrescante (Shitali)',
    evite: 'pimenta, frituras, álcool e cobrança excessiva',
  },
  kapha: {
    nome: 'Kapha (terra e água)',
    alimentacao:
      'refeições leves e aquecidas, com legumes, leguminosas e especiarias estimulantes (gengibre, pimenta-do-reino, cúrcuma); pouco açúcar e laticínios',
    movimento: 'treino vigoroso e aeróbico, de preferência pela manhã',
    mente:
      'variedade, novidade e respiração energizante (Kapalabhati, se não houver contraindicação)',
    evite: 'cochilos longos, refeições pesadas à noite e sedentarismo',
  },
};

/** Respiração sugerida conforme o tom do dia e a prontidão. */
export function respiracaoDoDia(
  prontidao: number | null,
  estresse: number | null
) {
  if ((estresse ?? 0) >= 60 || (prontidao !== null && prontidao < 45)) {
    return {
      nome: 'Respiração 4-7-8',
      como: 'inspire em 4 tempos, segure 7 e solte em 8; 4 ciclos',
      porque:
        'a expiração longa ativa o sistema parassimpático e reduz a ativação',
    };
  }
  if (prontidao !== null && prontidao >= 75) {
    return {
      nome: 'Respiração quadrada',
      como: 'inspire 4, segure 4, solte 4, segure 4; 5 minutos',
      porque: 'mantém foco e estabilidade em um dia de boa energia',
    };
  }
  return {
    nome: 'Nadi Shodhana (narinas alternadas)',
    como: 'alterne as narinas a cada respiração, em ritmo calmo; 5 minutos',
    porque:
      'equilibra ativação e calma e é a prática clássica de Pranayama para o dia a dia',
  };
}
