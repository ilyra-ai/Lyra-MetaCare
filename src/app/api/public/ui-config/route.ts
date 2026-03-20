import { NextResponse } from 'next/server';
import { queryRows } from '@/lib/mysql/pool';

export async function GET() {
  try {
    const rows = await queryRows<{
      landing_data: any;
      login_data: any;
    }>('SELECT landing_data, login_data FROM ui_config WHERE id = ? LIMIT 1', [
      'default',
    ]);

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
    return NextResponse.json({ config: null });
  }
}
