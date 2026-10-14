import { AstrologicalData } from '@/lib/astrology/engine';

interface PlanPayload {
  metrics: {
    hrv_ms: number | null;
    sleep_duration_minutes: number | null;
    steps: number | null;
    blood_glucose_mgdl: number | null;
    weight_kg: number | null;
  };
  astrology: AstrologicalData;
  goals: string[];
  /** Prontidão gravada hoje (0 a 100) ou null sem sinais suficientes. */
  readiness?: number | null;
}

/** Meta automática sugerida pelo plano (vira meta com um clique). */
export interface MetaSugerida {
  metrica: 'passos' | 'sono' | 'agua' | 'meditacao' | 'minutosAtivos';
  alvo: number;
  porque: string;
}

/**
 * Uma ação por objetivo escolhido no perfil, com a meta automática que a
 * acompanha. Antes só "Gerenciar picos de glicose" mudava o plano.
 */
const ACOES_DOS_OBJETIVOS: Record<
  string,
  { titulo: string; detalhe: string; imagem: string; meta?: MetaSugerida }
> = {
  lose_weight: {
    titulo: 'Déficit leve e sustentável',
    detalhe:
      'Um déficit de 300 a 500 kcal por dia, com proteína alta e passos diários, leva a perder de 0,5% a 1% do peso por semana preservando músculo.',
    imagem: 'strain',
    meta: {
      metrica: 'passos',
      alvo: 8000,
      porque:
        'Passos diários aumentam o gasto sem elevar o apetite como treinos extenuantes.',
    },
  },
  gain_muscle: {
    titulo: 'Força progressiva 3 vezes por semana',
    detalhe:
      'Treine os grandes grupos musculares três vezes por semana, aumentando carga ou repetições aos poucos, com cerca de 1,6 g/kg de proteína por dia.',
    imagem: 'strength',
    meta: {
      metrica: 'minutosAtivos',
      alvo: 30,
      porque:
        'Constância de treino é o principal motor de ganho de massa muscular.',
    },
  },
  improve_endurance: {
    titulo: 'Base aeróbica em zona 2',
    detalhe:
      'De 150 a 300 minutos por semana em ritmo de conversa constroem a base aeróbica; um treino intervalado por semana eleva o teto.',
    imagem: 'cardio',
    meta: {
      metrica: 'minutosAtivos',
      alvo: 40,
      porque: 'Volume aeróbico semanal é o que mais desenvolve resistência.',
    },
  },
  reduce_stress: {
    titulo: 'Respiração lenta duas vezes ao dia',
    detalhe:
      'Cinco minutos de respiração com expiração mais longa que a inspiração, de manhã e à noite, reduzem a ativação do sistema nervoso simpático.',
    imagem: 'breath',
    meta: {
      metrica: 'meditacao',
      alvo: 10,
      porque:
        'Prática diária curta reduz o estresse percebido mais que sessões longas e raras.',
    },
  },
  eat_healthier: {
    titulo: 'Metade do prato com vegetais',
    detalhe:
      'Vegetais em metade do prato, fibras em todas as refeições e ultraprocessados como exceção, sem proibições rígidas.',
    imagem: 'fiber',
    meta: {
      metrica: 'agua',
      alvo: 2.5,
      porque: 'Hidratação adequada reduz a confusão entre sede e fome.',
    },
  },
  optimize_hrv: {
    titulo: 'Proteger a VFC',
    detalhe:
      'Horário de sono regular, álcool mínimo e treino intenso só em dias de boa recuperação sustentam uma VFC alta.',
    imagem: 'regularity',
    meta: {
      metrica: 'sono',
      alvo: 7.5,
      porque:
        'Sono suficiente é o fator que mais eleva a VFC de um dia para o outro.',
    },
  },
  improve_readiness: {
    titulo: 'Rotina de recuperação',
    detalhe:
      'Alterne dias fortes e leves conforme a prontidão do dia e encerre o dia com luz baixa e sem telas.',
    imagem: 'deep_sleep',
    meta: {
      metrica: 'sono',
      alvo: 7.5,
      porque: 'Sono é o maior componente da prontidão.',
    },
  },
  regulate_sleep_duration: {
    titulo: 'De 7 a 9 horas por noite',
    detalhe:
      'Defina o horário de acordar e conte 8 horas para trás: esse é o seu horário de deitar, inclusive nos fins de semana.',
    imagem: 'deep_sleep',
    meta: {
      metrica: 'sono',
      alvo: 7.5,
      porque:
        'A média de 7 dias mostra se a duração está regular, não só uma noite boa.',
    },
  },
  improve_sleep_efficiency: {
    titulo: 'Cama só para dormir',
    detalhe:
      'Sem sono em 20 minutos, levante e volte só com sono; evite cafeína depois do almoço e refeições pesadas à noite.',
    imagem: 'light',
  },
  reduce_social_jetlag: {
    titulo: 'Mesmo horário todos os dias',
    detalhe:
      'Mantenha a diferença de horário de acordar entre dias úteis e fins de semana abaixo de 1 hora.',
    imagem: 'regularity',
  },
  increase_vo2max: {
    titulo: 'Intervalado 4×4 uma vez por semana',
    detalhe:
      'Quatro blocos de 4 minutos em esforço forte com 3 minutos leves entre eles, uma vez por semana, somados à base aeróbica.',
    imagem: 'cardio',
    meta: {
      metrica: 'minutosAtivos',
      alvo: 30,
      porque:
        'O VO₂max cresce com volume aeróbico somado a estímulos intensos.',
    },
  },
  meet_activity_guidelines: {
    titulo: '150 minutos por semana',
    detalhe:
      'A diretriz da OMS para adultos é de 150 a 300 minutos de atividade moderada por semana e força duas vezes por semana.',
    imagem: 'cardio',
    meta: {
      metrica: 'minutosAtivos',
      alvo: 25,
      porque: '25 minutos por dia cumprem a diretriz semanal de 150 minutos.',
    },
  },
  optimize_protein: {
    titulo: 'Proteína em todas as refeições',
    detalhe:
      'Distribua de 1,2 a 1,6 g/kg de proteína em 3 ou 4 refeições, com 25 a 40 g em cada uma.',
    imagem: 'protein',
  },
};

function createItem(title: string, details: string, image: string) {
  return {
    id: crypto.randomUUID(),
    title,
    details,
    image,
  };
}

export function generateLocalWellnessPlan(payload: PlanPayload) {
  const sleepMinutes = payload.metrics.sleep_duration_minutes ?? 0;
  const hrv = payload.metrics.hrv_ms ?? 0;
  const steps = payload.metrics.steps ?? 0;
  const glucose = payload.metrics.blood_glucose_mgdl ?? null;
  const moonPhase = payload.astrology.moonPhase;

  const readiness = payload.readiness ?? null;
  const recoveryMode =
    (hrv > 0 && hrv < 40) || (readiness !== null && readiness < 55);
  const shortSleep = sleepMinutes > 0 && sleepMinutes < 420;
  const highGlucose = glucose !== null && glucose > 110;
  const lowActivity = steps > 0 && steps < 6000;

  const summary = [
    `Lua em ${payload.astrology.moonSign}, nakshatra ${payload.astrology.nakshatra}, ${payload.astrology.tithi} e ayanamsha de ${payload.astrology.ayanamshaDegrees.toFixed(2)} graus.`,
    `Leitura fisiológica-astrológica atual com foco em ${payload.astrology.impactOnHealth.energy.toLowerCase()}.`,
    readiness !== null
      ? `Prontidão de hoje: ${Math.round(readiness)}/100.`
      : '',
    recoveryMode || shortSleep
      ? 'Seu protocolo de hoje prioriza recuperação, sono consistente e menor agressão metabólica.'
      : 'Seu protocolo de hoje pode combinar carga física moderada com alimentação estável e recuperação ativa.',
  ]
    .filter(Boolean)
    .join(' ');

  const nutritionItems = [
    highGlucose
      ? createItem(
          'Modular carga glicêmica',
          'Priorize refeição com proteína, fibra e vegetais no início do prato para reduzir pico pós-prandial e preservar energia.',
          'glucose_control'
        )
      : createItem(
          'Ancorar proteína cedo',
          'Concentre proteína nas primeiras refeições do dia para apoiar saciedade, recuperação e estabilidade circadiana.',
          'protein'
        ),
    createItem(
      'Hidratação contextual',
      moonPhase > 0.45 && moonPhase < 0.55
        ? 'Na janela de Lua Cheia, hidrate-se de forma fracionada ao longo do dia para reduzir percepção de agitação e retenção.'
        : 'Hidrate-se de forma fracionada, ajustando eletrólitos conforme treino, temperatura corporal e quantidade de sono.',
      'hydration'
    ),
  ];

  const exerciseItems = [
    recoveryMode || shortSleep
      ? createItem(
          'Reduzir intensidade',
          'Troque sessões extenuantes por caminhada vigorosa, mobilidade e força submáxima até que HRV e sono se recuperem.',
          'strain'
        )
      : createItem(
          'Treino principal do dia',
          'Mantenha treino moderado a intenso apenas se sua sensação subjetiva estiver alinhada com prontidão e recuperação.',
          'strength'
        ),
    lowActivity
      ? createItem(
          'Quebrar sedentarismo',
          'Inclua blocos curtos de movimento ao longo do dia para elevar circulação, sensibilidade insulínica e foco.',
          'sedentary'
        )
      : createItem(
          'Consolidar volume',
          'Feche o dia com zona aeróbica leve para ampliar recuperação sem elevar demais a carga interna.',
          'cardio'
        ),
  ];

  const sleepItems = [
    shortSleep
      ? createItem(
          'Janela de sono prioritária',
          'Antecipe o início da rotina noturna em 60 minutos, reduza telas e mantenha quarto mais frio para ampliar sono profundo.',
          'deep_sleep'
        )
      : createItem(
          'Preservar regularidade',
          'Repita horário de dormir e acordar com margem máxima de 30 minutos para sustentar recuperação autonômica.',
          'regularity'
        ),
    createItem(
      'Ajuste astrológico do sono',
      payload.astrology.impactOnHealth.sleep,
      'moon'
    ),
  ];

  if (payload.goals.includes('manage_blood_glucose') && !highGlucose) {
    nutritionItems.push(
      createItem(
        'Monitorar glicose de contexto',
        'Reavalie glicemia em refeições mais densas em carboidrato para identificar padrão individual de resposta.',
        'post_meal'
      )
    );
  }

  // Pilar dos objetivos do perfil e as metas automáticas sugeridas (uma por
  // métrica, no máximo três).
  const goalItems = payload.goals
    .filter((objetivo) => objetivo in ACOES_DOS_OBJETIVOS)
    .map((objetivo) => {
      const acao = ACOES_DOS_OBJETIVOS[objetivo];
      return createItem(acao.titulo, acao.detalhe, acao.imagem);
    });
  const metasSugeridas: MetaSugerida[] = [];
  for (const objetivo of payload.goals) {
    const meta = ACOES_DOS_OBJETIVOS[objetivo]?.meta;
    if (
      meta &&
      metasSugeridas.length < 3 &&
      !metasSugeridas.some((m) => m.metrica === meta.metrica)
    ) {
      metasSugeridas.push(meta);
    }
  }

  return {
    summary,
    metasSugeridas,
    pillars: {
      ...(goalItems.length > 0
        ? {
            goals: {
              title: 'Seus objetivos',
              icon: 'CheckCircle',
              color: 'text-primary',
              description:
                'Uma ação concreta para cada objetivo escolhido no seu perfil.',
              items: goalItems,
            },
          }
        : {}),
      nutrition: {
        title: 'Nutrição',
        icon: 'Utensils',
        color: 'text-primary',
        description:
          'Intervenções alimentares de baixo atrito e alto impacto metabólico.',
        items: nutritionItems,
      },
      exercise: {
        title: 'Movimento',
        icon: 'Dumbbell',
        color: 'text-accent',
        description:
          'Prescrição de movimento guiada por recuperação e prontidão.',
        items: exerciseItems,
      },
      sleep: {
        title: 'Sono',
        icon: 'Moon',
        color: 'text-cosmic',
        description:
          'Recuperação noturna alinhada ao estado fisiológico e ao céu atual.',
        items: sleepItems,
      },
    },
  };
}
