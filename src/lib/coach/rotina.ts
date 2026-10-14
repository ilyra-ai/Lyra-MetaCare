import { apagarNotificacoesAntigas } from '@/lib/notificacoes/servico';
import { registrarErroInterno } from '@/lib/observability/log-seguro';

import { executarRotinaDoCoach } from './servico';

/**
 * Agendador da rotina diária do coach dentro do servidor Node.js (iniciado
 * em `src/instrumentation.ts`). A cada 15 minutos prepara o dia de quem já
 * passou das 3 h locais e ainda não tem o briefing de hoje; os índices únicos
 * tornam seguro rodar em mais de uma instância ao mesmo tempo.
 *
 * Desligue com `COACH_ROTINA=desligada` quando a rotina for disparada por um
 * agendador externo (rota `POST /api/coach/rotina`).
 */

const INTERVALO_MS = 15 * 60_000;
const ATRASO_INICIAL_MS = 30_000;

type EstadoGlobal = typeof globalThis & {
  __lyraRotinaDoCoach?: { timer: NodeJS.Timeout };
};

export function rotinaDoCoachAtiva() {
  return process.env.COACH_ROTINA !== 'desligada';
}

export async function executarRotinaCompleta(agora: Date = new Date()) {
  const resultado = await executarRotinaDoCoach(agora);
  const notificacoesApagadas = await apagarNotificacoesAntigas();
  return { ...resultado, notificacoesApagadas };
}

export function iniciarRotinaDoCoach() {
  const estado = globalThis as EstadoGlobal;
  if (!rotinaDoCoachAtiva() || estado.__lyraRotinaDoCoach) return;

  let executando = false;
  const executar = async () => {
    if (executando) return;
    executando = true;
    try {
      const resultado = await executarRotinaCompleta();
      if (resultado.gerados > 0 || resultado.falhas > 0) {
        console.info(
          `[coach:rotina] ${resultado.gerados} dia(s) preparado(s), ${resultado.falhas} falha(s).`
        );
      }
    } catch (error) {
      registrarErroInterno('coach:rotina', error);
    } finally {
      executando = false;
    }
  };

  const inicial = setTimeout(() => void executar(), ATRASO_INICIAL_MS);
  inicial.unref();
  const timer = setInterval(() => void executar(), INTERVALO_MS);
  timer.unref();
  estado.__lyraRotinaDoCoach = { timer };
}
