/**
 * Motor Ayurvédico Dinâmico de Doshas — Lyra MetaCare
 *
 * Calcula o dosha dominante (Vata, Pitta, Kapha) a partir de
 * biomarcadores fisiológicos reais do dia, não de questionários estáticos.
 *
 * Fundamentação: cada dosha é mapeado para padrões mensuráveis:
 * - VATA: variabilidade alta, leveza, irregularidade (HRV alto, sono curto, peso baixo)
 * - PITTA: calor, metabolismo acelerado, inflamação (temperatura alta, glicose alta, FC alta)
 * - KAPHA: estabilidade, retenção, lentidão (sedentarismo alto, sono longo, peso alto)
 */

import type { AstrologicalData } from '@/lib/astrology/engine';

/** Biomarcadores necessários para o cálculo do dosha dinâmico. */
export interface DoshaMetricSnapshot {
  hrv_ms: number | null;
  resting_heart_rate: number | null;
  body_temperature_celsius: number | null;
  sleep_duration_minutes: number | null;
  deep_sleep_minutes: number | null;
  active_minutes: number | null;
  sedentary_hours: number | null;
  blood_glucose_mgdl: number | null;
  weight_kg: number | null;
  stress_score: number | null;
  water_liters: number | null;
  respiratory_rate: number | null;
  mood_score: number | null;
}

/** Resultado completo do cálculo de dosha dinâmico. */
export interface DoshaResult {
  /** Dosha dominante do momento. */
  dominant: 'vata' | 'pitta' | 'kapha';
  /** Scores individuais de cada dosha (0 a 100). */
  scores: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  /** Percentuais normalizados. */
  percentages: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  /** Prakriti estimada (constituição natural) em formato textual. */
  prakritiLabel: string;
  /** Recomendações ayurvédicas contextualizadas ao dosha dominante. */
  recommendations: {
    nutrition: string;
    exercise: string;
    routine: string;
    herbs: string;
  };
  /** Influência astrológica sobre o dosha (se disponível). */
  astroInfluence: string | null;
}

/**
 * Mapeia cada signo lunar védico a um dosha dominante conforme a tradição ayurvédica.
 * Os signos de fogo tendem a Pitta, de terra a Kapha, de ar a Vata, de água a Kapha/Pitta.
 */
const MOON_SIGN_DOSHA_MAP: Record<string, 'vata' | 'pitta' | 'kapha'> = {
  Áries: 'pitta',
  Touro: 'kapha',
  Gêmeos: 'vata',
  Câncer: 'kapha',
  Leão: 'pitta',
  Virgem: 'vata',
  Libra: 'vata',
  Escorpião: 'pitta',
  Sagitário: 'pitta',
  Capricórnio: 'vata',
  Aquário: 'vata',
  Peixes: 'kapha',
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function safeNum(value: number | null | undefined, fallback = 0): number {
  return value !== null && value !== undefined && Number.isFinite(value)
    ? value
    : fallback;
}

/**
 * Calcula o score Vata a partir dos biomarcadores.
 * Vata se manifesta com: HRV alto e irregular, sono curto, peso baixo,
 * estresse alto, hidratação baixa, frequência respiratória alta.
 */
function calculateVataScore(metrics: DoshaMetricSnapshot): number {
  const hrv = safeNum(metrics.hrv_ms, 50);
  const sleep = safeNum(metrics.sleep_duration_minutes, 420);
  const weight = safeNum(metrics.weight_kg, 70);
  const stress = safeNum(metrics.stress_score, 50);
  const water = safeNum(metrics.water_liters, 2);
  const respiratory = safeNum(metrics.respiratory_rate, 16);
  const mood = safeNum(metrics.mood_score, 3);

  let score = 50;

  // HRV muito alto (>80) ou muito baixo (<25) = Vata agravado
  if (hrv > 80) score += (hrv - 80) * 0.6;
  if (hrv < 25) score += (25 - hrv) * 0.8;

  // Sono curto (<360 min / 6h) = Vata alto
  if (sleep < 360) score += (360 - sleep) * 0.08;

  // Peso abaixo de 60 = tendência Vata
  if (weight < 60) score += (60 - weight) * 0.5;

  // Estresse elevado = Vata agravado
  if (stress > 60) score += (stress - 60) * 0.4;

  // Desidratação = Vata
  if (water < 1.5) score += (1.5 - water) * 15;

  // Respiração acelerada = Vata
  if (respiratory > 18) score += (respiratory - 18) * 2;

  // Humor baixo e instável = Vata
  if (mood < 3) score += (3 - mood) * 8;

  return clamp(score);
}

/**
 * Calcula o score Pitta a partir dos biomarcadores.
 * Pitta se manifesta com: temperatura alta, FC alta, glicose alta,
 * atividade intensa, metabolismo acelerado.
 */
function calculatePittaScore(metrics: DoshaMetricSnapshot): number {
  const temp = safeNum(metrics.body_temperature_celsius, 36.6);
  const fc = safeNum(metrics.resting_heart_rate, 65);
  const glucose = safeNum(metrics.blood_glucose_mgdl, 90);
  const active = safeNum(metrics.active_minutes, 30);
  const stress = safeNum(metrics.stress_score, 50);

  let score = 50;

  // Temperatura elevada (>37) = Pitta
  if (temp > 37) score += (temp - 37) * 20;

  // FC repouso alta (>72) = metabolismo Pitta
  if (fc > 72) score += (fc - 72) * 0.8;

  // Glicose elevada (>110) = calor metabólico Pitta
  if (glucose > 110) score += (glucose - 110) * 0.3;

  // Atividade intensa (>90 min) = Pitta predominante
  if (active > 90) score += (active - 90) * 0.2;

  // Estresse moderado-alto com calor = Pitta
  if (stress > 50 && temp > 36.8) score += (stress - 50) * 0.25;

  return clamp(score);
}

/**
 * Calcula o score Kapha a partir dos biomarcadores.
 * Kapha se manifesta com: sono longo, sedentarismo, peso elevado,
 * sono profundo extenso, estabilidade metabólica.
 */
function calculateKaphaScore(metrics: DoshaMetricSnapshot): number {
  const sleep = safeNum(metrics.sleep_duration_minutes, 420);
  const deepSleep = safeNum(metrics.deep_sleep_minutes, 90);
  const sedentary = safeNum(metrics.sedentary_hours, 6);
  const weight = safeNum(metrics.weight_kg, 70);
  const active = safeNum(metrics.active_minutes, 30);

  let score = 50;

  // Sono muito longo (>540 min / 9h) = Kapha
  if (sleep > 540) score += (sleep - 540) * 0.06;

  // Sono profundo extenso (>120 min) = Kapha forte
  if (deepSleep > 120) score += (deepSleep - 120) * 0.15;

  // Sedentarismo alto (>10h) = Kapha agravado
  if (sedentary > 10) score += (sedentary - 10) * 4;

  // Peso elevado (>90) = tendência Kapha
  if (weight > 90) score += (weight - 90) * 0.3;

  // Pouca atividade = Kapha
  if (active < 20) score += (20 - active) * 0.6;

  return clamp(score);
}

/**
 * Gera recomendações ayurvédicas personalizadas para o dosha dominante.
 */
function buildRecommendations(
  dominant: 'vata' | 'pitta' | 'kapha'
): DoshaResult['recommendations'] {
  const map: Record<string, DoshaResult['recommendations']> = {
    vata: {
      nutrition:
        'Priorize alimentos quentes, oleosos e nutritivos. Sopas, ghee, raízes cozidas, gengibre e especiarias suaves (canela, cardamomo). Evite alimentos crus, frios e secos.',
      exercise:
        'Pratique exercícios suaves e estabilizadores: yoga restaurativo, caminhada leve, tai chi. Evite atividades muito intensas ou erráticas que aumentem a dispersão.',
      routine:
        'Mantenha horários fixos para dormir, comer e meditar. Regularidade é o antídoto do Vata. Massagem com óleo de gergelim morno (Abhyanga) antes do banho é altamente recomendada.',
      herbs:
        'Ashwagandha para aterramento e força, Brahmi para clareza mental, Triphala para digestão suave e Shatavari para nutrição dos tecidos.',
    },
    pitta: {
      nutrition:
        'Priorize alimentos frescos, doces e amargos. Saladas com pepino, coco, hortelã, coentro. Evite alimentos picantes, ácidos, fermentados e excesso de cafeína.',
      exercise:
        'Prefira exercícios moderados em horários frescos (manhã cedo ou fim de tarde). Natação, ciclismo leve, yoga com foco em abertura. Evite competição excessiva.',
      routine:
        'Evite exposição prolongada ao calor e ao sol do meio-dia. Pratique respiração refrescante (Shitali Pranayama). Mantenha pausas estratégicas entre tarefas intensas.',
      herbs:
        'Shatavari para resfriar, Amalaki (amla) como antioxidante poderoso, Brahmi para pacificar a mente agitada e Neem para purificação.',
    },
    kapha: {
      nutrition:
        'Priorize alimentos leves, secos, picantes e amargos. Especiarias quentes (gengibre, pimenta preta, cúrcuma). Evite laticínios pesados, doces excessivos e frituras.',
      exercise:
        'Pratique exercícios vigorosos e estimulantes: corrida, HIIT, dança, vinyasa yoga dinâmico. O movimento intenso é o melhor pacificador de Kapha.',
      routine:
        'Acorde antes das 6h (evite o período Kapha da manhã). Evite cochilos diurnos. Pratique escovação a seco (Garshana) para estimular circulação linfática.',
      herbs:
        'Trikatu (gengibre + pimenta preta + pimenta longa) para acender o Agni digestivo, Guggulu para metabolismo e Punarnava para drenagem de fluidos.',
    },
  };

  return map[dominant];
}

/**
 * Calcula a influência astrológica védica sobre o dosha do momento.
 */
function buildAstroInfluence(
  astrology: AstrologicalData | null
): string | null {
  if (!astrology) return null;

  const moonDosha = MOON_SIGN_DOSHA_MAP[astrology.moonSign] ?? 'vata';
  const moonPhase = astrology.moonPhase;

  let phaseInfluence: string;
  if (moonPhase >= 0.45 && moonPhase <= 0.55) {
    phaseInfluence =
      'Lua Cheia amplifica Pitta (calor, intensidade emocional e metabólica)';
  } else if (moonPhase <= 0.06 || moonPhase >= 0.94) {
    phaseInfluence =
      'Lua Nova amplifica Vata (introspecção, leveza, tendência à dispersão)';
  } else if (astrology.paksha === 'Shukla Paksha') {
    phaseInfluence =
      'Lua crescente amplifica Kapha (crescimento, acúmulo, nutrição)';
  } else {
    phaseInfluence =
      'Lua minguante amplifica Vata (depuração, liberação, leveza)';
  }

  return `Lua em ${astrology.moonSign} (dosha lunar: ${moonDosha.charAt(0).toUpperCase() + moonDosha.slice(1)}). ${phaseInfluence}. Nakshatra ${astrology.nakshatra} durante ${astrology.tithi}.`;
}

/**
 * Função principal: calcula o dosha dinâmico do momento a partir
 * de biomarcadores reais e contexto astrológico védico.
 */
export function calculateDynamicDosha(
  metrics: DoshaMetricSnapshot,
  astrology: AstrologicalData | null = null
): DoshaResult {
  const vataRaw = calculateVataScore(metrics);
  const pittaRaw = calculatePittaScore(metrics);
  const kaphaRaw = calculateKaphaScore(metrics);

  // Influência astrológica: adiciona +8 pontos ao dosha correspondente ao signo lunar
  let vata = vataRaw;
  let pitta = pittaRaw;
  let kapha = kaphaRaw;

  if (astrology) {
    const moonDosha = MOON_SIGN_DOSHA_MAP[astrology.moonSign] ?? 'vata';
    const astroBoost = 8;

    if (moonDosha === 'vata') vata = clamp(vata + astroBoost);
    if (moonDosha === 'pitta') pitta = clamp(pitta + astroBoost);
    if (moonDosha === 'kapha') kapha = clamp(kapha + astroBoost);

    // Fase lunar modula levemente
    if (
      (astrology.moonPhase <= 0.06 || astrology.moonPhase >= 0.94) &&
      moonDosha !== 'vata'
    ) {
      vata = clamp(vata + 4);
    }
    if (
      astrology.moonPhase >= 0.45 &&
      astrology.moonPhase <= 0.55 &&
      moonDosha !== 'pitta'
    ) {
      pitta = clamp(pitta + 4);
    }
  }

  // Normalização para percentuais inteiros pelo método do maior resto: a
  // soma é sempre exatamente 100 (arredondar cada parcela separadamente
  // produzia 99 ou 101). Sem nenhum escore, as três parcelas são iguais.
  const brutos = { vata, pitta, kapha };
  const total = vata + pitta + kapha;
  const chaves = ['vata', 'pitta', 'kapha'] as const;
  const exatos = chaves.map((chave) =>
    total > 0 ? (brutos[chave] / total) * 100 : 100 / 3
  );
  const inteiros = exatos.map(Math.floor);
  const faltam = 100 - inteiros.reduce((soma, valor) => soma + valor, 0);
  [0, 1, 2]
    .sort((a, b) => exatos[b] - inteiros[b] - (exatos[a] - inteiros[a]))
    .slice(0, faltam)
    .forEach((indice) => {
      inteiros[indice] += 1;
    });
  const percentages = {
    vata: inteiros[0],
    pitta: inteiros[1],
    kapha: inteiros[2],
  };

  // Determina o dosha dominante
  let dominant: 'vata' | 'pitta' | 'kapha' = 'vata';
  if (pitta >= vata && pitta >= kapha) dominant = 'pitta';
  if (kapha >= vata && kapha >= pitta) dominant = 'kapha';

  // Prakriti label composta
  const sorted = [
    { name: 'Vata', score: vata },
    { name: 'Pitta', score: pitta },
    { name: 'Kapha', score: kapha },
  ].sort((a, b) => b.score - a.score);

  const prakritiLabel =
    sorted[0].score - sorted[1].score < 10
      ? `${sorted[0].name}-${sorted[1].name}`
      : sorted[0].name;

  return {
    dominant,
    scores: {
      vata: Math.round(vata),
      pitta: Math.round(pitta),
      kapha: Math.round(kapha),
    },
    percentages,
    prakritiLabel,
    recommendations: buildRecommendations(dominant),
    astroInfluence: buildAstroInfluence(astrology),
  };
}
