# TASK DE IMPLEMENTACAO - REFERENCIA ELEMENTOR NA LYRA METACARE

Data de criacao: 2026-03-26
Projeto: Lyra MetaCare
Workspace: `C:\temp\Lyra-MetaCare`
Responsavel: Codex
Idioma obrigatorio: pt-BR
Status geral: planejamento estruturado, sem execucao completa ainda

## Objetivo desta task

Estruturar a implementacao, dentro da Lyra MetaCare, de um construtor administrativo inspirado nas capacidades reais identificadas no Elementor, respeitando integralmente a stack atual do projeto, sem adicionar dependencias proibidas, sem simulacoes, sem placeholders funcionais, sem hardcode indevido e com persistencia real em banco de dados.

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

- [ ] Expandir `src/lib/site-page-config/schema.ts`.
- [ ] Suportar `pageKey`:
  - `landing`
  - `login`
  - `app`
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

- [ ] Evoluir `src/components/admin/SiteExperienceBuilder.tsx`.
- [ ] Adicionar terceira aba ou terceiro contexto:
  - Landing
  - Login
  - App Interno
- [ ] Expor controles reais de UI/UX global.
- [ ] Expor preview coerente do estado atual.

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

- [ ] Ampliar schema para `app`.
- [ ] Criar defaults reais do `app`.
- [ ] Ampliar service.
- [ ] Ampliar APIs por `pageKey`.

### Fase B - Editor administrativo do app

- [ ] Adicionar contexto `App Interno` no construtor.
- [ ] Criar controles de:
  - tipografia
  - tamanhos
  - sidebar
  - header
  - cards
  - tabelas
  - botoes
  - textos
  - visibilidade de blocos

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
- [ ] Implementacao ainda nao iniciada por completo nesta task.
- [ ] Aguardando proxima instrucao do usuario.
