import { queryRows } from '@/lib/mysql/pool';

/**
 * Dica do dia (tarefa 43): escolhida do conteúdo curado pelo administrador
 * (`ai_tips`) pela área que mais pede atenção nos sinais registrados hoje, e
 * não por sorteio. Sem sinal que aponte uma área, a dica roda por dia (a
 * mesma o dia inteiro, outra no dia seguinte).
 */

export type AreaDaDica =
  'sono' | 'hidratacao' | 'movimento' | 'mente' | 'nutricao';

/** Categorias de `ai_tips` aceitas para cada área (sem acento, minúsculas). */
const CATEGORIAS: Record<AreaDaDica, readonly string[]> = {
  sono: ['sono', 'descanso', 'recuperacao'],
  hidratacao: ['hidratacao', 'agua'],
  movimento: ['movimento', 'atividade', 'exercicio', 'treino'],
  mente: ['mente', 'estresse', 'meditacao', 'bem-estar', 'respiracao'],
  nutricao: ['nutricao', 'alimentacao', 'proteina'],
};

export function normalizarCategoria(texto: string | null) {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

export interface SinaisDaDica {
  sleep_duration_minutes: number | null;
  water_liters: number | null;
  steps: number | null;
  active_minutes: number | null;
  stress_score: number | null;
  protein_grams: number | null;
}

/**
 * Áreas que pedem atenção hoje, da mais urgente para a menos, com o motivo
 * em texto. Só sinais registrados entram (ausência não é problema de saúde).
 */
export function areasQuePedemAtencao(sinais: SinaisDaDica | null) {
  if (!sinais) return [];
  const areas: Array<{ area: AreaDaDica; motivo: string }> = [];
  const sono = sinais.sleep_duration_minutes;
  if (sono !== null && sono < 420) {
    areas.push({
      area: 'sono',
      motivo: `Você dormiu ${Math.floor(sono / 60)}h${String(Math.round(sono % 60)).padStart(2, '0')}, abaixo das 7 h recomendadas.`,
    });
  }
  if (sinais.stress_score !== null && sinais.stress_score >= 60) {
    areas.push({
      area: 'mente',
      motivo: `Estresse registrado em ${Math.round(sinais.stress_score)}/100.`,
    });
  }
  const poucoMovimento =
    (sinais.steps !== null && sinais.steps < 6000) ||
    (sinais.active_minutes !== null && sinais.active_minutes < 20);
  if (poucoMovimento) {
    areas.push({
      area: 'movimento',
      motivo:
        sinais.steps !== null && sinais.steps < 6000
          ? `${sinais.steps.toLocaleString('pt-BR')} passos registrados hoje.`
          : `${sinais.active_minutes} min ativos registrados hoje.`,
    });
  }
  if (sinais.water_liters !== null && sinais.water_liters < 1.5) {
    areas.push({
      area: 'hidratacao',
      motivo: `${sinais.water_liters.toLocaleString('pt-BR')} L de água registrados hoje.`,
    });
  }
  if (sinais.protein_grams !== null && sinais.protein_grams < 60) {
    areas.push({
      area: 'nutricao',
      motivo: `${Math.round(sinais.protein_grams)} g de proteína registrados hoje.`,
    });
  }
  return areas;
}

export interface Dica {
  id: string;
  title: string;
  detail: string;
  category: string | null;
}

/** Número do dia (para o rodízio estável ao longo do dia). */
function numeroDoDia(data: string) {
  return Math.floor(Date.parse(`${data}T00:00:00Z`) / 86_400_000);
}

export function escolherDica(
  dicas: Dica[],
  sinais: SinaisDaDica | null,
  hoje: string
): { dica: Dica; motivo: string | null } | null {
  if (dicas.length === 0) return null;
  const ordenadas = [...dicas].sort((a, b) => a.id.localeCompare(b.id));
  for (const { area, motivo } of areasQuePedemAtencao(sinais)) {
    const daArea = ordenadas.filter((dica) =>
      CATEGORIAS[area].includes(normalizarCategoria(dica.category))
    );
    if (daArea.length > 0) {
      return { dica: daArea[numeroDoDia(hoje) % daArea.length], motivo };
    }
  }
  return {
    dica: ordenadas[numeroDoDia(hoje) % ordenadas.length],
    motivo: null,
  };
}

export async function dicaDoDia(userId: string, hoje: string) {
  const dicas = await queryRows<Dica>(
    'SELECT id, title, detail, category FROM ai_tips WHERE is_active = TRUE'
  );
  const [linha] = await queryRows<Record<string, unknown>>(
    `SELECT sleep_duration_minutes, water_liters, steps, active_minutes,
            stress_score, protein_grams
       FROM daily_metrics WHERE user_id = ? AND date = ? LIMIT 1`,
    [userId, hoje]
  );
  const numero = (valor: unknown) =>
    valor === null || valor === undefined ? null : Number(valor);
  const sinais: SinaisDaDica | null = linha
    ? {
        sleep_duration_minutes: numero(linha.sleep_duration_minutes),
        water_liters: numero(linha.water_liters),
        steps: numero(linha.steps),
        active_minutes: numero(linha.active_minutes),
        stress_score: numero(linha.stress_score),
        protein_grams: numero(linha.protein_grams),
      }
    : null;
  return escolherDica(dicas, sinais, hoje);
}
