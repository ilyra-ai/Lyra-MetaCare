import type { DoshaMetricSnapshot } from '@/lib/ayurveda/dosha-engine';
import type { ChakraMetricSnapshot } from '@/lib/chakra/alignment-engine';
import type { PranicMetricSnapshot } from '@/lib/prana/prana-engine';
import type { CoherenceMetricSnapshot } from '@/lib/quantum/coherence-engine';

/**
 * Cobertura dos índices integrativos (tarefa 57).
 *
 * Os motores integrativos (coerência, prana, chakras, koshas e dosha) usam
 * valores de referência típicos para os sinais que faltam, para que um dia
 * com poucos registros ainda tenha leitura. Sem esta conferência, uma pessoa
 * sem nenhum registro via números como "ICQ 67, harmonia" calculados só com
 * esses valores de referência, como se fossem medidos. Agora cada índice só
 * é mostrado quando uma parte mínima dos seus sinais foi realmente medida, e
 * a tela informa quantos sinais entraram e quais faltaram.
 */

/** Rótulos em pt-BR dos sinais usados pelos motores. */
export const NOME_DO_SINAL = {
  hrv_ms: 'variabilidade da frequência cardíaca',
  resting_heart_rate: 'frequência cardíaca em repouso',
  body_temperature_celsius: 'temperatura corporal',
  sleep_duration_minutes: 'duração do sono',
  deep_sleep_minutes: 'sono profundo',
  rem_sleep_minutes: 'sono REM',
  sleep_regularity_index: 'regularidade do sono',
  spo2_average: 'oxigenação (SpO₂)',
  respiratory_rate: 'frequência respiratória',
  stress_score: 'estresse',
  mood_score: 'humor',
  meditation_minutes: 'meditação',
  active_minutes: 'minutos ativos',
  sedentary_hours: 'horas sentado',
  steps: 'passos',
  vo2_max: 'VO₂ máx.',
  blood_glucose_mgdl: 'glicose',
  weight_kg: 'peso',
  water_liters: 'água',
  hydration_ml_per_kg: 'hidratação por kg',
  dietary_fiber_grams: 'fibras',
  eating_window_hours: 'janela alimentar',
  cognitive_test_score: 'teste cognitivo',
  reaction_time_pvt_ms: 'tempo de reação',
  hrv_stress_index: 'índice de estresse da VFC',
} as const;

export type SinalIntegrativo = keyof typeof NOME_DO_SINAL;

export const SINAIS_DA_COERENCIA = [
  'hrv_ms',
  'resting_heart_rate',
  'sleep_duration_minutes',
  'deep_sleep_minutes',
  'rem_sleep_minutes',
  'spo2_average',
  'respiratory_rate',
  'stress_score',
  'mood_score',
  'meditation_minutes',
  'sleep_regularity_index',
] as const satisfies ReadonlyArray<keyof CoherenceMetricSnapshot>;

export const SINAIS_DO_PRANA = [
  'spo2_average',
  'respiratory_rate',
  'meditation_minutes',
  'dietary_fiber_grams',
  'water_liters',
  'hydration_ml_per_kg',
  'blood_glucose_mgdl',
  'body_temperature_celsius',
  'eating_window_hours',
  'mood_score',
  'cognitive_test_score',
  'reaction_time_pvt_ms',
  'hrv_ms',
  'resting_heart_rate',
  'steps',
  'active_minutes',
  'vo2_max',
] as const satisfies ReadonlyArray<keyof PranicMetricSnapshot>;

export const SINAIS_DOS_CHAKRAS = [
  'weight_kg',
  'sedentary_hours',
  'deep_sleep_minutes',
  'water_liters',
  'mood_score',
  'blood_glucose_mgdl',
  'active_minutes',
  'dietary_fiber_grams',
  'hrv_ms',
  'resting_heart_rate',
  'spo2_average',
  'respiratory_rate',
  'sleep_regularity_index',
  'cognitive_test_score',
  'reaction_time_pvt_ms',
  'rem_sleep_minutes',
  'meditation_minutes',
  'stress_score',
  'hrv_stress_index',
] as const satisfies ReadonlyArray<keyof ChakraMetricSnapshot>;

export const SINAIS_DOS_KOSHAS = [
  'steps',
  'vo2_max',
  'dietary_fiber_grams',
  'water_liters',
  'hrv_ms',
  'respiratory_rate',
  'stress_score',
  'mood_score',
  'sleep_duration_minutes',
  'deep_sleep_minutes',
  'cognitive_test_score',
  'meditation_minutes',
] as const;

export const SINAIS_DO_DOSHA = [
  'hrv_ms',
  'resting_heart_rate',
  'body_temperature_celsius',
  'sleep_duration_minutes',
  'deep_sleep_minutes',
  'active_minutes',
  'sedentary_hours',
  'blood_glucose_mgdl',
  'weight_kg',
  'stress_score',
  'water_liters',
  'respiratory_rate',
  'mood_score',
] as const satisfies ReadonlyArray<keyof DoshaMetricSnapshot>;

export interface Cobertura {
  /** Sinais medidos (valor numérico finito). */
  medidos: SinalIntegrativo[];
  /** Sinais que o motor usa e que faltaram. */
  faltando: SinalIntegrativo[];
  total: number;
  /** Mínimo de sinais medidos para o índice ser mostrado. */
  minimo: number;
  suficiente: boolean;
}

/**
 * Mínimo de sinais medidos: 3, ou 30% dos sinais do motor, o que for maior.
 * Com menos que isso, mais de dois terços do índice viriam de valores de
 * referência e não da pessoa.
 */
export function minimoDeSinais(total: number) {
  return Math.max(3, Math.ceil(total * 0.3));
}

export function avaliarCobertura(
  snapshot: Partial<Record<SinalIntegrativo, number | null | undefined>> | null,
  sinais: ReadonlyArray<SinalIntegrativo>
): Cobertura {
  const medidos: SinalIntegrativo[] = [];
  const faltando: SinalIntegrativo[] = [];
  for (const sinal of sinais) {
    const valor = snapshot?.[sinal];
    if (typeof valor === 'number' && Number.isFinite(valor)) {
      medidos.push(sinal);
    } else {
      faltando.push(sinal);
    }
  }
  const minimo = minimoDeSinais(sinais.length);
  return {
    medidos,
    faltando,
    total: sinais.length,
    minimo,
    suficiente: medidos.length >= minimo,
  };
}

/** "4 de 11 sinais medidos" */
export function resumoDaCobertura(cobertura: Cobertura) {
  return `${cobertura.medidos.length} de ${cobertura.total} sinais medidos`;
}

/** Até `limite` sinais que faltam, por extenso, em pt-BR. */
export function sinaisQueFaltam(cobertura: Cobertura, limite = 3) {
  const nomes = cobertura.faltando.map((s) => NOME_DO_SINAL[s]);
  if (nomes.length <= limite) return nomes.join(', ');
  return `${nomes.slice(0, limite).join(', ')} e mais ${nomes.length - limite}`;
}
