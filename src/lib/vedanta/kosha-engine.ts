import { AstrologicalData } from '../astrology/engine';

export type KoshaName =
  'Annamaya' | 'Pranamaya' | 'Manomaya' | 'Vijnanamaya' | 'Anandamaya';

export interface Kosha {
  name: KoshaName;
  sanskrit: string;
  translation: string;
  score: number; // 0 a 100
  status: 'Obstruído' | 'Desalinhado' | 'Fluido' | 'Radiante';
  insight: string;
}

export interface KoshaResult {
  koshas: Kosha[];
  overallScore: number;
  overallStatus: string;
  dharmaAlignment: string; // Propósito e autoconsciência
}

interface KoshaSnapshot {
  steps?: number | null;
  vo2_max?: number | null;
  dietary_fiber_grams?: number | null;
  water_liters?: number | null;
  hrv_ms?: number | null;
  respiratory_rate?: number | null;
  stress_score?: number | null;
  mood_score?: number | null;
  sleep_duration_minutes?: number | null;
  deep_sleep_minutes?: number | null;
  cognitive_test_score?: number | null;
  meditation_minutes?: number | null;
}

export function calculateKoshas(
  metrics: KoshaSnapshot,
  astro?: AstrologicalData | null
): KoshaResult {
  // 1. Annamaya Kosha (Corpo Físico/Alimento)
  let annamayaScore = 50;
  if (metrics.steps)
    annamayaScore +=
      metrics.steps > 8000 ? 20 : metrics.steps > 4000 ? 10 : -10;
  if (metrics.dietary_fiber_grams)
    annamayaScore += metrics.dietary_fiber_grams > 25 ? 15 : 5;
  if (metrics.water_liters) annamayaScore += metrics.water_liters > 2 ? 15 : 0;
  annamayaScore = Math.min(100, Math.max(0, annamayaScore));

  // 2. Pranamaya Kosha (Corpo Energético/Vital)
  let pranamayaScore = 50;
  if (metrics.hrv_ms)
    pranamayaScore += metrics.hrv_ms > 50 ? 20 : metrics.hrv_ms > 30 ? 10 : -15;
  if (metrics.respiratory_rate)
    pranamayaScore +=
      metrics.respiratory_rate < 15
        ? 15
        : metrics.respiratory_rate > 20
          ? -10
          : 5;
  if (metrics.vo2_max) pranamayaScore += metrics.vo2_max > 40 ? 15 : 0;
  pranamayaScore = Math.min(100, Math.max(0, pranamayaScore));

  // 3. Manomaya Kosha (Corpo Mental/Emocional)
  let manomayaScore = 50;
  if (metrics.stress_score) manomayaScore -= (metrics.stress_score - 50) * 0.4;
  if (metrics.mood_score) manomayaScore += (metrics.mood_score - 3) * 10;
  if (metrics.sleep_duration_minutes)
    manomayaScore += metrics.sleep_duration_minutes > 420 ? 15 : -10;
  manomayaScore = Math.min(100, Math.max(0, manomayaScore));

  // 4. Vijnanamaya Kosha (Corpo Intelectual/Sabedoria)
  let vijnanamayaScore = 50;
  if (metrics.cognitive_test_score)
    vijnanamayaScore += (metrics.cognitive_test_score - 70) * 0.5;
  if (metrics.meditation_minutes)
    vijnanamayaScore +=
      metrics.meditation_minutes > 15
        ? 25
        : metrics.meditation_minutes > 5
          ? 10
          : -5;
  vijnanamayaScore = Math.min(100, Math.max(0, vijnanamayaScore));

  // 5. Anandamaya Kosha (Corpo de Bem-Aventurança/Causal)
  let anandamayaScore = 50;
  if (metrics.deep_sleep_minutes)
    anandamayaScore += metrics.deep_sleep_minutes > 60 ? 20 : -10;
  if (metrics.meditation_minutes)
    anandamayaScore +=
      metrics.meditation_minutes > 30
        ? 20
        : metrics.meditation_minutes > 10
          ? 10
          : 0;
  if (astro && astro.impactOnHealth.energy === 'Alta') anandamayaScore += 10;
  anandamayaScore = Math.min(100, Math.max(0, anandamayaScore));

  const koshas: Kosha[] = [
    {
      name: 'Annamaya',
      sanskrit: 'अन्नमय कोष',
      translation: 'Corpo Físico',
      score: Math.round(annamayaScore),
      status: getKoshaStatus(annamayaScore),
      insight: getAnnamayaInsight(annamayaScore),
    },
    {
      name: 'Pranamaya',
      sanskrit: 'प्राणमय कोष',
      translation: 'Corpo Energético',
      score: Math.round(pranamayaScore),
      status: getKoshaStatus(pranamayaScore),
      insight: getPranamayaInsight(pranamayaScore),
    },
    {
      name: 'Manomaya',
      sanskrit: 'मनोमय कोष',
      translation: 'Corpo Mental',
      score: Math.round(manomayaScore),
      status: getKoshaStatus(manomayaScore),
      insight: getManomayaInsight(manomayaScore),
    },
    {
      name: 'Vijnanamaya',
      sanskrit: 'विज्ञानमय कोष',
      translation: 'Corpo de Sabedoria',
      score: Math.round(vijnanamayaScore),
      status: getKoshaStatus(vijnanamayaScore),
      insight: getVijnanamayaInsight(vijnanamayaScore),
    },
    {
      name: 'Anandamaya',
      sanskrit: 'आनन्दमय कोष',
      translation: 'Corpo de Bem-Aventurança',
      score: Math.round(anandamayaScore),
      status: getKoshaStatus(anandamayaScore),
      insight: getAnandamayaInsight(anandamayaScore),
    },
  ];

  const overallScore = Math.round(
    (annamayaScore +
      pranamayaScore +
      manomayaScore +
      vijnanamayaScore +
      anandamayaScore) /
      5
  );

  let overallStatus = 'Fragmentado';
  let dharmaAlignment =
    'Desconexão temporal com o propósito. Ação necessária no plano físico e vital.';

  if (overallScore >= 85) {
    overallStatus = 'Iluminado';
    dharmaAlignment =
      'Sincronia absoluta com o Dharma. O Ser irradia consciência unificada em todas as 5 dimensões.';
  } else if (overallScore >= 70) {
    overallStatus = 'Harmônico';
    dharmaAlignment =
      'Forte percepção do Dharma. O fluxo vital apoia o florescimento da sabedoria interior.';
  } else if (overallScore >= 50) {
    overallStatus = 'Em Transição';
    dharmaAlignment =
      'Dharma em latência. Flutuações mentais estão ofuscando o contato com o corpo causal.';
  }

  return { koshas, overallScore, overallStatus, dharmaAlignment };
}

function getKoshaStatus(score: number): Kosha['status'] {
  if (score >= 85) return 'Radiante';
  if (score >= 60) return 'Fluido';
  if (score >= 40) return 'Desalinhado';
  return 'Obstruído';
}

function getAnnamayaInsight(score: number) {
  if (score >= 70)
    return 'Seu veículo físico está nutrido e estruturalmente sólido.';
  return 'Atenção à hidratação, nutrição e movimento diário. O físico clama por suporte.';
}

function getPranamayaInsight(score: number) {
  if (score >= 70)
    return 'A circulação do Prana e a respiração (Vayus) operam com excelente capacidade.';
  return 'Sua energia vital está estagnada. Práticas de Pranayama são indicadas imediatamente.';
}

function getManomayaInsight(score: number) {
  if (score >= 70)
    return 'Clareza emocional e estabilidade diante dos estressores diários.';
  return 'Carga alostática alta. A mente está turva pelas emoções. Priorize descanso sensorial.';
}

function getVijnanamayaInsight(score: number) {
  if (score >= 70)
    return 'Discernimento aguçado. A intuição e o intelecto trabalham em harmonia.';
  return 'O intelecto está desconectado da sabedoria inata. Meditação e estudo meditativo são sugeridos.';
}

function getAnandamayaInsight(score: number) {
  if (score >= 70)
    return 'Contato direto com a alegria incondicional (Ananda) e o repouso profundo.';
  return 'A camada mais sutil do Ser está inacessível. O sono profundo e o soltar do ego necessitam de cultivo.';
}
