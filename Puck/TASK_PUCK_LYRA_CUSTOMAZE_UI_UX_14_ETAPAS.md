# Task Mestre de Implementação do Puck no Lyra Customaze UI UX

## 0. Identificação desta task

- Nome da iniciativa: `Lyra Customaze UI UX com Puck`
- Objetivo central: substituir a falsa expectativa de um editor “tipo Elementor” por uma implementação real, progressiva, auditável e baseada no **Puck**, integrada ao ecossistema atual da Lyra.
- Base documental oficial analisada: documentação pública do Puck em março de 2026.
- Quantidade de frentes obrigatórias desta task: `14`
- Estado desta task: `Planejamento técnico detalhado`

---

## 1. Compromisso técnico e honestidade obrigatória

Esta task parte de um compromisso explícito:

- não vender Puck como algo que ele não é;
- não tratar “instalar o pacote” como se isso resolvesse sozinho a paridade com Elementor;
- não prometer drag-and-drop total, multi-superfície, versionamento visual, permissões avançadas e integração universal antes que essas camadas estejam realmente implementadas e validadas;
- não gravar segredo sensível em código ou markdown versionado;
- não usar placeholder funcional;
- não cortar implementação;
- não simular funcionamento.

### 1.1. Conclusão técnica honesta desta etapa de planejamento

O **Puck** é hoje o melhor candidato técnico para o que queremos construir dentro da Lyra, porque:

- é nativo do ecossistema React;
- funciona com Next.js;
- oferece editor visual real;
- suporta render por componentes reais;
- possui recursos oficiais para:
  - configuração de componentes;
  - root configuration;
  - layout por colunas;
  - categorias;
  - rich text editing;
  - dynamic props;
  - dynamic fields;
  - external data sources;
  - React Server Components;
  - data migration;
  - viewports;
  - feature toggling;
  - overlay portals.

Mas também é obrigatório registrar:

- Puck **não é automaticamente Elementor**;
- Puck é a **fundação correta** para construirmos um editor visual muito mais próximo do Elementor dentro da arquitetura da Lyra.

---

## 2. Regras arquiteturais obrigatórias desta implementação

- O módulo final continuará se chamando `Lyra Customaze UI UX`.
- A engine baseada em Puck deverá ser integrada de forma **segregada**, para que no futuro seja portada para outros apps compatíveis.
- A solução precisa respeitar a stack real da Lyra:
  - `Next.js 15`
  - `React 19`
  - `TypeScript 5`
  - `Tailwind CSS`
  - `Radix UI`
  - `shadcn/ui`
  - `MySQL`
- Toda persistência deverá ser real.
- Toda publicação deverá ser real.
- Toda proteção administrativa deverá ser real.
- A chave beta fornecida pelo usuário **não deve ser commitada nem gravada em markdown público do repositório**.
- Se for necessária, ela deve entrar apenas por variável de ambiente local e/ou fluxo de segredo operacional.

### 2.1. Tratamento da chave beta do Puck

Chave recebida do usuário:

- foi recebida no chat;
- **não deve ser copiada para arquivo versionado**;
- **não deve ser hardcoded** em `package.json`, `.ts`, `.tsx`, `.md` ou script commitado;
- deverá, se necessário, ser usada apenas via:
  - `.env.local`
  - segredo operacional
  - configuração local não versionada

---

## 3. Fontes oficiais usadas para esta task

Todas as 14 tarefas abaixo foram mapeadas a partir da documentação oficial do Puck:

1. [Getting Started](https://puckeditor.com/docs/getting-started)
2. [Component Configuration](https://puckeditor.com/docs/integrating-puck/component-configuration)
3. [Root Configuration](https://puckeditor.com/docs/integrating-puck/root-configuration)
4. [Multi-column Layouts](https://puckeditor.com/docs/integrating-puck/multi-column-layouts)
5. [Categories](https://puckeditor.com/docs/integrating-puck/categories)
6. [Rich Text Editing](https://puckeditor.com/docs/integrating-puck/rich-text-editing)
7. [Dynamic Props](https://puckeditor.com/docs/integrating-puck/dynamic-props)
8. [Dynamic Fields](https://puckeditor.com/docs/integrating-puck/dynamic-fields)
9. [External Data Sources](https://puckeditor.com/docs/integrating-puck/external-data-sources)
10. [React Server Components](https://puckeditor.com/docs/integrating-puck/server-components)
11. [Data Migration](https://puckeditor.com/docs/integrating-puck/data-migration)
12. [Viewports](https://puckeditor.com/docs/integrating-puck/viewports)
13. [Feature Toggling](https://puckeditor.com/docs/integrating-puck/feature-toggling)
14. [Overlay Portals](https://puckeditor.com/docs/integrating-puck/overlay-portals)

---

## 4. Objetivo prático desta task

Ao final das 14 etapas, queremos chegar a um estado em que:

- o administrador consiga acessar um editor visual real baseado em Puck;
- o editor viva dentro da Lyra;
- o editor publique configurações reais para superfícies reais;
- o editor use componentes reais do app;
- o editor tenha base de responsividade por viewport;
- o editor suporte conteúdo rico;
- o editor suporte integração com dados externos reais;
- o editor esteja preparado para campos dinâmicos, props dinâmicas e regras de edição;
- o editor respeite permissões administrativas;
- o editor sirva como base para evolução do `Lyra Customaze UI UX` rumo a uma experiência mais próxima de um Elementor para apps React/Next.

---

## 5. Estratégia de implantação

As 14 tarefas abaixo não são apenas “ler docs”.

Cada uma representa:

- entendimento da página oficial;
- adaptação para a realidade da Lyra;
- instalação;
- configuração;
- uso;
- integração com o módulo `Lyra Customaze UI UX`;
- critérios de aceite;
- riscos;
- dependências;
- validação real.

---

# TASK 01 — Puck Getting Started

## Fonte oficial

- [Getting Started](https://puckeditor.com/docs/getting-started)

## Objetivo

Integrar o pacote base `@puckeditor/core` à Lyra de forma real, segura e compatível com a arquitetura atual.

## Instalação

- Instalar `@puckeditor/core` no projeto.
- Verificar compatibilidade com `React 19` e `Next.js 15`.
- Validar carregamento de `@puckeditor/core/puck.css`.

## Configuração

- Criar a primeira infraestrutura real de editor Puck dentro do módulo `Lyra Customaze UI UX`.
- Criar a separação entre:
  - editor (`Puck`)
  - render público (`Render`)
- Definir o primeiro arquivo de configuração central do Puck para a Lyra.

## Uso

- Expor uma rota administrativa experimental e protegida para o editor Puck.
- Garantir que o admin consiga abrir o editor real e visualizar um bloco mínimo configurado.

## Dependências

- autenticação administrativa;
- carregamento de CSS do Puck;
- estrutura mínima de config.

## Critérios de aceite

- `@puckeditor/core` instalado de verdade;
- CSS do Puck carregado;
- rota administrativa funcional;
- editor renderizando sem crash;
- render público usando `Render` sem simulação.

## Risco principal

- conflitos entre SSR/CSR, CSS global e App Router.

---

# TASK 02 — Component Configuration

## Fonte oficial

- [Component Configuration](https://puckeditor.com/docs/integrating-puck/component-configuration)

## Objetivo

Criar o catálogo de componentes editáveis do Puck para a Lyra.

## Instalação

- Estruturar arquivos de configuração por componentes editáveis.

## Configuração

- Definir `components` do Puck para blocos reais da Lyra.
- Cada componente deverá possuir:
  - `render`
  - `fields`
  - typing forte
- Iniciar por blocos controlados:
  - heading
  - paragraph
  - CTA
  - metric card
  - feature block
  - FAQ item
  - section wrapper

## Uso

- Permitir que o admin insira e edite esses componentes no canvas.

## Critérios de aceite

- cada componente renderiza via `render`;
- cada campo aparece no editor;
- o valor dos campos é refletido no preview;
- o tipo dos campos é validado.

## Risco principal

- modelar componentes sem governança e quebrar consistência visual.

---

# TASK 03 — Root Configuration

## Fonte oficial

- [Root Configuration](https://puckeditor.com/docs/integrating-puck/root-configuration)

## Objetivo

Modelar a estrutura raiz das superfícies editáveis da Lyra usando `root`.

## Instalação

- Habilitar `root` no config principal do Puck.

## Configuração

- Definir root render para:
  - landing
  - login
  - app shell
- Usar root fields para metadata estrutural, como:
  - título da página
  - chave de superfície
  - flags de layout
  - contexto de template

## Uso

- O administrador deve conseguir editar metadados de uma superfície inteira sem precisar mexer componente por componente.

## Critérios de aceite

- root configurado de forma real;
- fields de root aparecendo no editor;
- render de root envolvendo corretamente `children`.

## Risco principal

- confundir metadado da superfície com props dos componentes filhos.

---

# TASK 04 — Multi-column Layouts

## Fonte oficial

- [Multi-column Layouts](https://puckeditor.com/docs/integrating-puck/multi-column-layouts)

## Objetivo

Implementar layouts multi-coluna reais no editor da Lyra usando a abordagem oficial do Puck com `DropZone`.

## Instalação

- Preparar componentes container compatíveis com `DropZone`.

## Configuração

- Criar estruturas como:
  - 2 colunas
  - 3 colunas
  - hero com colunas assimétricas
  - sidebar de edição lateral
- Garantir governança visual com limites claros.

## Uso

- O admin deve conseguir posicionar componentes em zonas distintas.

## Critérios de aceite

- zonas separadas funcionando;
- componentes renderizando nas colunas corretas;
- persistência correta da estrutura.

## Risco principal

- permitir layouts livres demais e comprometer responsividade.

---

# TASK 05 — Categories

## Fonte oficial

- [Categories](https://puckeditor.com/docs/integrating-puck/categories)

## Objetivo

Organizar o catálogo de blocos da Lyra em categorias utilizáveis por usuários administrativos.

## Instalação

- Configurar `categories` no Puck.

## Configuração

- Criar categorias reais para a Lyra, por exemplo:
  - Tipografia
  - Estrutura
  - Marketing
  - Conversão
  - Dashboard
  - Astrologia
  - Saúde e sinais
  - Navegação
  - Formulários

## Uso

- O administrador deve encontrar os blocos por categoria de forma organizada.

## Critérios de aceite

- categorias visíveis no inseridor de componentes;
- componentes mapeados corretamente;
- sem mistura caótica entre blocos públicos e internos.

## Risco principal

- taxonomia ruim dificultando o uso por pessoas leigas.

---

# TASK 06 — Rich Text Editing

## Fonte oficial

- [Rich Text Editing](https://puckeditor.com/docs/integrating-puck/rich-text-editing)

## Objetivo

Habilitar edição de texto rico real no editor da Lyra.

## Instalação

- Preparar campos `richtext`.

## Configuração

- Aplicar `contentEditable` onde fizer sentido.
- Definir quais blocos aceitam rich text:
  - hero description
  - section body
  - FAQ answer
  - textos editoriais

## Uso

- O admin deve conseguir editar texto diretamente no preview e também pelo painel.

## Critérios de aceite

- rich text persistindo de forma real;
- inline editing funcional;
- render consistente no front.

## Risco principal

- rich text mal controlado quebrando semântica, sanitização e consistência visual.

---

# TASK 07 — Dynamic Props

## Fonte oficial

- [Dynamic Props](https://puckeditor.com/docs/integrating-puck/dynamic-props)

## Objetivo

Usar `resolveData` para derivar props dinâmicas reais no editor da Lyra.

## Instalação

- Estruturar resolução dinâmica por componente e por root.

## Configuração

- Aplicar `resolveData` em componentes que precisem de:
  - valores derivados;
  - leitura de estado do app;
  - campos readonly;
  - otimização contra recomputações desnecessárias.

## Uso

- O editor deve refletir dados calculados, não apenas props digitadas manualmente.

## Critérios de aceite

- props derivadas funcionando;
- campos readonly respeitados;
- uso de `changed` para evitar recomputações caras.

## Risco principal

- chamadas caras ou repetidas sem controle.

---

# TASK 08 — Dynamic Fields

## Fonte oficial

- [Dynamic Fields](https://puckeditor.com/docs/integrating-puck/dynamic-fields)

## Objetivo

Construir formulários e painéis que mudam conforme o estado atual do componente.

## Instalação

- Preparar lógica de campos condicionais no config.

## Configuração

- Exemplo de aplicação na Lyra:
  - CTA muda os campos se o tipo for link interno, externo ou ação;
  - card muda campos se ativar ícone, badge ou mídia;
  - bloco de plano muda opções conforme categoria.

## Uso

- O admin deve ver apenas os campos relevantes para o contexto atual do bloco.

## Critérios de aceite

- fields dinâmicos mudando em tempo real;
- dados persistidos corretamente;
- UX administrativa mais limpa.

## Risco principal

- ocultar campos essenciais e gerar perda de contexto.

---

# TASK 09 — External Data Sources

## Fonte oficial

- [External Data Sources](https://puckeditor.com/docs/integrating-puck/external-data-sources)

## Objetivo

Integrar o editor da Lyra com fontes externas e internas de dados reais.

## Instalação

- Avaliar e configurar `external field type` quando necessário.

## Configuração

- Conectar o Puck à realidade da Lyra:
  - planos publicados;
  - usuários;
  - métricas;
  - catálogo de recursos;
  - blocos vindos de banco;
  - futuras fontes externas seguras.

## Uso

- O admin deve poder selecionar dados reais ao invés de digitar tudo manualmente.

## Critérios de aceite

- carregamento real de dados;
- persistência correta no payload;
- sem mock de fonte externa.

## Risco principal

- dependência de fontes não autenticadas ou instáveis.

---

# TASK 10 — React Server Components

## Fonte oficial

- [React Server Components](https://puckeditor.com/docs/integrating-puck/server-components)

## Objetivo

Adaptar o Puck corretamente ao modelo `App Router + RSC + Client Components` da Lyra.

## Instalação

- Segregar o que precisa ser client-side do que pode ser server-side.

## Configuração

- Modelar fronteiras entre:
  - editor interativo
  - render de página
  - componentes server
  - wrappers client

## Uso

- O editor precisa continuar funcionando sem quebrar a arquitetura RSC do projeto.

## Critérios de aceite

- editor sem crash em App Router;
- render público preservado;
- boundaries corretas entre client e server.

## Risco principal

- tentar usar Puck diretamente em contexto que exige client interativo sem isolamento adequado.

---

# TASK 11 — Data Migration

## Fonte oficial

- [Data Migration](https://puckeditor.com/docs/integrating-puck/data-migration)

## Objetivo

Criar estratégia de migração de payloads do Puck para a Lyra.

## Instalação

- Integrar o helper `migrate` do Puck ao pipeline de leitura dos dados persistidos.

## Configuração

- Criar versionamento do payload;
- definir política de compatibilidade;
- mapear transforms entre versões;
- preservar conteúdo legado já salvo.

## Uso

- Toda leitura de payload antigo deve poder ser migrada antes do render.

## Critérios de aceite

- payload legado lido sem quebra;
- migração aplicada de forma determinística;
- estratégia documentada.

## Risco principal

- perda de conteúdo por evolução do schema sem migração formal.

---

# TASK 12 — Viewports

## Fonte oficial

- [Viewports](https://puckeditor.com/docs/integrating-puck/viewports)

## Objetivo

Adicionar visualização e edição responsiva controlada por viewport no editor da Lyra.

## Instalação

- Configurar a API de `viewports` do Puck.

## Configuração

- Criar viewports reais para:
  - Desktop
  - Tablet
  - Mobile
- Garantir coerência com breakpoints reais do projeto.

## Uso

- O admin deve conseguir alternar entre viewports e revisar layout por contexto.

## Critérios de aceite

- alternância real de viewport;
- render coerente entre os modos;
- sem divergência estrutural grave entre preview e front.

## Risco principal

- breakpoints do editor divergirem dos breakpoints reais do app.

---

# TASK 13 — Feature Toggling

## Fonte oficial

- [Feature Toggling](https://puckeditor.com/docs/integrating-puck/feature-toggling)

## Objetivo

Controlar permissões e capacidades do editor por usuário, componente e contexto.

## Instalação

- Integrar `permissions` globais e `resolvePermissions`.

## Configuração

- Restringir funções perigosas;
- permitir funcionalidades apenas para administradores;
- bloquear ações em componentes sensíveis;
- controlar edição por superfície.

## Uso

- O sistema deve permitir, por exemplo:
  - admin total;
  - componentes com delete bloqueado;
  - certos blocos readonly;
  - edição condicional por status.

## Critérios de aceite

- permissões globais funcionando;
- permissões por componente funcionando;
- permissões dinâmicas funcionando.

## Risco principal

- liberar demais e quebrar estruturas sensíveis.

---

# TASK 14 — Overlay Portals

## Fonte oficial

- [Overlay Portals](https://puckeditor.com/docs/integrating-puck/overlay-portals)

## Objetivo

Permitir interação real com elementos específicos no canvas usando `registerOverlayPortal`.

## Instalação

- Integrar a API `registerOverlayPortal`.

## Configuração

- Aplicar em casos reais da Lyra, como:
  - rich text inline;
  - acordeões interativos;
  - tabs;
  - componentes com subinteração;
  - slots internos.

## Uso

- O admin deve conseguir interagir com elementos selecionados do canvas sem o overlay bloquear indevidamente.

## Critérios de aceite

- overlay desativado apenas nos pontos permitidos;
- interatividade preservada;
- sem comprometer a seleção global do editor.

## Risco principal

- liberar áreas demais e degradar a ergonomia de edição.

---

## 6. Ordem recomendada de implementação

Para reduzir retrabalho, a ordem correta desta task é:

1. Task 01 — Getting Started
2. Task 10 — React Server Components
3. Task 02 — Component Configuration
4. Task 03 — Root Configuration
5. Task 12 — Viewports
6. Task 05 — Categories
7. Task 13 — Feature Toggling
8. Task 04 — Multi-column Layouts
9. Task 06 — Rich Text Editing
10. Task 14 — Overlay Portals
11. Task 07 — Dynamic Props
12. Task 08 — Dynamic Fields
13. Task 09 — External Data Sources
14. Task 11 — Data Migration

---

## 7. Critérios globais de aceite

Esta iniciativa só poderá ser considerada correta quando:

- o Puck estiver realmente instalado;
- o editor estiver realmente funcionando dentro da Lyra;
- o editor estiver realmente protegido por perfil admin;
- o editor publicar conteúdo real;
- o frontend consumir esse conteúdo real;
- a integração respeitar a arquitetura App Router;
- os componentes do Puck forem reais e não só demonstrativos;
- o uso não depender de simulação;
- nenhuma chave sensível estiver hardcoded no código ou na documentação.

---

## 8. Critérios globais de reprovação

Esta iniciativa deverá ser considerada reprovada se ocorrer qualquer um dos itens abaixo:

- instalar Puck e chamar isso de implementação completa;
- renderizar apenas um demo fake;
- criar editor sem persistência real;
- criar edição sem publicação real;
- liberar o editor para não admins;
- gravar a chave beta do usuário em arquivo versionado;
- usar placeholders funcionais no lugar de componentes reais;
- declarar paridade com Elementor sem comprovação real.

---

## 9. Saída esperada desta task

Ao concluir este planejamento e as implementações futuras derivadas dele, a Lyra deverá ter:

- uma trilha real de adoção do Puck;
- uma base técnica séria para evolução do `Lyra Customaze UI UX`;
- um editor visual que deixe de ser apenas um builder de campos e se torne uma engine visual de verdade;
- documentação rastreável por tarefa;
- integração coerente com o app atual.

---

## 10. Próximo passo prático após esta task

O próximo passo recomendado, sem pular etapas e sem criar expectativa falsa, é iniciar a **Task 01 — Getting Started**, porque:

- ela instala a base;
- revela conflitos reais da stack;
- permite medir a viabilidade da integração Puck + Lyra;
- prepara o terreno para as próximas 13 tarefas.

---

## 11. Registro desta task

- Criada para servir como plano oficial de implementação do Puck no `Lyra Customaze UI UX`.
- Esta task não declara que a paridade com Elementor já existe.
- Esta task declara um caminho técnico real para construir uma solução mais próxima desse objetivo, com honestidade e validação real.
