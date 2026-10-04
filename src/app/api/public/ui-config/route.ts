import { NextResponse } from 'next/server';
import { queryRows } from '@/lib/mysql/pool';

export const runtime = 'nodejs';

// As colunas JSON do MySQL chegam já desserializadas pelo mysql2; o conteúdo é
// repassado como está, sem suposições sobre a forma.
type UiConfigRow = {
  landing_data: unknown;
  login_data: unknown;
};

export async function GET() {
  try {
    const rows = await queryRows<UiConfigRow>(
      'SELECT landing_data, login_data FROM ui_config WHERE id = ? LIMIT 1',
      ['default']
    );

    const rawConfig = rows[0];

    if (rawConfig) {
      return NextResponse.json({
        config: {
          landing: rawConfig.landing_data,
          login: rawConfig.login_data,
        },
      });
    }

    return NextResponse.json({ config: null });
  } catch (error) {
    // A falha de banco não pode ser mascarada como "configuração ausente".
    console.error('[api/public/ui-config] Falha ao ler ui_config:', error);
    return NextResponse.json(
      { error: 'Falha ao carregar a configuração de interface.' },
      { status: 500 }
    );
  }
}
