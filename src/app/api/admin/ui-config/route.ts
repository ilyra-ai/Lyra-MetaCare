import { NextResponse } from 'next/server';
import { z } from 'zod';

import { lerJson, respostaDeErro } from '@/lib/http/api';
import { executeStatement } from '@/lib/mysql/pool';
import { requireAdminSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

// Conteúdo livre das telas de landing e login (objetos JSON), editado no
// painel administrativo.
const uiConfigSchema = z.object({
  landing: z.looseObject({}),
  login: z.looseObject({}),
});

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession();
    const { landing, login } = await lerJson(request, uiConfigSchema);

    await executeStatement(
      `INSERT INTO ui_config (id, landing_data, login_data, updated_by)
       VALUES (?, ?, ?, ?) AS novo
       ON DUPLICATE KEY UPDATE
         landing_data = novo.landing_data,
         login_data = novo.login_data,
         updated_by = novo.updated_by
      `,
      [
        'default',
        JSON.stringify(landing),
        JSON.stringify(login),
        session.user.id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return respostaDeErro(
      error,
      'Falha ao salvar a configuração de interface.'
    );
  }
}
