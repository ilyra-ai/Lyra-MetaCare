# TASK DE IMPLEMENTACAO - REFERENCIA ELEMENTOR NA LYRA METACARE

Data de criacao: 2026-03-26
Projeto: Lyra MetaCare
Workspace: `C:\temp\Lyra-MetaCare`
Responsavel: Codex
Idioma obrigatorio: pt-BR
Status geral: planejamento estruturado, sem execucao completa ainda

## Objetivo desta task

Estruturar a implementacao, dentro da Lyra MetaCare, de um construtor administrativo inspirado nas capacidades reais identificadas no Elementor, respeitando integralmente a stack atual do projeto, sem adicionar dependencias proibidas, sem simulacoes, sem placeholders funcionais, sem hardcode indevido e com persistencia real em banco de dados.

## Progresso real mais recente

- [x] `AppPageConfig` expandido com dominio real de `dashboard`.
- [x] Home principal (`src/app/page.tsx`) conectada ao `page-config/app.dashboard`.
- [x] `Dashboard` principal conectado ao `page-config/app.dashboard` com consumo real de textos publicados.
- [x] `SiteExperienceBuilder` ampliado com:
  - preview administrativo do `dashboard`
  - painel guiado de edicao do `dashboard`
- [x] Publicacao administrativa real validada em `2026-03-27 00:08:15`.
- [x] Validacao em navegador real confirmou:
  - home exibindo `Painel astral vivo`
  - dashboard exibindo `Seu painel principal agora responde ao builder`
  - dashboard exibindo `Semana editável com ritmo, contexto e clareza`
  - dashboard exibindo `Camadas profundas sob seu comando`
  - `admin/page-builder` exibindo a secao `Dashboard` no contexto `App interno`
  - preview administrativo refletindo os textos publicados do `dashboard`

## Auditoria real da pasta ELEMENTOR

### Inventario local auditado

- [x] Pasta auditada na raiz: `C:\temp\Lyra-MetaCare\ELEMENTOR`
- [x] Subpacotes encontrados:
  - `elementor-pro`
  - `elementskit`
  - `essential-addons-elementor`
  - `powerpack-elements`
  - `unlimited-elements-for-elementor-premium`
- [x] O core `elementor` nao foi encontrado na pasta auditada.

### Evidencias tecnicas objetivas da auditoria

- [x] Os pacotes auditados sao majoritariamente baseados em PHP e runtime WordPress.
- [x] Nao foi encontrado um conjunto moderno de componentes React/TSX prontos para consumo direto no app.
- [x] Contagem levantada durante a auditoria:
  - `elementor-pro`: 756 arquivos PHP e 244 arquivos JS
  - `elementskit`: 1124 arquivos PHP e 30 arquivos JS
  - `essential-addons-elementor`: 445 arquivos PHP e 221 arquivos JS
  - `powerpack-elements`: 429 arquivos PHP e 174 arquivos JS
  - `unlimited-elements-for-elementor-premium`: 795 arquivos PHP e 91 arquivos JS
- [x] Nao foi encontrado core React/TSX reutilizavel:
  - `elementor-pro`: 0 arquivos TSX/JSX/TS reaproveitaveis
  - `elementskit`: 0 arquivos TSX/JSX/TS reaproveitaveis
  - `essential-addons-elementor`: 0 arquivos TSX/JSX/TS reaproveitaveis
  - `powerpack-elements`: 0 arquivos TSX/JSX/TS reaproveitaveis
  - `unlimited-elements-for-elementor-premium`: 0 arquivos TSX/JSX/TS reaproveitaveis

### Conclusao honesta da auditoria de causa raiz

- [x] Nao e tecnicamente correto tratar a pasta `ELEMENTOR` como um pacote plug-and-play para o app Next.js da Lyra.
- [x] A causa raiz e arquitetural:
  - dependencia de WordPress
  - dependencia de PHP
  - dependencia do runtime do Elementor core
  - dependencia de hooks, filtros, controles e widgets internos do ecossistema WordPress
- [x] Sem o plugin core `elementor`, os addons locais nao conseguem operar como no WordPress.
- [x] Portanto, o caminho profissional nao e "plugar os plugins no Next.js", e sim:
  - auditar
  - decompor capacidades
  - modelar schemas
  - reproduzir as capacidades relevantes em engine propria
  - criar adaptadores para a Lyra

## Mapa completo das capacidades identificadas

### Capacidades nucleares do Elementor Pro encontradas na auditoria

- [x] `Theme Builder`
- [x] `Theme Elements`
- [x] `Forms`
- [x] `Popup Builder`
- [x] `Dynamic Tags`
- [x] `Display Conditions`
- [x] `Loop Builder`
- [x] `Query Control`
- [x] `Custom CSS`
- [x] `Global Widget`
- [x] `Role Manager`
- [x] `Notes`
- [x] `Mega Menu`
- [x] `Link in Bio`
- [x] `Payments`
- [x] `WooCommerce Builder`
- [x] `Variables`
- [x] `Atomic Widgets`
- [x] `Atomic Form`
- [x] `Motion / Interactions / Transitions / Scroll Snap / Page Transitions`

### Capacidades identificadas no ElementsKit

- [x] Layout packs
- [x] Custom controls
- [x] Header / Footer module
- [x] Sticky content
- [x] Wrapper link
- [x] Advanced tooltip
- [x] Conditional content
- [x] Parallax
- [x] Particles
- [x] Glass morphism
- [x] Liquid glass
- [x] Mouse cursor
- [x] Masking
- [x] Cross-domain copy/paste
- [x] Widgets auditados:
  - advanced accordion
  - advanced search
  - advanced slider
  - advanced tab
  - advanced toggle
  - audio player
  - blog posts
  - breadcrumb
  - chart
  - circle menu
  - comparison table
  - content ticker
  - creative button
  - fancy animated text
  - flip box
  - gallery
  - google map
  - hotspot
  - image hover effect
  - image morphing
  - image swap
  - instagram feed
  - interactive links
  - popup modal
  - price menu
  - protected content
  - table
  - timeline
  - video gallery
  - whatsapp
  - woo product carousel
  - woo mini cart

### Capacidades identificadas no Essential Addons for Elementor

- [x] Biblioteca ampla de elementos premium
- [x] Extensoes auditadas:
  - particles
  - parallax
  - advanced tooltip
  - content protection
  - reading progress bar
  - custom JS
  - conditional display
- [x] Templates auditados:
  - content timeline
  - dynamic filterable gallery
  - post block
  - post carousel
  - post list
  - woo account dashboard
  - woo cross sells
  - woo product slider
  - woo thank you
- [x] Elementos auditados:
  - advanced search
  - content timeline
  - fancy chart
  - figma to elementor
  - flip carousel
  - google map
  - image comparison
  - image hot spots
  - image scroller
  - instagram feed
  - interactive promo
  - lightbox
  - logo carousel
  - mailchimp
  - multicolumn pricing table
  - offcanvas
  - one page navigation
  - post block
  - post carousel
  - post list
  - price menu
  - protected content
  - stacked cards
  - static product
  - team member carousel
  - testimonial slider
  - toggle
  - woo account dashboard
  - woo collections
  - woo cross sells
  - woo product slider
  - woo thank you

### Capacidades identificadas no PowerPack

- [x] Biblioteca ampla de widgets criativos e extensoes
- [x] Widgets auditados:
  - advanced accordion
  - advanced menu
  - advanced tabs
  - author list
  - breadcrumbs
  - business reviews
  - buttons
  - categories
  - charts
  - contact form integrations
  - content reveal
  - countdown
  - counter
  - custom fields
  - devices
  - display conditions
  - divider
  - dynamic tags
  - faq
  - flipbox
  - gallery
  - google maps
  - headings
  - hotspots
  - icon list
  - image accordion
  - info box
  - info list
  - info table
  - instagram feed
  - login form
  - logos
  - modal popup
  - offcanvas content
  - posts
  - pricing
  - progress bar
  - promo box
  - protected content
  - query control
  - query post
  - review box
  - table
  - team member
  - testimonials
  - timeline
  - toc
  - toggle
  - twitter
  - video
  - woocommerce
  - wpforms

### Capacidades identificadas no Unlimited Elements

- [x] Widget library
- [x] Widget creator framework
- [x] Template kits
- [x] Loop builder
- [x] Background widgets
- [x] Post widgets e filtros
- [x] WooCommerce widgets e filtros
- [x] Remote control widgets
- [x] Sync between widgets
- [x] Multi-source galleries
- [x] Live copy paste
- [x] Mega menu builder
- [x] Mega slider builder
- [x] Multi-source widgets
- [x] Dynamic popup builder
- [x] Form builder
- [x] Calculator builder
- [x] AJAX faceted filters

## Decisao arquitetural recomendada

### Nao fazer

- [x] Nao tentar rodar diretamente os plugins PHP do Elementor dentro do app Next.js.
- [x] Nao injetar WordPress dentro da Lyra apenas para reaproveitar addons.
- [x] Nao acoplar o futuro construtor visual da Lyra a uma infraestrutura WordPress.

### Fazer

- [ ] Criar um modulo proprio inspirado no Elementor, mas nativo da Lyra.
- [ ] Modelar esse modulo como produto reutilizavel para outros apps.
- [ ] Separar a arquitetura em:
  - `builder-core`
  - `builder-admin`
  - `builder-renderer`
  - `builder-schema`
  - `builder-storage`
  - `builder-adapters`
- [ ] Fazer a Lyra ser o primeiro app consumidor desse modulo.

## Meta adicional: modulo reutilizavel entre apps

### Objetivo de produto

- [ ] O modulo deve nascer com arquitetura reutilizavel para qualquer outro app futuro.
- [ ] O modulo nao deve depender de nomes de pagina, componentes ou rotas exclusivas da Lyra.
- [ ] O modulo deve aceitar adaptadores por aplicacao:
  - catalogo de componentes
  - rotas editaveis
  - zonas editaveis
  - permissoes
  - schemas
  - dados dinamicos
  - tema

### Estrutura proposta do modulo reutilizavel

- [x] Criar a pasta raiz do modulo reutilizavel em `modules/lyra-customaze-ui-ux`.
- [x] Criar manifesto tecnico do modulo.
- [x] Criar README tecnico do modulo.
- [x] Extrair o nucleo inicial reutilizavel de `schema` e `ui` para o modulo.
- [x] Manter reexport no app atual para nao quebrar a Lyra durante a transicao.
- [x] Criar contrato tecnico de integracao reutilizavel para apps consumidores.
- [x] Extrair utilitarios genericos de armazenamento do builder para o modulo.
- [ ] `packages/builder-core` ou estrutura equivalente final
  - engine de arvore de layout
  - sistema de slots
  - sistema de props editaveis
  - sistema de breakpoints
  - sistema de estilos responsivos
  - sistema de conditions
  - sistema de revisions
- [ ] `packages/builder-admin` ou estrutura equivalente final
  - canvas ao vivo
  - drag-and-drop
  - navigator de arvore
  - painel Content
  - painel Style
  - painel Advanced
  - time-travel
  - controle de publicacao
- [ ] `packages/builder-renderer` ou estrutura equivalente final
  - renderer publico
  - renderer do app interno
  - injecao segura de CSS customizado
  - consumo de configuracao publicada
- [ ] `packages/builder-adapter-lyra` ou estrutura equivalente final
  - registro de componentes reais da Lyra
  - registro de zonas editaveis
  - regras de permissao admin
  - integracao com MySQL e APIs do projeto

## Entrega final obrigatoria de portabilidade

- [ ] Criar na raiz do projeto o script `implement_elementor_lyra.py`.
- [x] Criar na raiz do projeto o script `implement_elementor_lyra.py`.
- [x] O script deve permitir instalar e configurar o modulo em qualquer outro app compativel apenas por:
  - copiar a pasta do modulo para a raiz do projeto alvo
  - executar `implement_elementor_lyra.py`
- [ ] O script deve executar instalacao e configuracao reais, sem simulacao.
- [ ] O script nao pode depender de placeholders funcionais.
- [ ] O script nao pode depender de hardcodes especificos da Lyra quando estiver operando em outro app.
- [ ] O script deve:
  - [x] detectar o projeto alvo
  - [x] validar stack minima compativel
  - [x] copiar/registrar arquivos necessarios do modulo
  - [ ] integrar rotas administrativas
  - [ ] integrar schemas e persistencia
  - [ ] configurar permissao de acesso apenas para admin
  - [x] ajustar arquivos de configuracao do projeto alvo
  - [ ] executar checks finais reais
- [ ] O script deve produzir relatorio final claro do que foi instalado, alterado e validado.
- [x] O script ja produz relatorio claro em stdout com acoes executadas, arquivos criados, arquivos alinhados e validacoes aplicadas.

## Escopo do modulo Elementor interno da Lyra

### Acesso e seguranca

- [ ] Criar um modulo administrativo chamado `Elementor` ou nome equivalente aprovado.
- [ ] Restringir acesso somente ao administrador total do sistema.
- [ ] Exibir o acesso dentro das configuracoes do app.
- [ ] Ao clicar, abrir o construtor visual com lista real de:
  - landing page
  - login
  - sidebar
  - header
  - rodape
  - paginas internas elegiveis
  - templates globais

### Editor visual total

- [ ] Editor ao vivo com drag-and-drop real.
- [ ] DOM Navigator interativo.
- [ ] Abas:
  - `Content`
  - `Style`
  - `Advanced`
- [ ] Selecao visual de blocos e componentes.
- [ ] Reordenacao hierarquica real.
- [ ] Insercao e remocao real de componentes suportados.
- [ ] Edicao de texto em pt-BR.
- [ ] Configuracao de tamanho de:
  - fontes
  - cards
  - icones
  - tabelas
  - botoes
  - containers

### Controles globais de marca

- [ ] Configuracoes globais de:
  - tipografia
  - escala tipografica
  - cores
  - gradientes
  - bordas
  - raios
  - sombras
  - espacamentos
  - largura maxima
  - densidade visual
- [ ] Publicacao global refletida em todo o app.

### Theme Builder interno

- [ ] Builder visual de:
  - cabecalho
  - sidebar
  - rodape
  - layouts globais
  - templates de pagina
  - estados especiais
  - resultados de busca futuros
- [ ] Sistema de atribuicao de template por alvo.

### Dynamic Content e Loop Builder

- [ ] Dynamic loops reais para listas repetitivas.
- [ ] Separacao clara entre:
  - configuracao visual
  - dados vivos do sistema
- [ ] Conectores reais para dados do app sem mock.

### Revisions, historico e publicacao

- [ ] Rascunho e publicado.
- [ ] Revisoes persistidas em banco.
- [ ] Restauracao de revisao.
- [ ] Time-travel de UI.
- [ ] Auditoria com autor, data e diff.

## Premissas obrigatorias

- A implementacao deve seguir a identidade da Lyra:
  - clara
  - premium
  - astrologia moderna
  - aura esoterica luminosa
  - fusao com IA
  - sem atmosfera de clinica
- O idioma do app, textos administrativos, labels, documentacao e UX deve permanecer em pt-BR.
- O acesso ao construtor deve continuar restrito a perfis administradores.
- Toda configuracao visual precisa ser persistida de forma real no MySQL.
- O frontend publico e o app interno precisam refletir a configuracao salva e publicada.
- A implementacao deve privilegiar:
  - design tokens
  - schema validado
  - formularios administrativos reais
  - preview real
  - publicacao real
  - restauracao real
- Nada desta task autoriza substituir logica de negocio por mock visual.

## Escopo funcional inspirado no Elementor

## Pilares obrigatorios de referencia Elementor

### Pilar 1. Editor ao vivo com arrastar e soltar

- [ ] Implementar editor visual ao vivo para a experiencia publica e para a experiencia interna do app.
- [ ] Permitir selecionar, mover, reordenar e reposicionar blocos e componentes via interacao visual real.
- [ ] Garantir que o editor permita ao administrador:
  - arrastar e soltar
  - reorganizar hierarquia
  - editar conteudo inline quando aplicavel
  - refinar layout sem depender de codigo
- [ ] Garantir feedback visual claro durante:
  - selecao
  - hover
  - drop target
  - reordenacao
- [ ] Garantir que o preview reflita imediatamente o estado do rascunho.
- [ ] Garantir persistencia real no banco ao salvar.

### Pilar 2. Controle de design responsivo

- [ ] Implementar controles reais por breakpoint:
  - Desktop
  - Tablet
  - Mobile
- [ ] Permitir ajustar por breakpoint:
  - tipografia
  - espacamento
  - largura
  - tamanho de cards
  - tamanho de icones
  - tamanho de componentes
  - empilhamento
  - visibilidade
- [ ] Garantir que o admin consiga alternar o preview entre os breakpoints.
- [ ] Garantir que o frontend publicado respeite os overrides por dispositivo.
- [ ] Garantir consistencia visual e funcional em todos os tamanhos de tela.

### Pilar 3. Configuracoes globais de marca

- [ ] Criar painel global de marca para aplicar configuracoes consistentes em todo o site e app.
- [ ] Permitir configurar de forma real:
  - tipografia global
  - cores globais
  - estilos de botoes
  - estilos de cards
  - bordas
  - sombras
  - raios
  - espacamentos globais
- [ ] Garantir que a mudanca nessas configuracoes reflita automaticamente em:
  - landing
  - login
  - sidebar
  - header
  - paginas internas
  - componentes reutilizaveis
- [ ] Garantir alinhamento visual integral com a marca Lyra.

### Pilar 4. Design de tema flexivel

- [ ] Implementar sistema de Theme Builder interno para partes globais e templates principais.
- [ ] Permitir personalizar visualmente:
  - cabecalhos
  - rodapes
  - templates de pagina
  - templates de posts futuros
  - templates de resultados de busca
  - templates de arquivo quando houver escopo real
- [ ] Garantir controle administrativo sobre:
  - paginas
  - posts
  - produtos futuros
  - arquivos
  - resultados de busca
- [ ] Garantir coesao visual entre todas as areas do produto.

### 1. Construtor visual de experiencia publica

- [ ] Expandir o construtor de landing e login para suportar:
  - controle de tipografia
  - controle de tamanhos de cards
  - controle de tamanhos de icones
  - controle de botoes
  - controle de espacamentos
  - ordem de secoes
  - exibicao ou ocultacao de blocos
  - criacao, remocao e reordenacao de componentes editaveis
- [ ] Garantir preview administrativo em tempo real.
- [ ] Garantir persistencia de rascunho.
- [ ] Garantir publicacao.
- [ ] Garantir restauracao do publicado.
- [ ] Garantir restauracao do padrao.

### 2. Construtor visual da experiencia interna do app

- [ ] Criar um novo dominio de configuracao administrativa para o app interno.
- [ ] Suportar customizacao real de:
  - sidebar
  - header
  - rodape
  - cards
  - tabelas
  - botoes
  - labels
  - titulos
  - descricoes
  - blocos principais das paginas internas
- [ ] Permitir editar:
  - textos
  - visibilidade
  - ordem
  - escala visual
  - largura da sidebar
  - escala de icones
  - escala de tabelas
  - escala de cards
  - escala de botoes
- [ ] Garantir que as alteracoes sejam consumidas por paginas reais do app.

### 3. Estrutura tipo Theme Builder

- [ ] Criar configuracao administrativa central para partes globais:
  - cabecalho
  - barra lateral
  - rodape
  - blocos de contexto
  - labels de navegacao
- [ ] Fazer as partes globais consumirem config central publicada.
- [ ] Garantir fallback seguro para defaults do sistema.

### 4. Estrutura tipo Template Builder

- [ ] Definir arquitetura de templates configuraveis por dominio:
  - landing
  - login
  - app interno
  - paginas-chave futuras
- [ ] Padronizar schemas por `pageKey`.
- [ ] Padronizar servico administrativo de leitura, salvamento e publicacao.
- [ ] Padronizar APIs administrativas e publicas por chave.

### 5. Estrutura tipo Global Design System Controls

- [ ] Criar camada administrativa para:
  - tipografia
  - tamanhos
  - raios
  - espacamentos
  - intensidade visual
  - escala de icones
  - escala de componentes
- [ ] Ligar essa camada aos componentes reais do projeto:
  - Button
  - Card
  - Table
  - Sidebar
  - Header
  - secoes principais da landing
  - login
  - paginas internas prioritarias

### 6. Estrutura tipo Widgets/Blocos Reordenaveis

- [ ] Permitir adicionar, remover e reordenar blocos editaveis em areas suportadas.
- [ ] Mapear blocos elegiveis:
  - hero
  - FAQ
  - metricas
  - fluxo
  - CTA final
  - preview cards
  - highlights do login
  - secoes internas prioritarias
- [ ] Garantir que cada bloco tenha schema validado.
- [ ] Garantir que blocos removidos nao quebrem renderizacao.

### 7. Estrutura tipo Display Conditions

- [ ] Criar base administrativa para condicoes de exibicao de blocos.
- [ ] Comecar por condicoes reais e simples:
  - usuario admin ou nao admin
  - recurso habilitado no plano
  - secao visivel ou oculta
  - pagina especifica
- [ ] Evitar condicoes falsas ou artificiais.

### 8. Estrutura tipo Dynamic Content

- [ ] Garantir que blocos publicos continuem lendo dados reais quando aplicavel:
  - planos
  - features
  - categorias
  - checkout pronto
- [ ] Garantir que app interno continue lendo dados reais:
  - appointments
  - monitoring
  - profile
  - planos
  - dados administrativos
- [ ] Separar claramente:
  - texto configuravel
  - dados vivos do sistema

### 9. Estrutura tipo Loop Builder / List Builder

- [ ] Planejar lista configuravel para componentes repetitivos:
  - cards de recursos
  - cards de preview
  - highlights
  - FAQ
  - etapas
  - possiveis listas internas futuras
- [ ] Permitir reordenacao.
- [ ] Permitir visibilidade individual.
- [ ] Permitir tom visual individual.

### 10. Estrutura tipo Popup / Overlay Builder

- [ ] Avaliar implementacao futura de blocos administrativos para:
  - banners
  - overlays
  - CTAs flutuantes
  - anuncios contextuais
- [ ] So implementar se houver persistencia real, controle admin e integracao real.

### 11. Estrutura tipo Form Builder Administrativo

- [ ] Evoluir formulacao do construtor para padrao mais robusto:
  - campos agrupados
  - sliders
  - selects
  - toggles
  - campos repetiveis
  - modo JSON avancado
- [ ] Manter validacao com Zod.
- [ ] Garantir erros claros para o admin.

### 12. Estrutura tipo Colaboracao e Governanca

- [ ] Manter metadados reais de:
  - ultima atualizacao
  - usuario responsavel
  - rascunho versus publicado
- [ ] Expandir auditoria se necessario para futuras revisoes administrativas.

## Arquitetura tecnica proposta

### Camada 1. Schema

- [x] Expandir `src/lib/site-page-config/schema.ts`.
- [ ] Suportar `pageKey`:
  - [x] `landing`
  - [x] `login`
  - [x] `app`
  - outros futuros somente quando houver escopo real
- [ ] Criar schemas separados para:
  - tipografia
  - tamanhos
  - navegacao
  - secoes
  - componentes repetiveis
  - blocos internos

### Camada 2. Servico

- [ ] Expandir `src/lib/site-page-config/service.ts`.
- [ ] Garantir leitura administrativa.
- [ ] Garantir leitura publica quando aplicavel.
- [ ] Garantir salvamento de rascunho.
- [ ] Garantir publicacao.
- [ ] Garantir restauracao.

### Camada 3. API

- [ ] Expandir:
  - `src/app/api/admin/page-config/[pageKey]/route.ts`
  - `src/app/api/public/page-config/[pageKey]/route.ts`
- [ ] Garantir suporte a `app`.
- [ ] Validar guard admin.
- [ ] Validar respostas com erros consistentes.

### Camada 4. Builder administrativo

- [x] Evoluir `src/components/admin/SiteExperienceBuilder.tsx`.
- [x] Adicionar terceira aba ou terceiro contexto:
  - [x] Landing
  - [x] Login
  - [x] App Interno
- [ ] Expor controles reais de UI/UX global.
- [x] Expor preview coerente do estado atual.

### Camada 5. Consumo no frontend

- [ ] Consumir config em:
  - `src/components/layout/sidebar.tsx`
  - `src/components/layout/header.tsx`
  - `src/app/appointments/page.tsx`
  - `src/components/appointments/AppointmentsContent.tsx`
  - `src/app/monitoring/page.tsx`
  - `src/components/monitoring/*`
  - `src/app/profile/page.tsx`
  - `src/components/landing/LandingPage.tsx`
  - `src/components/auth/LoginExperience.tsx`

## Ordem recomendada de execucao

### Fase A - Fundacao do builder global

- [x] Ampliar schema para `app`.
- [x] Criar defaults reais do `app`.
- [ ] Ampliar service.
- [ ] Ampliar APIs por `pageKey`.

### Fase B - Editor administrativo do app

- [x] Adicionar contexto `App Interno` no construtor.
- [x] Criar controles de:
  - [x] tipografia
  - [x] tamanhos
  - [x] sidebar
  - [x] header
  - [x] cards
  - [x] tabelas
  - [x] botoes
  - [x] textos
  - [x] visibilidade de blocos

### Fase C - Consumo nas partes globais

- [ ] Sidebar
- [ ] Header
- [ ] Rodape auxiliar

### Fase D - Consumo nas paginas internas prioritarias

- [ ] Appointments
- [ ] Monitoring
- [ ] Profile
- [ ] Dashboard

### Fase E - Evolucao do builder publico

- [ ] Landing com tamanho de cards, icones, botoes e componentes
- [ ] Login com tamanho de cards, icones, botoes e componentes
- [ ] Refino do preview

### Fase F - QA e validacao

- [ ] Validar em navegador real.
- [ ] Validar publicacao real.
- [ ] Validar persistencia real no MySQL.
- [ ] Validar guards administrativos.
- [ ] Validar check de tipos, lint e format.

## Requisitos obrigatorios de validacao

- [ ] O admin consegue editar a landing.
- [ ] O admin consegue editar o login.
- [ ] O admin consegue editar a experiencia interna do app.
- [ ] O admin consegue alterar tamanho de fontes.
- [ ] O admin consegue alterar tamanho de cards.
- [ ] O admin consegue alterar tamanho de icones.
- [ ] O admin consegue alterar tamanho de botoes.
- [ ] O admin consegue alterar escala de tabelas.
- [ ] O admin consegue alterar textos.
- [ ] O admin consegue adicionar e remover blocos suportados.
- [ ] O admin consegue reordenar blocos suportados.
- [ ] O preview administrativo reflete o rascunho atual.
- [ ] A versao publicada reflete o estado salvo.
- [ ] Usuarios nao admin nao conseguem acessar a edicao.
- [ ] O frontend nao quebra quando um bloco e ocultado.
- [ ] O app continua funcional com dados reais.

## Checks obrigatorios por bloco

Executar exatamente:

```bash
npm run fix:format
npm run fix:lint
npm run check:lint
npm run check:format
npm run check:types
```

## Observacoes de integridade

- Esta task foi criada a partir de investigacao real sobre capacidades conhecidas do Elementor, mas a implementacao na Lyra deve ser adaptada a:
  - Next.js App Router
  - React 19
  - Tailwind CSS
  - shadcn/ui
  - MySQL
  - guardas administrativas reais
- Nao transformar a Lyra em copia literal do Elementor.
- A referencia serve como matriz de capacidade para o construtor administrativo da Lyra.
- O objetivo e dar poder administrativo real de composicao visual, sem degradar a coerencia do produto.

## Estado atual desta task

- [x] Task criada na raiz do projeto.
- [x] Auditoria local profunda da pasta `ELEMENTOR` consolidada na task.
- [x] Causa raiz da inviabilidade de integracao direta documentada.
- [x] Schema e builder administrativo alinhados para `landing`, `login` e `app`.
- [x] `ELEMENTOR` isolado corretamente dos checks do app em lint/format.
- [x] Modulo raiz `modules/lyra-customaze-ui-ux` criado e documentado.
- [x] Nucleo inicial segregado do app sem quebrar imports existentes.
- [x] Contrato tecnico de integracao reutilizavel criado em `modules/lyra-customaze-ui-ux/src/contracts/integration.ts`.
- [x] Instalador portavel `implement_elementor_lyra.py` criado e validado no proprio projeto.
- [x] Script `lyra-customaze:install` registrado no `package.json`.
- [x] Modulo renomeado para `Lyra Customaze UI UX`, preservando `implement_elementor_lyra.py` por compatibilidade operacional.
- [x] Reexport agregador `src/lib/site-page-config/index.ts` criado para apps consumidores.
- [x] Camada generica de armazenamento extraida para `modules/lyra-customaze-ui-ux/src/site-page-config/storage.ts`.
- [x] Helper reutilizavel de runtime criado em `modules/lyra-customaze-ui-ux/src/site-page-config/runtime.ts` para escalar tipografia e dimensoes no app consumidor.
- [x] Hook real `src/hooks/use-public-site-page-config.ts` criado para consumir configuracoes publicadas do builder no frontend cliente.
- [x] Consumo real do `page-config/app` ligado em `sidebar`, `header`, `mobile sidebar`, `appointments`, `monitoring` e `profile`.
- [x] Publicacao real via API administrativa do `page-config/app` validada em navegador autenticado, com reflexo visual imediato no app interno.
- [x] Validacao final em navegador real do contexto `app` concluida para `dashboard`, `appointments`, `monitoring` e `profile`.
- [ ] Implementacao completa desta task ainda segue em andamento.
