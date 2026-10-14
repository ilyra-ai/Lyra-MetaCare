/**
 * Catálogo das metas automáticas (tarefa 43), sem dependência de servidor:
 * usado pela rota, pelo recálculo e pelo formulário no navegador.
 *
 * - Métricas diárias (passos, sono, água, meditação, minutos ativos): média
 *   dos dias com registro nos últimos 7 dias, para medir constância e não um
 *   dia isolado.
 * - Peso: o registro mais recente dos últimos 30 dias, e a direção vem do
 *   alvo (abaixo do peso atual = reduzir).
 */

export interface MetricaDaMeta {
  coluna: string;
  rotulo: string;
  unidade: string;
  /** Converte o valor gravado para a unidade da meta (ex.: minutos → horas). */
  escala: number;
  casas: number;
  categoria: string;
  /** null: direção definida pelo alvo em relação ao valor atual. */
  direcao: 'up' | 'down' | null;
  modo: 'media7' | 'ultimo30';
  minimo: number;
  maximo: number;
  /** Sugestão de alvo no formulário. */
  sugestao: number;
}

export const METRICAS_DAS_METAS = {
  passos: {
    coluna: 'steps',
    rotulo: 'Passos por dia',
    unidade: 'passos',
    escala: 1,
    casas: 0,
    categoria: 'Movimento',
    direcao: 'up',
    modo: 'media7',
    minimo: 500,
    maximo: 50_000,
    sugestao: 8000,
  },
  sono: {
    coluna: 'sleep_duration_minutes',
    rotulo: 'Sono por noite',
    unidade: 'h',
    escala: 1 / 60,
    casas: 1,
    categoria: 'Sono',
    direcao: 'up',
    modo: 'media7',
    minimo: 4,
    maximo: 12,
    sugestao: 7.5,
  },
  agua: {
    coluna: 'water_liters',
    rotulo: 'Água por dia',
    unidade: 'L',
    escala: 1,
    casas: 1,
    categoria: 'Hidratação',
    direcao: 'up',
    modo: 'media7',
    minimo: 0.5,
    maximo: 6,
    sugestao: 2.5,
  },
  meditacao: {
    coluna: 'meditation_minutes',
    rotulo: 'Meditação por dia',
    unidade: 'min',
    escala: 1,
    casas: 0,
    categoria: 'Mente',
    direcao: 'up',
    modo: 'media7',
    minimo: 1,
    maximo: 240,
    sugestao: 10,
  },
  minutosAtivos: {
    coluna: 'active_minutes',
    rotulo: 'Minutos ativos por dia',
    unidade: 'min',
    escala: 1,
    casas: 0,
    categoria: 'Movimento',
    direcao: 'up',
    modo: 'media7',
    minimo: 5,
    maximo: 600,
    sugestao: 30,
  },
  peso: {
    coluna: 'weight_kg',
    rotulo: 'Peso',
    unidade: 'kg',
    escala: 1,
    casas: 1,
    categoria: 'Corpo',
    direcao: null,
    modo: 'ultimo30',
    minimo: 30,
    maximo: 300,
    sugestao: 70,
  },
} as const satisfies Record<string, MetricaDaMeta>;

export type ChaveDaMetrica = keyof typeof METRICAS_DAS_METAS;

export const CHAVES_DAS_METRICAS = Object.keys(
  METRICAS_DAS_METAS
) as ChaveDaMetrica[];

export function ehChaveDaMetrica(valor: unknown): valor is ChaveDaMetrica {
  return (
    typeof valor === 'string' &&
    (CHAVES_DAS_METRICAS as readonly string[]).includes(valor)
  );
}

export function diasAntes(data: string, dias: number) {
  const instante = new Date(`${data}T12:00:00Z`);
  instante.setUTCDate(instante.getUTCDate() - dias);
  return instante.toISOString().slice(0, 10);
}

export interface RegistroDaMetrica {
  date: string;
  valor: number | null;
}

/**
 * Valor atual da meta (na unidade da meta) e quantos dias entraram. Pura:
 * recebe os registros já filtrados da pessoa.
 */
export function valorAtualDaMeta(
  chave: ChaveDaMetrica,
  registros: RegistroDaMetrica[],
  hoje: string
) {
  const metrica: MetricaDaMeta = METRICAS_DAS_METAS[chave];
  const inicio = diasAntes(hoje, metrica.modo === 'media7' ? 6 : 29);
  const validos = registros
    .filter(
      (r): r is { date: string; valor: number } =>
        r.date >= inicio &&
        r.date <= hoje &&
        r.valor !== null &&
        Number.isFinite(r.valor)
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  if (validos.length === 0) return { valor: null, dias: 0 };
  const bruto =
    metrica.modo === 'ultimo30'
      ? validos[validos.length - 1].valor
      : validos.reduce((soma, r) => soma + r.valor, 0) / validos.length;
  const fator = 10 ** metrica.casas;
  return {
    valor: Math.round(bruto * metrica.escala * fator) / fator,
    dias: validos.length,
  };
}

/** Sequências derivadas do registro do dia (calculadas no servidor). */
export const CRITERIOS_DAS_SEQUENCIAS = {
  daily_metrics: {
    rotulo: 'Registro do dia',
    regra: 'dias com check-in ou sessão da pulseira',
  },
  sleep_hygiene: { rotulo: 'Sono de 7 h ou mais', regra: 'sono ≥ 7 h' },
  movement: {
    rotulo: 'Corpo em movimento',
    regra: '7.000 passos ou 30 min ativos',
  },
  meditation: { rotulo: 'Meditação', regra: 'meditação registrada' },
  hydration: { rotulo: 'Hidratação', regra: '2 L de água ou mais' },
} as const;

export type TipoDeSequencia = keyof typeof CRITERIOS_DAS_SEQUENCIAS;

export type StatusDaMeta = 'in_progress' | 'completed' | 'missed';

/** Status pela regra do alvo e do prazo. */
export function statusDaMeta(meta: {
  atual: number | null;
  alvo: number | null;
  direcao: 'up' | 'down';
  prazo: string | null;
  hoje: string;
}): StatusDaMeta {
  const atingida =
    meta.atual !== null &&
    meta.alvo !== null &&
    (meta.direcao === 'down'
      ? meta.atual <= meta.alvo
      : meta.atual >= meta.alvo);
  if (atingida) return 'completed';
  if (meta.prazo && meta.prazo < meta.hoje) return 'missed';
  return 'in_progress';
}
