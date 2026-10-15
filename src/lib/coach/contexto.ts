import { createHash } from 'node:crypto';

import {
  lerPerfilAstrologico,
  type PerfilAstrologico,
} from '@/lib/astrology/perfil-astrologico';
import { dataLocal } from '@/lib/astrology/tempo';
import { listaDeTextos } from '@/lib/json-values';
import { queryRows } from '@/lib/mysql/pool';

/**
 * Entradas reais do coach de uma pessoa em uma data: perfil (nascimento,
 * moradia, ciclo, objetivos) e as métricas de hoje e dos sete dias
 * anteriores. O hash dessas entradas decide quando o briefing precisa ser
 * refeito (check-in novo, sessão da pulseira, mudança de cidade).
 */

/** Muda quando o gerador muda de regra: força refazer os briefings do dia. */
export const VERSAO_DO_GERADOR = 2;

export const COLUNAS_DO_COACH = [
  'sleep_duration_minutes',
  'deep_sleep_minutes',
  'hrv_ms',
  'resting_heart_rate',
  'mood_score',
  'energy_level',
  'stress_score',
  'steps',
  'active_minutes',
  'water_liters',
  'caffeine_mg',
  'protein_grams',
  'meditation_minutes',
  'blood_glucose_mgdl',
  'body_temperature_celsius',
  'spo2_average',
  'respiratory_rate',
  'sedentary_hours',
  'weight_kg',
] as const;

export type ColunaDoCoach = (typeof COLUNAS_DO_COACH)[number];

export type MetricasDoCoach = {
  date: string;
  menstrual_flow: string | null;
} & {
  [coluna in ColunaDoCoach]: number | null;
};

export interface CicloDoPerfil {
  lastMenstrualPeriod: string | null;
  cycleLength: number | null;
  periodLength: number | null;
  lifeStage: string | null;
}

export interface ContextoDoCoach {
  userId: string;
  /** Data local (AAAA-MM-DD) no fuso do lugar do dia. */
  data: string;
  perfil: PerfilAstrologico & {
    localDoDia: NonNullable<PerfilAstrologico['localDoDia']>;
  };
  pessoa: {
    nome: string | null;
    objetivos: string[];
    ciclo: CicloDoPerfil | null;
  };
  hoje: MetricasDoCoach | null;
  /** Sete dias anteriores a `data`, do mais recente ao mais antigo. */
  historico: MetricasDoCoach[];
}

export type ResultadoDoContexto =
  | { estado: 'pronto'; contexto: ContextoDoCoach }
  | { estado: 'sem_local'; perfil: PerfilAstrologico };

interface LinhaDaPessoa {
  first_name: string | null;
  goals: unknown;
  tracks_menstrual_cycle: number | boolean | null;
  last_menstrual_period: string | null;
  menstrual_cycle_length: number | null;
  menstrual_period_length: number | null;
  menstrual_life_stage: string | null;
}

function numeroOuNulo(valor: unknown) {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function normalizarMetricas(linha: Record<string, unknown>): MetricasDoCoach {
  const metricas = {
    date: String(linha.date).slice(0, 10),
    menstrual_flow:
      typeof linha.menstrual_flow === 'string' ? linha.menstrual_flow : null,
  } as MetricasDoCoach;
  for (const coluna of COLUNAS_DO_COACH) {
    metricas[coluna] = numeroOuNulo(linha[coluna]);
  }
  return metricas;
}

function diaAnterior(data: string, dias: number) {
  const instante = new Date(`${data}T12:00:00Z`);
  instante.setUTCDate(instante.getUTCDate() - dias);
  return instante.toISOString().slice(0, 10);
}

export async function lerContextoDoCoach(
  userId: string,
  agora: Date = new Date()
): Promise<ResultadoDoContexto> {
  const perfil = await lerPerfilAstrologico(userId);
  const lugar = perfil.localDoDia;
  if (!lugar) return { estado: 'sem_local', perfil };

  const data = dataLocal(agora, lugar.fuso);
  const [pessoa] = await queryRows<LinhaDaPessoa>(
    `SELECT first_name, goals, tracks_menstrual_cycle, last_menstrual_period,
            menstrual_cycle_length, menstrual_period_length, menstrual_life_stage
       FROM profiles WHERE id = ? LIMIT 1`,
    [userId]
  );
  const linhas = await queryRows<Record<string, unknown>>(
    `SELECT date, menstrual_flow, ${COLUNAS_DO_COACH.join(', ')}
       FROM daily_metrics
      WHERE user_id = ? AND date BETWEEN ? AND ?
      ORDER BY date DESC`,
    [userId, diaAnterior(data, 7), data]
  );
  const metricas = linhas.map(normalizarMetricas);

  return {
    estado: 'pronto',
    contexto: {
      userId,
      data,
      perfil: { ...perfil, localDoDia: lugar },
      pessoa: {
        nome: pessoa?.first_name?.trim() || null,
        objetivos: listaDeTextos(pessoa?.goals),
        ciclo: pessoa?.tracks_menstrual_cycle
          ? {
              lastMenstrualPeriod: pessoa.last_menstrual_period
                ? String(pessoa.last_menstrual_period).slice(0, 10)
                : null,
              cycleLength: pessoa.menstrual_cycle_length,
              periodLength: pessoa.menstrual_period_length,
              lifeStage: pessoa.menstrual_life_stage,
            }
          : null,
      },
      hoje: metricas.find((m) => m.date === data) ?? null,
      historico: metricas.filter((m) => m.date < data),
    },
  };
}

/**
 * SHA-256 das entradas: igual enquanto nada que o coach usa mudar. A
 * assinatura do provedor de IA (tipo, URL, modelo e data da configuração,
 * nunca a chave) faz a troca de modelo refazer o dia.
 */
export function hashDasEntradas(
  contexto: ContextoDoCoach,
  assinaturaDoProvedor: string
) {
  return createHash('sha256')
    .update(
      JSON.stringify({
        versao: VERSAO_DO_GERADOR,
        data: contexto.data,
        nascimento: contexto.perfil.nascimento,
        lugar: contexto.perfil.localDoDia,
        pessoa: contexto.pessoa,
        provedor: assinaturaDoProvedor,
        hoje: contexto.hoje,
        historico: contexto.historico,
      })
    )
    .digest('hex');
}
