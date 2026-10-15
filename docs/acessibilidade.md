# Acessibilidade

Auditoria feita com **axe-core** (regras `wcag2a`, `wcag2aa`, `wcag21a`,
`wcag21aa`, `wcag22aa` e `best-practice`) sobre o build de produção
(`pnpm build` + `pnpm start`), com Playwright/Chromium, em **1440px** e
**390px** de largura. Foram auditadas as rotas públicas (`/`, `/login`) e,
com sessão de administrador, `/`, `/plan`, `/goals`, `/appointments`,
`/monitoring`, `/chat`, `/connect`, `/profile`, `/instruments` (removida
depois, na tarefa 32),
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

## Contraste após o redesign "Lyra Clean" (tarefa 27)

Os tokens de cor foram recalculados para que todo texto passe de 4,5:1 sobre
branco e sobre o próprio tom claro dos badges: teal `#187268`, violeta
`#6A4BD6` (texto de destaque `#4E35A8`), aviso `#8F5400`, sucesso `#0D704B`,
informação `#3B4FC4`, erro `#B42318`, dourado `#7A5E00`. Contornos de
checkbox e trilho do switch desligado usam `--control` (`#8C8C9B`, 3,3:1,
WCAG 1.4.11; escurecido para `#848494` na tarefa 34 para passar de 3:1
também sobre os tons neutros `muted`/`secondary`). Os dias de outro mês do calendário passaram do `#999` da
biblioteca para o cinza secundário. Resultado: zero violações de contraste
nas telas da Lyra em 1440px e 390px.

## Paleta do logo oficial (tarefa 47)

As cores passaram a seguir o logo (teal `#087878` e coral `#F87850`). Valores
de texto no tema claro, com o contraste sobre `muted` (`#F0F3F4`, o fundo
claro mais escuro): teal `#087678` (4,88:1), coral `#BE3B13` (4,93:1), coral
forte `#913012` (7,17:1; 7,21:1 sobre `#FFF1EB`), erro `#B6163C` (5,97:1),
texto secundário `#57646B` (5,48:1) e contorno de controle `#7B888E`
(3,28:1). O coral puro do logo fica abaixo de 3:1 sobre branco e só é usado
como `--brand-coral`, em elementos decorativos. O teste
[`src/app/tema.test.ts`](../src/app/tema.test.ts) verifica todos os pares nos
dois temas, e a auditoria axe (WCAG 2.2 AA) de landing, login, painel, menu
do celular, `/dia`, `/chat`, `/goals` e `/profile` em 1440px e 390px, claro e
escuro, terminou sem violações.

## Celular (tarefa 33)

Varredura em 390×844 (toque) de todas as rotas, para visitante, paciente,
administrador e conta nova, medindo estouro horizontal e alvos de toque
menores que 24×24px (WCAG 2.5.8):

- **Onboarding:** o formulário crescia até 672px dentro de uma linha flex
  centralizada e estourava para os dois lados (531px de página, início dos
  cartões fora da tela). Agora é uma coluna com a largura da tela; as etapas
  fora da tela ficam `inert`; o progresso é anunciado como "Etapa X de N"
  (os pontos eram um `role="tablist"` sem abas); a linha inteira de cada meta
  marca a opção (44px de altura); a página ganhou `<main>` e `<h1>`.
- **Login:** a ordem passou a ser marca → título → formulário → detalhes da
  apresentação, então o formulário aparece na primeira dobra; o título acompanha
  a largura da tela. No desktop o desenho em duas colunas continua igual.
- **Alvos de toque:** "Criar conta"/"Entrar", "Voltar para a landing",
  "Lembrar-me" e o selo "Feito com iLyra AI" com 44px de altura; os botões do
  acesso rápido da landing caíam para 22px por `flex-1` na coluna (agora só na
  linha, a partir de `sm`).
- **Perfil:** o cartão que repetia título e descrição da página saiu.
- **Chat:** cabeçalho compacto no celular, para a conversa e o campo de
  mensagem aparecerem antes.

Resultado: nenhuma rota com estouro horizontal e nenhum alvo abaixo de 24px,
exceto o checkbox "Lembrar-me" (20px, com rótulo de 44px ao lado, dentro da
exceção de espaçamento) e o seletor de zoom interno do Puck (abaixo).

## Tema escuro (tarefa 34)

- **Alternância:** o tema claro continua sendo o padrão. No app, o menu do
  perfil tem o grupo "Tema" (Claro, Escuro, Do sistema), que não fecha o menu
  ao escolher; nas telas públicas (landing, entrada, política de privacidade
  e termos) há um botão "Tema escuro" com `aria-pressed`. A escolha fica no
  navegador (`localStorage`, chave `theme` do `next-themes`) e é aplicada
  antes da pintura, sem piscar. "Do sistema" segue `prefers-color-scheme`.
- **Tokens (`.dark` em `src/app/globals.css`):** superfícies em grafite
  azulado (nunca preto puro), com popover um degrau acima do cartão. As cores
  de destaque são versões mais claras das do tema claro e, por isso, levam
  texto escuro por cima (todos os `*-foreground` do escuro são `#0C0C13`).
  Antes, o branco sobre violeta, vermelho, verde, âmbar, azul e dourado claros
  ficava entre 1,9:1 e 4,3:1, e o vermelho de erro sobre o cartão e o tom
  claro ficava em 3,7–4,3:1. O contorno dos campos de texto (`--input`) passou
  de 1,2:1 para 3:1 sobre cartão, popover e tons neutros.
- **Complementos:** `color-scheme: dark` (controles nativos e barra de
  rolagem), polegar da barra de rolagem claro, sombras mais densas e a meta
  `theme-color` acompanhando o tema (`ThemeColorSync`).
- **Garantia contínua:** `src/app/tema.test.ts` lê o `globals.css` e falha se
  qualquer par de texto ficar abaixo de 4,5:1 ou de contorno abaixo de 3:1,
  nos dois temas.
- **Camadas:** a varredura passou a abrir também o menu do perfil, as
  notificações, a busca Ctrl K e a sidebar do celular. Isso revelou que o
  menu suspenso, modal no Radix, marcava cabeçalho e conteúdo com
  `aria-hidden` enquanto continuavam focáveis (`aria-hidden-focus`) e
  escondia o `<h1>`; os menus agora são não modais por padrão
  (`ui/dropdown-menu.tsx`), como no padrão "menu button" da WAI-ARIA. O
  popover de notificações e o diálogo da busca ganharam nome acessível.

Resultado: zero violações de contraste no escuro e no claro, em 390px e
1440px, em todas as telas (visitante, conta nova, paciente e administrador)
e nas camadas abertas.

## O que ainda aparece no axe e por quê

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
  O contraste dos títulos das categorias (#767676 sobre #FAFAFA, 4,35:1)
  foi corrigido na tarefa 34 pela variável de personalização do próprio Puck
  (`--puck-drawer-category-color-text`, em
  `src/app/admin/puck/puck-contraste.css`).

- **`region` (boa prática, fora da WCAG) com o menu do perfil aberto:** o
  Radix renderiza o conteúdo do menu em um portal no fim do `<body>`, fora
  dos landmarks. O menu é anunciado pelo papel `menu` e fica ligado ao botão
  por `aria-controls`; levá-lo para dentro do `<header>` o colocaria na
  camada de empilhamento do cabeçalho, abaixo de elementos flutuantes da
  página.

## Como repetir a auditoria

Com o app em produção em `http://localhost:3100`, rode um script Playwright
que injete `axe-core` em cada rota e execute
`axe.run(document, { runOnly: { type: 'tag', values: [...] } })`, com uma
sessão anônima e outra de administrador (login via `POST /api/auth/login`
com cabeçalho `Origin`, exigido pela proteção CSRF).
