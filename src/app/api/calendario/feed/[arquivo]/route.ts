import {
  agendaDaPessoa,
  calendarioDaAgenda,
  DIAS_DA_ASSINATURA,
  donoDoToken,
  hashDoToken,
} from '@/lib/calendario/servico';
import { respostaDeErro } from '@/lib/http/api';
import { HttpError } from '@/lib/http-error';
import {
  exigirDentroDoLimite,
  type RegraDeLimite,
} from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

/**
 * Leituras por link e por hora. Os apps de calendário releem o feed algumas
 * vezes por dia; o limite só barra uso abusivo de um link vazado.
 */
const LIMITE_DO_FEED: RegraDeLimite = {
  escopo: 'agenda-feed',
  limite: 60,
  janelaSegundos: 3600,
};

/**
 * Feed iCalendar da agenda védica (link de assinatura privado), lido pelo
 * app de calendário sem sessão: o token do link é a credencial. Traz hoje e
 * os próximos dias, recalculados a cada leitura. Link inexistente ou
 * desativado responde 404 sem dizer qual dos dois.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ arquivo: string }> }
) {
  try {
    const { arquivo } = await params;
    const token = arquivo.endsWith('.ics') ? arquivo.slice(0, -4) : '';
    const userId = await donoDoToken(token);
    if (!userId) {
      throw new HttpError('Agenda não encontrada.', 404);
    }
    await exigirDentroDoLimite(LIMITE_DO_FEED, hashDoToken(token));
    const lembretes =
      new URL(request.url).searchParams.get('lembretes') !== 'nao';
    const agenda = await agendaDaPessoa(userId, DIAS_DA_ASSINATURA, {
      lembretes,
    });
    return new Response(calendarioDaAgenda(agenda), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="lyra-janelas-do-dia.ics"',
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex, nofollow',
        'Referrer-Policy': 'no-referrer',
      },
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao gerar a agenda.');
  }
}
