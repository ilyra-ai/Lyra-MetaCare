import { createHash, randomUUID } from 'node:crypto';

import type { PoolConnection } from 'mysql2/promise';

import {
  type BirthReference,
  getAstrologicalContext,
} from '@/lib/astrology/engine';
import { listaDeTextos } from '@/lib/json-values';
import { diasAntes } from '@/lib/metas/catalogo';
import { hojeDaPessoa } from '@/lib/metas/servico';
import { executeStatement, queryRows } from '@/lib/mysql/pool';
import { recursoHabilitado } from '@/lib/plans/service';

import { generateLocalWellnessPlan } from './plan-engine';

/**
 * Plano de IA com validade (tarefa 43): gerado com a média dos últimos 7 dias
 * de registro, a prontidão de hoje, os objetivos e o céu do dia, e refeito
 * sozinho quando o dia vira ou quando as entradas mudam. Antes o plano usava
 * a última linha de qualquer data e só mudava quando a pessoa clicava.
 */

export type PlanoGerado = ReturnType<typeof generateLocalWellnessPlan> & {
  meta: {
    /** Dia local (AAAA-MM-DD) para o qual o plano foi feito. */
    data: string;
    geradoEm: string;
    origem: 'manual' | 'automatico';
    /** Sinais usados, em texto ("Sono médio 7h10 (5 dias)"). */
    base: string[];
    hash: string;
  };
};

interface LinhaDoDia {
  date: string;
  hrv_ms: number | string | null;
  sleep_duration_minutes: number | string | null;
  steps: number | string | null;
  blood_glucose_mgdl: number | string | null;
  weight_kg: number | string | null;
  readiness_score: number | string | null;
}

function numero(valor: unknown) {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function media(linhas: LinhaDoDia[], coluna: keyof LinhaDoDia) {
  const valores = linhas
    .map((l) => numero(l[coluna]))
    .filter((v): v is number => v !== null);
  return valores.length === 0
    ? { valor: null, dias: 0 }
    : {
        valor: valores.reduce((s, v) => s + v, 0) / valores.length,
        dias: valores.length,
      };
}

function ultimo(linhas: LinhaDoDia[], coluna: keyof LinhaDoDia) {
  for (const linha of linhas) {
    const valor = numero(linha[coluna]);
    if (valor !== null) return valor;
  }
  return null;
}

async function entradas(userId: string, hoje: string) {
  const [perfil] = await queryRows<BirthReference & { goals: unknown }>(
    `SELECT goals, birth_date, birth_time, birth_location, birth_latitude,
            birth_longitude, birth_timezone
       FROM profiles WHERE id = ? LIMIT 1`,
    [userId]
  );
  const linhas = await queryRows<LinhaDoDia>(
    `SELECT date, hrv_ms, sleep_duration_minutes, steps, blood_glucose_mgdl,
            weight_kg, readiness_score
       FROM daily_metrics
      WHERE user_id = ? AND date BETWEEN ? AND ?
      ORDER BY date DESC`,
    [userId, diasAntes(hoje, 6), hoje]
  );
  const sono = media(linhas, 'sleep_duration_minutes');
  const passos = media(linhas, 'steps');
  const vfc = media(linhas, 'hrv_ms');
  const metricas = {
    hrv_ms: vfc.valor === null ? null : Math.round(vfc.valor),
    sleep_duration_minutes: sono.valor === null ? null : Math.round(sono.valor),
    steps: passos.valor === null ? null : Math.round(passos.valor),
    blood_glucose_mgdl: ultimo(linhas, 'blood_glucose_mgdl'),
    weight_kg: ultimo(linhas, 'weight_kg'),
  };
  const hojeLinha = linhas.find((l) => String(l.date).slice(0, 10) === hoje);
  const prontidao = hojeLinha ? numero(hojeLinha.readiness_score) : null;
  const objetivos = listaDeTextos(perfil?.goals);

  const base: string[] = [];
  if (metricas.sleep_duration_minutes !== null) {
    const m = metricas.sleep_duration_minutes;
    base.push(
      `Sono médio ${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')} (${sono.dias} ${sono.dias === 1 ? 'dia' : 'dias'})`
    );
  }
  if (metricas.steps !== null) {
    base.push(
      `Passos médios ${metricas.steps.toLocaleString('pt-BR')} (${passos.dias} ${passos.dias === 1 ? 'dia' : 'dias'})`
    );
  }
  if (metricas.hrv_ms !== null) base.push(`VFC média ${metricas.hrv_ms} ms`);
  if (metricas.blood_glucose_mgdl !== null) {
    base.push(`Glicemia ${metricas.blood_glucose_mgdl} mg/dL`);
  }
  if (prontidao !== null)
    base.push(`Prontidão de hoje ${Math.round(prontidao)}`);
  if (objetivos.length > 0) {
    base.push(
      `${objetivos.length} ${objetivos.length === 1 ? 'objetivo' : 'objetivos'} do perfil`
    );
  }

  const hash = createHash('sha256')
    .update(JSON.stringify({ metricas, prontidao, objetivos }))
    .digest('hex');
  return { perfil, metricas, prontidao, objetivos, base, hash };
}

export async function gerarPlanoDaPessoa(
  userId: string,
  origem: PlanoGerado['meta']['origem'],
  agora = new Date()
): Promise<PlanoGerado> {
  const hoje = await hojeDaPessoa(userId, agora);
  const e = await entradas(userId, hoje);
  const plano = generateLocalWellnessPlan({
    metrics: e.metricas,
    readiness: e.prontidao,
    astrology: getAstrologicalContext(agora, e.perfil ?? undefined),
    goals: e.objetivos,
  });
  return {
    ...plano,
    meta: {
      data: hoje,
      geradoEm: agora.toISOString(),
      origem,
      base: e.base,
      hash: e.hash,
    },
  };
}

export async function gravarPlano(
  userId: string,
  plano: PlanoGerado,
  conexao?: PoolConnection
) {
  const sql = `INSERT INTO ai_plans (id, user_id, plan_data)
               VALUES (?, ?, ?) AS novo
               ON DUPLICATE KEY UPDATE
                 plan_data = novo.plan_data,
                 updated_at = CURRENT_TIMESTAMP`;
  const params: string[] = [randomUUID(), userId, JSON.stringify(plano)];
  if (conexao) await conexao.execute(sql, params);
  else await executeStatement(sql, params);
}

function planoValido(valor: unknown): valor is PlanoGerado {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    typeof (valor as { summary?: unknown }).summary === 'string' &&
    typeof (valor as { pillars?: unknown }).pillars === 'object'
  );
}

export interface PlanoAtualizado {
  plano: PlanoGerado;
  /** O plano foi gerado ou refeito nesta leitura. */
  atualizado: boolean;
  /** Primeiro plano da pessoa, preparado sozinho (tarefa 51). */
  primeiro: boolean;
}

/**
 * Plano da pessoa, sempre pronto: gerado sozinho na primeira leitura (desde a
 * tarefa 51; antes, o primeiro plano dependia de a pessoa clicar em "Gerar")
 * e refeito quando é de outro dia ou quando as entradas mudaram. As gerações
 * automáticas não consomem a cota das gerações manuais.
 */
export async function obterPlanoAtualizado(
  userId: string,
  agora = new Date()
): Promise<PlanoAtualizado> {
  const [linha] = await queryRows<{ plan_data: unknown }>(
    'SELECT plan_data FROM ai_plans WHERE user_id = ? LIMIT 1',
    [userId]
  );
  if (linha) {
    const salvo =
      typeof linha.plan_data === 'string'
        ? (JSON.parse(linha.plan_data) as unknown)
        : linha.plan_data;

    const hoje = await hojeDaPessoa(userId, agora);
    if (planoValido(salvo) && salvo.meta?.data === hoje) {
      const { hash } = await entradas(userId, hoje);
      if (salvo.meta.hash === hash) {
        return { plano: salvo, atualizado: false, primeiro: false };
      }
    }
  }
  const novo = await gerarPlanoDaPessoa(userId, 'automatico', agora);
  await gravarPlano(userId, novo);
  return { plano: novo, atualizado: true, primeiro: !linha };
}

/**
 * Prepara o plano do dia quando a pessoa entra no app (tarefa 51), se o
 * plano dela inclui o Plano de IA. Roda depois da resposta do login, sem
 * atrasar a entrada.
 */
export async function prepararPlanoAoEntrar(
  userId: string,
  role: string,
  agora = new Date()
): Promise<'pronto' | 'sem_recurso'> {
  if (!(await recursoHabilitado(userId, role, 'ai_plan_generations'))) {
    return 'sem_recurso';
  }
  await obterPlanoAtualizado(userId, agora);
  return 'pronto';
}
