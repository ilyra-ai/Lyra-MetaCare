import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  calculateLongevityScores,
  COBERTURA_MINIMA_DO_ESCORE,
  type EscoresDoDia,
  METRICAS_DO_ESCORE,
  metricasMedidas,
  type MetricSnapshot,
} from '@/lib/ai/score-engine';
import { lerJsonOpcional, respostaDeErro } from '@/lib/http/api';
import { dataDoRegistroSchema } from '@/lib/metricas/registro-do-dia';
import { queryRows } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { requireFeatureEnabled } from '@/lib/plans/service';

export const runtime = 'nodejs';

const pedidoSchema = z.object({
  // Dia local da pessoa (o mesmo do check-in); sem ele, o dia UTC de hoje.
  data: dataDoRegistroSchema.optional(),
});

/**
 * Escores do dia pedido. Antes a rota usava a última linha de qualquer data
 * (uma métrica de semanas atrás aparecia como de hoje) e, sem registro,
 * inventava longevidade 5 e prontidão 50.
 */
export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    await requireFeatureEnabled(session, 'ai_scores');
    // Corpo opcional: sem corpo vale o dia UTC de hoje.
    const { data: pedida } = await lerJsonOpcional(request, pedidoSchema);
    const data = pedida ?? new Date().toISOString().slice(0, 10);

    const [metric] = await queryRows<MetricSnapshot>(
      'SELECT * FROM daily_metrics WHERE user_id = ? AND date = ? LIMIT 1',
      [session.user.id, data]
    );
    const [config] = await queryRows<{
      weight_hrv: number;
      weight_sleep: number;
      weight_activity: number;
      weight_nutrition: number;
    }>(
      'SELECT weight_hrv, weight_sleep, weight_activity, weight_nutrition FROM ai_config LIMIT 1'
    );

    const medidas = metricasMedidas(metric ?? null);
    const numero = (valor: unknown) =>
      valor === null || valor === undefined ? null : Number(valor);
    const resposta: EscoresDoDia = {
      data,
      readinessScore: numero(metric?.readiness_score),
      recoveryScore: numero(metric?.recovery_score),
      longevityScore:
        metric && medidas.length >= COBERTURA_MINIMA_DO_ESCORE
          ? calculateLongevityScores(metric, config ?? undefined).longevityScore
          : null,
      cobertura: medidas.length,
      totalDeMetricas: METRICAS_DO_ESCORE.length,
    };
    return NextResponse.json(resposta);
  } catch (error) {
    return respostaDeErro(error, 'Falha no cálculo local.');
  }
}
