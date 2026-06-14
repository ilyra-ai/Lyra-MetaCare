/**
 * Motor do Assistente Agêntico Proativo.
 *
 * Em vez de só responder quando perguntado, a Lyra observa os dados reais do dia
 * e gera AÇÕES proativas, priorizadas e categorizadas, cruzando: detecção
 * precoce multimodal, idade biológica, fase do ciclo, prontidão e as métricas
 * de hoje. É 100% determinístico e roda no dispositivo (on-device), sem enviar
 * dados a serviços externos.
 */

import type { EarlyWarningResult } from '@/lib/health/early-warning-engine';
import type { BiologicalAgeResult } from '@/lib/longevity/biological-age-engine';
import type { MenstrualCycleResult } from '@/lib/cycle/menstrual-engine';

export type AgentCategory =
  | 'alerta'
  | 'recuperacao'
  | 'movimento'
  | 'sono'
  | 'nutricao'
  | 'hidratacao'
  | 'mente'
  | 'ciclo'
  | 'longevidade'
  | 'equilibrio';

export type AgentSeverity = 'critico' | 'atencao' | 'info' | 'positivo';

export interface AgentActionCta {
  label: string;
  href: string;
}

export interface AgentAction {
  id: string;
  category: AgentCategory;
  severity: AgentSeverity;
  priority: number;
  title: string;
  detail: string;
  cta?: AgentActionCta;
}

export interface AgentMetricsToday {
  steps?: number | null;
  active_minutes?: number | null;
  water_liters?: number | null;
  meditation_minutes?: number | null;
  sleep_duration_minutes?: number | null;
}

export interface AgentContext {
  firstName?: string | null;
  readinessScore?: number | null;
  earlyWarning: EarlyWarningResult;
  biologicalAge: BiologicalAgeResult | null;
  cycle: MenstrualCycleResult | null;
  today: AgentMetricsToday;
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

const SEVERITY_TO_PRIORITY: Record<AgentSeverity, number> = {
  critico: 96,
  atencao: 80,
  info: 50,
  positivo: 30,
};

export function generateProactiveActions(
  context: AgentContext,
  limit = 6
): AgentAction[] {
  const actions: AgentAction[] = [];
  const today = context.today ?? {};

  // 1. Sinais de detecção precoce — maior prioridade.
  for (const signal of context.earlyWarning.signals) {
    const severity: AgentSeverity =
      signal.severity === 'alerta' ? 'critico' : 'atencao';
    actions.push({
      id: `early_${signal.key}`,
      category: signal.key === 'respiratory' ? 'alerta' : 'recuperacao',
      severity,
      priority:
        SEVERITY_TO_PRIORITY[severity] +
        (signal.action === 'procure_orientacao' ? 2 : 0),
      title: `${signal.title} — ${signal.actionLabel}`,
      detail: `${signal.detail}${
        signal.contributors.length ? ` (${signal.contributors.join(', ')})` : ''
      }`,
      cta:
        signal.key === 'respiratory'
          ? { label: 'Reabrir monitoramento', href: '/monitoring' }
          : { label: 'Ver recuperação', href: '/monitoring' },
    });
  }

  const hasSleepDebtSignal = context.earlyWarning.signals.some(
    (s) => s.key === 'sleep_debt'
  );

  // 2. Prontidão baixa → recuperação ativa.
  if (isNumber(context.readinessScore) && context.readinessScore < 50) {
    actions.push({
      id: 'readiness_low',
      category: 'recuperacao',
      severity: 'atencao',
      priority: 74,
      title: 'Prontidão baixa hoje',
      detail: `Sua prontidão está em ${Math.round(
        context.readinessScore
      )}/100. Reduza a intensidade, faça respiração coerente e priorize recuperação passiva.`,
      cta: { label: 'Falar com a Lyra', href: '/chat' },
    });
  }

  // 3. Fase do ciclo (quando rastreável) → orientação alinhada à fase.
  if (context.cycle && context.cycle.trackable && context.cycle.phase) {
    actions.push({
      id: 'cycle_phase',
      category: 'ciclo',
      severity: 'info',
      priority: 64,
      title: `${context.cycle.phaseEmoji} ${context.cycle.phaseLabel} (dia ${context.cycle.cycleDay})`,
      detail: `${context.cycle.recommendation.training} ${context.cycle.recommendation.nutrition}`,
      cta: { label: 'Ver plano', href: '/plan' },
    });
  }

  // 4. Idade biológica — reforço positivo ou foco no principal driver.
  if (context.biologicalAge && context.biologicalAge.availableMarkers >= 3) {
    const { ageDelta, drivers } = context.biologicalAge;
    if (ageDelta > 1) {
      const worst = drivers[drivers.length - 1];
      actions.push({
        id: 'bioage_focus',
        category: 'longevidade',
        severity: 'atencao',
        priority: 58,
        title: `Idade biológica ${ageDelta.toFixed(1)} ano(s) acima da real`,
        detail: worst
          ? `O fator com maior impacto agora é "${worst.label}" (${worst.detail}). Pequenas melhorias aqui reduzem seu ritmo de envelhecimento.`
          : 'Foque nos hábitos de recuperação, movimento e metabolismo para reverter a tendência.',
        cta: { label: 'Gerar plano de longevidade', href: '/plan' },
      });
    } else if (ageDelta < -1) {
      actions.push({
        id: 'bioage_positive',
        category: 'longevidade',
        severity: 'positivo',
        priority: 32,
        title: `Você está ${Math.abs(ageDelta).toFixed(1)} ano(s) mais jovem que a idade real`,
        detail:
          'Seus biomarcadores indicam um ritmo de envelhecimento mais lento. Mantenha a consistência — está funcionando.',
      });
    }
  }

  // 5. Sono insuficiente (se ainda não sinalizado pela detecção precoce).
  if (
    !hasSleepDebtSignal &&
    isNumber(today.sleep_duration_minutes) &&
    today.sleep_duration_minutes > 0 &&
    today.sleep_duration_minutes < 390
  ) {
    actions.push({
      id: 'sleep_short',
      category: 'sono',
      severity: 'atencao',
      priority: 60,
      title: 'Sono abaixo do ideal',
      detail: `Você dormiu ${Math.floor(today.sleep_duration_minutes / 60)}h ${Math.round(
        today.sleep_duration_minutes % 60
      )}m. Antecipe a rotina noturna e reduza telas para recuperar a próxima noite.`,
      cta: { label: 'Dicas de sono', href: '/chat' },
    });
  }

  // 6. Movimento insuficiente.
  const lowSteps = isNumber(today.steps) && today.steps < 6000;
  const lowActive = isNumber(today.active_minutes) && today.active_minutes < 20;
  if (lowSteps || lowActive) {
    actions.push({
      id: 'movement_low',
      category: 'movimento',
      severity: 'info',
      priority: 46,
      title: 'Aumente o movimento do dia',
      detail: `${
        lowSteps
          ? `${today.steps} passos`
          : `${today.active_minutes} min ativos`
      } até agora. Uma caminhada de 15 minutos melhora circulação, glicose e humor.`,
      cta: { label: 'Conectar wearable', href: '/connect' },
    });
  }

  // 7. Hidratação.
  if (isNumber(today.water_liters) && today.water_liters < 1.5) {
    actions.push({
      id: 'hydration_low',
      category: 'hidratacao',
      severity: 'info',
      priority: 40,
      title: 'Hidratação abaixo da meta',
      detail: `${today.water_liters.toFixed(
        1
      )} L registrados. Beba água ao longo da tarde para sustentar energia e foco.`,
    });
  }

  // 8. Regulação mental.
  if (isNumber(today.meditation_minutes) && today.meditation_minutes === 0) {
    actions.push({
      id: 'mind_regulation',
      category: 'mente',
      severity: 'info',
      priority: 34,
      title: 'Reserve um momento de regulação',
      detail:
        'Cinco minutos de respiração coerente (5s inspira, 5s expira) elevam o HRV e reduzem o estresse percebido.',
      cta: { label: 'Iniciar com a Lyra', href: '/chat' },
    });
  }

  // 9. Nada disparou → reforço de equilíbrio.
  if (actions.length === 0) {
    actions.push({
      id: 'balance',
      category: 'equilibrio',
      severity: 'positivo',
      priority: 20,
      title: 'Tudo em equilíbrio por aqui',
      detail:
        'Seus sinais estão alinhados à sua linha de base. Mantenha a constância e aproveite o dia.',
    });
  }

  return actions.sort((a, b) => b.priority - a.priority).slice(0, limit);
}
