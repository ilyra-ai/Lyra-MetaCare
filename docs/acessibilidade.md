# Acessibilidade

Auditoria feita com **axe-core** (regras `wcag2a`, `wcag2aa`, `wcag21a`,
`wcag21aa`, `wcag22aa` e `best-practice`) sobre o build de produção
(`pnpm build` + `pnpm start`), com Playwright/Chromium, em **1440px** e
**390px** de largura. Foram auditadas as rotas públicas (`/`, `/login`) e,
com sessão de administrador, `/`, `/plan`, `/goals`, `/appointments`,
`/monitoring`, `/chat`, `/connect`, `/profile`, `/instruments`,
`/billing/success`, `/admin/dashboard`, `/admin/users`, `/admin/plans`,
`/admin/data-health`, `/admin/content`, `/admin/ai-config`,
`/admin/reports`, `/admin/page-builder` e `/admin/puck`.

## O que foi corrigido

| Problema                                  | Causa                                                                                                                                                            | Correção                                                                                                                                                                                    |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zoom bloqueado no celular                 | `maximumScale: 1` no viewport (WCAG 1.4.4).                                                                                                                      | Removido de `src/app/layout.tsx`.                                                                                                                                                           |
| Hierarquia de títulos                     | Páginas com dois `<h1>` (cabeçalho e conteúdo) e `h3`/`h4`/`h5` pulando níveis.                                                                                  | O título do cabeçalho é o único `<h1>`; títulos de conteúdo viraram `<h2>`/`<h3>`. `AlertTitle` deixou de ser `<h5>` (padrão atual do shadcn).                                              |
| "Pular para o conteúdo" sem destino       | O alvo `#conteudo-principal` não existia em várias páginas.                                                                                                      | `id="conteudo-principal"` no `<main>` de todas as páginas (a landing e o login só quando não estão em modo de prévia).                                                                      |
| Nome acessível diferente do texto visível | `aria-label` que não continha o texto exibido (menu do usuário, logo da landing, busca Ctrl K).                                                                  | Nome vem do texto visível, com complemento em `sr-only`; atalho anunciado com `aria-keyshortcuts`.                                                                                          |
| Controles sem nome                        | Campos, switches, sliders, botões só com ícone e barras de progresso sem nome.                                                                                   | `FieldBlock` virou `<label>`; `aria-label` nos switches, sliders (repassado ao thumb em `ui/slider.tsx`), botões de ação e em todo `Progress` (agora obrigatório na tipagem).               |
| Barra de progresso sem valor              | `ui/progress.tsx` não repassava `value` ao Radix, então não havia `aria-valuenow`.                                                                               | `value` repassado ao `Root`.                                                                                                                                                                |
| Área rolável sem acesso por teclado       | Tabela de dados, listas e prévia do construtor rolavam sem nada focável dentro.                                                                                  | `Table` aceita `scrollLabel` e `ScrollArea` aceita `viewportLabel`: viram regiões nomeadas e focáveis. No construtor, a coluna da prévia passou a usar flex e não transborda mais o painel. |
| Conteúdo duplicado para leitor de tela    | Prévias visuais (construtor e as duas prévias do Puck) repetiam títulos, regiões e botões da página.                                                             | Prévias marcadas com `inert` + `aria-hidden="true"`: continuam visíveis, mas fora do foco e da árvore de acessibilidade.                                                                    |
| Seletor sem rótulo                        | Seletor de superfície do editor Puck sem nome.                                                                                                                   | `<label>` associado (`sr-only`).                                                                                                                                                            |
| Alvo de toque pequeno                     | Número do dia no calendário com ~19px de largura; no celular o calendário tinha só 300px de altura, as semanas ficavam com 20px e o cabeçalho cobria os números. | Área mínima de 24×24px em `agenda.css` (WCAG 2.5.8) e calendário com 520px (celular) / 640px (a partir de `md`).                                                                            |
| Rodapé fora de landmark                   | O selo "feito com" era uma `div` solta.                                                                                                                          | `made-with-ilyra.tsx` virou `<footer>`; o link externo anuncia "(abre em nova aba)".                                                                                                        |

## O que ainda aparece no axe e por quê

- **`color-contrast`**: badges e textos com as cores de estado atuais
  (`warning`, `cosmic`, `info`) sobre fundos claros. É resolvido pelos novos
  tokens de cor do redesign "Lyra Clean" (tarefa 27), que troca a paleta
  inteira. Corrigir cor a cor antes disso seria retrabalho.
- **Interno do editor Puck (`@puckeditor/core` 0.23.0)**, sem API para
  ajustar:
  - `frame-title`: o `<iframe id="preview-frame">` do Puck não recebe
    `title`.
  - `select-name`: o seletor de zoom (`ViewportControls-zoomSelect`) não tem
    rótulo.
  - `aria-prohibited-attr`: o `Loader` do Puck usa `aria-label` em um
    `<span>` sem `role`.

  O editor só é acessível a administradores. Esses três pontos ficam
  registrados para atualização quando o Puck publicar uma versão corrigida.

## Como repetir a auditoria

Com o app em produção em `http://localhost:3100`, rode um script Playwright
que injete `axe-core` em cada rota e execute
`axe.run(document, { runOnly: { type: 'tag', values: [...] } })`, com uma
sessão anônima e outra de administrador (login via `POST /api/auth/login`
com cabeçalho `Origin`, exigido pela proteção CSRF).
