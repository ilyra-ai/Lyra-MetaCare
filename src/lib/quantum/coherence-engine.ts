/**
 * Motor de Coerência Quântica — Lyra MetaCare
 *
 * Calcula o Índice de Coerência Quântica (ICQ): a convergência matemática
 * entre o estado biológico vibracional do usuário e os ciclos cósmicos do momento.
 *
 * Fundamentação: aplica-se o princípio de ressonância — quando os ritmos
 * biológicos (HRV, sono, respiração) estão em fase com os ciclos lunares
 * e nakshatras, a coerência é máxima.
 *
 * O ICQ varia de 0 a 100:
 * - 0-30: Dissonância (desalinhamento bio-cósmico)
 * - 31-60: Transição (ajustes necessários)
 * - 61-80: Harmonia (boa ressonância)
 * - 81-100: Coerência Plena (estado ótimo de alinhamento)
 */

import type { AstrologicalData } from '@/lib/astrology/engine';

/** Biomarcadores para o cálculo de coerência quântica. */
export interface CoherenceMetricSnapshot {
  hrv_ms: number | null;
  resting_heart_rate: number | null;
  sleep_duration_minutes: number | null;
  deep_sleep_minutes: number | null;
  rem_sleep_minutes: number | null;
  spo2_average: number | null;
  respiratory_rate: number | null;
  stress_score: number | null;
  mood_score: number | null;
  meditation_minutes: number | null;
  sleep_regularity_index: number | null;
}

/** Resultado do cálculo de coerência quântica. */
export interface QuantumCoherenceResult {
  /** Índice de Coerência Quântica (0-100). */
  index: number;
  /** Classificação textual do estado de coerência. */
  level: 'dissonância' | 'transição' | 'harmonia' | 'coerência plena';
  /** Descrição do estado atual. */
  description: string;
  /** Componentes individuais do cálculo (para transparência). */
  components: {
    bioResonance: number;
    cosmicAlignment: number;
    consciousnessDepth: number;
    rhythmicCoherence: number;
  };
  /** Recomendação para elevar a coerência. */
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
 * Bio-Ressonância: mede o quão harmonioso está o sistema nervoso autônomo.
 * HRV ótimo (45-80ms), FC repouso baixa (<65), SpO₂ alta (>95%).
 */
function calculateBioResonance(metrics: CoherenceMetricSnapshot): number {
  const hrv = safeNum(metrics.hrv_ms, 50);
  const fc = safeNum(metrics.resting_heart_rate, 68);
  const spo2 = safeNum(metrics.spo2_average, 96);

  let score = 0;

  // HRV na faixa ótima (45-80ms) = máxima ressonância
  if (hrv >= 45 && hrv <= 80) {
    score += 40;
  } else if (hrv >= 30 && hrv < 45) {
    score += 25 + ((hrv - 30) / 15) * 15;
  } else if (hrv > 80 && hrv <= 100) {
    score += 30 + ((100 - hrv) / 20) * 10;
  } else {
    score += Math.max(0, 20 - Math.abs(hrv - 60) * 0.5);
  }

  // FC repouso baixa = sistema parassimpático dominante
  if (fc <= 58) score += 35;
  else if (fc <= 65) score += 28 + ((65 - fc) / 7) * 7;
  else if (fc <= 75) score += 15 + ((75 - fc) / 10) * 13;
  else score += Math.max(0, 15 - (fc - 75) * 0.5);

  // SpO₂ alta = boa oxigenação celular
  if (spo2 >= 97) score += 25;
  else if (spo2 >= 95) score += 18 + ((spo2 - 95) / 2) * 7;
  else score += Math.max(0, 10 - (95 - spo2) * 3);

  return clamp(score);
}

/**
 * Alinhamento Cósmico: mede a ressonância entre biomarcadores
 * e o ciclo lunar/nakshatra atual.
 */
function calculateCosmicAlignment(
  metrics: CoherenceMetricSnapshot,
  astro: AstrologicalData | null
): number {
  if (!astro) return 50;

  const moonPhase = astro.moonPhase;
  const stress = safeNum(metrics.stress_score, 50);
  const sleep = safeNum(metrics.sleep_duration_minutes, 420);
  const hrv = safeNum(metrics.hrv_ms, 50);

  let score = 50;

  // Lua Nova: corpo deve estar em modo introspecção (estresse baixo, sono bom)
  if (moonPhase <= 0.06 || moonPhase >= 0.94) {
    if (stress < 40 && sleep >= 420) score += 25;
    else if (stress < 60) score += 12;
    else score -= 10;
  }

  // Lua Cheia: corpo deve estar energizado mas controlado
  if (moonPhase >= 0.45 && moonPhase <= 0.55) {
    if (hrv >= 50 && stress < 50) score += 25;
    else if (hrv >= 35) score += 10;
    else score -= 8;
  }

  // Shukla Paksha (crescente): energia crescente alinhada com atividade
  if (
    astro.paksha === 'Shukla Paksha' &&
    moonPhase > 0.06 &&
    moonPhase < 0.45
  ) {
    if (hrv >= 45 && sleep >= 390) score += 15;
  }

  // Krishna Paksha (minguante): recuperação alinhada com recolhimento
  if (
    astro.paksha === 'Krishna Paksha' &&
    moonPhase > 0.55 &&
    moonPhase < 0.94
  ) {
    if (stress < 45 && sleep >= 450) score += 15;
  }

  return clamp(score);
}

/**
 * Profundidade de Consciência: mede a qualidade do sono profundo,
 * meditação e estabilidade emocional — os "campos sutis" do ser.
 */
function calculateConsciousnessDepth(
  metrics: CoherenceMetricSnapshot
): number {
  const deepSleep = safeNum(metrics.deep_sleep_minutes, 80);
  const rem = safeNum(metrics.rem_sleep_minutes, 80);
  const meditation = safeNum(metrics.meditation_minutes, 0);
  const mood = safeNum(metrics.mood_score, 3);

  let score = 0;

  // Sono profundo (ideal 90-150 min)
  if (deepSleep >= 90 && deepSleep <= 150) score += 30;
  else if (deepSleep >= 60) score += 20;
  else score += Math.max(0, deepSleep * 0.25);

  // Sono REM (ideal 90-120 min)
  if (rem >= 90 && rem <= 120) score += 25;
  else if (rem >= 60) score += 15;
  else score += Math.max(0, rem * 0.2);

  // Meditação amplifica consciência
  if (meditation >= 20) score += 25;
  else if (meditation >= 10) score += 15;
  else if (meditation > 0) score += meditation;

  // Humor alto = estabilidade emocional
  if (mood >= 4) score += 20;
  else if (mood >= 3) score += 12;
  else score += mood * 3;

  return clamp(score);
}

/**
 * Coerência Rítmica: mede a regularidade dos ritmos circadianos
 * e a estabilidade respiratória.
 */
function calculateRhythmicCoherence(
  metrics: CoherenceMetricSnapshot
): number {
  const sri = safeNum(metrics.sleep_regularity_index, 60);
  const respiratory = safeNum(metrics.respiratory_rate, 16);
  const stress = safeNum(metrics.stress_score, 50);

  let score = 0;

  // Índice de Regularidade do Sono (ideal > 80)
  if (sri >= 80) score += 40;
  else if (sri >= 60) score += 25 + ((sri - 60) / 20) * 15;
  else score += Math.max(0, sri * 0.35);

  // Frequência respiratória na faixa ideal (12-18 rpm)
  if (respiratory >= 12 && respiratory <= 18) score += 35;
  else if (respiratory >= 10 && respiratory <= 20) score += 22;
  else score += 10;

  // Estresse baixo = ritmo coerente
  if (stress <= 30) score += 25;
  else if (stress <= 50) score += 18;
  else if (stress <= 70) score += 8;

  return clamp(score);
}

/**
 * Gera a descrição e recomendação baseada no nível de coerência.
 */
function buildCoherenceInsight(
  level: QuantumCoherenceResult['level'],
  components: QuantumCoherenceResult['components']
): { description: string; recommendation: string } {
  const weakest = Object.entries(components).sort(
    ([, a], [, b]) => a - b
  )[0][0];

  const weakLabels: Record<string, string> = {
    bioResonance: 'ressonância biológica (HRV, FC, SpO₂)',
    cosmicAlignment: 'alinhamento com os ciclos cósmicos',
    consciousnessDepth: 'profundidade de consciência (sono profundo, meditação)',
    rhythmicCoherence: 'coerência rítmica (regularidade circadiana)',
  };

  const descriptions: Record<string, string> = {
    dissonância:
      'Seu campo bio-energético está em desarmonia com os ritmos cósmicos do momento. O sistema nervoso autônomo apresenta sinais de sobrecarga ou irregularidade.',
    transição:
      'Você está em fase de transição entre estados. Há sinais de ajuste acontecendo nos seus ritmos biológicos em relação ao ciclo cósmico vigente.',
    harmonia:
      'Boa ressonância entre seus biomarcadores e o momento cósmico. Seu sistema nervoso está respondendo bem aos estímulos e há coerência nos seus ciclos vitais.',
    'coerência plena':
      'Estado excepcional de alinhamento quântico-biológico. Seus ritmos biológicos estão em perfeita fase com os ciclos cósmicos. Aproveite este momento para decisões importantes e práticas profundas.',
  };

  return {
    description: descriptions[level],
    recommendation: `Seu ponto de maior oportunidade agora é fortalecer a ${weakLabels[weakest]}. Pequenos ajustes nesta área podem elevar significativamente sua coerência geral.`,
  };
}

/**
 * Função principal: calcula o Índice de Coerência Quântica
 * integrando biomarcadores fisiológicos com contexto astrológico védico.
 */
export function calculateQuantumCoherence(
  metrics: CoherenceMetricSnapshot,
  astrology: AstrologicalData | null = null
): QuantumCoherenceResult {
  const bioResonance = calculateBioResonance(metrics);
  const cosmicAlignment = calculateCosmicAlignment(metrics, astrology);
  const consciousnessDepth = calculateConsciousnessDepth(metrics);
  const rhythmicCoherence = calculateRhythmicCoherence(metrics);

  // Pesos: Bio (35%), Cósmico (25%), Consciência (20%), Rítmico (20%)
  const index = Math.round(
    bioResonance * 0.35 +
      cosmicAlignment * 0.25 +
      consciousnessDepth * 0.2 +
      rhythmicCoherence * 0.2
  );

  const clampedIndex = clamp(index);

  let level: QuantumCoherenceResult['level'];
  if (clampedIndex <= 30) level = 'dissonância';
  else if (clampedIndex <= 60) level = 'transição';
  else if (clampedIndex <= 80) level = 'harmonia';
  else level = 'coerência plena';

  const components = {
    bioResonance: Math.round(bioResonance),
    cosmicAlignment: Math.round(cosmicAlignment),
    consciousnessDepth: Math.round(consciousnessDepth),
    rhythmicCoherence: Math.round(rhythmicCoherence),
  };

  const { description, recommendation } = buildCoherenceInsight(
    level,
    components
  );

  return {
    index: clampedIndex,
    level,
    description,
    components,
    recommendation,
  };
}
