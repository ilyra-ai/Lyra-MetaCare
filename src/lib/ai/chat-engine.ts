import { AstrologicalData } from '@/lib/astrology/engine';
import type { BriefingDoDia } from '@/lib/coach/tipos';
import { calculateDynamicDosha } from '@/lib/ayurveda/dosha-engine';
import { calculateQuantumCoherence } from '@/lib/quantum/coherence-engine';
import { calculateChakraAlignment } from '@/lib/chakra/alignment-engine';
import { calculatePranicIndex } from '@/lib/prana/prana-engine';
import { calculateKoshas } from '@/lib/vedanta/kosha-engine';
import {
  avaliarCobertura,
  SINAIS_DA_COERENCIA,
  SINAIS_DO_DOSHA,
  SINAIS_DO_PRANA,
  SINAIS_DOS_CHAKRAS,
  SINAIS_DOS_KOSHAS,
} from '@/lib/integrativo/cobertura';
import { IDENTIDADE_DA_LYRA } from '@/lib/lyra/personalidade';
import { type ContextoDaLyra, responderComoLyra } from '@/lib/lyra/responder';

/** O mesmo snapshot só com ausências (dosha pela Lua, sem sinais). */
function semSinais<T extends Record<string, number | null>>(snapshot: T): T {
  return Object.fromEntries(
    Object.keys(snapshot).map((chave) => [chave, null])
  ) as T;
}

export interface AiSkillDocument {
  title: string;
  category: string;
  content: string;
}

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
  // Documentos/skills configurados no admin que orientam o que a IA deve
  // saber, fazer e executar no app. Injetados em tempo real no contexto.
  skills?: AiSkillDocument[];
  // "Seu dia" do coach diário (tarefa 42), quando o plano inclui o coach e o
  // perfil tem cidade: o chat responde sobre o dia com os mesmos horários.
  seuDia?: BriefingDoDia | null;
  // Mapa natal da pessoa para o motor da Lyra (tarefa 55): leitura védica,
  // Mapa Lyra DM Samādhi, Mapa Quantum e a base de saberes védicos.
  lyra?: Omit<ContextoDaLyra, 'nome'>;
}

function resumoDoDia(dia: BriefingDoDia) {
  const leituraDo = (chave: string) =>
    dia.leitura.periodos.find((p) => p.chave === chave);
  const linhas = [
    `Seu dia (${dia.local.rotulo.split(',')[0]}): ${dia.manchete}.`,
    dia.leitura.resumoGeral,
    ...dia.periodos.map((p) => {
      const leitura = leituraDo(p.chave);
      return `- ${p.nome} (${p.horario}): ${p.qualidade === 'favoravel' ? 'favorável' : p.qualidade === 'neutro' ? 'neutro' : 'cautela'}. ${p.sugestao}${
        leitura
          ? ` Emocional: ${leitura.emocional} Físico: ${leitura.fisico} Espiritual: ${leitura.espiritual}`
          : ''
      }`;
    }),
    `Focos: ${dia.focos.map((f) => f.texto).join(' ')}`,
    `Cuidados: ${dia.cuidados.map((c) => c.texto).join(' ')}`,
  ];
  linhas.push(
    `Pontos positivos: ${dia.leitura.pontosPositivos.join(' ')}`,
    `Pontos negativos: ${dia.leitura.pontosNegativos.join(' ')}`,
    `Dicas do mapa: ${dia.leitura.dicas.map((d) => d.texto).join(' ')}`
  );
  if (dia.alertas.length > 0) {
    linhas.push(`Atenção: ${dia.alertas.map((a) => a.texto).join(' ')}`);
  }
  if (dia.prontidao.valor !== null) {
    linhas.push(
      `Prontidão de hoje: ${dia.prontidao.valor}/100 (${dia.prontidao.base.join(', ')}).`
    );
  }
  return linhas.join('\n');
}

// Monta um bloco textual com as skills ativas, para uso como instrucao
// determinante do comportamento do assistente (local e LLM).
export function buildSkillsContext(skills?: AiSkillDocument[]): string {
  if (!skills || skills.length === 0) {
    return '';
  }

  const blocks = skills.map((skill, index) => {
    const label = skill.category?.trim()
      ? `${skill.title} [${skill.category}]`
      : skill.title;
    return `### Skill ${index + 1}: ${label}\n${skill.content.trim()}`;
  });

  return [
    'HABILIDADES, SKILLS E TREINAMENTOS CONFIGURADOS (siga estritamente):',
    ...blocks,
  ].join('\n\n');
}

// Busca de termos como palavras inteiras com limites Unicode. O `\b` do
// JavaScript só considera [A-Za-z0-9_]: "olá" sozinho ou no fim da frase não
// era reconhecido, porque não há limite de palavra depois do "á".
function contemTermo(texto: string, termos: string[]) {
  const escapados = termos.map((termo) =>
    termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  return new RegExp(
    `(?<![\\p{L}\\p{N}_])(?:${escapados.join('|')})(?![\\p{L}\\p{N}_])`,
    'u'
  ).test(texto);
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

  // Motor da Lyra (tarefa 55): mapa natal, os três tipos de mapa, Vedanta,
  // Upavedas e Vedangas, respondidos pela base curada, sem modelo de IA.
  const daLyra = responderComoLyra(query, {
    nome: context.profile?.first_name ?? null,
    mapa: context.lyra?.mapa ?? null,
    faltando: context.lyra?.faltando,
    agora: context.lyra?.agora,
    fuso: context.lyra?.fuso,
  });
  if (daLyra) {
    return daLyra.texto;
  }
  const goals = context.profile?.goals?.length
    ? context.profile.goals.join(', ')
    : 'longevidade geral e bem-estar sistêmico';

  const metrics = context.latestMetric;
  const astro = context.astrology;

  const snap = {
    hrv_ms: metrics?.hrv_ms ?? null,
    resting_heart_rate: null,
    body_temperature_celsius: null,
    sleep_duration_minutes: metrics?.sleep_duration_minutes ?? null,
    deep_sleep_minutes: null,
    rem_sleep_minutes: null,
    active_minutes: null,
    sedentary_hours: null,
    blood_glucose_mgdl: metrics?.blood_glucose_mgdl ?? null,
    weight_kg: null,
    stress_score: null,
    water_liters: null,
    respiratory_rate: null,
    mood_score: null,
    spo2_average: null,
    sleep_regularity_index: null,
    cognitive_test_score: null,
    reaction_time_pvt_ms: null,
    meditation_minutes: null,
    hrv_stress_index: null,
    dietary_fiber_grams: null,
    hydration_ml_per_kg: null,
    eating_window_hours: null,
    steps: metrics?.steps ?? null,
    vo2_max: null,
  };

  // Só índices com sinais suficientes medidos (tarefa 57): com poucos sinais,
  // os motores completariam o resto com valores de referência e a resposta
  // apresentaria números que não vieram da pessoa.
  const doshaPelosSinais = avaliarCobertura(snap, SINAIS_DO_DOSHA).suficiente;
  const dosha = calculateDynamicDosha(
    doshaPelosSinais ? snap : semSinais(snap),
    astro
  );
  const icq = avaliarCobertura(snap, SINAIS_DA_COERENCIA).suficiente
    ? calculateQuantumCoherence(snap, astro)
    : null;
  const chakras = avaliarCobertura(snap, SINAIS_DOS_CHAKRAS).suficiente
    ? calculateChakraAlignment(snap)
    : null;
  const prana = avaliarCobertura(snap, SINAIS_DO_PRANA).suficiente
    ? calculatePranicIndex(snap, astro)
    : null;
  const koshas = avaliarCobertura(snap, SINAIS_DOS_KOSHAS).suficiente
    ? calculateKoshas(snap, astro)
    : null;
  const doshaTexto = doshaPelosSinais
    ? `${dosha.dominant} (${dosha.prakritiLabel})`
    : `${dosha.dominant} (tendência pela Lua do dia, sem sinais suficientes do corpo)`;
  const indicesIntegrativos = [
    icq ? `- ICQ: ${icq.index}/100 (${icq.level})` : null,
    chakras
      ? `- Alinhamento de Chakras: ${chakras.overallScore}/100 (${chakras.overallLabel})`
      : null,
    prana
      ? `- Energia Vital (Prana): ${prana.index}/100 (${prana.level})`
      : null,
    koshas
      ? `- Pancha Koshas (Vedanta): ${koshas.overallScore}/100 (${koshas.overallStatus} - ${koshas.dharmaAlignment})`
      : null,
  ].filter((linha): linha is string => linha !== null);
  const semIndices =
    'Os índices de coerência, prana, chakras e koshas aparecem quando há sinais suficientes registrados hoje (sono, VFC, humor, estresse, respiração e outros).';

  const skills = context.skills ?? [];

  const responses: string[] = [];

  // 1. Processamento e Análise de Intenções (NLP Determinístico)
  const isGreeting = contemTermo(text, [
    'oi',
    'ola',
    'olá',
    'bom dia',
    'boa tarde',
    'boa noite',
    'tudo bem',
  ]);
  const isSkillsQuery =
    /(o que voc[eê] (pode|sabe|consegue|faz)|suas? habilidades?|seus? skills?|suas? capacidades?|seus? treinament|seus? document|quais.*(habilidades?|skills?|capacidades?))/.test(
      text
    );
  const isSleepQuery = contemTermo(text, [
    'sono',
    'dormir',
    'descanso',
    'insônia',
    'cansaço',
    'acordar',
  ]);
  const isGlucoseQuery = contemTermo(text, [
    'glicose',
    'açúcar',
    'insulina',
    'diabetes',
    'doce',
    'carboidrato',
    'comida',
  ]);
  const isHeartHrvQuery = contemTermo(text, [
    'coração',
    'hrv',
    'frequência',
    'batimentos',
    'estresse',
    'recuperação',
    'prontidão',
  ]);
  const isActivityQuery = contemTermo(text, [
    'exercício',
    'treino',
    'passos',
    'caminhada',
    'atividade',
    'movimento',
    'musculação',
  ]);
  const isAstrologyQuery = contemTermo(text, [
    'astrologia',
    'céu',
    'lua',
    'planeta',
    'signo',
    'energia',
    'astrológico',
  ]);
  const isSummaryQuery = contemTermo(text, [
    'resumo',
    'ontem',
    'hoje',
    'relatório',
    'status',
    'como estou',
  ]);
  const isDayQuery = contemTermo(text, [
    'meu dia',
    'o dia',
    'hoje',
    'amanhã',
    'manhã',
    'tarde',
    'noite',
    'agora',
    'horário',
    'horários',
    'rahu',
    'choghadiya',
    'panchang',
    'coach',
  ]);
  const isConsultationQuery = contemTermo(text, [
    'consulta',
    'médico',
    'profissional',
    'agendar',
    'agendamento',
  ]);

  // 2. Resposta de Saudação
  if (isGreeting && text.length < 30) {
    responses.push(
      `Olá, ${name}! ${IDENTIDADE_DA_LYRA.apresentacao} Como posso te ajudar hoje com ${goals}?`
    );
  }

  // 2.1. Skills, habilidades e treinamentos configurados
  if (isSkillsQuery) {
    if (skills.length > 0) {
      responses.push(
        `Opero sob ${skills.length} ${skills.length === 1 ? 'habilidade configurada' : 'habilidades configuradas'} pela administração da Lyra, que definem o que devo saber e executar:`
      );
      skills.forEach((skill, index) => {
        const label = skill.category?.trim()
          ? `${skill.title} (${skill.category})`
          : skill.title;
        const summary = skill.content.trim().replace(/\s+/g, ' ').slice(0, 220);
        responses.push(
          `${index + 1}. ${label} — ${summary}${skill.content.trim().length > 220 ? '…' : ''}`
        );
      });
      responses.push(
        'Posso aplicar essas diretrizes junto da sua biometria, do plano de longevidade e do contexto astrológico. Peça uma delas pelo nome para detalharmos.'
      );
    } else {
      responses.push(
        `${name}, ainda não há documentos de habilidade configurados. Um administrador pode adicioná-los em Configuração de IA para ampliar o que devo saber e executar.`
      );
    }
  }

  // 3. Resumo de Saúde
  if (isSummaryQuery) {
    responses.push(`Aqui está sua leitura atual, ${name}:`);

    const fisiologia = metrics
      ? [
          metrics.steps !== null ? `${metrics.steps} passos` : null,
          metrics.sleep_duration_minutes !== null
            ? `${formatSleep(metrics.sleep_duration_minutes)} de sono`
            : null,
          metrics.hrv_ms !== null ? `VFC de ${metrics.hrv_ms} ms` : null,
        ].filter((parte): parte is string => parte !== null)
      : [];
    if (fisiologia.length > 0) {
      responses.push(`- Fisiologia: você registrou ${fisiologia.join(', ')}.`);
    } else {
      responses.push(
        `- Fisiologia: Não encontrei métricas recentes vinculadas à sua conta. Conecte um wearable ou registre manualmente.`
      );
    }

    responses.push(
      `- Ciclo Astrológico: A Lua está em ${astro.moonSign} sob o Nakshatra ${astro.nakshatra} (${astro.tithi}). Isso significa que sua energia geral está ${astro.impactOnHealth.energy.toLowerCase()}.`
    );

    responses.push(`- Dosha dominante: ${doshaTexto}.`);
    responses.push(
      icq || prana
        ? `- Insights Védico-Quânticos: ${[
            icq ? `Coerência Quântica ${icq.index}/100 (${icq.level})` : null,
            prana ? `Índice Pránico ${prana.index}/100 (${prana.level})` : null,
          ]
            .filter(Boolean)
            .join(' e ')}.`
        : `- ${semIndices}`
    );
  }

  // 4. Análise de Sono
  if (isSleepQuery) {
    if (metrics?.sleep_duration_minutes) {
      const isLowSleep = metrics.sleep_duration_minutes < 420; // menos de 7 horas
      responses.push(
        `Analisando seu último registro de ${formatSleep(metrics.sleep_duration_minutes)}: ${isLowSleep ? 'Você está dormindo menos do que o mínimo recomendado (7 horas) para longevidade e reparo celular.' : 'Seu tempo total de sono está adequado.'}`
      );
    } else {
      responses.push('Ainda não tenho dados recentes do seu sono.');
    }
    responses.push(
      `Astrologicamente: ${astro.impactOnHealth.sleep} Recomendo reduzir exposição à luz azul e manter regularidade cronobiológica. Se os problemas persistirem, ajuste a ingestão de magnésio e carboidratos no período noturno.`
    );
  }

  // 5. Análise de Glicose e Metabolismo
  if (isGlucoseQuery) {
    if (metrics?.blood_glucose_mgdl) {
      const isHighGlucose = metrics.blood_glucose_mgdl > 100;
      responses.push(
        `Sua última leitura de glicose foi de ${metrics.blood_glucose_mgdl} mg/dL. ${isHighGlucose ? 'Este valor indica possível estresse oxidativo ou carga glicêmica excessiva.' : 'Sua glicemia em jejum ou basal parece controlada.'}`
      );
    }
    responses.push(
      `Para gerir o metabolismo: Observe a resposta pós-prandial. Combine carboidratos com fibras, proteínas e gorduras boas. Uma caminhada de 15 minutos logo após as refeições ajuda a atenuar picos insulínicos, alinhando-se aos seus objetivos de ${goals}.`
    );
  }

  // 6. Análise de Recuperação e HRV
  if (isHeartHrvQuery) {
    if (metrics?.hrv_ms) {
      const isLowHrv = metrics.hrv_ms < 40;
      responses.push(
        `Seu último HRV (Variabilidade da Frequência Cardíaca) foi de ${metrics.hrv_ms} ms e prontidão de ${metrics.readiness_score ?? 'N/A'}/100. ${isLowHrv ? 'Seu sistema nervoso simpático parece sobrecarregado; priorize recuperação passiva.' : 'Seu sistema nervoso parassimpático mostra boa capacidade de adaptação ao estresse.'}`
      );
    } else {
      responses.push(
        'Sem registros recentes de Variabilidade da Frequência Cardíaca (HRV). Use o monitoramento Bluetooth para medir.'
      );
    }
    responses.push(
      `O contexto atual astrológico para seu estresse é: ${astro.impactOnHealth.stress.toLowerCase()}. Técnicas de respiração coerente (ex: 5s inalação, 5s exalação) são fundamentais agora.`
    );
  }

  // 7. Análise de Exercício e Movimento
  if (isActivityQuery) {
    if (metrics?.steps) {
      const isLowSteps = metrics.steps < 8000;
      responses.push(
        `Você registrou ${metrics.steps} passos recentemente. ${isLowSteps ? 'Aumentar seu NEAT (Termogênese da Atividade Não Relacionada ao Exercício) é essencial para melhorar o fluxo linfático e metabólico.' : 'Excelente volume basal de movimento.'}`
      );
    }
    responses.push(
      `A energia cósmica no momento sugere: ${astro.impactOnHealth.energy}. Para ${goals}, calibre a intensidade do treinamento de força para não comprometer a recuperação sistêmica.`
    );
  }

  // 8. Análise Astrológica
  if (isAstrologyQuery) {
    responses.push(
      `Neste instante astronômico: Lua em ${astro.moonSign}, sob o domínio de ${astro.nakshatra} durante a fase ${astro.tithi}. Ayanamsha calculado: ${astro.ayanamshaDegrees.toFixed(2)} graus.`
    );
    responses.push(`Impactos orgânicos diretos:`);
    responses.push(`- Energia: ${astro.impactOnHealth.energy}`);
    responses.push(`- Estresse: ${astro.impactOnHealth.stress}`);
    responses.push(`- Sono: ${astro.impactOnHealth.sleep}`);

    responses.push(
      [
        'Com base nestes astros e nos seus sinais de hoje:',
        `- Dosha: ${doshaTexto}`,
        ...(indicesIntegrativos.length > 0
          ? indicesIntegrativos
          : [`- ${semIndices}`]),
      ].join('\n')
    );
  }

  // 8.1. O dia de hoje pelo coach diário
  if (isDayQuery) {
    if (context.seuDia) {
      responses.push(resumoDoDia(context.seuDia));
      responses.push(
        'Os detalhes de cada período, com o "por quê" de cada dica, estão em "Meu dia" na barra lateral.'
      );
    } else if (text.includes('meu dia') || text.includes('coach')) {
      responses.push(
        `${name}, para eu dizer como será o seu dia por período, escolha no perfil a cidade onde você mora e informe data, hora e cidade de nascimento.`
      );
    }
  }

  // 9. Agendamentos
  if (isConsultationQuery) {
    responses.push(
      `Para organizar sua saúde e atacar metas como ${goals}, nosso hub de profissionais e orquestração clínica está disponível no módulo 'Consultas' na barra lateral. Lá você pode gerenciar os horários de forma centralizada.`
    );
  }

  // 10. Fallback Deterministico
  if (responses.length === 0) {
    responses.push(
      `${name}, o motor de análise estruturou seu contexto: Sua meta principal foca em ${goals}. O céu atual (Lua em ${astro.moonSign}, ${astro.tithi}) e suas métricas fisiológicas são monitorados para lhe orientar.`
    );
    responses.push(
      `Você pode me perguntar sobre o seu sono, glicose, recuperação (HRV), exercícios, o resumo do dia ou o céu de hoje. Também leio o seu mapa védico (Ascendente, Lua, dasha, casas), o seu Mapa Lyra DM Samādhi e o Score de Ação do Mapa Quantum, e explico Vedanta, Upanishads, Ayurveda, Vastu, música védica e os Vedangas.`
    );
    if (skills.length > 0) {
      responses.push(
        `Também opero sob ${skills.length} ${skills.length === 1 ? 'habilidade configurada' : 'habilidades configuradas'} (${skills
          .map((skill) => skill.title)
          .slice(0, 5)
          .join(', ')}). Pergunte "o que você pode fazer" para ver todas.`
      );
    }
  }

  return responses.join('\n\n');
}
