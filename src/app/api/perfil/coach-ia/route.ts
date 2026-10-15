import { NextResponse } from 'next/server';
import { z } from 'zod';

import { geminiDisponivel } from '@/lib/coach/gemini';
import { HttpError } from '@/lib/http-error';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { registrarConsentimentos } from '@/lib/lgpd/conta';
import { executeStatement, queryRows } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

async function estado(userId: string) {
  const [linha] = await queryRows<{ coach_external_ai_since: string | null }>(
    'SELECT coach_external_ai_since FROM profiles WHERE id = ? LIMIT 1',
    [userId]
  );
  const desde = linha?.coach_external_ai_since ?? null;
  return {
    ativo: desde !== null,
    // O MySQL guarda em UTC sem fuso no texto.
    desde: desde ? `${String(desde).replace(' ', 'T')}Z` : null,
    disponivel: geminiDisponivel(),
  };
}

/** Situação do consentimento para o texto do coach pelo Google Gemini. */
export async function GET() {
  try {
    const session = await requireServerSession();
    return NextResponse.json(await estado(session.user.id), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao ler a preferência do coach.');
  }
}

const pedidoSchema = z.object({ ativo: z.boolean() }).strict();

/**
 * Ativa (com registro do consentimento, versão e data) ou revoga o texto do
 * coach pelo Gemini. Revogar vale na hora: o próximo "Seu dia" volta a ser
 * só do motor local.
 */
export async function PATCH(request: Request) {
  try {
    const session = await requireServerSession();
    const { ativo } = await lerJson(request, pedidoSchema);
    if (ativo) {
      if (!geminiDisponivel()) {
        throw new HttpError(
          'A IA externa não está configurada nesta instalação.',
          503
        );
      }
      await executeStatement(
        `UPDATE profiles
            SET coach_external_ai_since = COALESCE(coach_external_ai_since, UTC_TIMESTAMP())
          WHERE id = ?`,
        [session.user.id]
      );
      await registrarConsentimentos({
        userId: session.user.id,
        tipos: ['coach_external_ai'],
        userAgent: request.headers.get('user-agent'),
      });
    } else {
      await executeStatement(
        'UPDATE profiles SET coach_external_ai_since = NULL WHERE id = ?',
        [session.user.id]
      );
    }
    return NextResponse.json(await estado(session.user.id));
  } catch (error) {
    return respostaDeErro(error, 'Falha ao salvar a preferência do coach.');
  }
}
