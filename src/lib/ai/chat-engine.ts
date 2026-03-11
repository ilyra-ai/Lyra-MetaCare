import { AstrologicalData } from '@/lib/astrology/engine';

interface ChatContext {
  profile: {
    first_name: string | null;
    goals: string[] | null;
  } | null;
  latestMetric: {
    steps: number | null;
    sleep_duration_minutes: number | null;
    hrv_ms: number | null;
    readiness_score: number | null;
    blood_glucose_mgdl?: number | null;
  } | null;
  astrology: AstrologicalData;
}

function formatSleep(minutes: number | null | undefined) {
  if (!minutes) {
    return 'sem registro recente de sono';
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

export function generateLocalAssistantReply(query: string, context: ChatContext) {
  const text = query.toLowerCase();
  const name = context.profile?.first_name ?? 'você';
  const goals = context.profile?.goals?.join(', ') ?? 'longevidade geral';

  if (text.includes('sono')) {
    return `${name}, seu último registro indica ${formatSleep(context.latestMetric?.sleep_duration_minutes)}. ${context.astrology.impactOnHealth.sleep} Priorize regularidade de horário, redução de luz intensa à noite e desaceleração cognitiva 60 minutos antes de dormir.`;
  }

  if (text.includes('resumo') || text.includes('ontem')) {
    return `${name}, no quadro recente você somou ${context.latestMetric?.steps ?? 0} passos, registrou ${formatSleep(context.latestMetric?.sleep_duration_minutes)} e HRV em ${context.latestMetric?.hrv_ms ?? 'N/A'} ms. A leitura astrológica atual aponta ${context.astrology.impactOnHealth.energy.toLowerCase()} e metas prioritárias em ${goals}.`;
  }

  if (text.includes('consulta') || text.includes('agendar')) {
    return `${name}, o fluxo de agenda já está disponível no módulo de consultas. Se o objetivo for revisar recuperação, glicose ou sono, sugiro priorizar o especialista mais aderente à sua meta principal: ${goals}.`;
  }

  if (text.includes('glicose')) {
    return `${name}, sua melhor decisão prática é observar resposta pós-prandial com fibra, proteína e caminhada leve após refeição. Se houver tendência de elevação, reduza densidade glicêmica nas refeições mais tardias.`;
  }

  return `${name}, posso ajudar com sono, recuperação, prontidão, glicose, metas e organização de consultas. Seu contexto atual combina ${context.astrology.moonSign} em ${context.astrology.nakshatra} com foco de saúde em ${context.astrology.impactOnHealth.stress.toLowerCase()}.`;
}
