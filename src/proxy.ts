import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { requisicaoDeMesmaOrigem } from '@/lib/security/csrf';

/**
 * Proxy (antigo middleware):
 * - rotas de API: recusa escrita vinda de outra origem (CSRF). Regras em
 *   src/lib/security/csrf.ts;
 * - páginas `/admin/*`: verificação otimista do papel no token de sessão,
 *   para que o código das telas administrativas nem seja entregue a quem não
 *   é administrador. A autorização definitiva continua em cada rota de API
 *   (`requireAdminSession`, que relê o papel no banco a cada requisição).
 */
export async function proxy(request: NextRequest) {
  const caminho = request.nextUrl.pathname;

  if (caminho === '/admin' || caminho.startsWith('/admin/')) {
    return protegerAreaAdministrativa(request);
  }

  const permitido = requisicaoDeMesmaOrigem({
    metodo: request.method,
    caminho,
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

async function protegerAreaAdministrativa(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const sessao = token ? await verifySessionToken(token) : null;

  if (!sessao) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (sessao.role !== 'admin') {
    // Sem detalhar o motivo: o usuário comum volta ao próprio painel.
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/admin', '/admin/:path*'],
};
