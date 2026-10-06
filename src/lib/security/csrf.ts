/**
 * Proteção contra CSRF nas rotas de API que alteram estado.
 *
 * O cookie de sessão já é `SameSite=Lax` (não acompanha POST vindo de outro
 * site). Esta verificação é a segunda camada, independente do navegador
 * respeitar o SameSite: requisições de escrita vindas de outra origem são
 * recusadas pelos cabeçalhos que o navegador preenche e o JavaScript da
 * página não consegue forjar (`Sec-Fetch-Site` e `Origin`).
 *
 * Clientes fora do navegador (curl, a Stripe chamando o webhook) não enviam
 * esses cabeçalhos e não carregam o cookie da vítima, então não representam
 * CSRF e seguem para a autenticação normal da rota.
 */

export const METODOS_DE_ESCRITA = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Rotas chamadas por servidores externos, com autenticação própria.
const ROTAS_EXTERNAS = new Set(['/api/webhooks/stripe']);

function origemDe(url: string | null | undefined) {
  if (!url) {
    return null;
  }
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export interface DadosDaRequisicao {
  metodo: string;
  caminho: string;
  /** Origem pela qual a aplicação foi acessada (protocolo + host). */
  origemDaAplicacao: string;
  /** Origem pública configurada (APP_BASE_URL), quando definida. */
  origemConfigurada?: string | null;
  secFetchSite: string | null;
  origin: string | null;
}

/** `true` quando a requisição pode seguir; `false` para responder 403. */
export function requisicaoDeMesmaOrigem(dados: DadosDaRequisicao): boolean {
  if (!METODOS_DE_ESCRITA.has(dados.metodo.toUpperCase())) {
    return true;
  }
  if (ROTAS_EXTERNAS.has(dados.caminho)) {
    return true;
  }

  if (dados.secFetchSite) {
    // `none`: navegação iniciada pelo próprio usuário (barra de endereço).
    return (
      dados.secFetchSite === 'same-origin' || dados.secFetchSite === 'none'
    );
  }

  if (dados.origin) {
    const origem = origemDe(dados.origin);
    return (
      origem !== null &&
      (origem === dados.origemDaAplicacao ||
        origem === origemDe(dados.origemConfigurada))
    );
  }

  return true;
}
