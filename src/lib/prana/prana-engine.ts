/**
 * Motor de Índice Pránico (Energia Vital) — Lyra MetaCare
 *
 * Calcula o Prana Index: uma métrica que quantifica a energia vital
 * disponível no organismo, baseada na tradição védica do Prana
 * (força vital que permeia tudo) e medida por biomarcadores modernos.
 *
 * O Prana se manifesta nos 5 Vayus (ventos vitais):
 * 1. Prana Vayu  → Respiração, SpO₂, capacidade pulmonar
 * 2. Apana Vayu  → Eliminação, digestão, fibras, hidratação
 * 3. Samana Vayu → Metabolismo, glicose, equilíbrio térmico
 * 4. Udana Vayu  → Expressão, humor, comunicação, cognição
 * 5. Vyana Vayu  → Circulação, HRV, FC, movimento, passos
 *
 * Score final: 0-100 (média ponderada dos 5 Vayus)
 */

import type { AstrologicalData } from '@/lib/astrology/engine';

/** Biomarcadores para o cálculo pránico. */
export interface PranicMetricSnapshot {
  spo2_average: number | null;
  respiratory_rate: number | null;
  meditation_minutes: number | null;
  dietary_fiber_grams: number | null;
  water_liters: number | null;
  hydration_ml_per_kg: number | null;
  blood_glucose_mgdl: number | null;
  body_temperature_celsius: number | null;
  eating_window_hours: number | null;
  mood_score: number | null;
  cognitive_test_score: number | null;
  reaction_time_pvt_ms: number | null;
  hrv_ms: number | null;
  resting_heart_rate: number | null;
  steps: number | null;
  active_minutes: number | null;
  vo2_max: number | null;
}

/** Score de um Vayu individual. */
export interface VayuScore {
  /** Nome do Vayu em sânscrito. */
  name: string;
  /** Nome em português. */
  label: string;
  /** Domínio funcional. */
  domain: string;
  /** Score (0-100). */
  score: number;
  /** Insight textual do estado. */
  insight: string;
}

/** Resultado completo do Índice Pránico. */
export interface PranicIndexResult {
  /** Índice Pránico total (0-100). */
  index: number;
  /** Classificação textual. */
  level: 'desvitalizado' | 'em recuperação' | 'vital' | 'radiante';
  /** Descrição do estado energético. */
  description: string;
  /** Scores dos 5 Vayus. */
  vayus: VayuScore[];
  /** Influência lunar sobre o prana. */
  lunarInfluence: string | null;
  /** Prática recomendada para elevar o prana. */
  recommendation: string;
}

function safeNum(value: number | null | undefined, fallback = 0): number {
  return value !== null && value !== undefined && Number.isFinite(value)
    ? value
    : fallback;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Prana Vayu: governa a inalação, absorção de energia e oxigenação.
 */
function calcPranaVayu(m: PranicMetricSnapshot): VayuScore {
  const spo2 = safeNum(m.spo2_average, 96);
  const resp = safeNum(m.respiratory_rate, 16);
  const meditation = safeNum(m.meditation_minutes, 0);

  let score = 40;

  if (spo2 >= 98) score += 25;
  else if (spo2 >= 96) score += 15;
  else if (spo2 >= 94) score += 8;

  // Respiração calma e rítmica (12-16 rpm) = prana fluindo
  if (resp >= 12 && resp <= 16) score += 20;
  else if (resp >= 10 && resp <= 18) score += 10;

  // Pranayama/meditação amplifica prana vayu
  if (meditation >= 20) score += 20;
  else if (meditation >= 10) score += 12;
  else if (meditation > 0) score += meditation;

  const s = clamp(score);
  let insight: string;
  if (s >= 75)
    insight =
      'Prana Vayu forte — boa captação de energia vital pela respiração.';
  else if (s >= 50)
    insight = 'Prana Vayu moderado — pranayama pode amplificar a absorção.';
  else insight = 'Prana Vayu fraco — priorize respiração consciente e ar puro.';

  return {
    name: 'Prana',
    label: 'Prana Vayu',
    domain: 'Respiração e absorção',
    score: s,
    insight,
  };
}

/**
 * Apana Vayu: governa a eliminação, desintoxicação e digestão baixa.
 */
function calcApanaVayu(m: PranicMetricSnapshot): VayuScore {
  const fiber = safeNum(m.dietary_fiber_grams, 18);
  const water = safeNum(m.water_liters, 1.5);
  const hydration = safeNum(m.hydration_ml_per_kg, 25);

  let score = 40;

  // Fibras adequadas (>25g) = eliminação saudável
  if (fiber >= 25) score += 22;
  else if (fiber >= 15) score += 12;
  else score += fiber * 0.5;

  // Hidratação boa
  if (water >= 2.5) score += 20;
  else if (water >= 2.0) score += 12;
  else if (water >= 1.0) score += 5;

  // Hidratação por kg
  if (hydration >= 35) score += 18;
  else if (hydration >= 30) score += 12;
  else if (hydration >= 20) score += 6;

  const s = clamp(score);
  let insight: string;
  if (s >= 75)
    insight = 'Apana Vayu forte — eliminação e desintoxicação funcionais.';
  else if (s >= 50)
    insight = 'Apana Vayu moderado — aumente fibras e hidratação fracionada.';
  else
    insight = 'Apana Vayu fraco — priorize água, fibras e alimentos integrais.';

  return {
    name: 'Apana',
    label: 'Apana Vayu',
    domain: 'Eliminação e desintoxicação',
    score: s,
    insight,
  };
}

/**
 * Samana Vayu: governa a digestão, assimilação e equilíbrio metabólico.
 */
function calcSamanaVayu(m: PranicMetricSnapshot): VayuScore {
  const glucose = safeNum(m.blood_glucose_mgdl, 90);
  const temp = safeNum(m.body_temperature_celsius, 36.6);
  const window = safeNum(m.eating_window_hours, 12);

  let score = 45;

  // Glicose equilibrada (70-99)
  if (glucose >= 70 && glucose <= 99) score += 25;
  else if (glucose >= 60 && glucose <= 115) score += 12;
  else score -= 5;

  // Temperatura corporal estável (36.2-37.0)
  if (temp >= 36.2 && temp <= 37.0) score += 15;
  else if (temp >= 35.8 && temp <= 37.4) score += 8;

  // Janela alimentar restrita (<10h) = fogo digestivo concentrado
  if (window <= 10) score += 18;
  else if (window <= 12) score += 10;
  else score += 3;

  const s = clamp(score);
  let insight: string;
  if (s >= 75)
    insight = 'Samana Vayu forte — Agni digestivo aceso e metabolismo estável.';
  else if (s >= 50)
    insight =
      'Samana Vayu moderado — considere jejum intermitente leve para fortalecer.';
  else
    insight =
      'Samana Vayu fraco — simplifique refeições e use especiarias digestivas.';

  return {
    name: 'Samana',
    label: 'Samana Vayu',
    domain: 'Digestão e metabolismo',
    score: s,
    insight,
  };
}

/**
 * Udana Vayu: governa a expressão, comunicação, crescimento e cognição.
 */
function calcUdanaVayu(m: PranicMetricSnapshot): VayuScore {
  const mood = safeNum(m.mood_score, 3);
  const cognitive = safeNum(m.cognitive_test_score, 0.5);
  const pvt = safeNum(m.reaction_time_pvt_ms, 300);

  let score = 40;

  // Humor alto = expressão livre
  if (mood >= 4) score += 22;
  else if (mood >= 3) score += 12;
  else score += mood * 3;

  // Cognição alta
  if (cognitive >= 0.7) score += 20;
  else if (cognitive >= 0.4) score += 10;
  else score += 5;

  // Reação rápida = clareza de expressão
  if (pvt > 0 && pvt < 250) score += 18;
  else if (pvt > 0 && pvt < 350) score += 10;
  else score += 5;

  const s = clamp(score);
  let insight: string;
  if (s >= 75)
    insight =
      'Udana Vayu forte — expressão clara, criatividade e cognição afiada.';
  else if (s >= 50)
    insight =
      'Udana Vayu moderado — pratique leitura, canto ou ensino para fortalecer.';
  else
    insight =
      'Udana Vayu fraco — silêncio regenerativo e atividades criativas são recomendados.';

  return {
    name: 'Udana',
    label: 'Udana Vayu',
    domain: 'Expressão e cognição',
    score: s,
    insight,
  };
}

/**
 * Vyana Vayu: governa a circulação, distribuição de energia e movimento.
 */
function calcVyanaVayu(m: PranicMetricSnapshot): VayuScore {
  const hrv = safeNum(m.hrv_ms, 50);
  const fc = safeNum(m.resting_heart_rate, 68);
  const steps = safeNum(m.steps, 5000);
  const active = safeNum(m.active_minutes, 30);
  const vo2 = safeNum(m.vo2_max, 35);

  let score = 35;

  // HRV boa = circulação vital
  if (hrv >= 50 && hrv <= 85) score += 18;
  else if (hrv >= 35) score += 10;

  // FC baixa
  if (fc <= 60) score += 12;
  else if (fc <= 70) score += 7;

  // Movimento (passos)
  if (steps >= 10000) score += 15;
  else if (steps >= 7000) score += 10;
  else if (steps >= 4000) score += 5;

  // Atividade moderada/vigorosa
  if (active >= 45) score += 12;
  else if (active >= 20) score += 7;

  // VO₂max alto
  if (vo2 >= 45) score += 10;
  else if (vo2 >= 35) score += 5;

  const s = clamp(score);
  let insight: string;
  if (s >= 75)
    insight =
      'Vyana Vayu forte — circulação de energia vital excelente em todo o corpo.';
  else if (s >= 50)
    insight =
      'Vyana Vayu moderado — aumente movimento e exercícios cardiovasculares.';
  else
    insight =
      'Vyana Vayu fraco — priorize caminhadas, alongamento e massagem (Abhyanga).';

  return {
    name: 'Vyana',
    label: 'Vyana Vayu',
    domain: 'Circulação e movimento',
    score: s,
    insight,
  };
}

/**
 * Calcula a influência lunar sobre o Prana.
 */
function buildLunarInfluence(astro: AstrologicalData | null): string | null {
  if (!astro) return null;

  const phase = astro.moonPhase;
  if (phase >= 0.45 && phase <= 0.55) {
    return `Lua Cheia em ${astro.moonSign}: Prana no pico de expansão. Energia abundante porém dispersiva — canalize com intenção clara e práticas de foco.`;
  }
  if (phase <= 0.06 || phase >= 0.94) {
    return `Lua Nova em ${astro.moonSign}: Prana em recolhimento e regeneração. Momento ideal para introspecção, jejum leve e plantio de intenções.`;
  }
  if (astro.paksha === 'Shukla Paksha') {
    return `Lua Crescente em ${astro.moonSign}: Prana em ascensão gradual. Construa hábitos, amplie atividades e absorva nutrientes com mais consciência.`;
  }
  return `Lua Minguante em ${astro.moonSign}: Prana em depuração. Libere o que não serve mais — hábitos, toxinas e pensamentos estagnados.`;
}

/**
 * Função principal: calcula o Índice Pránico completo.
 */
export function calculatePranicIndex(
  metrics: PranicMetricSnapshot,
  astrology: AstrologicalData | null = null
): PranicIndexResult {
  const vayus = [
    calcPranaVayu(metrics),
    calcApanaVayu(metrics),
    calcSamanaVayu(metrics),
    calcUdanaVayu(metrics),
    calcVyanaVayu(metrics),
  ];

  // Pesos: Prana (25%), Vyana (22%), Samana (20%), Apana (18%), Udana (15%)
  const weights = [0.25, 0.18, 0.2, 0.15, 0.22];
  let weightedSum = 0;
  for (let i = 0; i < vayus.length; i++) {
    weightedSum += vayus[i].score * weights[i];
  }

  // Bônus lunar: +5 se lua crescente/cheia (prana expandido)
  if (astrology) {
    const phase = astrology.moonPhase;
    if (phase >= 0.1 && phase <= 0.55) {
      weightedSum += 5;
    }
  }

  const index = clamp(Math.round(weightedSum));

  let level: PranicIndexResult['level'];
  if (index <= 30) level = 'desvitalizado';
  else if (index <= 55) level = 'em recuperação';
  else if (index <= 80) level = 'vital';
  else level = 'radiante';

  const descriptions: Record<string, string> = {
    desvitalizado:
      'Sua energia vital (Prana) está significativamente baixa. Os canais energéticos (Nadis) precisam de atenção urgente através de respiração, hidratação e descanso.',
    'em recuperação':
      'Seu Prana está em processo de recuperação. Alguns Vayus já mostram sinais de vitalidade mas outros precisam de suporte.',
    vital:
      'Boa vitalidade pránica. Seus 5 Vayus estão fluindo de forma adequada, sustentando as funções vitais com eficiência.',
    radiante:
      'Estado excepcional de energia vital. Todos os 5 Vayus estão ativos e em harmonia. Seu Prana irradia força e clareza.',
  };

  // A recomendação foca no Vayu mais fraco
  const weakestVayu = [...vayus].sort((a, b) => a.score - b.score)[0];
  const recommendation = `Seu Vayu mais necessitado de atenção é o ${weakestVayu.label} (${weakestVayu.domain}). ${weakestVayu.insight} Fortalecer este Vayu elevará significativamente sua energia vital global.`;

  return {
    index,
    level,
    description: descriptions[level],
    vayus,
    lunarInfluence: buildLunarInfluence(astrology),
    recommendation,
  };
}
