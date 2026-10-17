# Sistema visual "Lyra Clean"

Visual aprovado pelo usuário em 2026-10-09 (tarefa 27) e aplicado em todo o
app: mais simples, moderno e premium, sem perder nenhuma função. Substitui o
visual anterior ("Cosmic Light", com vidro fosco, orbes e gradientes).

## Princípios

- Superfície calma: fundo neutro, cartões brancos com borda fina, uma cor de
  ação (teal do logo) e uma cor de destaque (coral do logo) reservada ao que é
  astral ou de IA.
- Uma ação principal clara por tela.
- Nada decorativo que não informe: sem orbes, gradientes, vidro, sombras
  coloridas, caixa alta espaçada ou animações contínuas.
- Acessibilidade como requisito: todo texto passa de 4,5:1 e todo contorno de
  controle passa de 3:1 (ver [`acessibilidade.md`](./acessibilidade.md)).

## Tokens (`src/app/globals.css`)

Desde a tarefa 47 a paleta deriva do **logo oficial** (o "L" em teal
abraçando o coração coral): teal para ação, coral para astral e IA, e neutros
levemente puxados para o azul-petróleo do teal. Valores do tema claro:

| Uso                           | Classe Tailwind                                                   | Valor                             |
| ----------------------------- | ----------------------------------------------------------------- | --------------------------------- |
| Fundo da página               | `bg-background`                                                   | `#F6F8F9`                         |
| Superfície (cartão, header)   | `bg-card` + `border-border`                                       | `#FFFFFF` / `#E1E8EA`             |
| Texto / secundário            | `text-foreground` / `text-muted-foreground`                       | `#121C21` / `#57646B`             |
| Ação principal e item ativo   | `bg-primary`, `hover:bg-primary-hover`                            | `#087678` / `#055F61`             |
| Tom suave do teal             | `bg-sidebar-accent` + `text-sidebar-accent-foreground`            | `#E6F5F5`                         |
| Astral e IA (coral)           | `text-cosmic`, `bg-cosmic-light`, `text-cosmic-strong`            | `#BE3B13` / `#FFF1EB` / `#913012` |
| Erro (carmim frio)            | `text-destructive`, `bg-destructive-light`                        | `#B6163C`                         |
| Estados (texto + fundo claro) | `success`, `warning`, `info`, `destructive`, `golden` + `*-light` | 4,5:1 ou mais                     |
| Contorno de controle          | `border-control` / `bg-control`                                   | `#7B888E` (3,3:1 sobre `muted`)   |
| Cores puras do logo           | `bg-brand-teal`, `bg-brand-coral` (só decorativo, nunca texto)    | `#087878` / `#F8764F`             |

`accent` também é coral (`#BE3B13`) e é usado só para ações de IA (por
exemplo, o botão "Ações rápidas"). O coral original do logo (`#F8764F`) fica
abaixo de 3:1 sobre branco, por isso o texto usa a versão mais escura e o
original fica restrito a `--brand-coral`. O erro foi deslocado para um carmim
frio (matiz 346) justamente para não se confundir com o coral de destaque.

## Marca e ícones

- Componente único [`MarcaLyra`](../src/components/marca/MarcaLyra.tsx): logo
  oficial (`src/assets/marca/lyra-logo.png`, fundo convertido em
  transparência) usado na sidebar, menu do celular, landing (cabeçalho e
  rodapé), login, tela de carregamento e erro global. É decorativo (`alt=""`)
  quando o nome "lyra" aparece ao lado.
- O logo foi desenhado sobre branco; no tema escuro os brilhos sumiriam, então
  a marca fica num ladrilho branco arredondado (mesmo recurso do favicon).
- Ícones gerados a partir do mesmo arquivo: `src/app/favicon.ico` (16, 32,
  48 e 64 px), `src/app/icon.png` (192 px), `src/app/apple-icon.png` (180 px,
  fundo branco) e, para o manifesto (`src/app/manifest.ts`),
  `public/icones/lyra-192.png`, `lyra-512.png` e `lyra-maskable-512.png`
  (marca dentro da área segura de 80%).
- Fonte única: o logo oficial original fica em
  [`docs/marca/lyra-logo-oficial.png`](./marca/lyra-logo-oficial.png) e todos
  os arquivos acima são gerados por
  [`scripts/gerar-icones-da-marca.py`](../scripts/gerar-icones-da-marca.py)
  (Pillow + NumPy; instruções no próprio script). Rodar o script de novo
  reproduz os mesmos arquivos byte a byte.

## Forma e tipografia

- Raios (escala completa desde a tarefa 59): caixa de seleção 6 px
  (`rounded-xs`), controles 10 px (`rounded`), blocos internos 12 px
  (`rounded-md`), cartões 16 px (`rounded-xl`), seções 20 px (`rounded-2xl`),
  chips e avatares `rounded-full`. `rounded-3xl` e `rounded-4xl` ficam no teto
  de 20 px. Nada de valores soltos como `rounded-[10px]`.
- Sombras: cartões sem sombra (a borda separa); popovers, menus e modais com
  `shadow-lg`. A cor e a força vêm de `--sombra-cor` e `--sombra-forca`, que
  mudam no tema escuro (o Tailwind 4 copia o valor da sombra para a classe,
  então redefinir `--shadow-*` no `.dark` não tinha efeito).
- Véu de modais e sobreposições: `bg-overlay/55`, escuro nos dois temas.
- Contorno de campo (`--input`) e de controle (`--control`) com 3:1 ou mais
  sobre cartão, fundo, muted, secondary e popover nos dois temas
  (`src/app/tema.test.ts`).
- Títulos em Space Grotesk semibold (`font-display`), texto em Inter.
  Rótulos pequenos em `text-sm font-medium text-muted-foreground`, sem caixa
  alta. Métricas em `font-display` (não `font-mono`).
- Escala de texto do tema além da do Tailwind: `text-micro` (11 px),
  `text-caption` (13 px) e `text-body` (15 px). O `cn()` conhece essas escalas
  (`src/lib/utils.ts`) para não apagar a cor do texto ao juntar classes.
- Movimento: `--duracao-rapida` (150 ms), `--duracao-media` (220 ms),
  `--duracao-lenta` (320 ms) e as curvas `ease-saida` e `ease-entrada`; tudo
  desligado com `prefers-reduced-motion`.
- Foco: anel de 2 px na cor `--ring` em todo elemento focável, inclusive
  regiões roláveis; o link "Pular para o conteúdo principal" aparece no
  primeiro Tab.

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
