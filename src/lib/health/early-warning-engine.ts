/**
 * Motor de Detecção Precoce Multimodal.
 *
 * Cruza desvios da LINHA DE BASE pessoal (média dos dias anteriores) em
 * múltiplos sinais fisiológicos — HRV, FC de repouso, temperatura corporal,
 * SpO2, frequência respiratória e sono — para sinalizar padrões com
 * antecedência (ex.: FC de repouso subindo + HRV caindo + temperatura subindo
 * sugere resposta imunológica precoce, até ~48h antes dos sintomas).
 *
 * Determinístico, sem hardcode de resultado: cada sinal é derivado dos dados
 * reais do usuário comparados à sua própria linha de base.
 */

export interface EarlyWarningMetric {
  hrv_ms?: number | null;
  resting_heart_rate?: number | null;
  body_temperature_celsius?: number | null;
  spo2_average?: number | null;
  respiratory_rate?: number | null;
  sleep_duration_minutes?: number | null;
}

export type EarlyWarningSeverity = 'info' | 'atencao' | 'alerta';
export type EarlyWarningAction =
  | 'desacelere'
  | 'reteste'
  | 'procure_orientacao'
  | 'recupere_sono'
  | 'mantenha';

export interface EarlyWarningSignal {
  key: string;
  title: string;
  severity: EarlyWarningSeverity;
  action: EarlyWarningAction;
  actionLabel: string;
  detail: string;
  contributors: string[];
}

export interface EarlyWarningResult {
  signals: EarlyWarningSignal[];
  baselineDays: number;
  hasBaseline: boolean;
  overall: 'estavel' | 'observar' | 'atencao';
}

const ACTION_LABEL: Record<EarlyWarningAction, string> = {
  desacelere: 'Desacelere',
  reteste: 'Reteste a medição',
  procure_orientacao: 'Procure orientação',
  recupere_sono: 'Recupere o sono',
  mantenha: 'Mantenha o ritmo',
};

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Média dos valores válidos (> 0 quando exigido) de uma métrica no histórico. */
function baselineMean(
  history: EarlyWarningMetric[],
  key: keyof EarlyWarningMetric,
  requirePositive = false
): number | null {
  const values = history
    .map((entry) => entry[key])
    .filter(
      (value): value is number =>
        isNumber(value) && (!requirePositive || value > 0)
    );
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function evaluateEarlyWarning(
  today: EarlyWarningMetric | null,
  history: EarlyWarningMetric[]
): EarlyWarningResult {
  const baselineDays = history.length;
  const hasBaseline = baselineDays >= 3;

  if (!today || !hasBaseline) {
    return {
      signals: [],
      baselineDays,
      hasBaseline,
      overall: 'estavel',
    };
  }

  const meanHrv = baselineMean(history, 'hrv_ms', true);
  const meanRhr = baselineMean(history, 'resting_heart_rate', true);
  const meanTemp = baselineMean(history, 'body_temperature_celsius', true);
  const meanSpo2 = baselineMean(history, 'spo2_average', true);
  const meanResp = baselineMean(history, 'respiratory_rate', true);
  const meanSleep = baselineMean(history, 'sleep_duration_minutes', true);

  // Desvios de hoje versus a linha de base pessoal.
  const hrvDropPct =
    isNumber(today.hrv_ms) && meanHrv
      ? (meanHrv - today.hrv_ms) / meanHrv
      : null;
  const rhrRise =
    isNumber(today.resting_heart_rate) && meanRhr
      ? today.resting_heart_rate - meanRhr
      : null;
  const tempRise =
    isNumber(today.body_temperature_celsius) && meanTemp
      ? today.body_temperature_celsius - meanTemp
      : null;
  const respRise =
    isNumber(today.respiratory_rate) && meanResp
      ? today.respiratory_rate - meanResp
      : null;
  const sleepRatio =
    isNumber(today.sleep_duration_minutes) && meanSleep
      ? today.sleep_duration_minutes / meanSleep
      : null;

  const signals: EarlyWarningSignal[] = [];

  // Padrão 1 — resposta imunológica/infecção precoce.
  {
    const contributors: string[] = [];
    if (rhrRise !== null && rhrRise >= 4) {
      contributors.push(`FC de repouso +${rhrRise.toFixed(0)} bpm`);
    }
    if (hrvDropPct !== null && hrvDropPct >= 0.15) {
      contributors.push(`HRV -${Math.round(hrvDropPct * 100)}%`);
    }
    if (tempRise !== null && tempRise >= 0.3) {
      contributors.push(`Temperatura +${tempRise.toFixed(1)}°C`);
    }
    if (contributors.length >= 2) {
      const severe = contributors.length >= 3 || (tempRise ?? 0) >= 0.5;
      signals.push({
        key: 'immune_response',
        title: 'Possível resposta imunológica precoce',
        severity: severe ? 'alerta' : 'atencao',
        action: 'desacelere',
        actionLabel: ACTION_LABEL.desacelere,
        detail:
          'Seu corpo mostra sinais combinados de estresse fisiológico que costumam anteceder sintomas. Reduza a carga, hidrate-se e durma bem; reavalie amanhã.',
        contributors,
      });
    }
  }

  // Padrão 2 — sobrecarga autonômica / baixa recuperação.
  if (
    hrvDropPct !== null &&
    hrvDropPct >= 0.2 &&
    !signals.some((s) => s.key === 'immune_response')
  ) {
    const contributors = [`HRV -${Math.round(hrvDropPct * 100)}%`];
    if (rhrRise !== null && rhrRise >= 3) {
      contributors.push(`FC de repouso +${rhrRise.toFixed(0)} bpm`);
    }
    signals.push({
      key: 'autonomic_load',
      title: 'Recuperação autonômica reduzida',
      severity: 'atencao',
      action: 'desacelere',
      actionLabel: ACTION_LABEL.desacelere,
      detail:
        'Sua variabilidade cardíaca está abaixo da sua média recente. Priorize recuperação passiva, respiração coerente e evite treinos intensos hoje.',
      contributors,
    });
  }

  // Padrão 3 — oxigenação / respiração.
  {
    const contributors: string[] = [];
    const lowSpo2 = isNumber(today.spo2_average) && today.spo2_average < 93;
    const spo2Drop =
      isNumber(today.spo2_average) && meanSpo2
        ? meanSpo2 - today.spo2_average >= 2
        : false;
    if (lowSpo2) contributors.push(`SpO₂ ${today.spo2_average!.toFixed(0)}%`);
    else if (spo2Drop)
      contributors.push(
        `SpO₂ -${(meanSpo2! - today.spo2_average!).toFixed(0)}%`
      );
    if (respRise !== null && respRise >= 2) {
      contributors.push(`Respiração +${respRise.toFixed(0)} rpm`);
    }
    if (contributors.length >= 1 && (lowSpo2 || contributors.length >= 2)) {
      signals.push({
        key: 'respiratory',
        title: 'Sinais respiratórios fora da linha de base',
        severity: lowSpo2 ? 'alerta' : 'atencao',
        action: lowSpo2 ? 'procure_orientacao' : 'reteste',
        actionLabel: lowSpo2
          ? ACTION_LABEL.procure_orientacao
          : ACTION_LABEL.reteste,
        detail: lowSpo2
          ? 'Sua oxigenação está abaixo do esperado. Refaça a medição em repouso; se persistir baixa, procure orientação profissional.'
          : 'Pequena variação na oxigenação/respiração. Reteste com o dispositivo bem posicionado e em repouso.',
        contributors,
      });
    }
  }

  // Padrão 4 — privação aguda de sono.
  if (
    sleepRatio !== null &&
    sleepRatio < 0.7 &&
    isNumber(today.sleep_duration_minutes) &&
    today.sleep_duration_minutes < 360
  ) {
    signals.push({
      key: 'sleep_debt',
      title: 'Privação aguda de sono',
      severity: 'atencao',
      action: 'recupere_sono',
      actionLabel: ACTION_LABEL.recupere_sono,
      detail:
        'Você dormiu bem menos que a sua média recente. Reduza a intensidade do dia, evite cafeína à tarde e priorize uma noite restauradora.',
      contributors: [
        `${Math.floor(today.sleep_duration_minutes / 60)}h ${Math.round(
          today.sleep_duration_minutes % 60
        )}m (${Math.round(sleepRatio * 100)}% da média)`,
      ],
    });
  }

  const hasAlert = signals.some((s) => s.severity === 'alerta');
  const hasAttention = signals.some((s) => s.severity === 'atencao');

  return {
    signals,
    baselineDays,
    hasBaseline,
    overall: hasAlert ? 'atencao' : hasAttention ? 'observar' : 'estavel',
  };
}
