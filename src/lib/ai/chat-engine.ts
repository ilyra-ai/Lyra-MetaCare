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

export function generateLocalAssistantReply(
  query: string,
  context: ChatContext
): string {
  const text = query.toLowerCase();
  const name = context.profile?.first_name ?? 'usuário';
  const goals = context.profile?.goals?.length
    ? context.profile.goals.join(', ')
    : 'longevidade geral e bem-estar sistêmico';

  const metrics = context.latestMetric;
  const astro = context.astrology;

  const responses: string[] = [];

  // 1. Processamento e Análise de Intenções (NLP Determinístico)
  const isGreeting = /\b(oi|ola|olá|bom dia|boa tarde|boa noite|tudo bem)\b/.test(text);
  const isSleepQuery = /\b(sono|dormir|descanso|insônia|cansaço|acordar)\b/.test(text);
  const isGlucoseQuery = /\b(glicose|açúcar|insulina|diabetes|doce|carboidrato|comida)\b/.test(text);
  const isHeartHrvQuery = /\b(coração|hrv|frequência|batimentos|estresse|recuperação|prontidão)\b/.test(text);
  const isActivityQuery = /\b(exercício|treino|passos|caminhada|atividade|movimento|musculação)\b/.test(text);
  const isAstrologyQuery = /\b(astrologia|céu|lua|planeta|signo|energia|astrológico)\b/.test(text);
  const isSummaryQuery = /\b(resumo|ontem|hoje|relatório|status|como estou)\b/.test(text);
  const isConsultationQuery = /\b(consulta|médico|profissional|agendar|agendamento)\b/.test(text);

  // 2. Resposta de Saudação
  if (isGreeting && text.length < 30) {
    responses.push(`Olá, ${name}! Sou seu assistente de saúde inteligente da Lyra MetaCare. Analiso seus dados fisiológicos e a influência astrológica atual para te orientar. Como posso ajudar a aprimorar seu foco em ${goals} hoje?`);
  }

  // 3. Resumo de Saúde
  if (isSummaryQuery) {
    responses.push(`Aqui está sua leitura atual, ${name}:`);

    if (metrics) {
      responses.push(`- Fisiologia: Você registrou ${metrics.steps ?? 0} passos, ${formatSleep(metrics.sleep_duration_minutes)} de sono, e um HRV de ${metrics.hrv_ms ?? 'N/A'} ms.`);
    } else {
      responses.push(`- Fisiologia: Não encontrei métricas recentes vinculadas à sua conta. Conecte um wearable ou registre manualmente.`);
    }

    responses.push(`- Ciclo Astrológico: A Lua está em ${astro.moonSign} sob o Nakshatra ${astro.nakshatra} (${astro.tithi}). Isso significa que sua energia geral está ${astro.impactOnHealth.energy.toLowerCase()}.`);
  }

  // 4. Análise de Sono
  if (isSleepQuery) {
    if (metrics?.sleep_duration_minutes) {
      const isLowSleep = metrics.sleep_duration_minutes < 420; // menos de 7 horas
      responses.push(`Analisando seu último registro de ${formatSleep(metrics.sleep_duration_minutes)}: ${isLowSleep ? 'Você está dormindo menos do que o mínimo recomendado (7 horas) para longevidade e reparo celular.' : 'Seu tempo total de sono está adequado.'}`);
    } else {
      responses.push('Ainda não tenho dados recentes do seu sono.');
    }
    responses.push(`Astrologicamente: ${astro.impactOnHealth.sleep} Recomendo reduzir exposição à luz azul e manter regularidade cronobiológica. Se os problemas persistirem, ajuste a ingestão de magnésio e carboidratos no período noturno.`);
  }

  // 5. Análise de Glicose e Metabolismo
  if (isGlucoseQuery) {
    if (metrics?.blood_glucose_mgdl) {
      const isHighGlucose = metrics.blood_glucose_mgdl > 100;
      responses.push(`Sua última leitura de glicose foi de ${metrics.blood_glucose_mgdl} mg/dL. ${isHighGlucose ? 'Este valor indica possível estresse oxidativo ou carga glicêmica excessiva.' : 'Sua glicemia em jejum ou basal parece controlada.'}`);
    }
    responses.push(`Para gerir o metabolismo: Observe a resposta pós-prandial. Combine carboidratos com fibras, proteínas e gorduras boas. Uma caminhada de 15 minutos logo após as refeições ajuda a atenuar picos insulínicos, alinhando-se aos seus objetivos de ${goals}.`);
  }

  // 6. Análise de Recuperação e HRV
  if (isHeartHrvQuery) {
    if (metrics?.hrv_ms) {
      const isLowHrv = metrics.hrv_ms < 40;
      responses.push(`Seu último HRV (Variabilidade da Frequência Cardíaca) foi de ${metrics.hrv_ms} ms e prontidão de ${metrics.readiness_score ?? 'N/A'}/100. ${isLowHrv ? 'Seu sistema nervoso simpático parece sobrecarregado; priorize recuperação passiva.' : 'Seu sistema nervoso parassimpático mostra boa capacidade de adaptação ao estresse.'}`);
    } else {
      responses.push('Sem registros recentes de Variabilidade da Frequência Cardíaca (HRV). Use o monitoramento Bluetooth para medir.');
    }
    responses.push(`O contexto atual astrológico para seu estresse é: ${astro.impactOnHealth.stress.toLowerCase()}. Técnicas de respiração coerente (ex: 5s inalação, 5s exalação) são fundamentais agora.`);
  }

  // 7. Análise de Exercício e Movimento
  if (isActivityQuery) {
    if (metrics?.steps) {
      const isLowSteps = metrics.steps < 8000;
      responses.push(`Você registrou ${metrics.steps} passos recentemente. ${isLowSteps ? 'Aumentar seu NEAT (Termogênese da Atividade Não Relacionada ao Exercício) é essencial para melhorar o fluxo linfático e metabólico.' : 'Excelente volume basal de movimento.'}`);
    }
    responses.push(`A energia cósmica no momento sugere: ${astro.impactOnHealth.energy}. Para ${goals}, calibre a intensidade do treinamento de força para não comprometer a recuperação sistêmica.`);
  }

  // 8. Análise Astrológica
  if (isAstrologyQuery) {
    responses.push(`Neste instante astronômico: Lua em ${astro.moonSign}, sob o domínio de ${astro.nakshatra} durante a fase ${astro.tithi}. Ayanamsha calculado: ${astro.ayanamshaDegrees.toFixed(2)} graus.`);
    responses.push(`Impactos orgânicos diretos:`);
    responses.push(`- Energia: ${astro.impactOnHealth.energy}`);
    responses.push(`- Estresse: ${astro.impactOnHealth.stress}`);
    responses.push(`- Sono: ${astro.impactOnHealth.sleep}`);
  }

  // 9. Agendamentos
  if (isConsultationQuery) {
    responses.push(`Para organizar sua saúde e atacar metas como ${goals}, nosso hub de profissionais e orquestração clínica está disponível no módulo 'Consultas' na barra lateral. Lá você pode gerenciar os horários de forma centralizada.`);
  }

  // 10. Fallback Deterministico
  if (responses.length === 0) {
    responses.push(`${name}, o motor de análise estruturou seu contexto: Sua meta principal foca em ${goals}. O céu atual (Lua em ${astro.moonSign}, ${astro.tithi}) e suas métricas fisiológicas são monitorados para lhe orientar.`);
    responses.push(`Você pode me perguntar especificamente sobre seu SONO, GLICOSE, RECUPERAÇÃO (HRV), EXERCÍCIOS, RESUMO GERAL ou LEITURA ASTROLÓGICA para obter uma análise cruzada e profunda.`);
  }

  return responses.join('\n\n');
}
