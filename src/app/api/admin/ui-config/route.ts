import { NextResponse } from 'next/server';
import { executeStatement } from '@/lib/mysql/pool';
import {
  getServerSessionToken,
  verifySessionToken,
  buildAppSession,
} from '@/lib/auth/session';
import { isAdmin } from '@/lib/mysql/query-utils';

export async function POST(request: Request) {
  try {
    const token = await getServerSessionToken();
    let session = null;

    if (token) {
      const payload = await verifySessionToken(token);
      if (payload) {
        session = buildAppSession(token, payload);
      }
    }

    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        {
          error: 'Não autorizado. Apenas administradores podem modificar a UI.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { landing, login } = body;

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
    console.error('Error saving ui config:', error);
    return NextResponse.json(
      {
        error:
          'Internal server error while saving configuration. Make sure migrations are up to date.',
      },
      { status: 500 }
    );
  }
}
