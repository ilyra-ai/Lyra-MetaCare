# Task Mestra Ultra Detalhada — Puck no Lyra Customaze UI UX 2026

## 1. Finalidade desta task

- Esta task mestra foi reescrita para atender ao nível extra de detalhe exigido pelo projeto.
- Ela não é uma task superficial.
- Ela não é um resumo.
- Ela não é uma lista vaga de intenções.
- Ela é uma peça operacional, arquitetural e executiva para conduzir a adoção do Puck dentro da Lyra.
- Ela foi escrita em pt-BR, no nível mais alto de detalhamento viável dentro desta fase.
- Ela considera a realidade técnica do projeto e não promete o que ainda não foi implementado.
- Ela serve como documento vivo para acompanhamento, execução, auditoria e validação.

## 2. Postura honesta obrigatória

- Puck não será tratado como solução mágica.
- Puck não será vendido como Elementor pronto.
- Puck será tratado como engine visual poderosa e correta para a Lyra.
- A paridade com Elementor dependerá de construção real sobre o Puck.
- Nenhuma etapa será marcada como feita sem validação real.
- Nenhuma etapa será declarada concluída apenas por “subir tela”.
- Nenhuma chave sensível será versionada.
- Nenhum placeholder funcional será aceito.
- Nenhuma simulação de persistência ou publicação será aceita.

## 3. Direção Premium 2026

- Tema claro e elegante como direção principal.
- Canvas limpo, editorial e premium.
- Componentes com aparência de produto sério e atual.
- UX administrativa feita para pessoas não técnicas.
- Controles de layout, texto, estrutura e viewport com clareza.
- Sem poluição visual, sem excesso de bordas, sem visual de protótipo tosco.
- Tonalidade da Lyra preservada: tecnologia + cuidado + clareza + sofisticação.
- Editor preparado para escalar para landing, login, shell do app e superfícies internas.

## 4. Ambiente e comandos-base

### 4.1. Comandos globais de preparação

```bash
python run_windows.py doctor
python run_windows.py setup-env
python run_windows.py dev
python run_windows.py health
```

### 4.2. Comandos globais de checks

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
```

### 4.3. Comando global de instalação do Puck

```bash
pnpm add @puckeditor/core
```

### 4.4. Comandos globais de versionamento

```bash
git add .
git commit -m "feat(puck): descricao objetiva da etapa concluida"
git push origin main
```

## 5. Estrutura prevista de diretórios desta frente

- `Puck/`
- `src/app/admin/puck/`
- `src/components/admin/puck/`
- `src/lib/puck/config/`
- `src/lib/puck/render/`
- `src/lib/puck/storage/`
- `src/lib/puck/permissions/`
- `src/lib/puck/viewports/`
- `src/lib/puck/data-sources/`
- `src/lib/puck/overlay-portals/`

## 6. Checklist mestre das 14 etapas

- [x] TASK 01 — Getting Started
- [ ] TASK 02 — Component Configuration
- [ ] TASK 03 — Root Configuration
- [ ] TASK 04 — Multi-column Layouts
- [ ] TASK 05 — Categories
- [ ] TASK 06 — Rich Text Editing
- [ ] TASK 07 — Dynamic Props
- [ ] TASK 08 — Dynamic Fields
- [ ] TASK 09 — External Data Sources
- [ ] TASK 10 — Server Components
- [ ] TASK 11 — Data Migration
- [ ] TASK 12 — Viewports
- [ ] TASK 13 — Feature Toggling
- [ ] TASK 14 — Overlay Portals

## 7. Observação importante sobre os comandos

- Os comandos abaixo são comandos reais a serem executados.
- Eles não significam que a etapa já foi executada.
- Eles significam exatamente o que precisa ser rodado quando a etapa entrar em execução.
- Cada task abaixo terá comandos de preparação, implementação, validação e fechamento.
- Cada task abaixo terá instruções de como executar, na ordem certa.

---

# TASK 01 — Getting Started

## Identificação

- Código da etapa: `TASK 01`
- Nome da etapa: `Getting Started`
- Fonte oficial: [Getting Started](https://puckeditor.com/docs/getting-started)
- Estado atual: `[x] concluída`

## Objetivo estratégico

- Instalar o núcleo do Puck e levantar a primeira rota administrativa protegida.
- Resultado alvo desta etapa: Editor inicial do Puck carregando na Lyra sem quebrar App Router.
- Esta etapa deve elevar o nível do editor da Lyra com entrega real, verificável e persistente.

## Valor de negócio desta etapa

- Reduz dependência de desenvolvimento manual para ajustes de experiência.
- Estrutura o editor para uso por administradores reais.
- Aproxima o módulo da experiência de um builder visual premium de 2026.
- Prepara a base para reutilização futura em outros apps compatíveis.

## O que entra no escopo desta etapa

1. Implementação técnica do recurso específico da doc oficial.
2. Integração com a arquitetura atual da Lyra.
3. Proteção administrativa quando aplicável.
4. Validação técnica com checks reais.
5. Validação visual no navegador.
6. Registro das evidências na task e no versionamento.

## O que não entra no escopo desta etapa

1. Declarar paridade total com Elementor.
2. Expandir para todos os recursos das etapas seguintes.
3. Criar mock no lugar de integração real.
4. Pular validação de browser ou de persistência.

## Dependências internas

- Ambiente local saudável.

## Arquivos previstos desta etapa

- Observação honesta: estes arquivos são previstos com base na arquitetura atual e podem ser ajustados se a implementação real revelar outra organização mais correta.
- `src/app/admin/puck/page.tsx`
- `src/components/admin/puck/PuckEditorShell.tsx`
- `src/components/admin/puck/PuckPreviewRenderer.tsx`
- `src/lib/puck/config/base.ts`
- `src/lib/puck/config/initial-data.ts`
- `src/lib/puck/types.ts`

## Variáveis e segredos desta etapa

- Não versionar a chave beta do Puck.
- Se necessário usar recurso beta, configurar apenas por variável local não versionada.
- Não salvar segredo em markdown, TypeScript, package.json ou commit.

## Comandos de preparação desta etapa

```bash
python run_windows.py doctor
python run_windows.py setup-env
python run_windows.py dev
python run_windows.py health
```

## Comandos específicos desta etapa

```bash
pnpm add @puckeditor/core
```

## Comandos de fechamento obrigatório

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
git add .
git commit -m "feat(puck): conclui task 01 getting started"
git push origin main
```

## Como executar esta etapa — passo a passo detalhado

1. Abrir a documentação oficial da etapa e confirmar o conceito exato que será integrado.
2. Subir o ambiente local da Lyra e confirmar saúde de banco e app.
3. Criar ou ajustar os arquivos previstos da etapa.
4. Implementar somente o escopo desta etapa, sem contaminar indevidamente as seguintes.
5. Ligar a etapa ao módulo Lyra Customaze UI UX, e não a um experimento isolado.
6. Garantir que a camada administrativa continue protegida por perfil admin.
7. Validar a integridade TypeScript da etapa.
8. Validar a integridade visual da etapa.
9. Validar o comportamento real no navegador.
10. Registrar riscos e evidências antes de fechar a etapa.
11. Executar todos os checks obrigatórios.
12. Atualizar a própria task marcando os itens realmente concluídos.
13. Commitar e publicar no branch principal apenas depois de a etapa estar real e validada.

## Sequência técnica detalhada

- Mapear exatamente onde esta etapa se conecta ao editor Puck.
- Mapear exatamente onde esta etapa impacta o render público.
- Definir contratos de tipo antes de renderizar UI.
- Garantir coerência com App Router e React 19.
- Preservar tema claro e padrão premium 2026.
- Evitar gerar abstração prematura sem necessidade real.
- Evitar acoplamento indevido com regras exclusivas da Lyra no núcleo reutilizável.
- Separar onde for necessário: config, render, storage, permissions, viewport, UI shell.
- Documentar o que é estrutural e o que é específico do projeto.
- Validar se a etapa preparou corretamente a próxima, sem pular dependências.

## Validação técnica obrigatória

- [ ] Sem erro de TypeScript.
- [ ] Sem erro de lint.
- [ ] Sem quebra de formatação.
- [ ] Sem erro de build quando aplicável.
- [ ] Sem crash na rota administrativa.
- [ ] Sem quebra no frontend público.
- [ ] Sem regressão em autenticação e guardas.
- [ ] Sem regressão em persistência já existente.

## Validação visual obrigatória

- [ ] Editor abre em tema claro de forma legível.
- [ ] Canvas não fica quebrado ou desalinhado.
- [ ] Controles do painel lateral ficam compreensíveis.
- [ ] Componentes visuais não aparentam protótipo improvisado.
- [ ] O nível visual permanece coerente com a Lyra.
- [ ] A superfície continua com aparência premium 2026.

## Validação funcional em navegador

1. Abrir a rota administrativa prevista da etapa.
2. Entrar com usuário administrador real.
3. Executar a ação principal da etapa dentro do editor.
4. Salvar ou aplicar a mudança se a etapa envolver estado.
5. Abrir a superfície correspondente no frontend.
6. Confirmar que o reflexo não depende de placeholder ou fake data.

## Evidências obrigatórias desta etapa

- [ ] Trecho de código implementado e revisado.
- [ ] Checks executados com sucesso.
- [ ] Rota ou tela validada em navegador.
- [ ] Estado real da task atualizado.
- [ ] Commit e push realizados.
- [ ] Descrição honesta do que entrou e do que ainda não entra.

## Riscos e causas raiz a observar

- Conflito entre client component e server component.
- Acoplamento indevido com CSS global.
- Modelagem ruim de schema e props.
- Falsa impressão de implementação completa sem publicação real.
- Permissões insuficientes permitindo acesso indevido.
- Degradação visual do app por conflito de estilos.
- Criação de abstração bonita, porém não operacional.

## Checklist final de pronto

- [ ] Escopo da etapa implementado.
- [ ] Arquivos estruturais criados ou ajustados.
- [ ] Integração com a Lyra preservada.
- [ ] Sem segredo hardcoded.
- [ ] Sem mock funcional.
- [ ] Sem placeholder funcional.
- [ ] Validação técnica concluída.
- [ ] Validação visual concluída.
- [ ] Validação em navegador concluída.
- [ ] Task atualizada.
- [ ] Commit feito.
- [ ] Push feito.

## Notas específicas desta etapa

- Nesta etapa, a rota administrativa prevista mais provável é `/admin/puck`.
- A primeira versão não deve tentar resolver tudo; deve apenas provar a integração correta do núcleo.

---

# TASK 02 — Component Configuration

## Identificação

- Código da etapa: `TASK 02`
- Nome da etapa: `Component Configuration`
- Fonte oficial: [Component Configuration](https://puckeditor.com/docs/integrating-puck/component-configuration)
- Estado atual: `[ ] não iniciada`

## Objetivo estratégico

- Criar o catálogo inicial de componentes reais e premium da Lyra para o Puck.
- Resultado alvo desta etapa: Componentes reais, tipados e editáveis no canvas.
- Esta etapa deve elevar o nível do editor da Lyra com entrega real, verificável e persistente.

## Valor de negócio desta etapa

- Reduz dependência de desenvolvimento manual para ajustes de experiência.
- Estrutura o editor para uso por administradores reais.
- Aproxima o módulo da experiência de um builder visual premium de 2026.
- Prepara a base para reutilização futura em outros apps compatíveis.

## O que entra no escopo desta etapa

1. Implementação técnica do recurso específico da doc oficial.
2. Integração com a arquitetura atual da Lyra.
3. Proteção administrativa quando aplicável.
4. Validação técnica com checks reais.
5. Validação visual no navegador.
6. Registro das evidências na task e no versionamento.

## O que não entra no escopo desta etapa

1. Declarar paridade total com Elementor.
2. Expandir para todos os recursos das etapas seguintes.
3. Criar mock no lugar de integração real.
4. Pular validação de browser ou de persistência.

## Dependências internas

- TASK 01 concluída.

## Arquivos previstos desta etapa

- Observação honesta: estes arquivos são previstos com base na arquitetura atual e podem ser ajustados se a implementação real revelar outra organização mais correta.
- `src/lib/puck/config/components/index.ts`
- `src/lib/puck/config/components/heading.tsx`
- `src/lib/puck/config/components/body-text.tsx`
- `src/lib/puck/config/components/cta-button.tsx`
- `src/lib/puck/config/components/metric-card.tsx`
- `src/lib/puck/config/components/feature-card.tsx`

## Variáveis e segredos desta etapa

- Não versionar a chave beta do Puck.
- Se necessário usar recurso beta, configurar apenas por variável local não versionada.
- Não salvar segredo em markdown, TypeScript, package.json ou commit.

## Comandos de preparação desta etapa

```bash
python run_windows.py doctor
python run_windows.py setup-env
python run_windows.py dev
python run_windows.py health
```

## Comandos específicos desta etapa

```bash
pnpm run check:types
pnpm run check:lint
```

## Comandos de fechamento obrigatório

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
git add .
git commit -m "feat(puck): conclui task 02 component configuration"
git push origin main
```

## Como executar esta etapa — passo a passo detalhado

1. Abrir a documentação oficial da etapa e confirmar o conceito exato que será integrado.
2. Subir o ambiente local da Lyra e confirmar saúde de banco e app.
3. Criar ou ajustar os arquivos previstos da etapa.
4. Implementar somente o escopo desta etapa, sem contaminar indevidamente as seguintes.
5. Ligar a etapa ao módulo Lyra Customaze UI UX, e não a um experimento isolado.
6. Garantir que a camada administrativa continue protegida por perfil admin.
7. Validar a integridade TypeScript da etapa.
8. Validar a integridade visual da etapa.
9. Validar o comportamento real no navegador.
10. Registrar riscos e evidências antes de fechar a etapa.
11. Executar todos os checks obrigatórios.
12. Atualizar a própria task marcando os itens realmente concluídos.
13. Commitar e publicar no branch principal apenas depois de a etapa estar real e validada.

## Sequência técnica detalhada

- Mapear exatamente onde esta etapa se conecta ao editor Puck.
- Mapear exatamente onde esta etapa impacta o render público.
- Definir contratos de tipo antes de renderizar UI.
- Garantir coerência com App Router e React 19.
- Preservar tema claro e padrão premium 2026.
- Evitar gerar abstração prematura sem necessidade real.
- Evitar acoplamento indevido com regras exclusivas da Lyra no núcleo reutilizável.
- Separar onde for necessário: config, render, storage, permissions, viewport, UI shell.
- Documentar o que é estrutural e o que é específico do projeto.
- Validar se a etapa preparou corretamente a próxima, sem pular dependências.

## Validação técnica obrigatória

- [ ] Sem erro de TypeScript.
- [ ] Sem erro de lint.
- [ ] Sem quebra de formatação.
- [ ] Sem erro de build quando aplicável.
- [ ] Sem crash na rota administrativa.
- [ ] Sem quebra no frontend público.
- [ ] Sem regressão em autenticação e guardas.
- [ ] Sem regressão em persistência já existente.

## Validação visual obrigatória

- [ ] Editor abre em tema claro de forma legível.
- [ ] Canvas não fica quebrado ou desalinhado.
- [ ] Controles do painel lateral ficam compreensíveis.
- [ ] Componentes visuais não aparentam protótipo improvisado.
- [ ] O nível visual permanece coerente com a Lyra.
- [ ] A superfície continua com aparência premium 2026.

## Validação funcional em navegador

1. Abrir a rota administrativa prevista da etapa.
2. Entrar com usuário administrador real.
3. Executar a ação principal da etapa dentro do editor.
4. Salvar ou aplicar a mudança se a etapa envolver estado.
5. Abrir a superfície correspondente no frontend.
6. Confirmar que o reflexo não depende de placeholder ou fake data.

## Evidências obrigatórias desta etapa

- [ ] Trecho de código implementado e revisado.
- [ ] Checks executados com sucesso.
- [ ] Rota ou tela validada em navegador.
- [ ] Estado real da task atualizado.
- [ ] Commit e push realizados.
- [ ] Descrição honesta do que entrou e do que ainda não entra.

## Riscos e causas raiz a observar

- Conflito entre client component e server component.
- Acoplamento indevido com CSS global.
- Modelagem ruim de schema e props.
- Falsa impressão de implementação completa sem publicação real.
- Permissões insuficientes permitindo acesso indevido.
- Degradação visual do app por conflito de estilos.
- Criação de abstração bonita, porém não operacional.

## Checklist final de pronto

- [ ] Escopo da etapa implementado.
- [ ] Arquivos estruturais criados ou ajustados.
- [ ] Integração com a Lyra preservada.
- [ ] Sem segredo hardcoded.
- [ ] Sem mock funcional.
- [ ] Sem placeholder funcional.
- [ ] Validação técnica concluída.
- [ ] Validação visual concluída.
- [ ] Validação em navegador concluída.
- [ ] Task atualizada.
- [ ] Commit feito.
- [ ] Push feito.

## Notas específicas desta etapa

- Os componentes iniciais precisam ser poucos, mas reais e premium.
- Não usar bloco genérico feio apenas para “mostrar que funciona”.

---

# TASK 03 — Root Configuration

## Identificação

- Código da etapa: `TASK 03`
- Nome da etapa: `Root Configuration`
- Fonte oficial: [Root Configuration](https://puckeditor.com/docs/integrating-puck/root-configuration)
- Estado atual: `[ ] não iniciada`

## Objetivo estratégico

- Controlar a estrutura raiz das superfícies com metadata e contexto global.
- Resultado alvo desta etapa: Landing, login e app shell com root fields reais.
- Esta etapa deve elevar o nível do editor da Lyra com entrega real, verificável e persistente.

## Valor de negócio desta etapa

- Reduz dependência de desenvolvimento manual para ajustes de experiência.
- Estrutura o editor para uso por administradores reais.
- Aproxima o módulo da experiência de um builder visual premium de 2026.
- Prepara a base para reutilização futura em outros apps compatíveis.

## O que entra no escopo desta etapa

1. Implementação técnica do recurso específico da doc oficial.
2. Integração com a arquitetura atual da Lyra.
3. Proteção administrativa quando aplicável.
4. Validação técnica com checks reais.
5. Validação visual no navegador.
6. Registro das evidências na task e no versionamento.

## O que não entra no escopo desta etapa

1. Declarar paridade total com Elementor.
2. Expandir para todos os recursos das etapas seguintes.
3. Criar mock no lugar de integração real.
4. Pular validação de browser ou de persistência.

## Dependências internas

- TASK 01 concluída.
- TASK 02 minimamente estável.

## Arquivos previstos desta etapa

- Observação honesta: estes arquivos são previstos com base na arquitetura atual e podem ser ajustados se a implementação real revelar outra organização mais correta.
- `src/lib/puck/config/root/index.ts`
- `src/lib/puck/config/root/landing-root.tsx`
- `src/lib/puck/config/root/login-root.tsx`
- `src/lib/puck/config/root/app-root.tsx`
- `src/lib/puck/config/root/surface-metadata.ts`
- `src/lib/puck/render/root-renderer.tsx`

## Variáveis e segredos desta etapa

- Não versionar a chave beta do Puck.
- Se necessário usar recurso beta, configurar apenas por variável local não versionada.
- Não salvar segredo em markdown, TypeScript, package.json ou commit.

## Comandos de preparação desta etapa

```bash
python run_windows.py doctor
python run_windows.py setup-env
python run_windows.py dev
python run_windows.py health
```

## Comandos específicos desta etapa

```bash
pnpm run check:types
pnpm run check:lint
```

## Comandos de fechamento obrigatório

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
git add .
git commit -m "feat(puck): conclui task 03 root configuration"
git push origin main
```

## Como executar esta etapa — passo a passo detalhado

1. Abrir a documentação oficial da etapa e confirmar o conceito exato que será integrado.
2. Subir o ambiente local da Lyra e confirmar saúde de banco e app.
3. Criar ou ajustar os arquivos previstos da etapa.
4. Implementar somente o escopo desta etapa, sem contaminar indevidamente as seguintes.
5. Ligar a etapa ao módulo Lyra Customaze UI UX, e não a um experimento isolado.
6. Garantir que a camada administrativa continue protegida por perfil admin.
7. Validar a integridade TypeScript da etapa.
8. Validar a integridade visual da etapa.
9. Validar o comportamento real no navegador.
10. Registrar riscos e evidências antes de fechar a etapa.
11. Executar todos os checks obrigatórios.
12. Atualizar a própria task marcando os itens realmente concluídos.
13. Commitar e publicar no branch principal apenas depois de a etapa estar real e validada.

## Sequência técnica detalhada

- Mapear exatamente onde esta etapa se conecta ao editor Puck.
- Mapear exatamente onde esta etapa impacta o render público.
- Definir contratos de tipo antes de renderizar UI.
- Garantir coerência com App Router e React 19.
- Preservar tema claro e padrão premium 2026.
- Evitar gerar abstração prematura sem necessidade real.
- Evitar acoplamento indevido com regras exclusivas da Lyra no núcleo reutilizável.
- Separar onde for necessário: config, render, storage, permissions, viewport, UI shell.
- Documentar o que é estrutural e o que é específico do projeto.
- Validar se a etapa preparou corretamente a próxima, sem pular dependências.

## Validação técnica obrigatória

- [ ] Sem erro de TypeScript.
- [ ] Sem erro de lint.
- [ ] Sem quebra de formatação.
- [ ] Sem erro de build quando aplicável.
- [ ] Sem crash na rota administrativa.
- [ ] Sem quebra no frontend público.
- [ ] Sem regressão em autenticação e guardas.
- [ ] Sem regressão em persistência já existente.

## Validação visual obrigatória

- [ ] Editor abre em tema claro de forma legível.
- [ ] Canvas não fica quebrado ou desalinhado.
- [ ] Controles do painel lateral ficam compreensíveis.
- [ ] Componentes visuais não aparentam protótipo improvisado.
- [ ] O nível visual permanece coerente com a Lyra.
- [ ] A superfície continua com aparência premium 2026.

## Validação funcional em navegador

1. Abrir a rota administrativa prevista da etapa.
2. Entrar com usuário administrador real.
3. Executar a ação principal da etapa dentro do editor.
4. Salvar ou aplicar a mudança se a etapa envolver estado.
5. Abrir a superfície correspondente no frontend.
6. Confirmar que o reflexo não depende de placeholder ou fake data.

## Evidências obrigatórias desta etapa

- [ ] Trecho de código implementado e revisado.
- [ ] Checks executados com sucesso.
- [ ] Rota ou tela validada em navegador.
- [ ] Estado real da task atualizado.
- [ ] Commit e push realizados.
- [ ] Descrição honesta do que entrou e do que ainda não entra.

## Riscos e causas raiz a observar

- Conflito entre client component e server component.
- Acoplamento indevido com CSS global.
- Modelagem ruim de schema e props.
- Falsa impressão de implementação completa sem publicação real.
- Permissões insuficientes permitindo acesso indevido.
- Degradação visual do app por conflito de estilos.
- Criação de abstração bonita, porém não operacional.

## Checklist final de pronto

- [ ] Escopo da etapa implementado.
- [ ] Arquivos estruturais criados ou ajustados.
- [ ] Integração com a Lyra preservada.
- [ ] Sem segredo hardcoded.
- [ ] Sem mock funcional.
- [ ] Sem placeholder funcional.
- [ ] Validação técnica concluída.
- [ ] Validação visual concluída.
- [ ] Validação em navegador concluída.
- [ ] Task atualizada.
- [ ] Commit feito.
- [ ] Push feito.

## Notas específicas desta etapa

- Root configuration será a chave para tratar superfícies inteiras da Lyra.
- Sem root bem modelado, o editor vira um amontoado de blocos soltos.

---

# TASK 04 — Multi-column Layouts

## Identificação

- Código da etapa: `TASK 04`
- Nome da etapa: `Multi-column Layouts`
- Fonte oficial: [Multi-column Layouts](https://puckeditor.com/docs/integrating-puck/multi-column-layouts)
- Estado atual: `[ ] não iniciada`

## Objetivo estratégico

- Permitir composição por colunas e DropZones reais.
- Resultado alvo desta etapa: Layouts multi-coluna responsivos e estáveis.
- Esta etapa deve elevar o nível do editor da Lyra com entrega real, verificável e persistente.

## Valor de negócio desta etapa

- Reduz dependência de desenvolvimento manual para ajustes de experiência.
- Estrutura o editor para uso por administradores reais.
- Aproxima o módulo da experiência de um builder visual premium de 2026.
- Prepara a base para reutilização futura em outros apps compatíveis.

## O que entra no escopo desta etapa

1. Implementação técnica do recurso específico da doc oficial.
2. Integração com a arquitetura atual da Lyra.
3. Proteção administrativa quando aplicável.
4. Validação técnica com checks reais.
5. Validação visual no navegador.
6. Registro das evidências na task e no versionamento.

## O que não entra no escopo desta etapa

1. Declarar paridade total com Elementor.
2. Expandir para todos os recursos das etapas seguintes.
3. Criar mock no lugar de integração real.
4. Pular validação de browser ou de persistência.

## Dependências internas

- TASK 02 concluída.
- TASK 03 concluída.

## Arquivos previstos desta etapa

- Observação honesta: estes arquivos são previstos com base na arquitetura atual e podem ser ajustados se a implementação real revelar outra organização mais correta.
- `src/lib/puck/config/layouts/two-columns.tsx`
- `src/lib/puck/config/layouts/three-columns.tsx`
- `src/lib/puck/config/layouts/hero-split.tsx`
- `src/lib/puck/config/layouts/sidebar-content.tsx`
- `src/lib/puck/config/layouts/index.ts`
- `src/lib/puck/utils/layout-guards.ts`

## Variáveis e segredos desta etapa

- Não versionar a chave beta do Puck.
- Se necessário usar recurso beta, configurar apenas por variável local não versionada.
- Não salvar segredo em markdown, TypeScript, package.json ou commit.

## Comandos de preparação desta etapa

```bash
python run_windows.py doctor
python run_windows.py setup-env
python run_windows.py dev
python run_windows.py health
```

## Comandos específicos desta etapa

```bash
pnpm run check:types
pnpm run check:lint
```

## Comandos de fechamento obrigatório

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
git add .
git commit -m "feat(puck): conclui task 04 multi-column layouts"
git push origin main
```

## Como executar esta etapa — passo a passo detalhado

1. Abrir a documentação oficial da etapa e confirmar o conceito exato que será integrado.
2. Subir o ambiente local da Lyra e confirmar saúde de banco e app.
3. Criar ou ajustar os arquivos previstos da etapa.
4. Implementar somente o escopo desta etapa, sem contaminar indevidamente as seguintes.
5. Ligar a etapa ao módulo Lyra Customaze UI UX, e não a um experimento isolado.
6. Garantir que a camada administrativa continue protegida por perfil admin.
7. Validar a integridade TypeScript da etapa.
8. Validar a integridade visual da etapa.
9. Validar o comportamento real no navegador.
10. Registrar riscos e evidências antes de fechar a etapa.
11. Executar todos os checks obrigatórios.
12. Atualizar a própria task marcando os itens realmente concluídos.
13. Commitar e publicar no branch principal apenas depois de a etapa estar real e validada.

## Sequência técnica detalhada

- Mapear exatamente onde esta etapa se conecta ao editor Puck.
- Mapear exatamente onde esta etapa impacta o render público.
- Definir contratos de tipo antes de renderizar UI.
- Garantir coerência com App Router e React 19.
- Preservar tema claro e padrão premium 2026.
- Evitar gerar abstração prematura sem necessidade real.
- Evitar acoplamento indevido com regras exclusivas da Lyra no núcleo reutilizável.
- Separar onde for necessário: config, render, storage, permissions, viewport, UI shell.
- Documentar o que é estrutural e o que é específico do projeto.
- Validar se a etapa preparou corretamente a próxima, sem pular dependências.

## Validação técnica obrigatória

- [ ] Sem erro de TypeScript.
- [ ] Sem erro de lint.
- [ ] Sem quebra de formatação.
- [ ] Sem erro de build quando aplicável.
- [ ] Sem crash na rota administrativa.
- [ ] Sem quebra no frontend público.
- [ ] Sem regressão em autenticação e guardas.
- [ ] Sem regressão em persistência já existente.

## Validação visual obrigatória

- [ ] Editor abre em tema claro de forma legível.
- [ ] Canvas não fica quebrado ou desalinhado.
- [ ] Controles do painel lateral ficam compreensíveis.
- [ ] Componentes visuais não aparentam protótipo improvisado.
- [ ] O nível visual permanece coerente com a Lyra.
- [ ] A superfície continua com aparência premium 2026.

## Validação funcional em navegador

1. Abrir a rota administrativa prevista da etapa.
2. Entrar com usuário administrador real.
3. Executar a ação principal da etapa dentro do editor.
4. Salvar ou aplicar a mudança se a etapa envolver estado.
5. Abrir a superfície correspondente no frontend.
6. Confirmar que o reflexo não depende de placeholder ou fake data.

## Evidências obrigatórias desta etapa

- [ ] Trecho de código implementado e revisado.
- [ ] Checks executados com sucesso.
- [ ] Rota ou tela validada em navegador.
- [ ] Estado real da task atualizado.
- [ ] Commit e push realizados.
- [ ] Descrição honesta do que entrou e do que ainda não entra.

## Riscos e causas raiz a observar

- Conflito entre client component e server component.
- Acoplamento indevido com CSS global.
- Modelagem ruim de schema e props.
- Falsa impressão de implementação completa sem publicação real.
- Permissões insuficientes permitindo acesso indevido.
- Degradação visual do app por conflito de estilos.
- Criação de abstração bonita, porém não operacional.

## Checklist final de pronto

- [ ] Escopo da etapa implementado.
- [ ] Arquivos estruturais criados ou ajustados.
- [ ] Integração com a Lyra preservada.
- [ ] Sem segredo hardcoded.
- [ ] Sem mock funcional.
- [ ] Sem placeholder funcional.
- [ ] Validação técnica concluída.
- [ ] Validação visual concluída.
- [ ] Validação em navegador concluída.
- [ ] Task atualizada.
- [ ] Commit feito.
- [ ] Push feito.

## Notas específicas desta etapa

- Layouts multi-coluna precisam nascer com governança de responsividade.
- Não liberar qualquer composição que degrade mobile.

---

# TASK 05 — Categories

## Identificação

- Código da etapa: `TASK 05`
- Nome da etapa: `Categories`
- Fonte oficial: [Categories](https://puckeditor.com/docs/integrating-puck/categories)
- Estado atual: `[ ] não iniciada`

## Objetivo estratégico

- Organizar o catálogo por categorias de negócio e UX.
- Resultado alvo desta etapa: Inseridor limpo, organizado e premium.
- Esta etapa deve elevar o nível do editor da Lyra com entrega real, verificável e persistente.

## Valor de negócio desta etapa

- Reduz dependência de desenvolvimento manual para ajustes de experiência.
- Estrutura o editor para uso por administradores reais.
- Aproxima o módulo da experiência de um builder visual premium de 2026.
- Prepara a base para reutilização futura em outros apps compatíveis.

## O que entra no escopo desta etapa

1. Implementação técnica do recurso específico da doc oficial.
2. Integração com a arquitetura atual da Lyra.
3. Proteção administrativa quando aplicável.
4. Validação técnica com checks reais.
5. Validação visual no navegador.
6. Registro das evidências na task e no versionamento.

## O que não entra no escopo desta etapa

1. Declarar paridade total com Elementor.
2. Expandir para todos os recursos das etapas seguintes.
3. Criar mock no lugar de integração real.
4. Pular validação de browser ou de persistência.

## Dependências internas

- TASK 02 concluída.

## Arquivos previstos desta etapa

- Observação honesta: estes arquivos são previstos com base na arquitetura atual e podem ser ajustados se a implementação real revelar outra organização mais correta.
- `src/lib/puck/config/categories.ts`
- `src/lib/puck/config/components/index.ts`
- `src/lib/puck/config/catalog/public.ts`
- `src/lib/puck/config/catalog/internal.ts`
- `src/lib/puck/config/catalog/forms.ts`
- `src/lib/puck/config/catalog/astrology.ts`

## Variáveis e segredos desta etapa

- Não versionar a chave beta do Puck.
- Se necessário usar recurso beta, configurar apenas por variável local não versionada.
- Não salvar segredo em markdown, TypeScript, package.json ou commit.

## Comandos de preparação desta etapa

```bash
python run_windows.py doctor
python run_windows.py setup-env
python run_windows.py dev
python run_windows.py health
```

## Comandos específicos desta etapa

```bash
pnpm run check:types
pnpm run check:lint
```

## Comandos de fechamento obrigatório

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
git add .
git commit -m "feat(puck): conclui task 05 categories"
git push origin main
```

## Como executar esta etapa — passo a passo detalhado

1. Abrir a documentação oficial da etapa e confirmar o conceito exato que será integrado.
2. Subir o ambiente local da Lyra e confirmar saúde de banco e app.
3. Criar ou ajustar os arquivos previstos da etapa.
4. Implementar somente o escopo desta etapa, sem contaminar indevidamente as seguintes.
5. Ligar a etapa ao módulo Lyra Customaze UI UX, e não a um experimento isolado.
6. Garantir que a camada administrativa continue protegida por perfil admin.
7. Validar a integridade TypeScript da etapa.
8. Validar a integridade visual da etapa.
9. Validar o comportamento real no navegador.
10. Registrar riscos e evidências antes de fechar a etapa.
11. Executar todos os checks obrigatórios.
12. Atualizar a própria task marcando os itens realmente concluídos.
13. Commitar e publicar no branch principal apenas depois de a etapa estar real e validada.

## Sequência técnica detalhada

- Mapear exatamente onde esta etapa se conecta ao editor Puck.
- Mapear exatamente onde esta etapa impacta o render público.
- Definir contratos de tipo antes de renderizar UI.
- Garantir coerência com App Router e React 19.
- Preservar tema claro e padrão premium 2026.
- Evitar gerar abstração prematura sem necessidade real.
- Evitar acoplamento indevido com regras exclusivas da Lyra no núcleo reutilizável.
- Separar onde for necessário: config, render, storage, permissions, viewport, UI shell.
- Documentar o que é estrutural e o que é específico do projeto.
- Validar se a etapa preparou corretamente a próxima, sem pular dependências.

## Validação técnica obrigatória

- [ ] Sem erro de TypeScript.
- [ ] Sem erro de lint.
- [ ] Sem quebra de formatação.
- [ ] Sem erro de build quando aplicável.
- [ ] Sem crash na rota administrativa.
- [ ] Sem quebra no frontend público.
- [ ] Sem regressão em autenticação e guardas.
- [ ] Sem regressão em persistência já existente.

## Validação visual obrigatória

- [ ] Editor abre em tema claro de forma legível.
- [ ] Canvas não fica quebrado ou desalinhado.
- [ ] Controles do painel lateral ficam compreensíveis.
- [ ] Componentes visuais não aparentam protótipo improvisado.
- [ ] O nível visual permanece coerente com a Lyra.
- [ ] A superfície continua com aparência premium 2026.

## Validação funcional em navegador

1. Abrir a rota administrativa prevista da etapa.
2. Entrar com usuário administrador real.
3. Executar a ação principal da etapa dentro do editor.
4. Salvar ou aplicar a mudança se a etapa envolver estado.
5. Abrir a superfície correspondente no frontend.
6. Confirmar que o reflexo não depende de placeholder ou fake data.

## Evidências obrigatórias desta etapa

- [ ] Trecho de código implementado e revisado.
- [ ] Checks executados com sucesso.
- [ ] Rota ou tela validada em navegador.
- [ ] Estado real da task atualizado.
- [ ] Commit e push realizados.
- [ ] Descrição honesta do que entrou e do que ainda não entra.

## Riscos e causas raiz a observar

- Conflito entre client component e server component.
- Acoplamento indevido com CSS global.
- Modelagem ruim de schema e props.
- Falsa impressão de implementação completa sem publicação real.
- Permissões insuficientes permitindo acesso indevido.
- Degradação visual do app por conflito de estilos.
- Criação de abstração bonita, porém não operacional.

## Checklist final de pronto

- [ ] Escopo da etapa implementado.
- [ ] Arquivos estruturais criados ou ajustados.
- [ ] Integração com a Lyra preservada.
- [ ] Sem segredo hardcoded.
- [ ] Sem mock funcional.
- [ ] Sem placeholder funcional.
- [ ] Validação técnica concluída.
- [ ] Validação visual concluída.
- [ ] Validação em navegador concluída.
- [ ] Task atualizada.
- [ ] Commit feito.
- [ ] Push feito.

## Notas específicas desta etapa

- Categorias são uma camada de UX crítica para pessoas leigas.
- Sem taxonomia boa, o editor fica confuso mesmo que tecnicamente poderoso.

---

# TASK 06 — Rich Text Editing

## Identificação

- Código da etapa: `TASK 06`
- Nome da etapa: `Rich Text Editing`
- Fonte oficial: [Rich Text Editing](https://puckeditor.com/docs/integrating-puck/rich-text-editing)
- Estado atual: `[ ] não iniciada`

## Objetivo estratégico

- Habilitar rich text real e controlado no canvas.
- Resultado alvo desta etapa: Texto rico funcional, seguro e consistente.
- Esta etapa deve elevar o nível do editor da Lyra com entrega real, verificável e persistente.

## Valor de negócio desta etapa

- Reduz dependência de desenvolvimento manual para ajustes de experiência.
- Estrutura o editor para uso por administradores reais.
- Aproxima o módulo da experiência de um builder visual premium de 2026.
- Prepara a base para reutilização futura em outros apps compatíveis.

## O que entra no escopo desta etapa

1. Implementação técnica do recurso específico da doc oficial.
2. Integração com a arquitetura atual da Lyra.
3. Proteção administrativa quando aplicável.
4. Validação técnica com checks reais.
5. Validação visual no navegador.
6. Registro das evidências na task e no versionamento.

## O que não entra no escopo desta etapa

1. Declarar paridade total com Elementor.
2. Expandir para todos os recursos das etapas seguintes.
3. Criar mock no lugar de integração real.
4. Pular validação de browser ou de persistência.

## Dependências internas

- TASK 02 concluída.
- TASK 03 concluída.

## Arquivos previstos desta etapa

- Observação honesta: estes arquivos são previstos com base na arquitetura atual e podem ser ajustados se a implementação real revelar outra organização mais correta.
- `src/lib/puck/config/fields/rich-text.ts`
- `src/lib/puck/components/RichTextBlock.tsx`
- `src/lib/puck/components/FaqRichAnswer.tsx`
- `src/lib/puck/components/EditorialText.tsx`
- `src/lib/puck/sanitization/rich-text.ts`
- `src/lib/puck/render/rich-text-renderer.tsx`

## Variáveis e segredos desta etapa

- Não versionar a chave beta do Puck.
- Se necessário usar recurso beta, configurar apenas por variável local não versionada.
- Não salvar segredo em markdown, TypeScript, package.json ou commit.

## Comandos de preparação desta etapa

```bash
python run_windows.py doctor
python run_windows.py setup-env
python run_windows.py dev
python run_windows.py health
```

## Comandos específicos desta etapa

```bash
pnpm run check:types
pnpm run check:lint
```

## Comandos de fechamento obrigatório

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
git add .
git commit -m "feat(puck): conclui task 06 rich text editing"
git push origin main
```

## Como executar esta etapa — passo a passo detalhado

1. Abrir a documentação oficial da etapa e confirmar o conceito exato que será integrado.
2. Subir o ambiente local da Lyra e confirmar saúde de banco e app.
3. Criar ou ajustar os arquivos previstos da etapa.
4. Implementar somente o escopo desta etapa, sem contaminar indevidamente as seguintes.
5. Ligar a etapa ao módulo Lyra Customaze UI UX, e não a um experimento isolado.
6. Garantir que a camada administrativa continue protegida por perfil admin.
7. Validar a integridade TypeScript da etapa.
8. Validar a integridade visual da etapa.
9. Validar o comportamento real no navegador.
10. Registrar riscos e evidências antes de fechar a etapa.
11. Executar todos os checks obrigatórios.
12. Atualizar a própria task marcando os itens realmente concluídos.
13. Commitar e publicar no branch principal apenas depois de a etapa estar real e validada.

## Sequência técnica detalhada

- Mapear exatamente onde esta etapa se conecta ao editor Puck.
- Mapear exatamente onde esta etapa impacta o render público.
- Definir contratos de tipo antes de renderizar UI.
- Garantir coerência com App Router e React 19.
- Preservar tema claro e padrão premium 2026.
- Evitar gerar abstração prematura sem necessidade real.
- Evitar acoplamento indevido com regras exclusivas da Lyra no núcleo reutilizável.
- Separar onde for necessário: config, render, storage, permissions, viewport, UI shell.
- Documentar o que é estrutural e o que é específico do projeto.
- Validar se a etapa preparou corretamente a próxima, sem pular dependências.

## Validação técnica obrigatória

- [ ] Sem erro de TypeScript.
- [ ] Sem erro de lint.
- [ ] Sem quebra de formatação.
- [ ] Sem erro de build quando aplicável.
- [ ] Sem crash na rota administrativa.
- [ ] Sem quebra no frontend público.
- [ ] Sem regressão em autenticação e guardas.
- [ ] Sem regressão em persistência já existente.

## Validação visual obrigatória

- [ ] Editor abre em tema claro de forma legível.
- [ ] Canvas não fica quebrado ou desalinhado.
- [ ] Controles do painel lateral ficam compreensíveis.
- [ ] Componentes visuais não aparentam protótipo improvisado.
- [ ] O nível visual permanece coerente com a Lyra.
- [ ] A superfície continua com aparência premium 2026.

## Validação funcional em navegador

1. Abrir a rota administrativa prevista da etapa.
2. Entrar com usuário administrador real.
3. Executar a ação principal da etapa dentro do editor.
4. Salvar ou aplicar a mudança se a etapa envolver estado.
5. Abrir a superfície correspondente no frontend.
6. Confirmar que o reflexo não depende de placeholder ou fake data.

## Evidências obrigatórias desta etapa

- [ ] Trecho de código implementado e revisado.
- [ ] Checks executados com sucesso.
- [ ] Rota ou tela validada em navegador.
- [ ] Estado real da task atualizado.
- [ ] Commit e push realizados.
- [ ] Descrição honesta do que entrou e do que ainda não entra.

## Riscos e causas raiz a observar

- Conflito entre client component e server component.
- Acoplamento indevido com CSS global.
- Modelagem ruim de schema e props.
- Falsa impressão de implementação completa sem publicação real.
- Permissões insuficientes permitindo acesso indevido.
- Degradação visual do app por conflito de estilos.
- Criação de abstração bonita, porém não operacional.

## Checklist final de pronto

- [ ] Escopo da etapa implementado.
- [ ] Arquivos estruturais criados ou ajustados.
- [ ] Integração com a Lyra preservada.
- [ ] Sem segredo hardcoded.
- [ ] Sem mock funcional.
- [ ] Sem placeholder funcional.
- [ ] Validação técnica concluída.
- [ ] Validação visual concluída.
- [ ] Validação em navegador concluída.
- [ ] Task atualizada.
- [ ] Commit feito.
- [ ] Push feito.

## Notas específicas desta etapa

- Rich text precisa ser útil sem virar fonte de inconsistência visual.
- Sanitização e limites de estilo serão fundamentais.

---

# TASK 07 — Dynamic Props

## Identificação

- Código da etapa: `TASK 07`
- Nome da etapa: `Dynamic Props`
- Fonte oficial: [Dynamic Props](https://puckeditor.com/docs/integrating-puck/dynamic-props)
- Estado atual: `[ ] não iniciada`

## Objetivo estratégico

- Derivar props reais com resolveData sem recomputação desnecessária.
- Resultado alvo desta etapa: Props dinâmicas refletindo dados reais do sistema.
- Esta etapa deve elevar o nível do editor da Lyra com entrega real, verificável e persistente.

## Valor de negócio desta etapa

- Reduz dependência de desenvolvimento manual para ajustes de experiência.
- Estrutura o editor para uso por administradores reais.
- Aproxima o módulo da experiência de um builder visual premium de 2026.
- Prepara a base para reutilização futura em outros apps compatíveis.

## O que entra no escopo desta etapa

1. Implementação técnica do recurso específico da doc oficial.
2. Integração com a arquitetura atual da Lyra.
3. Proteção administrativa quando aplicável.
4. Validação técnica com checks reais.
5. Validação visual no navegador.
6. Registro das evidências na task e no versionamento.

## O que não entra no escopo desta etapa

1. Declarar paridade total com Elementor.
2. Expandir para todos os recursos das etapas seguintes.
3. Criar mock no lugar de integração real.
4. Pular validação de browser ou de persistência.

## Dependências internas

- TASK 02 concluída.
- TASK 03 concluída.

## Arquivos previstos desta etapa

- Observação honesta: estes arquivos são previstos com base na arquitetura atual e podem ser ajustados se a implementação real revelar outra organização mais correta.
- `src/lib/puck/dynamic/resolve-data.ts`
- `src/lib/puck/dynamic/metrics.ts`
- `src/lib/puck/dynamic/astrology.ts`
- `src/lib/puck/dynamic/profile.ts`
- `src/lib/puck/dynamic/read-only-fields.ts`
- `src/lib/puck/dynamic/cache.ts`

## Variáveis e segredos desta etapa

- Não versionar a chave beta do Puck.
- Se necessário usar recurso beta, configurar apenas por variável local não versionada.
- Não salvar segredo em markdown, TypeScript, package.json ou commit.

## Comandos de preparação desta etapa

```bash
python run_windows.py doctor
python run_windows.py setup-env
python run_windows.py dev
python run_windows.py health
```

## Comandos específicos desta etapa

```bash
pnpm run check:types
pnpm run check:lint
```

## Comandos de fechamento obrigatório

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
git add .
git commit -m "feat(puck): conclui task 07 dynamic props"
git push origin main
```

## Como executar esta etapa — passo a passo detalhado

1. Abrir a documentação oficial da etapa e confirmar o conceito exato que será integrado.
2. Subir o ambiente local da Lyra e confirmar saúde de banco e app.
3. Criar ou ajustar os arquivos previstos da etapa.
4. Implementar somente o escopo desta etapa, sem contaminar indevidamente as seguintes.
5. Ligar a etapa ao módulo Lyra Customaze UI UX, e não a um experimento isolado.
6. Garantir que a camada administrativa continue protegida por perfil admin.
7. Validar a integridade TypeScript da etapa.
8. Validar a integridade visual da etapa.
9. Validar o comportamento real no navegador.
10. Registrar riscos e evidências antes de fechar a etapa.
11. Executar todos os checks obrigatórios.
12. Atualizar a própria task marcando os itens realmente concluídos.
13. Commitar e publicar no branch principal apenas depois de a etapa estar real e validada.

## Sequência técnica detalhada

- Mapear exatamente onde esta etapa se conecta ao editor Puck.
- Mapear exatamente onde esta etapa impacta o render público.
- Definir contratos de tipo antes de renderizar UI.
- Garantir coerência com App Router e React 19.
- Preservar tema claro e padrão premium 2026.
- Evitar gerar abstração prematura sem necessidade real.
- Evitar acoplamento indevido com regras exclusivas da Lyra no núcleo reutilizável.
- Separar onde for necessário: config, render, storage, permissions, viewport, UI shell.
- Documentar o que é estrutural e o que é específico do projeto.
- Validar se a etapa preparou corretamente a próxima, sem pular dependências.

## Validação técnica obrigatória

- [ ] Sem erro de TypeScript.
- [ ] Sem erro de lint.
- [ ] Sem quebra de formatação.
- [ ] Sem erro de build quando aplicável.
- [ ] Sem crash na rota administrativa.
- [ ] Sem quebra no frontend público.
- [ ] Sem regressão em autenticação e guardas.
- [ ] Sem regressão em persistência já existente.

## Validação visual obrigatória

- [ ] Editor abre em tema claro de forma legível.
- [ ] Canvas não fica quebrado ou desalinhado.
- [ ] Controles do painel lateral ficam compreensíveis.
- [ ] Componentes visuais não aparentam protótipo improvisado.
- [ ] O nível visual permanece coerente com a Lyra.
- [ ] A superfície continua com aparência premium 2026.

## Validação funcional em navegador

1. Abrir a rota administrativa prevista da etapa.
2. Entrar com usuário administrador real.
3. Executar a ação principal da etapa dentro do editor.
4. Salvar ou aplicar a mudança se a etapa envolver estado.
5. Abrir a superfície correspondente no frontend.
6. Confirmar que o reflexo não depende de placeholder ou fake data.

## Evidências obrigatórias desta etapa

- [ ] Trecho de código implementado e revisado.
- [ ] Checks executados com sucesso.
- [ ] Rota ou tela validada em navegador.
- [ ] Estado real da task atualizado.
- [ ] Commit e push realizados.
- [ ] Descrição honesta do que entrou e do que ainda não entra.

## Riscos e causas raiz a observar

- Conflito entre client component e server component.
- Acoplamento indevido com CSS global.
- Modelagem ruim de schema e props.
- Falsa impressão de implementação completa sem publicação real.
- Permissões insuficientes permitindo acesso indevido.
- Degradação visual do app por conflito de estilos.
- Criação de abstração bonita, porém não operacional.

## Checklist final de pronto

- [ ] Escopo da etapa implementado.
- [ ] Arquivos estruturais criados ou ajustados.
- [ ] Integração com a Lyra preservada.
- [ ] Sem segredo hardcoded.
- [ ] Sem mock funcional.
- [ ] Sem placeholder funcional.
- [ ] Validação técnica concluída.
- [ ] Validação visual concluída.
- [ ] Validação em navegador concluída.
- [ ] Task atualizada.
- [ ] Commit feito.
- [ ] Push feito.

## Notas específicas desta etapa

- Dynamic props devem puxar dados reais sem criar custo excessivo.
- A documentação do Puck enfatiza evitar recomputação desnecessária.

---

# TASK 08 — Dynamic Fields

## Identificação

- Código da etapa: `TASK 08`
- Nome da etapa: `Dynamic Fields`
- Fonte oficial: [Dynamic Fields](https://puckeditor.com/docs/integrating-puck/dynamic-fields)
- Estado atual: `[ ] não iniciada`

## Objetivo estratégico

- Fazer o painel reagir ao estado do bloco e do contexto.
- Resultado alvo desta etapa: Fields condicionais reais e úteis para usuários leigos.
- Esta etapa deve elevar o nível do editor da Lyra com entrega real, verificável e persistente.

## Valor de negócio desta etapa

- Reduz dependência de desenvolvimento manual para ajustes de experiência.
- Estrutura o editor para uso por administradores reais.
- Aproxima o módulo da experiência de um builder visual premium de 2026.
- Prepara a base para reutilização futura em outros apps compatíveis.

## O que entra no escopo desta etapa

1. Implementação técnica do recurso específico da doc oficial.
2. Integração com a arquitetura atual da Lyra.
3. Proteção administrativa quando aplicável.
4. Validação técnica com checks reais.
5. Validação visual no navegador.
6. Registro das evidências na task e no versionamento.

## O que não entra no escopo desta etapa

1. Declarar paridade total com Elementor.
2. Expandir para todos os recursos das etapas seguintes.
3. Criar mock no lugar de integração real.
4. Pular validação de browser ou de persistência.

## Dependências internas

- TASK 02 concluída.
- TASK 07 parcialmente pronta.

## Arquivos previstos desta etapa

- Observação honesta: estes arquivos são previstos com base na arquitetura atual e podem ser ajustados se a implementação real revelar outra organização mais correta.
- `src/lib/puck/fields/dynamic/cta.ts`
- `src/lib/puck/fields/dynamic/cards.ts`
- `src/lib/puck/fields/dynamic/plans.ts`
- `src/lib/puck/fields/dynamic/profile.ts`
- `src/lib/puck/fields/dynamic/index.ts`
- `src/lib/puck/fields/dynamic/guards.ts`

## Variáveis e segredos desta etapa

- Não versionar a chave beta do Puck.
- Se necessário usar recurso beta, configurar apenas por variável local não versionada.
- Não salvar segredo em markdown, TypeScript, package.json ou commit.

## Comandos de preparação desta etapa

```bash
python run_windows.py doctor
python run_windows.py setup-env
python run_windows.py dev
python run_windows.py health
```

## Comandos específicos desta etapa

```bash
pnpm run check:types
pnpm run check:lint
```

## Comandos de fechamento obrigatório

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
git add .
git commit -m "feat(puck): conclui task 08 dynamic fields"
git push origin main
```

## Como executar esta etapa — passo a passo detalhado

1. Abrir a documentação oficial da etapa e confirmar o conceito exato que será integrado.
2. Subir o ambiente local da Lyra e confirmar saúde de banco e app.
3. Criar ou ajustar os arquivos previstos da etapa.
4. Implementar somente o escopo desta etapa, sem contaminar indevidamente as seguintes.
5. Ligar a etapa ao módulo Lyra Customaze UI UX, e não a um experimento isolado.
6. Garantir que a camada administrativa continue protegida por perfil admin.
7. Validar a integridade TypeScript da etapa.
8. Validar a integridade visual da etapa.
9. Validar o comportamento real no navegador.
10. Registrar riscos e evidências antes de fechar a etapa.
11. Executar todos os checks obrigatórios.
12. Atualizar a própria task marcando os itens realmente concluídos.
13. Commitar e publicar no branch principal apenas depois de a etapa estar real e validada.

## Sequência técnica detalhada

- Mapear exatamente onde esta etapa se conecta ao editor Puck.
- Mapear exatamente onde esta etapa impacta o render público.
- Definir contratos de tipo antes de renderizar UI.
- Garantir coerência com App Router e React 19.
- Preservar tema claro e padrão premium 2026.
- Evitar gerar abstração prematura sem necessidade real.
- Evitar acoplamento indevido com regras exclusivas da Lyra no núcleo reutilizável.
- Separar onde for necessário: config, render, storage, permissions, viewport, UI shell.
- Documentar o que é estrutural e o que é específico do projeto.
- Validar se a etapa preparou corretamente a próxima, sem pular dependências.

## Validação técnica obrigatória

- [ ] Sem erro de TypeScript.
- [ ] Sem erro de lint.
- [ ] Sem quebra de formatação.
- [ ] Sem erro de build quando aplicável.
- [ ] Sem crash na rota administrativa.
- [ ] Sem quebra no frontend público.
- [ ] Sem regressão em autenticação e guardas.
- [ ] Sem regressão em persistência já existente.

## Validação visual obrigatória

- [ ] Editor abre em tema claro de forma legível.
- [ ] Canvas não fica quebrado ou desalinhado.
- [ ] Controles do painel lateral ficam compreensíveis.
- [ ] Componentes visuais não aparentam protótipo improvisado.
- [ ] O nível visual permanece coerente com a Lyra.
- [ ] A superfície continua com aparência premium 2026.

## Validação funcional em navegador

1. Abrir a rota administrativa prevista da etapa.
2. Entrar com usuário administrador real.
3. Executar a ação principal da etapa dentro do editor.
4. Salvar ou aplicar a mudança se a etapa envolver estado.
5. Abrir a superfície correspondente no frontend.
6. Confirmar que o reflexo não depende de placeholder ou fake data.

## Evidências obrigatórias desta etapa

- [ ] Trecho de código implementado e revisado.
- [ ] Checks executados com sucesso.
- [ ] Rota ou tela validada em navegador.
- [ ] Estado real da task atualizado.
- [ ] Commit e push realizados.
- [ ] Descrição honesta do que entrou e do que ainda não entra.

## Riscos e causas raiz a observar

- Conflito entre client component e server component.
- Acoplamento indevido com CSS global.
- Modelagem ruim de schema e props.
- Falsa impressão de implementação completa sem publicação real.
- Permissões insuficientes permitindo acesso indevido.
- Degradação visual do app por conflito de estilos.
- Criação de abstração bonita, porém não operacional.

## Checklist final de pronto

- [ ] Escopo da etapa implementado.
- [ ] Arquivos estruturais criados ou ajustados.
- [ ] Integração com a Lyra preservada.
- [ ] Sem segredo hardcoded.
- [ ] Sem mock funcional.
- [ ] Sem placeholder funcional.
- [ ] Validação técnica concluída.
- [ ] Validação visual concluída.
- [ ] Validação em navegador concluída.
- [ ] Task atualizada.
- [ ] Commit feito.
- [ ] Push feito.

## Notas específicas desta etapa

- Dynamic fields melhoram muito a UX do editor quando o esquema cresce.
- Mas, se mal usados, escondem informação importante.

---

# TASK 09 — External Data Sources

## Identificação

- Código da etapa: `TASK 09`
- Nome da etapa: `External Data Sources`
- Fonte oficial: [External Data Sources](https://puckeditor.com/docs/integrating-puck/external-data-sources)
- Estado atual: `[ ] não iniciada`

## Objetivo estratégico

- Conectar o Puck a dados internos e externos reais.
- Resultado alvo desta etapa: Seleção de dados reais sem mock.
- Esta etapa deve elevar o nível do editor da Lyra com entrega real, verificável e persistente.

## Valor de negócio desta etapa

- Reduz dependência de desenvolvimento manual para ajustes de experiência.
- Estrutura o editor para uso por administradores reais.
- Aproxima o módulo da experiência de um builder visual premium de 2026.
- Prepara a base para reutilização futura em outros apps compatíveis.

## O que entra no escopo desta etapa

1. Implementação técnica do recurso específico da doc oficial.
2. Integração com a arquitetura atual da Lyra.
3. Proteção administrativa quando aplicável.
4. Validação técnica com checks reais.
5. Validação visual no navegador.
6. Registro das evidências na task e no versionamento.

## O que não entra no escopo desta etapa

1. Declarar paridade total com Elementor.
2. Expandir para todos os recursos das etapas seguintes.
3. Criar mock no lugar de integração real.
4. Pular validação de browser ou de persistência.

## Dependências internas

- TASK 01 concluída.
- TASK 02 concluída.
- Conectores reais da Lyra mapeados.

## Arquivos previstos desta etapa

- Observação honesta: estes arquivos são previstos com base na arquitetura atual e podem ser ajustados se a implementação real revelar outra organização mais correta.
- `src/lib/puck/data-sources/index.ts`
- `src/lib/puck/data-sources/plans.ts`
- `src/lib/puck/data-sources/users.ts`
- `src/lib/puck/data-sources/content.ts`
- `src/lib/puck/data-sources/metrics.ts`
- `src/lib/puck/data-sources/external-resolver.ts`

## Variáveis e segredos desta etapa

- Não versionar a chave beta do Puck.
- Se necessário usar recurso beta, configurar apenas por variável local não versionada.
- Não salvar segredo em markdown, TypeScript, package.json ou commit.

## Comandos de preparação desta etapa

```bash
python run_windows.py doctor
python run_windows.py setup-env
python run_windows.py dev
python run_windows.py health
```

## Comandos específicos desta etapa

```bash
pnpm run check:types
pnpm run check:lint
```

## Comandos de fechamento obrigatório

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
git add .
git commit -m "feat(puck): conclui task 09 external data sources"
git push origin main
```

## Como executar esta etapa — passo a passo detalhado

1. Abrir a documentação oficial da etapa e confirmar o conceito exato que será integrado.
2. Subir o ambiente local da Lyra e confirmar saúde de banco e app.
3. Criar ou ajustar os arquivos previstos da etapa.
4. Implementar somente o escopo desta etapa, sem contaminar indevidamente as seguintes.
5. Ligar a etapa ao módulo Lyra Customaze UI UX, e não a um experimento isolado.
6. Garantir que a camada administrativa continue protegida por perfil admin.
7. Validar a integridade TypeScript da etapa.
8. Validar a integridade visual da etapa.
9. Validar o comportamento real no navegador.
10. Registrar riscos e evidências antes de fechar a etapa.
11. Executar todos os checks obrigatórios.
12. Atualizar a própria task marcando os itens realmente concluídos.
13. Commitar e publicar no branch principal apenas depois de a etapa estar real e validada.

## Sequência técnica detalhada

- Mapear exatamente onde esta etapa se conecta ao editor Puck.
- Mapear exatamente onde esta etapa impacta o render público.
- Definir contratos de tipo antes de renderizar UI.
- Garantir coerência com App Router e React 19.
- Preservar tema claro e padrão premium 2026.
- Evitar gerar abstração prematura sem necessidade real.
- Evitar acoplamento indevido com regras exclusivas da Lyra no núcleo reutilizável.
- Separar onde for necessário: config, render, storage, permissions, viewport, UI shell.
- Documentar o que é estrutural e o que é específico do projeto.
- Validar se a etapa preparou corretamente a próxima, sem pular dependências.

## Validação técnica obrigatória

- [ ] Sem erro de TypeScript.
- [ ] Sem erro de lint.
- [ ] Sem quebra de formatação.
- [ ] Sem erro de build quando aplicável.
- [ ] Sem crash na rota administrativa.
- [ ] Sem quebra no frontend público.
- [ ] Sem regressão em autenticação e guardas.
- [ ] Sem regressão em persistência já existente.

## Validação visual obrigatória

- [ ] Editor abre em tema claro de forma legível.
- [ ] Canvas não fica quebrado ou desalinhado.
- [ ] Controles do painel lateral ficam compreensíveis.
- [ ] Componentes visuais não aparentam protótipo improvisado.
- [ ] O nível visual permanece coerente com a Lyra.
- [ ] A superfície continua com aparência premium 2026.

## Validação funcional em navegador

1. Abrir a rota administrativa prevista da etapa.
2. Entrar com usuário administrador real.
3. Executar a ação principal da etapa dentro do editor.
4. Salvar ou aplicar a mudança se a etapa envolver estado.
5. Abrir a superfície correspondente no frontend.
6. Confirmar que o reflexo não depende de placeholder ou fake data.

## Evidências obrigatórias desta etapa

- [ ] Trecho de código implementado e revisado.
- [ ] Checks executados com sucesso.
- [ ] Rota ou tela validada em navegador.
- [ ] Estado real da task atualizado.
- [ ] Commit e push realizados.
- [ ] Descrição honesta do que entrou e do que ainda não entra.

## Riscos e causas raiz a observar

- Conflito entre client component e server component.
- Acoplamento indevido com CSS global.
- Modelagem ruim de schema e props.
- Falsa impressão de implementação completa sem publicação real.
- Permissões insuficientes permitindo acesso indevido.
- Degradação visual do app por conflito de estilos.
- Criação de abstração bonita, porém não operacional.

## Checklist final de pronto

- [ ] Escopo da etapa implementado.
- [ ] Arquivos estruturais criados ou ajustados.
- [ ] Integração com a Lyra preservada.
- [ ] Sem segredo hardcoded.
- [ ] Sem mock funcional.
- [ ] Sem placeholder funcional.
- [ ] Validação técnica concluída.
- [ ] Validação visual concluída.
- [ ] Validação em navegador concluída.
- [ ] Task atualizada.
- [ ] Commit feito.
- [ ] Push feito.

## Notas específicas desta etapa

- Fonte externa deve significar fonte real, autenticada e tratada.
- Nada de inventar integração para parecer completo.

---

# TASK 10 — Server Components

## Identificação

- Código da etapa: `TASK 10`
- Nome da etapa: `Server Components`
- Fonte oficial: [Server Components](https://puckeditor.com/docs/integrating-puck/server-components)
- Estado atual: `[ ] não iniciada`

## Objetivo estratégico

- Compatibilizar o editor com a arquitetura RSC do Next App Router.
- Resultado alvo desta etapa: Editor estável em client boundary e render público preservado.
- Esta etapa deve elevar o nível do editor da Lyra com entrega real, verificável e persistente.

## Valor de negócio desta etapa

- Reduz dependência de desenvolvimento manual para ajustes de experiência.
- Estrutura o editor para uso por administradores reais.
- Aproxima o módulo da experiência de um builder visual premium de 2026.
- Prepara a base para reutilização futura em outros apps compatíveis.

## O que entra no escopo desta etapa

1. Implementação técnica do recurso específico da doc oficial.
2. Integração com a arquitetura atual da Lyra.
3. Proteção administrativa quando aplicável.
4. Validação técnica com checks reais.
5. Validação visual no navegador.
6. Registro das evidências na task e no versionamento.

## O que não entra no escopo desta etapa

1. Declarar paridade total com Elementor.
2. Expandir para todos os recursos das etapas seguintes.
3. Criar mock no lugar de integração real.
4. Pular validação de browser ou de persistência.

## Dependências internas

- TASK 01 concluída.

## Arquivos previstos desta etapa

- Observação honesta: estes arquivos são previstos com base na arquitetura atual e podem ser ajustados se a implementação real revelar outra organização mais correta.
- `src/lib/puck/rsc/editor-client-shell.tsx`
- `src/lib/puck/rsc/render-server.tsx`
- `src/lib/puck/rsc/client-boundary.tsx`
- `src/lib/puck/rsc/root-loader.ts`
- `src/lib/puck/rsc/data-loader.ts`
- `src/lib/puck/rsc/contracts.ts`

## Variáveis e segredos desta etapa

- Não versionar a chave beta do Puck.
- Se necessário usar recurso beta, configurar apenas por variável local não versionada.
- Não salvar segredo em markdown, TypeScript, package.json ou commit.

## Comandos de preparação desta etapa

```bash
python run_windows.py doctor
python run_windows.py setup-env
python run_windows.py dev
python run_windows.py health
```

## Comandos específicos desta etapa

```bash
pnpm run check:types
pnpm run check:lint
pnpm run build
```

## Comandos de fechamento obrigatório

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
git add .
git commit -m "feat(puck): conclui task 10 server components"
git push origin main
```

## Como executar esta etapa — passo a passo detalhado

1. Abrir a documentação oficial da etapa e confirmar o conceito exato que será integrado.
2. Subir o ambiente local da Lyra e confirmar saúde de banco e app.
3. Criar ou ajustar os arquivos previstos da etapa.
4. Implementar somente o escopo desta etapa, sem contaminar indevidamente as seguintes.
5. Ligar a etapa ao módulo Lyra Customaze UI UX, e não a um experimento isolado.
6. Garantir que a camada administrativa continue protegida por perfil admin.
7. Validar a integridade TypeScript da etapa.
8. Validar a integridade visual da etapa.
9. Validar o comportamento real no navegador.
10. Registrar riscos e evidências antes de fechar a etapa.
11. Executar todos os checks obrigatórios.
12. Atualizar a própria task marcando os itens realmente concluídos.
13. Commitar e publicar no branch principal apenas depois de a etapa estar real e validada.

## Sequência técnica detalhada

- Mapear exatamente onde esta etapa se conecta ao editor Puck.
- Mapear exatamente onde esta etapa impacta o render público.
- Definir contratos de tipo antes de renderizar UI.
- Garantir coerência com App Router e React 19.
- Preservar tema claro e padrão premium 2026.
- Evitar gerar abstração prematura sem necessidade real.
- Evitar acoplamento indevido com regras exclusivas da Lyra no núcleo reutilizável.
- Separar onde for necessário: config, render, storage, permissions, viewport, UI shell.
- Documentar o que é estrutural e o que é específico do projeto.
- Validar se a etapa preparou corretamente a próxima, sem pular dependências.

## Validação técnica obrigatória

- [ ] Sem erro de TypeScript.
- [ ] Sem erro de lint.
- [ ] Sem quebra de formatação.
- [ ] Sem erro de build quando aplicável.
- [ ] Sem crash na rota administrativa.
- [ ] Sem quebra no frontend público.
- [ ] Sem regressão em autenticação e guardas.
- [ ] Sem regressão em persistência já existente.

## Validação visual obrigatória

- [ ] Editor abre em tema claro de forma legível.
- [ ] Canvas não fica quebrado ou desalinhado.
- [ ] Controles do painel lateral ficam compreensíveis.
- [ ] Componentes visuais não aparentam protótipo improvisado.
- [ ] O nível visual permanece coerente com a Lyra.
- [ ] A superfície continua com aparência premium 2026.

## Validação funcional em navegador

1. Abrir a rota administrativa prevista da etapa.
2. Entrar com usuário administrador real.
3. Executar a ação principal da etapa dentro do editor.
4. Salvar ou aplicar a mudança se a etapa envolver estado.
5. Abrir a superfície correspondente no frontend.
6. Confirmar que o reflexo não depende de placeholder ou fake data.

## Evidências obrigatórias desta etapa

- [ ] Trecho de código implementado e revisado.
- [ ] Checks executados com sucesso.
- [ ] Rota ou tela validada em navegador.
- [ ] Estado real da task atualizado.
- [ ] Commit e push realizados.
- [ ] Descrição honesta do que entrou e do que ainda não entra.

## Riscos e causas raiz a observar

- Conflito entre client component e server component.
- Acoplamento indevido com CSS global.
- Modelagem ruim de schema e props.
- Falsa impressão de implementação completa sem publicação real.
- Permissões insuficientes permitindo acesso indevido.
- Degradação visual do app por conflito de estilos.
- Criação de abstração bonita, porém não operacional.

## Checklist final de pronto

- [ ] Escopo da etapa implementado.
- [ ] Arquivos estruturais criados ou ajustados.
- [ ] Integração com a Lyra preservada.
- [ ] Sem segredo hardcoded.
- [ ] Sem mock funcional.
- [ ] Sem placeholder funcional.
- [ ] Validação técnica concluída.
- [ ] Validação visual concluída.
- [ ] Validação em navegador concluída.
- [ ] Task atualizada.
- [ ] Commit feito.
- [ ] Push feito.

## Notas específicas desta etapa

- RSC é etapa crítica na Lyra por causa do App Router.
- Se esta etapa for mal feita, o editor pode ficar funcional apenas localmente e falhar em build.

---

# TASK 11 — Data Migration

## Identificação

- Código da etapa: `TASK 11`
- Nome da etapa: `Data Migration`
- Fonte oficial: [Data Migration](https://puckeditor.com/docs/integrating-puck/data-migration)
- Estado atual: `[ ] não iniciada`

## Objetivo estratégico

- Versionar payloads e migrar dados antigos de forma segura.
- Resultado alvo desta etapa: Conteúdo legado lido sem quebra.
- Esta etapa deve elevar o nível do editor da Lyra com entrega real, verificável e persistente.

## Valor de negócio desta etapa

- Reduz dependência de desenvolvimento manual para ajustes de experiência.
- Estrutura o editor para uso por administradores reais.
- Aproxima o módulo da experiência de um builder visual premium de 2026.
- Prepara a base para reutilização futura em outros apps compatíveis.

## O que entra no escopo desta etapa

1. Implementação técnica do recurso específico da doc oficial.
2. Integração com a arquitetura atual da Lyra.
3. Proteção administrativa quando aplicável.
4. Validação técnica com checks reais.
5. Validação visual no navegador.
6. Registro das evidências na task e no versionamento.

## O que não entra no escopo desta etapa

1. Declarar paridade total com Elementor.
2. Expandir para todos os recursos das etapas seguintes.
3. Criar mock no lugar de integração real.
4. Pular validação de browser ou de persistência.

## Dependências internas

- TASK 01 concluída.
- TASK 03 concluída.

## Arquivos previstos desta etapa

- Observação honesta: estes arquivos são previstos com base na arquitetura atual e podem ser ajustados se a implementação real revelar outra organização mais correta.
- `src/lib/puck/migrations/index.ts`
- `src/lib/puck/migrations/v1-to-v2.ts`
- `src/lib/puck/migrations/v2-to-v3.ts`
- `src/lib/puck/storage/versioning.ts`
- `src/lib/puck/storage/read-with-migrate.ts`
- `src/lib/puck/storage/write-current-version.ts`

## Variáveis e segredos desta etapa

- Não versionar a chave beta do Puck.
- Se necessário usar recurso beta, configurar apenas por variável local não versionada.
- Não salvar segredo em markdown, TypeScript, package.json ou commit.

## Comandos de preparação desta etapa

```bash
python run_windows.py doctor
python run_windows.py setup-env
python run_windows.py dev
python run_windows.py health
```

## Comandos específicos desta etapa

```bash
pnpm run check:types
pnpm run check:lint
```

## Comandos de fechamento obrigatório

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
git add .
git commit -m "feat(puck): conclui task 11 data migration"
git push origin main
```

## Como executar esta etapa — passo a passo detalhado

1. Abrir a documentação oficial da etapa e confirmar o conceito exato que será integrado.
2. Subir o ambiente local da Lyra e confirmar saúde de banco e app.
3. Criar ou ajustar os arquivos previstos da etapa.
4. Implementar somente o escopo desta etapa, sem contaminar indevidamente as seguintes.
5. Ligar a etapa ao módulo Lyra Customaze UI UX, e não a um experimento isolado.
6. Garantir que a camada administrativa continue protegida por perfil admin.
7. Validar a integridade TypeScript da etapa.
8. Validar a integridade visual da etapa.
9. Validar o comportamento real no navegador.
10. Registrar riscos e evidências antes de fechar a etapa.
11. Executar todos os checks obrigatórios.
12. Atualizar a própria task marcando os itens realmente concluídos.
13. Commitar e publicar no branch principal apenas depois de a etapa estar real e validada.

## Sequência técnica detalhada

- Mapear exatamente onde esta etapa se conecta ao editor Puck.
- Mapear exatamente onde esta etapa impacta o render público.
- Definir contratos de tipo antes de renderizar UI.
- Garantir coerência com App Router e React 19.
- Preservar tema claro e padrão premium 2026.
- Evitar gerar abstração prematura sem necessidade real.
- Evitar acoplamento indevido com regras exclusivas da Lyra no núcleo reutilizável.
- Separar onde for necessário: config, render, storage, permissions, viewport, UI shell.
- Documentar o que é estrutural e o que é específico do projeto.
- Validar se a etapa preparou corretamente a próxima, sem pular dependências.

## Validação técnica obrigatória

- [ ] Sem erro de TypeScript.
- [ ] Sem erro de lint.
- [ ] Sem quebra de formatação.
- [ ] Sem erro de build quando aplicável.
- [ ] Sem crash na rota administrativa.
- [ ] Sem quebra no frontend público.
- [ ] Sem regressão em autenticação e guardas.
- [ ] Sem regressão em persistência já existente.

## Validação visual obrigatória

- [ ] Editor abre em tema claro de forma legível.
- [ ] Canvas não fica quebrado ou desalinhado.
- [ ] Controles do painel lateral ficam compreensíveis.
- [ ] Componentes visuais não aparentam protótipo improvisado.
- [ ] O nível visual permanece coerente com a Lyra.
- [ ] A superfície continua com aparência premium 2026.

## Validação funcional em navegador

1. Abrir a rota administrativa prevista da etapa.
2. Entrar com usuário administrador real.
3. Executar a ação principal da etapa dentro do editor.
4. Salvar ou aplicar a mudança se a etapa envolver estado.
5. Abrir a superfície correspondente no frontend.
6. Confirmar que o reflexo não depende de placeholder ou fake data.

## Evidências obrigatórias desta etapa

- [ ] Trecho de código implementado e revisado.
- [ ] Checks executados com sucesso.
- [ ] Rota ou tela validada em navegador.
- [ ] Estado real da task atualizado.
- [ ] Commit e push realizados.
- [ ] Descrição honesta do que entrou e do que ainda não entra.

## Riscos e causas raiz a observar

- Conflito entre client component e server component.
- Acoplamento indevido com CSS global.
- Modelagem ruim de schema e props.
- Falsa impressão de implementação completa sem publicação real.
- Permissões insuficientes permitindo acesso indevido.
- Degradação visual do app por conflito de estilos.
- Criação de abstração bonita, porém não operacional.

## Checklist final de pronto

- [ ] Escopo da etapa implementado.
- [ ] Arquivos estruturais criados ou ajustados.
- [ ] Integração com a Lyra preservada.
- [ ] Sem segredo hardcoded.
- [ ] Sem mock funcional.
- [ ] Sem placeholder funcional.
- [ ] Validação técnica concluída.
- [ ] Validação visual concluída.
- [ ] Validação em navegador concluída.
- [ ] Task atualizada.
- [ ] Commit feito.
- [ ] Push feito.

## Notas específicas desta etapa

- Sem estratégia de migração, cada mudança de schema vira risco de perda de conteúdo.
- Esta etapa é de infraestrutura e precisa ser muito séria.

---

# TASK 12 — Viewports

## Identificação

- Código da etapa: `TASK 12`
- Nome da etapa: `Viewports`
- Fonte oficial: [Viewports](https://puckeditor.com/docs/integrating-puck/viewports)
- Estado atual: `[ ] não iniciada`

## Objetivo estratégico

- Adicionar preview e edição por viewport.
- Resultado alvo desta etapa: Desktop, tablet e mobile coerentes com a Lyra.
- Esta etapa deve elevar o nível do editor da Lyra com entrega real, verificável e persistente.

## Valor de negócio desta etapa

- Reduz dependência de desenvolvimento manual para ajustes de experiência.
- Estrutura o editor para uso por administradores reais.
- Aproxima o módulo da experiência de um builder visual premium de 2026.
- Prepara a base para reutilização futura em outros apps compatíveis.

## O que entra no escopo desta etapa

1. Implementação técnica do recurso específico da doc oficial.
2. Integração com a arquitetura atual da Lyra.
3. Proteção administrativa quando aplicável.
4. Validação técnica com checks reais.
5. Validação visual no navegador.
6. Registro das evidências na task e no versionamento.

## O que não entra no escopo desta etapa

1. Declarar paridade total com Elementor.
2. Expandir para todos os recursos das etapas seguintes.
3. Criar mock no lugar de integração real.
4. Pular validação de browser ou de persistência.

## Dependências internas

- TASK 03 concluída.
- TASK 04 parcialmente pronta.

## Arquivos previstos desta etapa

- Observação honesta: estes arquivos são previstos com base na arquitetura atual e podem ser ajustados se a implementação real revelar outra organização mais correta.
- `src/lib/puck/viewports/index.ts`
- `src/lib/puck/viewports/desktop.ts`
- `src/lib/puck/viewports/tablet.ts`
- `src/lib/puck/viewports/mobile.ts`
- `src/lib/puck/viewports/theme-preview.ts`
- `src/lib/puck/viewports/breakpoint-map.ts`

## Variáveis e segredos desta etapa

- Não versionar a chave beta do Puck.
- Se necessário usar recurso beta, configurar apenas por variável local não versionada.
- Não salvar segredo em markdown, TypeScript, package.json ou commit.

## Comandos de preparação desta etapa

```bash
python run_windows.py doctor
python run_windows.py setup-env
python run_windows.py dev
python run_windows.py health
```

## Comandos específicos desta etapa

```bash
pnpm run check:types
pnpm run check:lint
```

## Comandos de fechamento obrigatório

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
git add .
git commit -m "feat(puck): conclui task 12 viewports"
git push origin main
```

## Como executar esta etapa — passo a passo detalhado

1. Abrir a documentação oficial da etapa e confirmar o conceito exato que será integrado.
2. Subir o ambiente local da Lyra e confirmar saúde de banco e app.
3. Criar ou ajustar os arquivos previstos da etapa.
4. Implementar somente o escopo desta etapa, sem contaminar indevidamente as seguintes.
5. Ligar a etapa ao módulo Lyra Customaze UI UX, e não a um experimento isolado.
6. Garantir que a camada administrativa continue protegida por perfil admin.
7. Validar a integridade TypeScript da etapa.
8. Validar a integridade visual da etapa.
9. Validar o comportamento real no navegador.
10. Registrar riscos e evidências antes de fechar a etapa.
11. Executar todos os checks obrigatórios.
12. Atualizar a própria task marcando os itens realmente concluídos.
13. Commitar e publicar no branch principal apenas depois de a etapa estar real e validada.

## Sequência técnica detalhada

- Mapear exatamente onde esta etapa se conecta ao editor Puck.
- Mapear exatamente onde esta etapa impacta o render público.
- Definir contratos de tipo antes de renderizar UI.
- Garantir coerência com App Router e React 19.
- Preservar tema claro e padrão premium 2026.
- Evitar gerar abstração prematura sem necessidade real.
- Evitar acoplamento indevido com regras exclusivas da Lyra no núcleo reutilizável.
- Separar onde for necessário: config, render, storage, permissions, viewport, UI shell.
- Documentar o que é estrutural e o que é específico do projeto.
- Validar se a etapa preparou corretamente a próxima, sem pular dependências.

## Validação técnica obrigatória

- [ ] Sem erro de TypeScript.
- [ ] Sem erro de lint.
- [ ] Sem quebra de formatação.
- [ ] Sem erro de build quando aplicável.
- [ ] Sem crash na rota administrativa.
- [ ] Sem quebra no frontend público.
- [ ] Sem regressão em autenticação e guardas.
- [ ] Sem regressão em persistência já existente.

## Validação visual obrigatória

- [ ] Editor abre em tema claro de forma legível.
- [ ] Canvas não fica quebrado ou desalinhado.
- [ ] Controles do painel lateral ficam compreensíveis.
- [ ] Componentes visuais não aparentam protótipo improvisado.
- [ ] O nível visual permanece coerente com a Lyra.
- [ ] A superfície continua com aparência premium 2026.

## Validação funcional em navegador

1. Abrir a rota administrativa prevista da etapa.
2. Entrar com usuário administrador real.
3. Executar a ação principal da etapa dentro do editor.
4. Salvar ou aplicar a mudança se a etapa envolver estado.
5. Abrir a superfície correspondente no frontend.
6. Confirmar que o reflexo não depende de placeholder ou fake data.

## Evidências obrigatórias desta etapa

- [ ] Trecho de código implementado e revisado.
- [ ] Checks executados com sucesso.
- [ ] Rota ou tela validada em navegador.
- [ ] Estado real da task atualizado.
- [ ] Commit e push realizados.
- [ ] Descrição honesta do que entrou e do que ainda não entra.

## Riscos e causas raiz a observar

- Conflito entre client component e server component.
- Acoplamento indevido com CSS global.
- Modelagem ruim de schema e props.
- Falsa impressão de implementação completa sem publicação real.
- Permissões insuficientes permitindo acesso indevido.
- Degradação visual do app por conflito de estilos.
- Criação de abstração bonita, porém não operacional.

## Checklist final de pronto

- [ ] Escopo da etapa implementado.
- [ ] Arquivos estruturais criados ou ajustados.
- [ ] Integração com a Lyra preservada.
- [ ] Sem segredo hardcoded.
- [ ] Sem mock funcional.
- [ ] Sem placeholder funcional.
- [ ] Validação técnica concluída.
- [ ] Validação visual concluída.
- [ ] Validação em navegador concluída.
- [ ] Task atualizada.
- [ ] Commit feito.
- [ ] Push feito.

## Notas específicas desta etapa

- Viewports precisam refletir breakpoints reais da Lyra.
- Não usar tamanhos arbitrários que só “parecem” responsivos.

---

# TASK 13 — Feature Toggling

## Identificação

- Código da etapa: `TASK 13`
- Nome da etapa: `Feature Toggling`
- Fonte oficial: [Feature Toggling](https://puckeditor.com/docs/integrating-puck/feature-toggling)
- Estado atual: `[ ] não iniciada`

## Objetivo estratégico

- Controlar recursos do editor por papel, superfície e componente.
- Resultado alvo desta etapa: Permissões reais e seguras no editor.
- Esta etapa deve elevar o nível do editor da Lyra com entrega real, verificável e persistente.

## Valor de negócio desta etapa

- Reduz dependência de desenvolvimento manual para ajustes de experiência.
- Estrutura o editor para uso por administradores reais.
- Aproxima o módulo da experiência de um builder visual premium de 2026.
- Prepara a base para reutilização futura em outros apps compatíveis.

## O que entra no escopo desta etapa

1. Implementação técnica do recurso específico da doc oficial.
2. Integração com a arquitetura atual da Lyra.
3. Proteção administrativa quando aplicável.
4. Validação técnica com checks reais.
5. Validação visual no navegador.
6. Registro das evidências na task e no versionamento.

## O que não entra no escopo desta etapa

1. Declarar paridade total com Elementor.
2. Expandir para todos os recursos das etapas seguintes.
3. Criar mock no lugar de integração real.
4. Pular validação de browser ou de persistência.

## Dependências internas

- TASK 01 concluída.
- Autorização admin real da Lyra disponível.

## Arquivos previstos desta etapa

- Observação honesta: estes arquivos são previstos com base na arquitetura atual e podem ser ajustados se a implementação real revelar outra organização mais correta.
- `src/lib/puck/permissions/index.ts`
- `src/lib/puck/permissions/global.ts`
- `src/lib/puck/permissions/component.ts`
- `src/lib/puck/permissions/surface.ts`
- `src/lib/puck/permissions/role-map.ts`
- `src/lib/puck/permissions/resolve.ts`

## Variáveis e segredos desta etapa

- Não versionar a chave beta do Puck.
- Se necessário usar recurso beta, configurar apenas por variável local não versionada.
- Não salvar segredo em markdown, TypeScript, package.json ou commit.

## Comandos de preparação desta etapa

```bash
python run_windows.py doctor
python run_windows.py setup-env
python run_windows.py dev
python run_windows.py health
```

## Comandos específicos desta etapa

```bash
pnpm run check:types
pnpm run check:lint
```

## Comandos de fechamento obrigatório

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
git add .
git commit -m "feat(puck): conclui task 13 feature toggling"
git push origin main
```

## Como executar esta etapa — passo a passo detalhado

1. Abrir a documentação oficial da etapa e confirmar o conceito exato que será integrado.
2. Subir o ambiente local da Lyra e confirmar saúde de banco e app.
3. Criar ou ajustar os arquivos previstos da etapa.
4. Implementar somente o escopo desta etapa, sem contaminar indevidamente as seguintes.
5. Ligar a etapa ao módulo Lyra Customaze UI UX, e não a um experimento isolado.
6. Garantir que a camada administrativa continue protegida por perfil admin.
7. Validar a integridade TypeScript da etapa.
8. Validar a integridade visual da etapa.
9. Validar o comportamento real no navegador.
10. Registrar riscos e evidências antes de fechar a etapa.
11. Executar todos os checks obrigatórios.
12. Atualizar a própria task marcando os itens realmente concluídos.
13. Commitar e publicar no branch principal apenas depois de a etapa estar real e validada.

## Sequência técnica detalhada

- Mapear exatamente onde esta etapa se conecta ao editor Puck.
- Mapear exatamente onde esta etapa impacta o render público.
- Definir contratos de tipo antes de renderizar UI.
- Garantir coerência com App Router e React 19.
- Preservar tema claro e padrão premium 2026.
- Evitar gerar abstração prematura sem necessidade real.
- Evitar acoplamento indevido com regras exclusivas da Lyra no núcleo reutilizável.
- Separar onde for necessário: config, render, storage, permissions, viewport, UI shell.
- Documentar o que é estrutural e o que é específico do projeto.
- Validar se a etapa preparou corretamente a próxima, sem pular dependências.

## Validação técnica obrigatória

- [ ] Sem erro de TypeScript.
- [ ] Sem erro de lint.
- [ ] Sem quebra de formatação.
- [ ] Sem erro de build quando aplicável.
- [ ] Sem crash na rota administrativa.
- [ ] Sem quebra no frontend público.
- [ ] Sem regressão em autenticação e guardas.
- [ ] Sem regressão em persistência já existente.

## Validação visual obrigatória

- [ ] Editor abre em tema claro de forma legível.
- [ ] Canvas não fica quebrado ou desalinhado.
- [ ] Controles do painel lateral ficam compreensíveis.
- [ ] Componentes visuais não aparentam protótipo improvisado.
- [ ] O nível visual permanece coerente com a Lyra.
- [ ] A superfície continua com aparência premium 2026.

## Validação funcional em navegador

1. Abrir a rota administrativa prevista da etapa.
2. Entrar com usuário administrador real.
3. Executar a ação principal da etapa dentro do editor.
4. Salvar ou aplicar a mudança se a etapa envolver estado.
5. Abrir a superfície correspondente no frontend.
6. Confirmar que o reflexo não depende de placeholder ou fake data.

## Evidências obrigatórias desta etapa

- [ ] Trecho de código implementado e revisado.
- [ ] Checks executados com sucesso.
- [ ] Rota ou tela validada em navegador.
- [ ] Estado real da task atualizado.
- [ ] Commit e push realizados.
- [ ] Descrição honesta do que entrou e do que ainda não entra.

## Riscos e causas raiz a observar

- Conflito entre client component e server component.
- Acoplamento indevido com CSS global.
- Modelagem ruim de schema e props.
- Falsa impressão de implementação completa sem publicação real.
- Permissões insuficientes permitindo acesso indevido.
- Degradação visual do app por conflito de estilos.
- Criação de abstração bonita, porém não operacional.

## Checklist final de pronto

- [ ] Escopo da etapa implementado.
- [ ] Arquivos estruturais criados ou ajustados.
- [ ] Integração com a Lyra preservada.
- [ ] Sem segredo hardcoded.
- [ ] Sem mock funcional.
- [ ] Sem placeholder funcional.
- [ ] Validação técnica concluída.
- [ ] Validação visual concluída.
- [ ] Validação em navegador concluída.
- [ ] Task atualizada.
- [ ] Commit feito.
- [ ] Push feito.

## Notas específicas desta etapa

- Feature toggling é essencial para manter o editor seguro.
- Admin-only continua obrigatório.

---

# TASK 14 — Overlay Portals

## Identificação

- Código da etapa: `TASK 14`
- Nome da etapa: `Overlay Portals`
- Fonte oficial: [Overlay Portals](https://puckeditor.com/docs/integrating-puck/overlay-portals)
- Estado atual: `[ ] não iniciada`

## Objetivo estratégico

- Liberar interação avançada em partes do canvas com segurança.
- Resultado alvo desta etapa: Canvas mais sofisticado sem perder ergonomia de edição.
- Esta etapa deve elevar o nível do editor da Lyra com entrega real, verificável e persistente.

## Valor de negócio desta etapa

- Reduz dependência de desenvolvimento manual para ajustes de experiência.
- Estrutura o editor para uso por administradores reais.
- Aproxima o módulo da experiência de um builder visual premium de 2026.
- Prepara a base para reutilização futura em outros apps compatíveis.

## O que entra no escopo desta etapa

1. Implementação técnica do recurso específico da doc oficial.
2. Integração com a arquitetura atual da Lyra.
3. Proteção administrativa quando aplicável.
4. Validação técnica com checks reais.
5. Validação visual no navegador.
6. Registro das evidências na task e no versionamento.

## O que não entra no escopo desta etapa

1. Declarar paridade total com Elementor.
2. Expandir para todos os recursos das etapas seguintes.
3. Criar mock no lugar de integração real.
4. Pular validação de browser ou de persistência.

## Dependências internas

- TASK 06 concluída.
- Componentes interativos já modelados.

## Arquivos previstos desta etapa

- Observação honesta: estes arquivos são previstos com base na arquitetura atual e podem ser ajustados se a implementação real revelar outra organização mais correta.
- `src/lib/puck/overlay-portals/index.ts`
- `src/lib/puck/overlay-portals/rich-text.ts`
- `src/lib/puck/overlay-portals/accordion.ts`
- `src/lib/puck/overlay-portals/tabs.ts`
- `src/lib/puck/overlay-portals/slots.ts`
- `src/lib/puck/overlay-portals/safety-guards.ts`

## Variáveis e segredos desta etapa

- Não versionar a chave beta do Puck.
- Se necessário usar recurso beta, configurar apenas por variável local não versionada.
- Não salvar segredo em markdown, TypeScript, package.json ou commit.

## Comandos de preparação desta etapa

```bash
python run_windows.py doctor
python run_windows.py setup-env
python run_windows.py dev
python run_windows.py health
```

## Comandos específicos desta etapa

```bash
pnpm run check:types
pnpm run check:lint
```

## Comandos de fechamento obrigatório

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
git add .
git commit -m "feat(puck): conclui task 14 overlay portals"
git push origin main
```

## Como executar esta etapa — passo a passo detalhado

1. Abrir a documentação oficial da etapa e confirmar o conceito exato que será integrado.
2. Subir o ambiente local da Lyra e confirmar saúde de banco e app.
3. Criar ou ajustar os arquivos previstos da etapa.
4. Implementar somente o escopo desta etapa, sem contaminar indevidamente as seguintes.
5. Ligar a etapa ao módulo Lyra Customaze UI UX, e não a um experimento isolado.
6. Garantir que a camada administrativa continue protegida por perfil admin.
7. Validar a integridade TypeScript da etapa.
8. Validar a integridade visual da etapa.
9. Validar o comportamento real no navegador.
10. Registrar riscos e evidências antes de fechar a etapa.
11. Executar todos os checks obrigatórios.
12. Atualizar a própria task marcando os itens realmente concluídos.
13. Commitar e publicar no branch principal apenas depois de a etapa estar real e validada.

## Sequência técnica detalhada

- Mapear exatamente onde esta etapa se conecta ao editor Puck.
- Mapear exatamente onde esta etapa impacta o render público.
- Definir contratos de tipo antes de renderizar UI.
- Garantir coerência com App Router e React 19.
- Preservar tema claro e padrão premium 2026.
- Evitar gerar abstração prematura sem necessidade real.
- Evitar acoplamento indevido com regras exclusivas da Lyra no núcleo reutilizável.
- Separar onde for necessário: config, render, storage, permissions, viewport, UI shell.
- Documentar o que é estrutural e o que é específico do projeto.
- Validar se a etapa preparou corretamente a próxima, sem pular dependências.

## Validação técnica obrigatória

- [ ] Sem erro de TypeScript.
- [ ] Sem erro de lint.
- [ ] Sem quebra de formatação.
- [ ] Sem erro de build quando aplicável.
- [ ] Sem crash na rota administrativa.
- [ ] Sem quebra no frontend público.
- [ ] Sem regressão em autenticação e guardas.
- [ ] Sem regressão em persistência já existente.

## Validação visual obrigatória

- [ ] Editor abre em tema claro de forma legível.
- [ ] Canvas não fica quebrado ou desalinhado.
- [ ] Controles do painel lateral ficam compreensíveis.
- [ ] Componentes visuais não aparentam protótipo improvisado.
- [ ] O nível visual permanece coerente com a Lyra.
- [ ] A superfície continua com aparência premium 2026.

## Validação funcional em navegador

1. Abrir a rota administrativa prevista da etapa.
2. Entrar com usuário administrador real.
3. Executar a ação principal da etapa dentro do editor.
4. Salvar ou aplicar a mudança se a etapa envolver estado.
5. Abrir a superfície correspondente no frontend.
6. Confirmar que o reflexo não depende de placeholder ou fake data.

## Evidências obrigatórias desta etapa

- [ ] Trecho de código implementado e revisado.
- [ ] Checks executados com sucesso.
- [ ] Rota ou tela validada em navegador.
- [ ] Estado real da task atualizado.
- [ ] Commit e push realizados.
- [ ] Descrição honesta do que entrou e do que ainda não entra.

## Riscos e causas raiz a observar

- Conflito entre client component e server component.
- Acoplamento indevido com CSS global.
- Modelagem ruim de schema e props.
- Falsa impressão de implementação completa sem publicação real.
- Permissões insuficientes permitindo acesso indevido.
- Degradação visual do app por conflito de estilos.
- Criação de abstração bonita, porém não operacional.

## Checklist final de pronto

- [ ] Escopo da etapa implementado.
- [ ] Arquivos estruturais criados ou ajustados.
- [ ] Integração com a Lyra preservada.
- [ ] Sem segredo hardcoded.
- [ ] Sem mock funcional.
- [ ] Sem placeholder funcional.
- [ ] Validação técnica concluída.
- [ ] Validação visual concluída.
- [ ] Validação em navegador concluída.
- [ ] Task atualizada.
- [ ] Commit feito.
- [ ] Push feito.

## Notas específicas desta etapa

- Overlay portals são sofisticados e devem ser usados com parcimônia.
- A prioridade é liberar interação necessária sem destruir a ergonomia do canvas.
