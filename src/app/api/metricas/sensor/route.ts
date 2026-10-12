import { NextResponse } from 'next/server';

import { lerJson, respostaDeErro } from '@/lib/http/api';
import { gravarSessaoDoSensor } from '@/lib/metricas/gravacao';
import { sessaoDoSensorSchema } from '@/lib/metricas/registro-do-dia';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { requireFeatureEnabled } from '@/lib/plans/service';

export const runtime = 'nodejs';

/**
 * Sessão da pulseira Bluetooth agregada no navegador. A conexão com wearable
 * é um recurso de plano: o bloqueio, antes só na tela, agora vale também no
 * servidor.
 */
export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    await requireFeatureEnabled(session, 'wearable_bluetooth_connection');
    const sessao = await lerJson(request, sessaoDoSensorSchema);
    const salvo = await gravarSessaoDoSensor(session.user.id, sessao);
    return NextResponse.json({ registro: salvo });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao gravar a sessão da pulseira.');
  }
}
