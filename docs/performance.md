# Performance da Lyra MetaCare

Auditoria da tarefa 20 da instrução mestra (2026-10-06). Medições reais com `pnpm build` + `pnpm start`, Chromium (Playwright) em contexto limpo, sem cache, tamanhos transferidos (comprimidos). "JS da página" é o que chega até o evento `load`; depois dele o Next.js ainda pré-carrega, em segundo plano, o código das rotas linkadas no menu (prefetch), que não bloqueia a página atual.

## Resultado

| Rota (sessão)               | Antes (JS até ociosidade) | Depois (JS da página) |
| --------------------------- | ------------------------: | --------------------: |
| `/` (visitante, landing)    |                    817 KB |                235 KB |
| `/login` (visitante)        |                    382 KB |                189 KB |
| `/chat` (logado)            |                    991 KB |                255 KB |
| `/plan` (logado)            |                   1000 KB |                241 KB |
| `/goals` (logado)           |                   1000 KB |                350 KB |
| `/profile` (logado)         |                    991 KB |                517 KB |
| `/appointments` (logado)    |                   1043 KB |                394 KB |
| `/admin/dashboard` (logado) |                    999 KB |                243 KB |
| `/admin/puck` (logado)      |                   1132 KB |                590 KB |

Chamadas de API ao abrir `/chat`: 12 → 8 (`/api/public/page-config/app` saía 4 vezes, agora 1).

## Gargalos encontrados e corrigidos

1. **Puck carregado em todas as páginas (≈ 307 KB).** Cada página do app renderiza o documento publicado do Puck da própria rota, e o runtime do Puck (com componentes e editor de rich text) era importado de forma estática, mesmo com o documento vazio. Agora o `PuckClientRenderer` busca o documento e só carrega o `PuckDocumentView` (via `next/dynamic`) quando há blocos publicados (`src/lib/puck/conteudo.ts`). Efeito colateral corrigido: com o documento vazio, a raiz do Puck exibia para o usuário final um cabeçalho técnico ("root app shell", "chave: patient-portal", "fonte: manual").
2. **Sentry sem DSN (≈ 157 KB).** O SDK e o Session Replay eram baixados em todas as páginas mesmo sem `NEXT_PUBLIC_SENTRY_DSN`. `src/instrumentation-client.ts` e `src/app/global-error.tsx` passaram a importar o SDK de forma dinâmica e somente quando o DSN está configurado.
3. **Zod nas páginas públicas (≈ 90 KB).** O hook `usePublicSitePageConfig` revalidava no navegador a configuração que o servidor já entrega validada, e os valores padrão viviam no mesmo módulo dos schemas Zod. Os padrões foram para `modules/lyra-customaze-ui-ux/src/site-page-config/defaults.ts` (sem Zod; idênticos aos anteriores, comparados um a um) e o cliente deixou de revalidar.
4. **Landing e dashboard juntos em `/`.** A rota importava a landing e o dashboard (com Recharts, ≈ 107 KB) para qualquer visitante. Agora cada um é carregado só quando exibido (`next/dynamic`).
5. **Requisições duplicadas.** Cabeçalho, menus e conteúdo montam juntos e pediam o mesmo recurso; `src/lib/http/requisicao-compartilhada.ts` faz as chamadas simultâneas com a mesma chave reaproveitarem a que está em andamento (sem cache além do próprio voo).
6. **Código e assets mortos.** Rotas `ui-config` sem chamador desde março de 2026; `public/` com 5 SVGs do modelo do create-next-app, um mockup de 636 KB e um protótipo HTML que carregava scripts de CDN na origem da aplicação (movidos para `docs/design/`); 7 classes de componente e 2 utilities do `globals.css` sem uso; `getHttpErrorStatus` duplicado.
7. **Documentos iniciais do Puck em formato legado.** Convertidos para slots nativos; a migração `migrate()` continua aplicada só aos documentos legados já gravados.

## Verificado sem alteração

- **Fontes:** `next/font/google` já baixa as fontes no build e as serve da própria origem (subset latin), com preload apenas das três famílias usadas.
- **Banco:** consultas por usuário usam índices (`daily_metrics` por `user_id,date`, assinaturas por `user_id,status,current_period_end`, contadores por usuário e período); pool único por processo (tarefa 24).
- **Prefetch:** o pré-carregamento das rotas do menu é o comportamento padrão do `<Link>` do Next.js e torna a navegação seguinte instantânea; não foi desativado.

## Como medir de novo

1. `pnpm build && pnpm start`.
2. Abrir cada rota em janela anônima com o DevTools (aba Network, "Disable cache") e somar os scripts transferidos até o evento `load`.
3. Para inspecionar o conteúdo dos pacotes: `pnpm exec next experimental-analyze`.
