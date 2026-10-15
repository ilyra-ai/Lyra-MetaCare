import { NextResponse } from 'next/server';
import { z } from 'zod';

import { lerJson, respostaDeErro } from '@/lib/http/api';
import {
  listarConsentimentos,
  registrarConsentimentos,
} from '@/lib/lgpd/conta';
import { TIPOS_DE_CONSENTIMENTO } from '@/lib/lgpd/documentos';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

const registroSchema = z.object({
  types: z.array(z.enum(TIPOS_DE_CONSENTIMENTO)).min(1).max(3),
});

/** Consentimentos dados pela própria conta (documento, versão e data). */
export async function GET() {
  try {
    const session = await requireServerSession();
    return NextResponse.json({
      consentimentos: await listarConsentimentos(session.user.id),
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao carregar os consentimentos.');
  }
}

/** Registra o aceite da versão vigente dos documentos informados. */
export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const payload = await lerJson(request, registroSchema);
    await registrarConsentimentos({
      userId: session.user.id,
      tipos: payload.types,
      userAgent: request.headers.get('user-agent'),
    });
    return NextResponse.json({
      consentimentos: await listarConsentimentos(session.user.id),
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao registrar o consentimento.');
  }
}
