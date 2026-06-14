/**
 * Motor de Idade Biológica (proxy fenotípico).
 *
 * IMPORTANTE — honestidade científica: este motor NÃO realiza teste epigenético
 * de DNA (relógios como GrimAge/DunedinPACE exigem metilação de DNA a partir de
 * amostra biológica). Aqui calculamos uma estimativa FENOTÍPICA da idade
 * biológica e do "ritmo de envelhecimento" a partir dos biomarcadores reais que
 * o app já coleta (HRV, FC de repouso, VO2max, sono, glicose, SpO2, atividade e
 * IMC quando disponível), na linha de modelos fenotípicos como o PhenoAge.
 *
 * O cálculo é determinístico, sem hardcode de resultado: cada biomarcador
 * desloca a idade biológica em anos, para mais (envelhece) ou para menos
 * (rejuvenesce), conforme a distância da faixa ótima baseada em literatura.
 */

export interface BiologicalAgeInput {
  chronologicalAge: number;
  hrv_ms?: number | null;
  resting_heart_rate?: number | null;
  vo2_max?: number | null;
  sleep_duration_minutes?: number | null;
  sleep_efficiency?: number | null;
  blood_glucose_mgdl?: number | null;
  spo2_average?: number | null;
  active_minutes?: number | null;
  steps?: number | null;
  bmi?: number | null;
}

export type DriverStatus = 'otimo' | 'bom' | 'atencao' | 'critico';

export interface BiologicalAgeDriver {
  key: string;
  label: string;
  /** Impacto em anos: negativo rejuvenesce, positivo envelhece. */
  impactYears: number;
  status: DriverStatus;
  detail: string;
}

export interface BiologicalAgeResult {
  chronologicalAge: number;
  biologicalAge: number;
  /** biologicalAge - chronologicalAge (negativo = mais jovem que a idade real). */
  ageDelta: number;
  /** Ritmo de envelhecimento: 1.0 = no compasso; <1 mais lento; >1 mais rápido. */
  paceOfAging: number;
  /** Vitalidade fenotípica 0-100 (maior = melhor). */
  vitalityScore: number;
  drivers: BiologicalAgeDriver[];
  confidence: 'baixa' | 'media' | 'alta';
  availableMarkers: number;
  methodology: string;
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function statusFromImpact(impactYears: number): DriverStatus {
  if (impactYears <= -1.2) return 'otimo';
  if (impactYears <= 0.4) return 'bom';
  if (impactYears <= 2.2) return 'atencao';
  return 'critico';
}

interface MonotonicBand {
  optimal: number;
  poor: number;
  bonusYears: number;
  penaltyYears: number;
  higherIsBetter: boolean;
}

/**
 * Impacto monotônico: quanto melhor que o ótimo, mais rejuvenesce (até bonus);
 * quanto pior que o "poor", mais envelhece (até penalty); interpola no meio.
 */
function monotonicImpact(value: number, band: MonotonicBand): number {
  const { optimal, poor, bonusYears, penaltyYears, higherIsBetter } = band;
  if (higherIsBetter) {
    if (value >= optimal) {
      const over = (value - optimal) / Math.max(optimal * 0.5, 1);
      return -clamp(bonusYears * Math.min(over + 1, 1.5), 0, bonusYears * 1.5);
    }
    if (value <= poor) {
      return penaltyYears;
    }
    const ratio = (optimal - value) / (optimal - poor);
    return penaltyYears * ratio;
  }
  // menor é melhor
  if (value <= optimal) {
    const under = (optimal - value) / Math.max(optimal * 0.5, 1);
    return -clamp(bonusYears * Math.min(under + 1, 1.5), 0, bonusYears * 1.5);
  }
  if (value >= poor) {
    return penaltyYears;
  }
  const ratio = (value - optimal) / (poor - optimal);
  return penaltyYears * ratio;
}

/** Faixa bilateral (sono): penaliza tanto a falta quanto o excesso. */
function bilateralImpact(
  value: number,
  low: number,
  high: number,
  hardLow: number,
  hardHigh: number,
  penaltyYears: number,
  bonusYears: number
): number {
  if (value >= low && value <= high) {
    return -bonusYears;
  }
  if (value < low) {
    const ratio = clamp((low - value) / (low - hardLow), 0, 1);
    return penaltyYears * ratio;
  }
  const ratio = clamp((value - high) / (hardHigh - high), 0, 1);
  return penaltyYears * ratio;
}

export function calculateBiologicalAge(
  input: BiologicalAgeInput
): BiologicalAgeResult {
  const chronologicalAge = clamp(
    Math.round(input.chronologicalAge || 30),
    12,
    110
  );
  const drivers: BiologicalAgeDriver[] = [];
  let available = 0;

  const push = (
    key: string,
    label: string,
    impactYears: number,
    detail: string
  ) => {
    drivers.push({
      key,
      label,
      impactYears: Number(impactYears.toFixed(2)),
      status: statusFromImpact(impactYears),
      detail,
    });
    available += 1;
  };

  // HRV (rMSSD): maior = melhor recuperação autonômica e menor idade biológica.
  if (isNumber(input.hrv_ms)) {
    const impact = monotonicImpact(input.hrv_ms, {
      optimal: 65,
      poor: 20,
      bonusYears: 3,
      penaltyYears: 4,
      higherIsBetter: true,
    });
    push(
      'hrv',
      'HRV (variabilidade cardíaca)',
      impact,
      `${Math.round(input.hrv_ms)} ms`
    );
  }

  // VO2max: forte preditor de mortalidade; maior = melhor.
  if (isNumber(input.vo2_max)) {
    const impact = monotonicImpact(input.vo2_max, {
      optimal: 48,
      poor: 22,
      bonusYears: 3.5,
      penaltyYears: 4.5,
      higherIsBetter: true,
    });
    push(
      'vo2',
      'VO₂max (aptidão aeróbica)',
      impact,
      `${input.vo2_max.toFixed(1)} mL/kg/min`
    );
  }

  // FC de repouso: menor = melhor.
  if (isNumber(input.resting_heart_rate)) {
    const impact = monotonicImpact(input.resting_heart_rate, {
      optimal: 55,
      poor: 85,
      bonusYears: 2,
      penaltyYears: 3,
      higherIsBetter: false,
    });
    push(
      'rhr',
      'FC de repouso',
      impact,
      `${Math.round(input.resting_heart_rate)} bpm`
    );
  }

  // Sono (duração): faixa ótima 7-9h; falta e excesso penalizam.
  if (
    isNumber(input.sleep_duration_minutes) &&
    input.sleep_duration_minutes > 0
  ) {
    const impact = bilateralImpact(
      input.sleep_duration_minutes,
      420,
      540,
      240,
      660,
      3,
      1.5
    );
    const hours = Math.floor(input.sleep_duration_minutes / 60);
    const mins = Math.round(input.sleep_duration_minutes % 60);
    push('sleep', 'Duração do sono', impact, `${hours}h ${mins}m`);
  }

  // Eficiência do sono: maior = melhor.
  if (isNumber(input.sleep_efficiency)) {
    const impact = monotonicImpact(input.sleep_efficiency, {
      optimal: 90,
      poor: 70,
      bonusYears: 1.2,
      penaltyYears: 2,
      higherIsBetter: true,
    });
    push(
      'sleep_eff',
      'Eficiência do sono',
      impact,
      `${Math.round(input.sleep_efficiency)}%`
    );
  }

  // Glicose: menor (dentro do fisiológico) = melhor controle metabólico.
  if (isNumber(input.blood_glucose_mgdl)) {
    const impact = monotonicImpact(input.blood_glucose_mgdl, {
      optimal: 90,
      poor: 140,
      bonusYears: 1.5,
      penaltyYears: 3.5,
      higherIsBetter: false,
    });
    push(
      'glucose',
      'Glicose',
      impact,
      `${Math.round(input.blood_glucose_mgdl)} mg/dL`
    );
  }

  // SpO2: maior = melhor oxigenação.
  if (isNumber(input.spo2_average)) {
    const impact = monotonicImpact(input.spo2_average, {
      optimal: 96,
      poor: 90,
      bonusYears: 0.8,
      penaltyYears: 2.5,
      higherIsBetter: true,
    });
    push('spo2', 'SpO₂ média', impact, `${input.spo2_average.toFixed(1)}%`);
  }

  // Atividade física (minutos moderados/vigorosos): maior = melhor.
  if (isNumber(input.active_minutes)) {
    const impact = monotonicImpact(input.active_minutes, {
      optimal: 45,
      poor: 5,
      bonusYears: 1.5,
      penaltyYears: 2,
      higherIsBetter: true,
    });
    push(
      'active',
      'Minutos ativos',
      impact,
      `${Math.round(input.active_minutes)} min`
    );
  }

  // IMC (quando peso/altura disponíveis): faixa saudável 18.5-24.9.
  if (isNumber(input.bmi) && input.bmi > 0) {
    const impact = bilateralImpact(input.bmi, 18.5, 24.9, 15, 35, 3, 1);
    push('bmi', 'IMC', impact, input.bmi.toFixed(1));
  }

  const totalImpact = drivers.reduce((sum, d) => sum + d.impactYears, 0);

  // Sem nenhum marcador: idade biológica = cronológica, confiança baixa.
  const biologicalAgeRaw = chronologicalAge + totalImpact;
  const biologicalAge = clamp(
    Number(biologicalAgeRaw.toFixed(1)),
    Math.max(12, chronologicalAge - 15),
    chronologicalAge + 20
  );
  const ageDelta = Number((biologicalAge - chronologicalAge).toFixed(1));

  // Ritmo de envelhecimento: 20 anos acumulados de impacto ~ pace 2.0.
  const paceOfAging = Number(clamp(1 + totalImpact / 20, 0.6, 1.8).toFixed(2));

  // Vitalidade fenotípica: 100 menos a penalidade líquida normalizada.
  const vitalityScore = Math.round(
    clamp(50 - totalImpact * 5 + (available >= 6 ? 5 : 0), 0, 100)
  );

  const confidence: BiologicalAgeResult['confidence'] =
    available >= 6 ? 'alta' : available >= 3 ? 'media' : 'baixa';

  return {
    chronologicalAge,
    biologicalAge,
    ageDelta,
    paceOfAging,
    vitalityScore,
    drivers: drivers.sort((a, b) => a.impactYears - b.impactYears),
    confidence,
    availableMarkers: available,
    methodology:
      'Estimativa fenotípica baseada em biomarcadores reais (não é teste epigenético de DNA).',
  };
}
