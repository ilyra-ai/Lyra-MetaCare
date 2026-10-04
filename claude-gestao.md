# Lyra MetaCare · Gestão da Instrução Mestra

> [!IMPORTANT]
> Este arquivo é o painel oficial de andamento da **INSTRUÇÃO MESTRA** definida em [`CLAUDE.md`](./CLAUDE.md).
> Todo modelo ou agente de IA que atuar neste repositório deve atualizá-lo a cada tarefa iniciada, bloqueada ou finalizada, no mesmo commit da tarefa.

**Regras de manutenção deste painel**

1. Cada tarefa existe em **um único tópico** por vez (sem repetição entre tópicos).
2. As tarefas são sempre listadas em **ordem numérica crescente** dentro de cada tópico.
3. **ANDAMENTO** comporta no máximo **3 tarefas simultâneas**; ao finalizar, a tarefa sai do Tópico 2 e entra no Tópico 4.
4. **BLOQUEADAS** recebe toda tarefa que dependa de interação do usuário, credencial externa ou limitação real do ambiente, sempre com a evidência do bloqueio.
5. O Tópico 4 registra apenas o que foi realmente implementado, testado, commitado e enviado para `origin/main`, com SHA e evidências reais.

**Legenda:** 🟢 finalizada · 🔵 em andamento · 🔴 bloqueada · ⚪ a iniciar

---

## Tópico 1 · Andamento Geral

| Indicador          | Valor                         |
| ------------------ | ----------------------------- |
| Progresso          | `██░░░░░░░░░░░░░░░░░░` **9%** |
| Tarefas totais     | 23                            |
| 🟢 Finalizadas     | 2                             |
| 🔵 Em andamento    | 1                             |
| 🔴 Bloqueadas      | 0                             |
| ⚪ A iniciar       | 20                            |
| Branch de trabalho | `main` (única permitida)      |
| Última atualização | 2026-10-04                    |

> Cálculo: tarefas finalizadas ÷ tarefas totais (2 ÷ 23 = 8,7%, arredondado para 9%). Cada bloco da barra representa 5%.

---

## Tópico 2 · Tarefas em Andamento ou Bloqueadas

### ANDAMENTO

| Nº  | Tarefa                                                        | O que está sendo realizado                                                                                                                                                                     |
| --- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 03  | Auditoria baseline e correção dos erros atualmente existentes | Registro das versões do ambiente e execução real de `pnpm install`, `check:lint`, `check:format`, `check:types`, `test`, `build`, `outdated` e `audit` para identificar erros pela causa raiz. |

### BLOQUEADAS

Nenhuma tarefa bloqueada no momento.

---

## Tópico 3 · Tarefas a Iniciar

### 04 · Normalização do package manager e lockfiles

_Instrução: Tarefa 2 · itens 6, 11, 65 e 66 do `CLAUDE.md`._

- Determinar o package manager oficial do projeto (a evidência aponta para pnpm).
- Padronizar todo o projeto em pnpm, adicionar `packageManager` explícito no `package.json`, fixar versão estável do pnpm e usar Corepack de forma reprodutível.
- Investigar `pnpm-lock.yaml`, `package-lock.json` e `bun.lock`; eliminar lockfiles concorrentes somente após comprovar que não são necessários.
- Remover `bun` das dependências se não for usado em runtime, após busca com `rg` por imports, requires, dynamic imports, scripts, loaders, configs, documentação e uso indireto.
- Não manter três fontes de resolução de dependências; não depender de pacotes globais sem necessidade técnica.

### 05 · Remoção comprovada de dependências não utilizadas

_Instrução: Tarefa 3 · itens 11, 12 e 43._

- Buscar com `rg` imports, requires, dynamic imports, scripts, loaders, configs, documentação e uso indireto de cada dependência.
- Remover somente com evidência, nunca por intuição nem apenas porque uma ferramenta automática apontou como não usada.
- Verificar pacotes instalados em seção errada (dependencies × devDependencies).
- Executar a Prova de Morte (`grep`/`rg`) após cada remoção.

### 06 · Upgrade controlado das dependências

_Instrução: Tarefa 4 · itens 8, 9, 12, 59, 62 e 63._

- Pesquisar as versões oficiais estáveis de outubro de 2026 (documentação oficial dos mantenedores), sem beta, alpha, canary, RC ou experimental.
- Montar a matriz interna por dependência: nome, versão declarada, versão instalada, última estável, tipo, onde é usada, breaking changes, compatibilidade e ação (MANTER, ATUALIZAR, SUBSTITUIR, REMOVER).
- Analisar TypeScript, ESLint, Vitest, Radix, shadcn, Sentry, Stripe, Zod, mysql2, Recharts, React Hook Form, Puck, Monaco, Sonner, Lucide e todas as demais.
- Para cada major: ler o migration guide, adaptar código e configuração, executar testes, build e runtime.
- Não usar `pnpm update --latest` como trabalho concluído; não fazer downgrade para esconder conflito; substituir pacotes abandonados por alternativas mantidas em 2026 preservando a funcionalidade.

### 07 · Migração Next.js

_Instrução: Tarefa 5 · itens 9 e 13._

- Migrar de Next.js 15.x para a versão Stable / Active LTS mais atual de outubro de 2026, corrigindo todos os breaking changes.
- Investigar App Router, Server Components, Client Components, Route Handlers, middleware/proxy, caching, dynamic rendering, async APIs, `next.config.ts`, image handling, webpack/Turbopack, React Server Components, Sentry, cookies, headers, redirects, metadata, build e standalone/runtime.
- Não manter versão vulnerável porque o upgrade exige alterações.

### 08 · Migração React

_Instrução: Tarefa 6 · item 14._

- Atualizar React e React DOM para a versão estável mais atual compatível com o Next.js escolhido.
- Revisar APIs depreciadas, Strict Mode, effects, transitions, hydration, Server Components, Context, refs, rendering concorrente e novas APIs estáveis de 2026, sem introduzir APIs experimentais desnecessárias.

### 09 · Migração Tailwind/shadcn/UI dependencies

_Instrução: Tarefa 7 · itens 15 e 64._

- Migrar Tailwind CSS 3.x para o Tailwind CSS 4.x estável atual, sem apenas trocar o número da versão.
- Revisar configuração, PostCSS, plugins, typography, animate, design tokens, classes obsoletas, custom utilities, dark/light mode, componentes, compatibilidade com shadcn, build, CSS final, content detection e responsividade.
- Testar visualmente as páginas após a migração, preservando a identidade Lyra e o tema claro.

### 10 · Modernização Node/pnpm/toolchain

_Instrução: Tarefa 8 · itens 10, 11 e 65._

- Avaliar a versão Node.js LTS recomendada em outubro de 2026, sem versão EOL.
- Criar ou atualizar `.nvmrc`, `.node-version` e o campo `engines` do `package.json`.
- Garantir ambiente reproduzível com Corepack e pnpm fixado.

### 11 · Modernização MySQL e autenticação

_Instrução: Tarefa 9 · item 16._

- Pesquisar as versões LTS do MySQL em 2026 e a rota oficial de upgrade a partir do 8.0.x, sem atualizar a imagem Docker cegamente.
- Eliminar `mysql_native_password` e migrar para `caching_sha2_password` quando compatível.
- Revisar `compose.yaml`, `scripts/mysql-migrate.mjs`, `src/lib/mysql/`, `src/integrations/mysql/`, `mysql/migrations/`, `run.py`, `run.sh` e `run_windows.py`, eliminando opções removidas ou depreciadas.

### 12 · Compose, env e secrets

_Instrução: Tarefa 10 · itens 19, 20 e 28._

- Auditar o `compose.yaml`: remover credenciais e passwords hardcoded (inclusive no healthcheck), opções MySQL removidas, versões obsoletas e configurações inseguras; consumir variáveis do ambiente mantendo o healthcheck realmente funcional.
- Testar `docker compose config`, `up -d`, `ps` e `logs` até estado saudável real.
- Auditar todo o repositório por `password`, `secret`, `token`, `apikey`, `api_key`, `Authorization`, `Bearer`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `AUTH_SECRET`, `STRIPE`, `GEMINI`, `SENTRY` e `admin123`.
- Criar ou atualizar `.env.example` apenas com documentação segura; `.env.local` nunca é commitado; gerar segredos de desenvolvimento corretamente.
- Centralizar a configuração em uma fonte única de verdade para `run.py`, `run.sh`, `run_windows.py`, `compose.yaml` e `README.md`.

### 13 · Correção e modernização completa do run.py

_Instrução: Tarefa 11 · itens 21, 22, 23, 26, 27, 44, 45, 46, 54, 56, 57 e 58._

- `run.py` como orquestrador oficial do WSL2 Ubuntu, validando plataforma, versão do Ubuntu, Python, Node, pnpm, Corepack, Docker, Docker Compose, daemon, portas, `.env.local`, dependências, MySQL, migrations, aplicação, health check e shutdown.
- Substituir a instalação dinâmica do Rich por ambiente virtual próprio do launcher, manifesto explícito de dependências Python e bootstrap seguro, sem `--break-system-packages` como fluxo normal.
- Separar `doctor`, `fix` seguro, `repair` e `purge` explícito; nenhuma operação destrutiva (apt purge, rm -rf, remoção de MySQL/MariaDB, diretórios, usuário/grupo) em fluxo automático.
- Portas: identificar PID, processo, proprietário e origem; nunca matar processos de terceiros; ajustar `APP_BASE_URL`, `NEXT_PUBLIC_APP_URL`, `PORT`, `MYSQL_HOST_PORT` e `MYSQL_PORT` de forma coerente.
- Logs com etapa, comando, resultado, causa provável, localização do log e exit code; sem esconder stderr; sem `[OK]` antes da verificação.
- Critérios de aprovação: iniciar, detectar ambiente, preparar dependências, subir banco, aguardar healthcheck, migrar, iniciar Next.js, identificar URL, acessar aplicação, status, logs, parar aplicação e banco; zero traceback não tratado; idempotência, restart e teste de falhas.

### 14 · Correção e modernização completa do run.sh

_Instrução: Tarefa 12 · itens 24, 26, 27, 44, 45, 55, 56, 57 e 58._

- `run.sh` funcional no Windows 11 via Git Bash (ambiente suportado claramente definido), detectando MINGW, MSYS, CYGWIN e demais ambientes.
- Paridade com `run.py` para `up`, `app`, `db`, `migrate`, `doctor`, `fix`, `status`, `stop`, `logs` e `help`.
- `./run.sh doctor`, `up`, `status`, `logs`, `stop` e o modo interativo `./run.sh` funcionando; TUI sem corromper o terminal e degradação para logs convencionais sem TTY.
- Mesmas regras de portas, logs, shutdown, idempotência, restart e falhas.

### 15 · Revisão do run_windows.py e eliminação de redundância

_Instrução: Tarefa 13 · item 25._

- Analisar por que `run_windows.py` existe e a sobreposição com `run.sh`.
- Escolher e documentar tecnicamente a arquitetura: (A) run.sh principal no Git Bash e run_windows.py alternativa PowerShell/CMD, (B) unificação com wrapper, ou (C) remoção do redundante somente se comprovadamente desnecessário.

### 16 · Migrations e banco

_Instrução: Tarefa 14 · itens 17 e 18._

- Validar todas as migrations: ordenação, idempotência, checksum, schema, PKs, FKs, índices, constraints, tipos, timestamps, collations, charset, defaults e tabelas administrativas, usuários, planos, billing, perfil, dados de saúde e demais.
- Testar banco vazio → migrations → aplicação e banco existente → upgrade → aplicação, sem apagar volumes.
- Implementar ou corrigir backup real e validar restore real.

### 17 · Testes automatizados

_Instrução: Tarefa 15 · item 32._

- Revisar a suíte Vitest e identificar áreas críticas sem cobertura.
- Adicionar testes reais para autenticação, autorização, usuários, admin, banco, plans, billing, migrations, motores de saúde, IA, APIs, launcher e configuração, sem testes falsos de mocks triviais.

### 18 · APIs e CRUD

_Instrução: Tarefa 16 · itens 33 e 34._

- Mapear todas as Route Handlers: método, rota, autenticação, autorização, input, output, erros e database.
- Testar GET, POST, PUT, PATCH e DELETE: sucesso, validação, erro, não autenticado, sem permissão, recurso inexistente e payload inválido.
- QA do CRUD real (CREATE, READ, UPDATE, DELETE, LIST, SEARCH, FILTER, PAGINATION, validação, persistência no MySQL, autorização e retorno na UI), confirmando no banco.

### 19 · Segurança

_Instrução: Tarefa 17 · itens 39, 40, 41 e 42._

- Auditar autenticação, autorização, sessões, cookies, CSRF, XSS, SQL injection, SSRF, open redirect, rate limiting, secrets, headers, upload, validação Zod, endpoints administrativos, IDOR, Stripe webhooks e assinatura, permissões, dados sensíveis e logging de informações pessoais.
- Dados de saúde como sensíveis: logs, erros, armazenamento, acesso indevido, APIs, administração, autorização, cache, analytics, Sentry e integrações externas.
- Stripe: checkout, customer portal, webhooks, planos, entitlement, roles, erros, idempotência, assinatura de webhooks e test mode, marcando a fronteira externa que exige credencial real.
- Sentry: não quebrar build sem DSN, opcional, sem segredos, respeitando ambientes, sem dados de saúde desnecessários e compatível com o Next.js escolhido.

### 20 · Performance

_Instrução: Tarefa 18 · item 38._

- Auditar bundle, imports, dependências pesadas, fronteiras Server/Client, re-renders, imagens, fontes, lazy loading, dynamic imports, queries SQL, conexões, caching, waterfalls, chamadas duplicadas e assets, priorizando gargalos mensuráveis.

### 21 · QA funcional com navegador

_Instrução: Tarefa 19 · itens 30, 35 e 46._

- Subir a aplicação real (`pnpm build` + `pnpm start`) e navegar com Playwright por landing, login, cadastro, onboarding, dashboard, perfil, plano, metas, chat, dispositivos, saúde, billing, configurações, menus, sidebar, área administrativa, editor Puck, Site Experience Builder e demais páginas.
- Clicar em links, botões, tabs, selects, dialogs, dropdowns, toggles, forms, paginações e cards interativos.
- Health check real: processo Next.js, porta, HTTP, MySQL saudável, migration concluída, conexão app ↔ MySQL, página principal renderizada e login funcional; endpoint de health/readiness sem expor segredos.

### 22 · QA responsivo e acessibilidade

_Instrução: Tarefa 20 · itens 36 e 37._

- Testar desktop, tablet e mobile em múltiplos viewports: overflow, cortes, truncamento, cards, tabelas, charts, modais, sidebars, menus, scroll, z-index, contraste, foco, estados hover/focus/active, loading, vazios e erros.
- Validar HTML semântico, labels, forms, navegação por teclado, foco visível, ARIA somente quando necessário, contraste, modais, menus, landmarks, headings e alt texts.

### 23 · Documentação final

_Instrução: Tarefa 21 · itens 29, 47, 48, 60, 71, 72, 73, 74 e 75._

- Atualizar `README.md`, `AGENTS.md`, `.env.example`, instalação, dependências, Node, pnpm, Docker, MySQL, `run.py`, `run.sh` e `run_windows.py`, documentando somente o que foi testado e removendo textos antigos.
- Teste de instalação completamente limpa, validação final integral (`pnpm install --frozen-lockfile`, gates, Docker, migrations, páginas, APIs, CRUD, autenticação, admin, shutdown e restart), teste final dos launchers e revisão Git final.
- Relatório final obrigatório (ambiente, dependências, erros, run.py, run.sh, MySQL, testes, segurança, commits e pendências).

---

## Tópico 4 · Histórico das Tarefas Finalizadas

### 01 · Instrução mestra no `CLAUDE.md` e obrigatoriedade para agentes de IA

- **Status:** 🟢 finalizada · **Commit:** `1272c56` · **Push:** `db86930..1272c56 main -> main` (confirmado)
- **Implementado:**
  - `CLAUDE.md` criado na raiz com a INSTRUÇÃO MESTRA em texto integral, do título ao item 76.
  - `AGENTS.md` recebeu a seção "INSTRUÇÃO MESTRA (OBRIGATÓRIO PARA TODOS OS MODELOS E AGENTES DE IA)", que obriga qualquer modelo (Claude, Codex, Copilot, Cursor, Gemini, Devin e outros) a ler e cumprir o `CLAUDE.md` e a registrar o andamento neste arquivo.
  - `.prettierignore` passou a ignorar o `CLAUDE.md`, pois `prettier --check` comprovadamente reformataria o texto integral (juntaria linhas e converteria `+` em listas).
- **Evidência:** `npx prettier --check CLAUDE.md` acusava diferença antes do ajuste; após o ajuste o arquivo fica fora da reformatação automática e permanece idêntico ao texto da instrução.

### 02 · Painel de gestão `claude-gestao.md`

- **Status:** 🟢 finalizada · **Commit:** registrado no histórico Git com a mensagem `docs(gestao): cria painel claude-gestao.md da instrução mestra`
- **Implementado:**
  - Painel com os quatro tópicos exigidos: Andamento Geral com barra e porcentagem, Tarefas em Andamento ou Bloqueadas (ANDAMENTO limitado a 3 e BLOQUEADAS), Tarefas a Iniciar com o escopo integral de cada tarefa e Histórico das Tarefas Finalizadas.
  - Layout baseado em padrões atuais de painéis em Markdown no GitHub: alertas nativos (`> [!IMPORTANT]`), tabelas de indicadores, barra de progresso em blocos Unicode legível em qualquer visualizador e legenda de status.
  - Numeração única e crescente (01 a 23), sem repetição entre tópicos; as tarefas 03 a 23 correspondem às Tarefas 1 a 21 do item 53 da instrução.
