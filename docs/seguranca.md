# Segurança da Lyra MetaCare

Modelo de segurança da aplicação, revisado na tarefa 19 da instrução mestra (2026-10-06). Cada item indica onde a regra vive no código e o teste que a comprova.

## Sessão e autenticação

- **Cookie:** `lyra_metacare_session`, `httpOnly`, `SameSite=Lax`, `Secure` em produção, JWT HS256 com `AUTH_SECRET` de no mínimo 32 bytes (`src/lib/auth/session.ts`).
- **O JWT não sai do cookie.** `/api/auth/session`, login e cadastro devolvem só os dados do usuário; antes o corpo trazia o `access_token`, que um XSS poderia ler.
- **Papel e e-mail vêm do banco a cada requisição** (`src/lib/mysql/server-auth.ts`). Um administrador rebaixado perde o acesso na hora (antes mantinha o papel `admin` até o token expirar, em até 7 dias) e uma conta removida deixa de ter sessão.
- **Login:** resposta 401 única e custo bcrypt constante para e-mail inexistente (sem enumeração de contas).
- Testes: `src/app/api/seguranca.integration.test.ts`, `src/app/api/auth-storage.integration.test.ts`.

## Limite de tentativas (rate limiting)

Janela fixa persistida no MySQL (`rate_limit_buckets`, migration 012), válida entre processos e reinícios (`src/lib/security/rate-limit.ts`). A chave é o SHA-256 de `<escopo>:<valor>`: e-mails e IPs não ficam em texto.

| Regra         | Limite                        | Observação                                                                    |
| ------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| `login-conta` | 10 falhas de senha por 15 min | Por e-mail, independe do IP. Com a conta bloqueada nem a senha correta entra. |
| `login-ip`    | 50 tentativas por 15 min      | Por IP. Um login correto zera as falhas da conta.                             |
| `cadastro-ip` | 10 cadastros por hora         | Por IP. Contém criação em massa e enumeração de e-mails pelo 409.             |

- Resposta: **429** com `Retry-After` (segundos) e a mensagem "Muitas tentativas. Tente novamente em N minutos."
- **IP do cliente:** primeiro endereço de `X-Forwarded-For` (depois `X-Real-IP`). Em produção, a aplicação deve ficar atrás de um proxy reverso que **sobrescreva** esse cabeçalho; sem isso ele pode ser forjado. Por isso o limite por conta não usa o IP.
- As rotas de IA têm, além disso, cotas por plano (`feature_usage_counters`).

## CSRF

- Primeira camada: cookie `SameSite=Lax`.
- Segunda camada: `src/proxy.ts` (convenção `proxy` do Next.js 16) recusa com **403** toda escrita (`POST`, `PUT`, `PATCH`, `DELETE`) em `/api/*` cujo `Sec-Fetch-Site` não seja `same-origin`/`none` ou cujo `Origin` não seja a origem da aplicação ou `APP_BASE_URL` (`src/lib/security/csrf.ts`).
- Requisições sem esses cabeçalhos (curl, servidores) não carregam o cookie da vítima e seguem para a autenticação da rota. `/api/webhooks/stripe` é autenticado pela assinatura da Stripe.
- Teste: `src/lib/security/csrf.test.ts`.

## Cabeçalhos HTTP

Definidos em `next.config.ts` para todas as respostas:

| Cabeçalho                    | Valor                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `Content-Security-Policy`    | `frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'` |
| `X-Frame-Options`            | `SAMEORIGIN`                                                                     |
| `X-Content-Type-Options`     | `nosniff`                                                                        |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`                                                |
| `Permissions-Policy`         | câmera, microfone, geolocalização, pagamento e USB desativados                   |
| `Cross-Origin-Opener-Policy` | `same-origin`                                                                    |
| `Strict-Transport-Security`  | `max-age=63072000; includeSubDomains` (somente em produção)                      |

- A CSP não restringe `script-src`: os scripts inline de hidratação do App Router exigiriam nonce por requisição, o que tornaria todas as páginas dinâmicas. A defesa contra XSS está no sanitizador e no React (escape por padrão).
- `/api/storage/*` usa CSP própria (`default-src 'none'; sandbox`), definida na rota; a CSP global não se aplica a esse caminho para não substituí-la.
- `X-Powered-By` desativado (`poweredByHeader: false`).

## XSS

- O rich text do Puck é sanitizado por `src/lib/puck/sanitization/rich-text.ts`, com o parser HTML5 do **parse5** (mesmo algoritmo dos navegadores) e reconstrução por lista de permissões: só tags de texto, nenhum atributo além de `href` em links (http, https, mailto, tel ou relativo), texto e atributos sempre escapados, conteúdo de `<script>`, `<style>`, `<svg>` e similares descartado.
- Antes, o servidor usava expressões regulares: `<a href='x" onmouseover="alert(1)'>` gerava um atributo de evento no HTML do SSR. Servidor e navegador agora usam a mesma função (sem divergência de hidratação).
- Teste: `src/lib/puck/sanitization/rich-text.test.ts` (6 dos 10 casos falham no sanitizador anterior).

## Upload e arquivos

Ver `docs/api.md`: buckets conhecidos, caminhos validados e resolvidos dentro do bucket, somente PNG/JPEG/WebP/GIF identificados pelos bytes, até 5 MB, caminho iniciando pelo id do dono, `nosniff` e CSP `sandbox` na entrega.

## Dados de saúde e logs

- Erros inesperados das rotas são registrados por `src/lib/observability/log-seguro.ts`: tipo, código e pilha de chamadas. Erros do MySQL **não** levam a mensagem nem a consulta (o mysql2 anexa o SQL já interpolado, com valores como métricas e e-mails). Teste: `log-seguro.test.ts`.
- O cliente recebe só a mensagem genérica da rota (status 500), nunca SQL, caminhos ou pilha.
- A chave BYOK do Gemini fica no `localStorage` do navegador do usuário, é enviada ao servidor no corpo de cada pergunta e repassada ao Gemini no cabeçalho `x-goog-api-key`; o servidor não a grava nem a registra. Com o Modo Privacidade ativo ela não é enviada.

## Sentry

- Opcional: sem `NEXT_PUBLIC_SENTRY_DSN` o SDK não envia eventos; sem `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` e `SENTRY_PROJECT` o build não envia source maps e segue normalmente.
- `dataCollection` (`src/lib/observability/sentry-data-collection.ts`) desliga usuário, cookies, cabeçalhos, corpos HTTP, parâmetros de URL, dados de banco, entradas e saídas de IA e variáveis locais.
- Session Replay com todo texto e entradas mascarados e mídias bloqueadas.

## Stripe

- Webhook: assinatura verificada pela SDK (`constructEvent`) com `STRIPE_WEBHOOK_SECRET`; sem assinatura ou com assinatura inválida → 400; eventos idempotentes por `billing_webhook_events` (reentrega devolve `duplicate`).
- Checkout e portal exigem sessão; o cliente Stripe é sempre o do usuário autenticado e os metadados levam o id dele.
- URLs de retorno: em produção vêm só de `APP_BASE_URL`/`NEXT_PUBLIC_APP_URL` (a origem da requisição, derivada do `Host`, é aceita apenas fora de produção).
- **Fronteira externa:** a criação real de sessões de checkout e portal e o `checkout.session.completed` (que consulta a API da Stripe) exigem credenciais reais da Stripe, não disponíveis neste ambiente; o restante é coberto por `src/lib/billing/service.integration.test.ts`.

## Dependências

- `pnpm audit` completo e `pnpm audit --prod`: nenhuma vulnerabilidade conhecida (2026-10-10).
- `braces` ≤ 3.0.3 (GHSA-vfj7-8cjw-p6xm, negação de serviço por padrões glob muito aninhados) não tem versão corrigida publicada; foi eliminado da árvore em vez de aguardar correção:
  - a CLI `shadcn` saiu das `devDependencies` (só era usada para gerar componentes, nunca importada). Para adicionar um componente novo, use `pnpm dlx shadcn@<versão> add <componente>`, que lê o `components.json`;
  - o `@next/eslint-plugin-next` fixa `fast-glob` 3.3.1 (que traz `micromatch` → `braces`) e só usa `globSync(padrão, { onlyDirectories: true })`. Um override restrito a esse pacote o resolve para o `tinyglobby` (fdir + picomatch, sem `braces`), que tem a mesma função e opção. A equivalência é verificada com a função real do plugin por `node scripts/verificar-glob-eslint-next.mjs`.
- As correções transitivas estão em `overrides` no `pnpm-workspace.yaml`, cada uma restrita às versões afetadas.
