/**
 * Motor de Alinhamento de Chakras — Lyra MetaCare
 *
 * Mapeia os 7 chakras principais a biomarcadores fisiológicos mensuráveis,
 * gerando um score de alinhamento para cada centro energético.
 *
 * Mapeamento Chakra → Biomarcador:
 * 1. Muladhara (Raiz)     → Peso, sedentarismo, sono profundo (estabilidade)
 * 2. Svadhisthana (Sacro) → Hidratação, humor, criatividade emocional
 * 3. Manipura (Plexo)     → Glicose, digestão, atividade física, Agni
 * 4. Anahata (Coração)    → HRV, FC repouso, SpO₂, coerência cardíaca
 * 5. Vishuddha (Garganta) → Respiração, expressão (mood), regularidade
 * 6. Ajna (Terceiro Olho) → Cognição, reação PVT, sono REM, meditação
 * 7. Sahasrara (Coroa)    → Meditação profunda, coerência geral, estresse
 */

/** Biomarcadores necessários para o cálculo dos chakras. */
export interface ChakraMetricSnapshot {
  weight_kg: number | null;
  sedentary_hours: number | null;
  deep_sleep_minutes: number | null;
  water_liters: number | null;
  mood_score: number | null;
  blood_glucose_mgdl: number | null;
  active_minutes: number | null;
  dietary_fiber_grams: number | null;
  hrv_ms: number | null;
  resting_heart_rate: number | null;
  spo2_average: number | null;
  respiratory_rate: number | null;
  sleep_regularity_index: number | null;
  cognitive_test_score: number | null;
  reaction_time_pvt_ms: number | null;
  rem_sleep_minutes: number | null;
  meditation_minutes: number | null;
  stress_score: number | null;
  hrv_stress_index: number | null;
}

/** Score de um chakra individual. */
export interface ChakraScore {
  /** Nome em sânscrito. */
  name: string;
  /** Nome em português. */
  label: string;
  /** Cor associada. */
  color: string;
  /** Classe CSS do tom. */
  toneClass: string;
  /** Score de alinhamento (0-100). */
  score: number;
  /** Status textual do chakra. */
  status: 'bloqueado' | 'subativo' | 'equilibrado' | 'hiperativo';
  /** Insight sobre o estado atual. */
  insight: string;
  /** Prática recomendada para equilíbrio. */
  practice: string;
}

/** Resultado completo do alinhamento de chakras. */
export interface ChakraAlignmentResult {
  /** Score geral de alinhamento (0-100). */
  overallScore: number;
  /** Label textual do alinhamento geral. */
  overallLabel: string;
  /** Scores individuais dos 7 chakras. */
  chakras: ChakraScore[];
}

function safeNum(value: number | null | undefined, fallback = 0): number {
  return value !== null && value !== undefined && Number.isFinite(value)
    ? value
    : fallback;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function getChakraStatus(score: number): ChakraScore['status'] {
  if (score <= 25) return 'bloqueado';
  if (score <= 50) return 'subativo';
  if (score <= 85) return 'equilibrado';
  return 'hiperativo';
}

function calcMuladhara(m: ChakraMetricSnapshot): number {
  const weight = safeNum(m.weight_kg, 70);
  const sedentary = safeNum(m.sedentary_hours, 8);
  const deep = safeNum(m.deep_sleep_minutes, 80);

  let s = 50;
  // Peso estável (55-95 kg faixa saudável) = raiz firme
  if (weight >= 55 && weight <= 95) s += 15;
  // Sedentarismo controlado (<8h) = aterramento
  if (sedentary < 8) s += 10 + (8 - sedentary) * 2;
  else s -= (sedentary - 8) * 3;
  // Sono profundo adequado (>80 min) = restauração basal
  if (deep >= 90) s += 20;
  else if (deep >= 60) s += 10;
  else s -= 5;

  return clamp(s);
}

function calcSvadhisthana(m: ChakraMetricSnapshot): number {
  const water = safeNum(m.water_liters, 1.5);
  const mood = safeNum(m.mood_score, 3);

  let s = 45;
  // Hidratação boa (>2L) = fluidez
  if (water >= 2.5) s += 25;
  else if (water >= 2.0) s += 15;
  else if (water >= 1.5) s += 8;
  // Humor alto = criatividade emocional
  if (mood >= 4) s += 25;
  else if (mood >= 3) s += 15;
  else s += mood * 3;

  return clamp(s);
}

function calcManipura(m: ChakraMetricSnapshot): number {
  const glucose = safeNum(m.blood_glucose_mgdl, 90);
  const active = safeNum(m.active_minutes, 30);
  const fiber = safeNum(m.dietary_fiber_grams, 20);

  let s = 45;
  // Glicose controlada (70-99) = Agni equilibrado
  if (glucose >= 70 && glucose <= 99) s += 25;
  else if (glucose >= 60 && glucose <= 110) s += 12;
  else s -= 5;
  // Atividade física adequada = fogo digestivo ativo
  if (active >= 45) s += 20;
  else if (active >= 25) s += 10;
  // Fibras = digestão saudável
  if (fiber >= 25) s += 10;
  else if (fiber >= 15) s += 5;

  return clamp(s);
}

function calcAnahata(m: ChakraMetricSnapshot): number {
  const hrv = safeNum(m.hrv_ms, 50);
  const fc = safeNum(m.resting_heart_rate, 68);
  const spo2 = safeNum(m.spo2_average, 96);

  let s = 40;
  // HRV na faixa ótima = coerência cardíaca
  if (hrv >= 50 && hrv <= 85) s += 30;
  else if (hrv >= 35 && hrv <= 100) s += 18;
  else s += 5;
  // FC baixa em repouso = coração equilibrado
  if (fc <= 60) s += 20;
  else if (fc <= 70) s += 12;
  else s += 5;
  // SpO₂ alta = circulação plena
  if (spo2 >= 97) s += 10;
  else if (spo2 >= 95) s += 5;

  return clamp(s);
}

function calcVishuddha(m: ChakraMetricSnapshot): number {
  const resp = safeNum(m.respiratory_rate, 16);
  const sri = safeNum(m.sleep_regularity_index, 60);
  const mood = safeNum(m.mood_score, 3);

  let s = 45;
  // Respiração rítmica e calma (12-16 rpm)
  if (resp >= 12 && resp <= 16) s += 25;
  else if (resp >= 10 && resp <= 18) s += 12;
  // Regularidade do sono = ritmo
  if (sri >= 80) s += 20;
  else if (sri >= 60) s += 10;
  // Expressão emocional positiva
  if (mood >= 4) s += 10;
  else if (mood >= 3) s += 5;

  return clamp(s);
}

function calcAjna(m: ChakraMetricSnapshot): number {
  const cognitive = safeNum(m.cognitive_test_score, 0.5);
  const pvt = safeNum(m.reaction_time_pvt_ms, 300);
  const rem = safeNum(m.rem_sleep_minutes, 80);
  const meditation = safeNum(m.meditation_minutes, 0);

  let s = 40;
  // Cognição alta = terceiro olho ativo
  if (cognitive >= 0.7) s += 20;
  else if (cognitive >= 0.4) s += 10;
  // Reação rápida (<250ms) = clareza mental
  if (pvt > 0 && pvt < 250) s += 15;
  else if (pvt > 0 && pvt < 350) s += 8;
  // Sono REM = processamento inconsciente
  if (rem >= 90) s += 15;
  else if (rem >= 60) s += 8;
  // Meditação amplia a percepção sutil
  if (meditation >= 15) s += 15;
  else if (meditation >= 5) s += 8;
  else if (meditation > 0) s += 3;

  return clamp(s);
}

function calcSahasrara(m: ChakraMetricSnapshot): number {
  const meditation = safeNum(m.meditation_minutes, 0);
  const stress = safeNum(m.stress_score, 50);
  const hrvStress = safeNum(m.hrv_stress_index, 10);

  let s = 35;
  // Meditação profunda (>20 min) = conexão com o todo
  if (meditation >= 30) s += 30;
  else if (meditation >= 15) s += 20;
  else if (meditation >= 5) s += 10;
  else if (meditation > 0) s += 5;
  // Estresse muito baixo = expansão de consciência
  if (stress <= 20) s += 25;
  else if (stress <= 40) s += 15;
  else if (stress <= 60) s += 5;
  // Índice de estresse HRV baixo
  if (hrvStress < 5) s += 15;
  else if (hrvStress < 10) s += 8;

  return clamp(s);
}

const CHAKRA_INSIGHTS: Record<
  string,
  Record<ChakraScore['status'], { insight: string; practice: string }>
> = {
  Muladhara: {
    bloqueado: {
      insight: 'Sensação de instabilidade, insegurança ou desconexão com o corpo físico.',
      practice: 'Caminhe descalço na terra, pratique agachamentos e aumente o sono profundo.',
    },
    subativo: {
      insight: 'Aterramento parcial. O corpo busca mais estabilidade e rotina.',
      practice: 'Mantenha horários fixos de sono e inclua alimentos raiz (beterraba, cenoura).',
    },
    equilibrado: {
      insight: 'Base sólida e segura. Boa conexão com o corpo e senso de pertencimento.',
      practice: 'Mantenha a rotina atual. Gratidão e presença sustentam o equilíbrio.',
    },
    hiperativo: {
      insight: 'Rigidez excessiva ou apego material. Flexibilidade é necessária.',
      practice: 'Pratique yoga fluido e exercícios de mobilidade para soltar tensões.',
    },
  },
  Svadhisthana: {
    bloqueado: { insight: 'Bloqueio criativo e emocional. Dificuldade de fluidez.', practice: 'Hidrate-se abundantemente, dance livremente e conecte-se com água (banho longo, natação).' },
    subativo: { insight: 'Emoções contidas. Pouca expressão criativa.', practice: 'Aumente a hidratação e permita-se atividades artísticas ou lúdicas.' },
    equilibrado: { insight: 'Fluxo emocional saudável. Criatividade e prazer em equilíbrio.', practice: 'Continue nutrindo relações e atividades que trazem alegria genuína.' },
    hiperativo: { insight: 'Emocionalidade excessiva ou compulsividade.', practice: 'Meditação focada e respiração abdominal para modular as emoções.' },
  },
  Manipura: {
    bloqueado: { insight: 'Digestão lenta, baixa autoestima e falta de iniciativa.', practice: 'Gengibre quente em jejum, exercícios core e especiarias para acender o Agni.' },
    subativo: { insight: 'Poder pessoal em desenvolvimento. Agni digestivo moderado.', practice: 'Aumente atividade física e inclua especiarias amarelas (cúrcuma, gengibre).' },
    equilibrado: { insight: 'Fogo digestivo forte, boa autoconfiança e metabolismo ativo.', practice: 'Mantenha alimentação rica em fibras e atividade física regular.' },
    hiperativo: { insight: 'Excesso de controle, irritabilidade ou inflamação.', practice: 'Reduza alimentos ácidos e picantes. Pratique respiração refrescante (Shitali).' },
  },
  Anahata: {
    bloqueado: { insight: 'Coração fechado. Dificuldade de conexão emocional e compaixão.', practice: 'Pranayama de coerência cardíaca (5s inspiração, 5s expiração) e atos de gentileza.' },
    subativo: { insight: 'Coração se abrindo. HRV pode melhorar com práticas de compaixão.', practice: 'Meditação de amor-bondade (Metta) e exercícios aeróbicos leves.' },
    equilibrado: { insight: 'Coerência cardíaca excelente. Compaixão e amor incondicional fluem.', practice: 'Sustente com gratidão diária e conexões afetivas genuínas.' },
    hiperativo: { insight: 'Excesso de doação ou codependência emocional.', practice: 'Estabeleça limites saudáveis e pratique autocompaixão antes de cuidar dos outros.' },
  },
  Vishuddha: {
    bloqueado: { insight: 'Dificuldade de expressão. Respiração superficial.', practice: 'Canto, mantra Om e exercícios de respiração rítmica.' },
    subativo: { insight: 'Expressão parcial. Ritmos circadianos em ajuste.', practice: 'Melhore a regularidade do sono e pratique leitura em voz alta.' },
    equilibrado: { insight: 'Comunicação clara. Ritmos biológicos harmônicos.', practice: 'Mantenha a consistência dos horários e pratique escuta ativa.' },
    hiperativo: { insight: 'Fala excessiva ou agitação mental noturna.', practice: 'Pratique silêncio intencional (Mauna) e reduza estímulos antes de dormir.' },
  },
  Ajna: {
    bloqueado: { insight: 'Confusão mental, dificuldade de foco e visão turva.', practice: 'Meditação Trataka (foco na chama), sono REM adequado e redução de telas.' },
    subativo: { insight: 'Intuição em desenvolvimento. Cognição pode ser ampliada.', practice: 'Aumente o tempo de meditação e garanta sono REM suficiente (>90 min).' },
    equilibrado: { insight: 'Clareza mental e boa intuição. Processamento cognitivo eficiente.', practice: 'Continue praticando meditação e desafios cognitivos leves.' },
    hiperativo: { insight: 'Hiperatividade mental, insônia por excesso de pensamento.', practice: 'Yoga Nidra para desacelerar e técnica 4-7-8 de respiração para dormir.' },
  },
  Sahasrara: {
    bloqueado: { insight: 'Desconexão espiritual. Sensação de falta de propósito.', practice: 'Meditação silenciosa diária (mesmo 5 minutos) e contato com a natureza.' },
    subativo: { insight: 'Conexão sutil emergindo. Estresse ainda interfere.', practice: 'Amplie meditação gradualmente e pratique gratidão profunda ao acordar.' },
    equilibrado: { insight: 'Senso de unidade e propósito. Estado de presença expansiva.', practice: 'Mantenha a prática meditativa e alimente-se de forma sátvica (pura e leve).' },
    hiperativo: { insight: 'Dissociação do corpo físico ou escapismo espiritual.', practice: 'Reconecte-se com o corpo: exercícios físicos, alimentação nutritiva e aterramento.' },
  },
};

/**
 * Função principal: calcula o alinhamento dos 7 chakras a partir
 * de biomarcadores fisiológicos mensuráveis.
 */
export function calculateChakraAlignment(
  metrics: ChakraMetricSnapshot
): ChakraAlignmentResult {
  const calculators = [
    { name: 'Muladhara', label: 'Raiz (Muladhara)', color: '#EF4444', toneClass: 'text-red-500', calc: calcMuladhara },
    { name: 'Svadhisthana', label: 'Sacro (Svadhisthana)', color: '#F97316', toneClass: 'text-orange-500', calc: calcSvadhisthana },
    { name: 'Manipura', label: 'Plexo Solar (Manipura)', color: '#EAB308', toneClass: 'text-yellow-500', calc: calcManipura },
    { name: 'Anahata', label: 'Coração (Anahata)', color: '#22C55E', toneClass: 'text-green-500', calc: calcAnahata },
    { name: 'Vishuddha', label: 'Garganta (Vishuddha)', color: '#3B82F6', toneClass: 'text-blue-500', calc: calcVishuddha },
    { name: 'Ajna', label: 'Terceiro Olho (Ajna)', color: '#6366F1', toneClass: 'text-indigo-500', calc: calcAjna },
    { name: 'Sahasrara', label: 'Coroa (Sahasrara)', color: '#A855F7', toneClass: 'text-purple-500', calc: calcSahasrara },
  ];

  const chakras: ChakraScore[] = calculators.map(({ name, label, color, toneClass, calc }) => {
    const score = calc(metrics);
    const status = getChakraStatus(score);
    const chakraInsights = CHAKRA_INSIGHTS[name][status];

    return {
      name,
      label,
      color,
      toneClass,
      score,
      status,
      insight: chakraInsights.insight,
      practice: chakraInsights.practice,
    };
  });

  const overallScore = Math.round(
    chakras.reduce((sum, c) => sum + c.score, 0) / chakras.length
  );

  let overallLabel: string;
  if (overallScore <= 30) overallLabel = 'Desalinhado — atenção holística necessária';
  else if (overallScore <= 50) overallLabel = 'Parcialmente alinhado — ajustes em progresso';
  else if (overallScore <= 75) overallLabel = 'Bem alinhado — harmonia crescente';
  else overallLabel = 'Plenamente alinhado — fluxo vital aberto';

  return { overallScore, overallLabel, chakras };
}
