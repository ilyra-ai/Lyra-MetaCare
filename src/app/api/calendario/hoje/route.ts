import { agendaDaPessoa, calendarioDaAgenda } from '@/lib/calendario/servico';
import { respostaDeErro } from '@/lib/http/api';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

/**
 * Arquivo .ics com as janelas de hoje (Brahma Muhurta, Abhijit, Rahu Kalam e
 * pôr do sol) da cidade da pessoa. `?lembretes=nao` tira os lembretes.
 */
export async function GET(request: Request) {
  try {
    const session = await requireServerSession();
    const lembretes =
      new URL(request.url).searchParams.get('lembretes') !== 'nao';
    const agenda = await agendaDaPessoa(session.user.id, 1, { lembretes });
    return new Response(calendarioDaAgenda(agenda), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="lyra-janelas-${agenda.inicio}.ics"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao gerar o arquivo da agenda.');
  }
}
