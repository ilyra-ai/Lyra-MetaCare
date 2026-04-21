import { NextResponse } from 'next/server';
import { getAstrologicalContext } from '@/lib/astrology/engine';
import { getHttpErrorStatus } from '@/lib/http-error';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    const date = dateParam ? new Date(dateParam) : new Date();
    
    const astrologyData = getAstrologicalContext(date);
    
    return NextResponse.json({ success: true, data: astrologyData });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao calcular efemérides.' },
      { status: getHttpErrorStatus(error) }
    );
  }
}
