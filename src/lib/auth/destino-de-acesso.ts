import type { AppSession } from '@/types/app-session';

// Rotas abertas a visitantes: a landing (`/`) e a tela de login/cadastro.
export const ROTAS_PUBLICAS: ReadonlySet<string> = new Set(['/', '/login']);
export const ROTA_LOGIN = '/login';
export const ROTA_ONBOARDING = '/onboarding';
export const ROTA_INICIAL = '/';

/**
 * Decide para onde a sessão precisa ir a partir da rota aberta.
 * Devolve `null` quando a rota é permitida e o destino obrigatório quando não é.
 *
 * - Visitante: só a landing e o login; o resto vai para o login.
 * - Conta sem onboarding concluído: só o onboarding, de qualquer rota e por
 *   qualquer caminho (link, endereço digitado ou botão "voltar").
 * - Conta com onboarding concluído: login e onboarding voltam ao painel.
 */
export function destinoObrigatorio(
  session: AppSession | null,
  pathname: string
): string | null {
  if (!session) {
    return ROTAS_PUBLICAS.has(pathname) ? null : ROTA_LOGIN;
  }

  if (!session.user.onboarding_completed) {
    return pathname === ROTA_ONBOARDING ? null : ROTA_ONBOARDING;
  }

  if (pathname === ROTA_LOGIN || pathname === ROTA_ONBOARDING) {
    return ROTA_INICIAL;
  }

  return null;
}
