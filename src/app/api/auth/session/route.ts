import { NextResponse } from 'next/server';

import { getServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getServerSession();
  return NextResponse.json({ session });
}
