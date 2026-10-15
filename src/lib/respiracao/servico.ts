import { randomUUID } from 'node:crypto';

import { lerPerfilAstrologico } from '@/lib/astrology/perfil-astrologico';
import { dataLocal, partesLocais } from '@/lib/astrology/tempo';
import {
  lerRegistroDoDia,
  somarMinutosDeMeditacao,
} from '@/lib/metricas/gravacao';
import { executeStatement, queryRows } from '@/lib/mysql/pool';

import {
  minutosDaSessao,
  recomendarTecnica,
  type Recomendacao,
  type SessaoDeRespiracao,
  type Tecnica,
} from './tecnicas';

/**
 * Respiração guiada (tarefa 44): registro das sessões e resumo do dia. A data
 * é sempre a do dia local da pessoa (fuso da cidade onde mora ou nasceu; sem
 * cidade, UTC), a mesma do check-in automático das metas e do coach.
 */

export interface SessaoRegistrada {
  id: string;
  tecnica: Tecnica;
  ciclos: number;
  segundos: number;
  minutos: number;
  /** ISO 8601 (UTC). */
  registradaEm: string;
}

export interface ResumoDaRespiracao {
  data: string;
  sessoes: SessaoRegistrada[];
  /** Minutos somados hoje pelas sessões guiadas. */
  minutosGuiados: number;
  /** Total de meditação do dia (sessões guiadas + check-in), ou null sem registro. */
  minutosDeMeditacaoNoDia: number | null;
  recomendacao: Recomendacao;
}

interface LinhaDaSessao {
  id: string;
  technique: Tecnica;
  cycles: number;
  duration_seconds: number;
  minutes_logged: number;
  created_at: string;
}

function isoDoBanco(valor: string) {
  return new Date(`${valor.replace(' ', 'T')}Z`).toISOString();
}

function numeroOuNulo(valor: unknown) {
  if (valor === null || valor === undefined) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

async function relogioDaPessoa(userId: string, agora: Date) {
  const perfil = await lerPerfilAstrologico(userId);
  const fuso = perfil.localDoDia?.fuso ?? 'UTC';
  return { data: dataLocal(agora, fuso), hora: partesLocais(agora, fuso).hora };
}

export async function lerResumoDaRespiracao(
  userId: string,
  agora = new Date()
): Promise<ResumoDaRespiracao> {
  const { data, hora } = await relogioDaPessoa(userId, agora);
  const linhas = await queryRows<LinhaDaSessao>(
    `SELECT id, technique, cycles, duration_seconds, minutes_logged, created_at
       FROM breathing_sessions
      WHERE user_id = ? AND session_date = ?
      ORDER BY created_at ASC`,
    [userId, data]
  );
  const registro = await lerRegistroDoDia(userId, data);
  const sessoes = linhas.map((linha) => ({
    id: linha.id,
    tecnica: linha.technique,
    ciclos: Number(linha.cycles),
    segundos: Number(linha.duration_seconds),
    minutos: Number(linha.minutes_logged),
    registradaEm: isoDoBanco(linha.created_at),
  }));
  const estresse = numeroOuNulo(registro?.stress_score);
  const prontidao = numeroOuNulo(registro?.readiness_score);
  return {
    data,
    sessoes,
    minutosGuiados: sessoes.reduce((soma, s) => soma + s.minutos, 0),
    minutosDeMeditacaoNoDia: numeroOuNulo(registro?.meditation_minutes),
    recomendacao: recomendarTecnica({
      hora,
      estresse: estresse === null ? null : Math.round(estresse),
      prontidao: prontidao === null ? null : Math.round(prontidao),
    }),
  };
}

/**
 * Registra a sessão e soma os minutos à meditação do dia (o que recalcula a
 * meta automática de meditação e a sequência). A coerência entre ciclos e
 * duração já foi conferida pelo schema.
 */
export async function registrarSessaoDeRespiracao(
  userId: string,
  sessao: SessaoDeRespiracao,
  agora = new Date()
): Promise<ResumoDaRespiracao> {
  const { data } = await relogioDaPessoa(userId, agora);
  const minutos = minutosDaSessao(sessao.segundos);
  await executeStatement(
    `INSERT INTO breathing_sessions
       (id, user_id, session_date, technique, cycles, duration_seconds, minutes_logged)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      userId,
      data,
      sessao.tecnica,
      sessao.ciclos,
      sessao.segundos,
      minutos,
    ]
  );
  await somarMinutosDeMeditacao(userId, data, minutos);
  return lerResumoDaRespiracao(userId, agora);
}
