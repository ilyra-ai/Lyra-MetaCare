/**
 * Motor de Ciclo Menstrual e Saúde da Mulher.
 *
 * Calcula, de forma determinística e a partir de dados reais do perfil (data da
 * última menstruação, duração média do ciclo e do período), a fase atual do
 * ciclo (menstrual, folicular, ovulatória, lútea), o dia do ciclo, a janela
 * fértil estimada, a próxima menstruação e recomendações reais por fase
 * (energia, treino, nutrição, sono e tom do assistente).
 *
 * Trata com honestidade as fases de vida em que o cálculo de ciclo não se
 * aplica (perimenopausa, menopausa, gestação), oferecendo orientação própria.
 */

import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';

export type MenstrualPhase = 'menstrual' | 'folicular' | 'ovulatoria' | 'lutea';

export type MenstrualLifeStage =
  | 'ciclo_regular'
  | 'perimenopausa'
  | 'menopausa'
  | 'gestacao'
  | 'sem_ciclo';

export interface MenstrualConfig {
  lastMenstrualPeriod: string | Date | null;
  cycleLength?: number | null;
  periodLength?: number | null;
  lifeStage?: string | null;
}

export interface MenstrualPhaseRecommendation {
  energy: string;
  training: string;
  nutrition: string;
  sleep: string;
  tone: string;
}

export interface MenstrualCycleResult {
  trackable: boolean;
  lifeStage: MenstrualLifeStage;
  cycleDay: number | null;
  cycleLength: number;
  periodLength: number;
  phase: MenstrualPhase | null;
  phaseLabel: string;
  phaseEmoji: string;
  daysUntilNextPeriod: number | null;
  nextPeriodDate: string | null;
  ovulationDay: number | null;
  fertileWindowStartDay: number | null;
  fertileWindowEndDay: number | null;
  isFertileToday: boolean;
  recommendation: MenstrualPhaseRecommendation;
  summary: string;
  note?: string;
}

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

const PHASE_META: Record<MenstrualPhase, { label: string; emoji: string }> = {
  menstrual: { label: 'Fase menstrual', emoji: '🌑' },
  folicular: { label: 'Fase folicular', emoji: '🌒' },
  ovulatoria: { label: 'Fase ovulatória', emoji: '🌕' },
  lutea: { label: 'Fase lútea', emoji: '🌘' },
};

const PHASE_RECOMMENDATION: Record<
  MenstrualPhase,
  MenstrualPhaseRecommendation
> = {
  menstrual: {
    energy: 'Energia mais baixa — respeite o descanso e a introspecção.',
    training: 'Movimento leve: caminhada, alongamento e ioga restaurativa.',
    nutrition: 'Priorize ferro (folhas verdes, leguminosas) e hidratação.',
    sleep: 'Durma um pouco mais; o corpo está em renovação.',
    tone: 'Acolhedor e gentil, sem cobranças.',
  },
  folicular: {
    energy: 'Energia em ascensão — ótimo momento para começar projetos.',
    training: 'Janela para treinos intensos, força e novos desafios.',
    nutrition: 'Proteína e carboidratos complexos sustentam o pico de foco.',
    sleep: 'Sono regular potencializa a recuperação e a criatividade.',
    tone: 'Motivador e propositivo.',
  },
  ovulatoria: {
    energy: 'Pico de energia e disposição social.',
    training: 'Melhor janela para alta performance e PRs.',
    nutrition: 'Antioxidantes e fibras apoiam o equilíbrio hormonal.',
    sleep: 'Mantenha a regularidade para sustentar o pico.',
    tone: 'Expansivo e confiante.',
  },
  lutea: {
    energy: 'Energia decrescente — ritmo mais estável e introspectivo.',
    training: 'Treinos moderados; atenção ao excesso e à recuperação.',
    nutrition: 'Magnésio e ômega-3 ajudam com TPM e variações de humor.',
    sleep: 'Priorize higiene do sono; a qualidade tende a oscilar.',
    tone: 'Estável, paciente e organizador.',
  },
};

function normalizeLifeStage(value?: string | null): MenstrualLifeStage {
  switch ((value ?? '').toLowerCase()) {
    case 'perimenopausa':
      return 'perimenopausa';
    case 'menopausa':
      return 'menopausa';
    case 'gestacao':
    case 'gestação':
      return 'gestacao';
    case 'sem_ciclo':
      return 'sem_ciclo';
    default:
      return 'ciclo_regular';
  }
}

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? parseISO(value) : value;
}

function buildNonCyclicResult(
  lifeStage: MenstrualLifeStage,
  cycleLength: number,
  periodLength: number,
  note: string,
  recommendation: MenstrualPhaseRecommendation,
  summary: string
): MenstrualCycleResult {
  return {
    trackable: false,
    lifeStage,
    cycleDay: null,
    cycleLength,
    periodLength,
    phase: null,
    phaseLabel: 'Sem cálculo de fase',
    phaseEmoji: '🌸',
    daysUntilNextPeriod: null,
    nextPeriodDate: null,
    ovulationDay: null,
    fertileWindowStartDay: null,
    fertileWindowEndDay: null,
    isFertileToday: false,
    recommendation,
    summary,
    note,
  };
}

export function calculateMenstrualCycle(
  referenceDate: Date,
  config: MenstrualConfig
): MenstrualCycleResult {
  const lifeStage = normalizeLifeStage(config.lifeStage);
  const cycleLength =
    config.cycleLength && config.cycleLength >= 20 && config.cycleLength <= 45
      ? config.cycleLength
      : DEFAULT_CYCLE_LENGTH;
  const periodLength =
    config.periodLength && config.periodLength >= 2 && config.periodLength <= 10
      ? config.periodLength
      : DEFAULT_PERIOD_LENGTH;

  // Fases de vida sem ciclo ativo recebem orientação própria e honesta.
  if (lifeStage === 'menopausa') {
    return buildNonCyclicResult(
      lifeStage,
      cycleLength,
      periodLength,
      'Na menopausa não há cálculo de fase do ciclo. O foco passa a ser saúde óssea, cardiovascular, sono e bem-estar hormonal.',
      {
        energy: 'Estabilize a energia com rotina e exposição à luz natural.',
        training: 'Treino de força é prioritário para massa óssea e muscular.',
        nutrition: 'Cálcio, vitamina D e proteína sustentam ossos e músculos.',
        sleep: 'Cuide de fogachos e da higiene do sono para noites estáveis.',
        tone: 'Empático e empoderador.',
      },
      'Fase de vida: menopausa. Acompanhamento focado em longevidade e equilíbrio.'
    );
  }

  if (lifeStage === 'perimenopausa') {
    return buildNonCyclicResult(
      lifeStage,
      cycleLength,
      periodLength,
      'Na perimenopausa os ciclos ficam irregulares; a estimativa de fase perde precisão. Registre os sintomas para acompanhar tendências.',
      {
        energy: 'Energia pode oscilar — ajuste a carga conforme o dia.',
        training:
          'Combine força e mobilidade; respeite dias de menor disposição.',
        nutrition: 'Fibras, ômega-3 e proteína ajudam na variação hormonal.',
        sleep: 'Priorize o sono; oscilações hormonais afetam a noite.',
        tone: 'Acolhedor e flexível.',
      },
      'Fase de vida: perimenopausa. Acompanhamento por sintomas e tendências.'
    );
  }

  if (lifeStage === 'gestacao') {
    return buildNonCyclicResult(
      lifeStage,
      cycleLength,
      periodLength,
      'Durante a gestação o ciclo é interrompido. O acompanhamento passa a focar em energia, sono e bem-estar do período gestacional.',
      {
        energy: 'Respeite o ritmo do corpo e os sinais de cansaço.',
        training: 'Atividade leve e segura, conforme orientação profissional.',
        nutrition: 'Foque em nutrientes essenciais e hidratação.',
        sleep: 'Priorize descanso e conforto para dormir.',
        tone: 'Muito acolhedor e cuidadoso.',
      },
      'Fase de vida: gestação. Acompanhamento gentil e seguro.'
    );
  }

  // Sem data da última menstruação não há como calcular a fase.
  if (!config.lastMenstrualPeriod) {
    return buildNonCyclicResult(
      'sem_ciclo',
      cycleLength,
      periodLength,
      'Informe a data da última menstruação no seu perfil para ativar o cálculo de fase, janela fértil e recomendações personalizadas.',
      PHASE_RECOMMENDATION.folicular,
      'Configuração pendente: data da última menstruação.'
    );
  }

  const lastPeriod = toDate(config.lastMenstrualPeriod);
  const rawDiff = differenceInCalendarDays(referenceDate, lastPeriod);
  // Posição dentro do ciclo (0-based), tolerante a datas no passado distante.
  const dayIndex = ((rawDiff % cycleLength) + cycleLength) % cycleLength;
  const cycleDay = dayIndex + 1;

  // Ovulação ~ 14 dias antes do fim do ciclo (fase lútea ~constante).
  const ovulationDay = Math.max(10, cycleLength - 14);
  const fertileWindowStartDay = Math.max(1, ovulationDay - 5);
  const fertileWindowEndDay = ovulationDay + 1;

  let phase: MenstrualPhase;
  if (cycleDay <= periodLength) {
    phase = 'menstrual';
  } else if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay + 1) {
    phase = 'ovulatoria';
  } else if (cycleDay < ovulationDay - 1) {
    phase = 'folicular';
  } else {
    phase = 'lutea';
  }

  const daysUntilNextPeriod = cycleLength - dayIndex;
  const nextPeriodDate = format(
    addDays(referenceDate, daysUntilNextPeriod),
    'yyyy-MM-dd'
  );
  const isFertileToday =
    cycleDay >= fertileWindowStartDay && cycleDay <= fertileWindowEndDay;

  const meta = PHASE_META[phase];

  return {
    trackable: true,
    lifeStage: 'ciclo_regular',
    cycleDay,
    cycleLength,
    periodLength,
    phase,
    phaseLabel: meta.label,
    phaseEmoji: meta.emoji,
    daysUntilNextPeriod,
    nextPeriodDate,
    ovulationDay,
    fertileWindowStartDay,
    fertileWindowEndDay,
    isFertileToday,
    recommendation: PHASE_RECOMMENDATION[phase],
    summary: `Dia ${cycleDay} do ciclo • ${meta.label} • próxima menstruação em ${daysUntilNextPeriod} dia${daysUntilNextPeriod === 1 ? '' : 's'}.`,
  };
}
