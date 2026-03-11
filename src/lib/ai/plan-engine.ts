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
}

function createItem(title: string, details: string, image: string) {
  return {
    id: crypto.randomUUID(),
    title,
    details,
    image
  };
}

export function generateLocalWellnessPlan(payload: PlanPayload) {
  const sleepMinutes = payload.metrics.sleep_duration_minutes ?? 0;
  const hrv = payload.metrics.hrv_ms ?? 0;
  const steps = payload.metrics.steps ?? 0;
  const glucose = payload.metrics.blood_glucose_mgdl ?? null;
  const moonPhase = payload.astrology.moonPhase;

  const recoveryMode = hrv > 0 && hrv < 40;
  const shortSleep = sleepMinutes > 0 && sleepMinutes < 420;
  const highGlucose = glucose !== null && glucose > 110;
  const lowActivity = steps > 0 && steps < 6000;

  const summary = [
    `Lua em ${payload.astrology.moonSign} sob ${payload.astrology.nakshatra}, com foco atual em ${payload.astrology.impactOnHealth.energy.toLowerCase()}.`,
    recoveryMode || shortSleep
      ? 'Seu protocolo de hoje prioriza recuperação, sono consistente e menor agressão metabólica.'
      : 'Seu protocolo de hoje pode combinar carga física moderada com alimentação estável e recuperação ativa.'
  ].join(' ');

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
    )
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
        )
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
    )
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

  return {
    summary,
    pillars: {
      nutrition: {
        title: 'Nutrição',
        icon: 'Utensils',
        color: 'text-teal-600',
        description: 'Intervenções alimentares de baixo atrito e alto impacto metabólico.',
        items: nutritionItems
      },
      exercise: {
        title: 'Movimento',
        icon: 'Dumbbell',
        color: 'text-rose-600',
        description: 'Prescrição de movimento guiada por recuperação e prontidão.',
        items: exerciseItems
      },
      sleep: {
        title: 'Sono',
        icon: 'Moon',
        color: 'text-indigo-600',
        description: 'Recuperação noturna alinhada ao estado fisiológico e ao céu atual.',
        items: sleepItems
      }
    }
  };
}
