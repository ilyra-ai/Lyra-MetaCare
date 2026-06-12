/**
 * Motor de Avaliações Subjetivas e KPIs — Lyra MetaCare
 *
 * Este motor é responsável pelo processamento de métricas subjetivas
 * relatadas pelo usuário, incluindo:
 * 1. Índice de Bem-Estar WHO-5 (Organização Mundial da Saúde)
 * 2. Net Promoter Score (NPS) da jornada de saúde
 * 3. Consistência e Aderência ao Protocolo (Streaks)
 */

export type AssessmentType = 'who5' | 'nps' | 'mood' | 'adherence';

export interface UserAssessment {
  id?: string;
  user_id: string;
  assessment_type: AssessmentType;
  score_value: number;
  raw_responses?: any;
  notes?: string;
  created_at?: string;
}

export interface UserStreak {
  id?: string;
  user_id: string;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

/**
 * WHO-5 Well-being Index
 * O WHO-5 consiste em 5 perguntas pontuadas de 0 a 5.
 * O score bruto varia de 0 a 25.
 * Um score bruto abaixo de 13 indica baixa qualidade de vida/bem-estar.
 */
export function calculateWHO5Score(responses: number[]): {
  rawScore: number;
  percentageScore: number;
  status: 'crítico' | 'alerta' | 'bom' | 'excelente';
  insight: string;
} {
  if (responses.length !== 5) {
    throw new Error('WHO-5 requires exactly 5 responses');
  }

  const rawScore = responses.reduce((acc, val) => acc + val, 0);
  const percentageScore = rawScore * 4; // Multiplica por 4 para ter o score de 0 a 100

  let status: 'crítico' | 'alerta' | 'bom' | 'excelente';
  let insight: string;

  if (rawScore < 13) {
    status = 'crítico';
    insight =
      'Seu bem-estar subjetivo está baixo. Recomendamos uma reavaliação da sua rotina e, se necessário, apoio profissional.';
  } else if (rawScore < 18) {
    status = 'alerta';
    insight =
      'Seu bem-estar está em um nível de transição. Focar no sono profundo e práticas de regulação do sistema nervoso pode ajudar.';
  } else if (rawScore <= 22) {
    status = 'bom';
    insight =
      'Você apresenta um nível de bem-estar bastante saudável. Continue mantendo seus hábitos de autocuidado.';
  } else {
    status = 'excelente';
    insight =
      'Excelente bem-estar subjetivo! Seu estilo de vida atual está altamente alinhado com a sua saúde mental e emocional.';
  }

  return { rawScore, percentageScore, status, insight };
}

/**
 * Calcula a aderência ao protocolo baseado nos streaks ativos
 */
export function calculateAdherenceScore(streaks: UserStreak[]): {
  score: number;
  level: 'baixa' | 'média' | 'alta' | 'consistente';
} {
  if (!streaks || streaks.length === 0) {
    return { score: 0, level: 'baixa' };
  }

  // Peso por tipo de streak (exemplo)
  const weights: Record<string, number> = {
    meditation: 1.5,
    hydration: 1.0,
    daily_metrics: 2.0,
    sleep_hygiene: 1.5,
  };

  let totalScore = 0;
  let maxPossible = 0;

  for (const streak of streaks) {
    const weight = weights[streak.streak_type] || 1.0;
    maxPossible += weight * 30; // Considerando 30 dias como máximo de peso

    // Cap in 30 days for score calculation purposes
    const effectiveStreak = Math.min(streak.current_streak, 30);
    totalScore += effectiveStreak * weight;
  }

  const score =
    Math.round(Math.min(100, (totalScore / maxPossible) * 100)) || 0;

  let level: 'baixa' | 'média' | 'alta' | 'consistente';
  if (score < 30) level = 'baixa';
  else if (score < 60) level = 'média';
  else if (score < 85) level = 'alta';
  else level = 'consistente';

  return { score, level };
}

/**
 * Classifica um resultado de NPS
 */
export function classifyNPS(score: number): 'detrator' | 'neutro' | 'promotor' {
  if (score >= 0 && score <= 6) return 'detrator';
  if (score >= 7 && score <= 8) return 'neutro';
  if (score >= 9 && score <= 10) return 'promotor';
  throw new Error('NPS score must be between 0 and 10');
}
