import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { HttpError } from '@/lib/http-error';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { recalcularMetas } from '@/lib/metas/automaticas';
import {
  CHAVES_DAS_METRICAS,
  diasAntes,
  METRICAS_DAS_METAS,
  type MetricaDaMeta,
} from '@/lib/metas/catalogo';
import { hojeDaPessoa } from '@/lib/metas/servico';
import { executeStatement, queryRows } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { requireFeatureEnabled } from '@/lib/plans/service';

export const runtime = 'nodejs';

const metaSchema = z
  .object({
    metrica: z.enum(CHAVES_DAS_METRICAS as [string, ...string[]]),
    alvo: z.number().finite(),
    prazo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Prazo inválido: use AAAA-MM-DD.')
      .nullable()
      .optional(),
  })
  .strict();

function formatar(valor: number, metrica: MetricaDaMeta) {
  return valor.toLocaleString('pt-BR', {
    maximumFractionDigits: metrica.casas,
  });
}

/**
 * Cria uma meta automática: o progresso vem do registro do dia (média dos
 * últimos 7 dias, ou o peso mais recente) e é recalculado pelo servidor.
 */
export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    await requireFeatureEnabled(session, 'goal_progress_tracking');
    const pedido = await lerJson(request, metaSchema);
    const chave = pedido.metrica as keyof typeof METRICAS_DAS_METAS;
    const metrica: MetricaDaMeta = METRICAS_DAS_METAS[chave];
    const userId = session.user.id;
    const hoje = await hojeDaPessoa(userId);

    if (pedido.alvo < metrica.minimo || pedido.alvo > metrica.maximo) {
      throw new HttpError(
        `O alvo de ${metrica.rotulo.toLowerCase()} precisa estar entre ${formatar(metrica.minimo, metrica)} e ${formatar(metrica.maximo, metrica)} ${metrica.unidade}.`,
        400
      );
    }
    const prazo = pedido.prazo ?? null;
    if (prazo && (prazo < hoje || prazo > diasAntes(hoje, -730))) {
      throw new HttpError(
        'O prazo precisa ser de hoje até daqui a 2 anos.',
        400
      );
    }

    const [existente] = await queryRows<{ id: string }>(
      'SELECT id FROM goals WHERE user_id = ? AND metric_key = ? LIMIT 1',
      [userId, chave]
    );
    if (existente) {
      throw new HttpError(
        `Você já tem uma meta automática de ${metrica.rotulo.toLowerCase()}. Edite ou exclua a atual.`,
        409
      );
    }

    let direcao = metrica.direcao;
    if (direcao === null) {
      const [ultimo] = await queryRows<{ valor: number | string }>(
        `SELECT ${metrica.coluna} AS valor FROM daily_metrics
          WHERE user_id = ? AND ${metrica.coluna} IS NOT NULL
            AND date BETWEEN ? AND ?
          ORDER BY date DESC LIMIT 1`,
        [userId, diasAntes(hoje, 29), hoje]
      );
      if (!ultimo) {
        throw new HttpError(
          `Registre ${metrica.rotulo.toLowerCase()} no check-in antes de criar esta meta: a direção (reduzir ou aumentar) vem do valor atual.`,
          422
        );
      }
      direcao = pedido.alvo < Number(ultimo.valor) ? 'down' : 'up';
    }

    const id = randomUUID();
    const titulo = `${metrica.rotulo}: ${direcao === 'down' ? 'até ' : ''}${formatar(pedido.alvo, metrica)} ${metrica.unidade}`;
    const descricao =
      metrica.modo === 'media7'
        ? 'Meta automática: progresso pela média dos dias com registro nos últimos 7 dias.'
        : 'Meta automática: progresso pelo registro mais recente dos últimos 30 dias.';
    await executeStatement(
      `INSERT INTO goals
         (id, user_id, title, description, category, target_value,
          current_value, unit, metric_key, metric_direction, deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 'in_progress')`,
      [
        id,
        userId,
        titulo,
        descricao,
        metrica.categoria,
        pedido.alvo,
        metrica.unidade,
        chave,
        direcao,
        prazo,
      ]
    );
    await recalcularMetas(userId, hoje);

    const [meta] = await queryRows<Record<string, unknown>>(
      'SELECT * FROM goals WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return NextResponse.json({ meta }, { status: 201 });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao criar a meta automática.');
  }
}
