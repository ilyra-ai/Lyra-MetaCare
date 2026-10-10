# Sistema visual "Lyra Clean"

Visual aprovado pelo usuário em 2026-10-09 (tarefa 27) e aplicado em todo o
app: mais simples, moderno e premium, sem perder nenhuma função. Substitui o
visual anterior ("Cosmic Light", com vidro fosco, orbes e gradientes).

## Princípios

- Superfície calma: fundo neutro, cartões brancos com borda fina, uma cor de
  ação e uma cor de destaque reservada ao que é astral ou de IA.
- Uma ação principal clara por tela.
- Nada decorativo que não informe: sem orbes, gradientes, vidro, sombras
  coloridas, caixa alta espaçada ou animações contínuas.
- Acessibilidade como requisito: todo texto passa de 4,5:1 e todo contorno de
  controle passa de 3:1 (ver [`acessibilidade.md`](./acessibilidade.md)).

## Tokens (`src/app/globals.css`)

| Uso                           | Classe Tailwind                                                   | Valor                             |
| ----------------------------- | ----------------------------------------------------------------- | --------------------------------- |
| Fundo da página               | `bg-background`                                                   | `#F7F7F9`                         |
| Superfície (cartão, header)   | `bg-card` + `border-border`                                       | `#FFFFFF` / `#E6E6EC`             |
| Texto / secundário            | `text-foreground` / `text-muted-foreground`                       | `#14141F` / `#5D5D6E`             |
| Ação principal e item ativo   | `bg-primary`, `hover:bg-primary-hover`                            | `#187268` / `#125850`             |
| Tom suave do teal             | `bg-sidebar-accent` + `text-sidebar-accent-foreground`            | `#E6F3F1`                         |
| Astral e IA                   | `text-cosmic`, `bg-cosmic-light`, `text-cosmic-strong`            | `#6A4BD6` / `#F0ECFC` / `#4E35A8` |
| Estados (texto + fundo claro) | `success`, `warning`, `info`, `destructive`, `golden` + `*-light` | 4,5:1 ou mais                     |
| Contorno de controle          | `border-control` / `bg-control`                                   | `#8C8C9B` (3,3:1)                 |

`accent` também é violeta (`#6A4BD6`) e é usado só para ações de IA (por
exemplo, o botão "Ações rápidas").

## Forma e tipografia

- Raios: controles 10 px (`rounded-[10px]`), blocos internos 12 px
  (`rounded-md`), cartões 16 px (`rounded-xl`), chips e avatares
  `rounded-full`. Nada acima de 20 px.
- Sombras: cartões sem sombra (a borda separa); popovers, menus e modais com
  `shadow-lg`.
- Títulos em Space Grotesk semibold (`font-display`), texto em Inter.
  Rótulos pequenos em `text-sm font-medium text-muted-foreground`, sem caixa
  alta. Métricas em `font-display` (não `font-mono`).

## Estrutura das telas

- `AppShell` (`src/components/layout/AppShell.tsx`): sidebar de 248 px
  (largura configurável no construtor de UI), cabeçalho de 64 px com o `<h1>`
  da página, busca Ctrl K, notificações, Chat IA e menu do usuário; conteúdo
  com largura máxima de 1280 px e o documento Puck da página, quando houver.
- `PageIntro`: abertura padrão da página (rótulo, título `<h2>`, descrição e
  ações), com as escalas de tipografia do construtor.
- `AccessDenied`: tela única de acesso negado das áreas administrativas.

## Referências

- Proposta aprovada: sistema visual, login, dashboard e metas, publicados como
  artefato de design em 2026-10-09.
- [`design/README.md`](./design/README.md): arquivos históricos do visual
  anterior.
