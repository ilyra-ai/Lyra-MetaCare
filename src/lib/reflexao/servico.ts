import { randomUUID } from 'node:crypto';

import { HttpError } from '@/lib/http-error';
import { hojeDaPessoa } from '@/lib/metas/servico';
import { executeStatement, queryRows } from '@/lib/mysql/pool';

import type { EstadoDaReflexao, Reflexao, ReflexaoValidada } from './esquema';

/**
 * Reflexão da noite (tarefa 44): leitura, gravação e remoção da reflexão de
 * uma data local da pessoa. A data é sempre conferida no servidor pelo fuso
 * da cidade da pessoa (o mesmo "hoje" do coach), aceitando hoje e ontem: quem
 * reflete depois da meia-noite ainda fecha o dia que terminou.
 */

interface LinhaDaReflexao {
  reflection_date: string;
  emotional_score: number;
  body_score: number;
  spiritual_score: number;
  note: string | null;
  updated_at: string;
}

function diaAnterior(data: string) {
  const instante = new Date(`${data}T12:00:00Z`);
  instante.setUTCDate(instante.getUTCDate() - 1);
  return instante.toISOString().slice(0, 10);
}

/** ISO 8601 de um DATETIME em UTC devolvido como texto pelo driver. */
function isoDoBanco(valor: string) {
  return new Date(`${valor.replace(' ', 'T')}Z`).toISOString();
}

function paraReflexao(linha: LinhaDaReflexao): Reflexao {
  return {
    data: linha.reflection_date,
    emocional: Number(linha.emotional_score),
    corpo: Number(linha.body_score),
    espiritual: Number(linha.spiritual_score),
    frase: linha.note,
    atualizadaEm: isoDoBanco(linha.updated_at),
  };
}

/** Hoje e ontem da pessoa, nessa ordem. */
export async function datasDaReflexao(userId: string, agora = new Date()) {
  const hoje = await hojeDaPessoa(userId, agora);
  return [hoje, diaAnterior(hoje)];
}

async function dataConferida(
  userId: string,
  data: string | undefined,
  agora: Date
) {
  const permitidas = await datasDaReflexao(userId, agora);
  if (data === undefined) return { data: permitidas[0], permitidas };
  if (!permitidas.includes(data)) {
    throw new HttpError(
      'A reflexão pode ser feita para hoje ou para ontem.',
      400
    );
  }
  return { data, permitidas };
}

export async function lerReflexoes(
  userId: string,
  inicio: string,
  fim: string
): Promise<Reflexao[]> {
  const linhas = await queryRows<LinhaDaReflexao>(
    `SELECT reflection_date, emotional_score, body_score, spiritual_score,
            note, updated_at
       FROM daily_reflections
      WHERE user_id = ? AND reflection_date BETWEEN ? AND ?
      ORDER BY reflection_date ASC`,
    [userId, inicio, fim]
  );
  return linhas.map(paraReflexao);
}

export async function lerEstadoDaReflexao(
  userId: string,
  data?: string,
  agora = new Date()
): Promise<EstadoDaReflexao> {
  const conferida = await dataConferida(userId, data, agora);
  const [reflexao] = await lerReflexoes(userId, conferida.data, conferida.data);
  return {
    data: conferida.data,
    datasPermitidas: conferida.permitidas,
    reflexao: reflexao ?? null,
  };
}

/** Grava (ou substitui) a reflexão da data e devolve o estado atualizado. */
export async function salvarReflexao(
  userId: string,
  entrada: ReflexaoValidada,
  agora = new Date()
): Promise<EstadoDaReflexao> {
  const conferida = await dataConferida(userId, entrada.data, agora);
  await executeStatement(
    `INSERT INTO daily_reflections
       (id, user_id, reflection_date, emotional_score, body_score,
        spiritual_score, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     AS nova
     ON DUPLICATE KEY UPDATE
       emotional_score = nova.emotional_score,
       body_score = nova.body_score,
       spiritual_score = nova.spiritual_score,
       note = nova.note`,
    [
      randomUUID(),
      userId,
      conferida.data,
      entrada.emocional,
      entrada.corpo,
      entrada.espiritual,
      entrada.frase ?? null,
    ]
  );
  return lerEstadoDaReflexao(userId, conferida.data, agora);
}

/** Apaga a reflexão da data (404 quando não existe). */
export async function apagarReflexao(
  userId: string,
  data: string | undefined,
  agora = new Date()
) {
  const conferida = await dataConferida(userId, data, agora);
  const resultado = await executeStatement(
    'DELETE FROM daily_reflections WHERE user_id = ? AND reflection_date = ?',
    [userId, conferida.data]
  );
  if (resultado.affectedRows === 0) {
    throw new HttpError('Não há reflexão desta data para apagar.', 404);
  }
  return lerEstadoDaReflexao(userId, conferida.data, agora);
}
