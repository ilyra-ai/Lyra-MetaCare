import { NextResponse, type NextRequest } from 'next/server';

import { requisicaoDeMesmaOrigem } from '@/lib/security/csrf';

/**
 * Proxy (antigo middleware) das rotas de API: recusa escrita vinda de outra
 * origem (CSRF). Regras em src/lib/security/csrf.ts.
 */
export function proxy(request: NextRequest) {
  const permitido = requisicaoDeMesmaOrigem({
    metodo: request.method,
    caminho: request.nextUrl.pathname,
    origemDaAplicacao: request.nextUrl.origin,
    origemConfigurada:
      process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || null,
    secFetchSite: request.headers.get('sec-fetch-site'),
    origin: request.headers.get('origin'),
  });

  if (!permitido) {
    return NextResponse.json(
      { error: 'Requisição de outra origem recusada.' },
      { status: 403 }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
