# Lyra MetaCare · Gestão da Instrução Mestra

> [!IMPORTANT]
> Este arquivo é o painel oficial de andamento da **INSTRUÇÃO MESTRA** definida em [`CLAUDE.md`](./CLAUDE.md).
> Todo modelo ou agente de IA que atuar neste repositório deve atualizá-lo a cada tarefa iniciada, bloqueada ou finalizada.

**Regras de manutenção deste painel**

1. Cada tarefa existe em **um único tópico** por vez (sem repetição entre tópicos).
2. As tarefas são sempre listadas em **ordem numérica crescente** dentro de cada tópico.
3. **ANDAMENTO** comporta no máximo **3 tarefas simultâneas**; ao finalizar, a tarefa sai do Tópico 2 e entra no Tópico 4.
4. **BLOQUEADAS** recebe toda tarefa que dependa de interação do usuário, credencial externa ou limitação real do ambiente, sempre com a evidência do bloqueio.
5. O Tópico 4 registra apenas o que foi realmente implementado, testado, commitado e enviado para `origin/main`, com SHA e evidências reais.
6. **Obrigatório:** logo após o commit e push de cada tarefa para `main`, este painel é atualizado imediatamente com o SHA real da tarefa e enviado em um commit e push próprios para `main`.

**Legenda:** 🟢 finalizada · 🔵 em andamento · 🔴 bloqueada · ⚪ a iniciar

---

## Tópico 1 · Andamento Geral

| Indicador          | Valor                          |
| ------------------ | ------------------------------ |
| Progresso          | `████████░░░░░░░░░░░░` **40%** |
| Tarefas totais     | 25                             |
| 🟢 Finalizadas     | 10                             |
| 🔵 Em andamento    | 1                              |
| 🔴 Bloqueadas      | 0                              |
| ⚪ A iniciar       | 14                             |
| Branch de trabalho | `main` (única permitida)       |
| Última atualização | 2026-10-04                     |

> Cálculo: tarefas finalizadas ÷ tarefas totais (10 ÷ 25 = 40%). Cada bloco da barra representa 5% (arredondamento para o bloco mais próximo).

---

## Tópico 2 · Tarefas em Andamento ou Bloqueadas

### ANDAMENTO

| Nº  | Tarefa                                        | O que está sendo realizado                                                                                                                                                                                                                                                                       |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 25  | Correção crítica: editor Puck quebra ao abrir | `/admin/puck` cai na tela de erro global com React #185 ("Maximum update depth exceeded"), defeito pré-existente comprovado no commit `7cbf0f3` (antes da tarefa 09). Investigação da causa raiz do laço de atualização, correção, teste e validação do editor e do painel de slot no navegador. |

### BLOQUEADAS

Nenhuma tarefa bloqueada no momento.

---

## Tópico 3 · Tarefas a Iniciar

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

- **Status:** 🟢 finalizada · **Commit:** `a99510b` · **Push:** `1272c56..a99510b main -> main` (confirmado)
- **Implementado:**
  - Painel com os quatro tópicos exigidos: Andamento Geral com barra e porcentagem, Tarefas em Andamento ou Bloqueadas (ANDAMENTO limitado a 3 e BLOQUEADAS), Tarefas a Iniciar com o escopo integral de cada tarefa e Histórico das Tarefas Finalizadas.
  - Layout baseado em padrões atuais de painéis em Markdown no GitHub: alertas nativos (`> [!IMPORTANT]`), tabelas de indicadores, barra de progresso em blocos Unicode legível em qualquer visualizador e legenda de status.
  - Numeração única e crescente (01 a 23), sem repetição entre tópicos; as tarefas 03 a 23 correspondem às Tarefas 1 a 21 do item 53 da instrução.

### 03 · Auditoria baseline e correção dos erros atualmente existentes

- **Status:** 🟢 finalizada · **Commit:** `e89a4b2` · **Push:** `a99510b..e89a4b2 main -> main` (confirmado)
- **Implementado:**
  - Baseline forense real registrado em [`docs/auditoria/2026-10-04-baseline-forense.md`](./docs/auditoria/2026-10-04-baseline-forense.md): versões do ambiente, quality gates, build, runtime, `pnpm outdated` e `pnpm audit` (146 avisos: 4 críticos, 50 altos, 80 moderados, 12 baixos).
  - Erro real encontrado: `pnpm db:migrate` falhava em banco novo criado pelo Compose (`fk_ui_config_updated_by ... are incompatible`). Causa raiz: tabelas iniciais herdavam `utf8mb4_0900_ai_ci` do servidor enquanto as novas declaram `utf8mb4_unicode_ci`; só o `run.py` mascarava o defeito ao iniciar o MySQL com `--collation-server=utf8mb4_unicode_ci`.
  - Correções: migration `mysql/migrations/005_add_tables_unicode_collation.sql`; `compose.yaml` com `--character-set-server=utf8mb4` e `--collation-server=utf8mb4_unicode_ci`; `scripts/mysql-migrate.mjs` com ordenação determinística por código de caractere.
- **Evidências:** banco parcialmente migrado → 7 migrations aplicadas (exit 0); reexecução idempotente ("Já aplicada"); banco novo → 12 migrations aplicadas e todas as tabelas em `utf8mb4_unicode_ci`; `pnpm start` com `GET /`, `/login`, `/api/public/plans`, `/api/public/ui-config` em HTTP 200 e login do admin bootstrap com sessão válida; gates `check:format`, `check:lint`, `check:types` (exit 0), `test` (82/82) e `build` (exit 0).

### 04 · Normalização do package manager e lockfiles

- **Status:** 🟢 finalizada · **Commit:** `27171f8` · **Push:** `e89a4b2..27171f8 main -> main` (confirmado)
- **Decisão técnica (pesquisa de 2026-10-04):** pnpm é o gerenciador oficial (único lockfile real, `pnpm-workspace.yaml`, scripts e README). Versões avaliadas: pnpm 12.9.1 (lançado em 2026-08-26, reescrito em Rust) e pnpm 11.28.4 (suporte até 2027-04-30). O pnpm 12 **não executa via Corepack** (testado com Corepack 0.34.0 e 0.36.0: `Cannot find module .../pnpm/12.9.1/bin/pnpm.cjs`, pois o pacote passou a distribuir binário nativo), o que viola o requisito de Corepack reproduzível; por isso foi fixado o pnpm **11.28.4**, estável, suportado e compatível com Corepack.
- **Implementado:**
  - `package.json`: `"packageManager": "pnpm@11.28.4+sha512..."` gerado por `corepack use`; `bun` removido das dependências; `db:start` usa `docker compose up -d --wait mysql && pnpm run db:migrate` (aguarda o healthcheck real em vez de migrar com o banco ainda subindo).
  - `bun.lock` removido; `package-lock.json` não existia no repositório.
  - `pnpm-workspace.yaml`: removidos `bun` e `termios` de `allowBuilds` (nenhum dos dois existe no lockfile).
  - `pnpm-lock.yaml` regenerado pelo pnpm 11 e incluído no `.prettierignore` (causa raiz dos diffs espúrios: o `prettier --write .` reformatava o lockfile e o pnpm o reescrevia a cada install).
  - `AGENTS.md`: checagens obrigatórias passam a usar `pnpm` (incluindo `pnpm test` e `pnpm build`).
  - Avaliado e descartado: manter `devEngines.packageManager` junto com `packageManager` gera o aviso `Cannot use both "packageManager" and "devEngines.packageManager"` no pnpm 11; foi mantido o campo exigido pela instrução e lido pelo Corepack.
- **Evidências:** `corepack pnpm@11.28.4 --version` → `11.28.4`; `CI=true pnpm install --frozen-lockfile` → exit 0 sem warnings; Prova de Morte: `ls bun.lock` inexistente e `grep -c "bun@" pnpm-lock.yaml` → `0`; gates `check:format`, `check:lint`, `check:types` (exit 0), `test` (82/82) e `build` (exit 0).
- **Pendências encaminhadas:** `run.py` e `run_windows.py` ainda citam `package-lock.json` e fallback para npm; serão tratados nas tarefas 13 e 15.

### 05 · Remoção comprovada de dependências não utilizadas

- **Status:** 🟢 finalizada · **Commit:** `ecf1b60` · **Push:** `27171f8..ecf1b60 main -> main` (confirmado)
- **Método:** para cada dependência do `package.json`, busca `rg` por `'pacote` e `"pacote` em todo o repositório (código, configs, scripts, CSS), excluindo `node_modules`, lockfile e o próprio `package.json`; candidatos com zero referências foram reconferidos por nome curto (ex.: `monaco`, `tremor`, `vaul`, `tooltip`) e na documentação.
- **Removidas (zero uso comprovado):** `@monaco-editor/react`, `monaco-editor`, `@radix-ui/react-aspect-ratio`, `@radix-ui/react-collapsible`, `@radix-ui/react-context-menu`, `@radix-ui/react-hover-card`, `@radix-ui/react-menubar`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-tooltip` (os tooltips usados são do Recharts e do `ui/chart`), `@tremor/react` (só aparecia no `content` do Tailwind), `input-otp`, `vaul`, `@tailwindcss/typography` (não registrado em `plugins`) e `eslint-config-prettier` (não estendido no `.eslintrc.json`).
- **Seção corrigida:** `@types/react-big-calendar` movido de `dependencies` para `devDependencies`.
- **Mantidas com evidência:** `react-big-calendar` (`src/components/appointments/Agenda.tsx` e `globals.css`), `@dyad-sh/nextjs-webpack-component-tagger` (`next.config.ts`, opcional via `ENABLE_DYAD_COMPONENT_TAGGER`; reavaliado na tarefa 06), `implement_elementor_lyra.py` e `modules/lyra-customaze-ui-ux` (importado por `src/lib/site-page-config`).
- **Defeito corrigido junto:** o `content` do Tailwind não incluía `src/lib` (componentes do Puck com `className`) nem `modules/`; agora cobre `./src/**/*` e `./modules/**/*`.
- **Artefatos indevidamente versionados:** `.logs/` (2 arquivos) e `.playwright-cli/` (52 arquivos) estavam no Git apesar do `.gitignore`; dois snapshots continham a senha padrão do admin digitada no login. Foram removidos do índice (`git rm --cached`), permanecendo apenas locais e ignorados.
- **Prova de Morte:** `git ls-files .logs .playwright-cli | wc -l` → `0`; nenhuma das 14 dependências permanece no `package.json` nem como importador direto no `pnpm-lock.yaml`.
- **Evidências:** `CI=true pnpm install --frozen-lockfile` exit 0; `check:format`, `check:lint`, `check:types` exit 0; `test` 82/82; `build` exit 0. Uma execução de build falhou de forma transitória em `next/font` (`Cannot read properties of null (reading '1')`) por resposta inválida do Google Fonts durante o download; a repetição passou. A dependência de rede no build pelo `next/font/google` foi registrada para tratamento na tarefa 20 (performance/fontes).

### 06 · Upgrade controlado das dependências

- **Status:** 🟢 finalizada · **Commit:** `de80385` · **Push:** `318faf1..de80385 main -> main` (confirmado)
- **Matriz completa:** [`docs/auditoria/2026-10-04-matriz-dependencias.md`](./docs/auditoria/2026-10-04-matriz-dependencias.md) com versão declarada, instalada, última estável, uso, breaking changes e ação de cada pacote.
- **Implementado (com adaptação real do código às novas APIs):**
  - **TypeScript 6.0.3:** o 7.0.2 foi pesquisado e descartado por não ter API JavaScript (usada pelo type-check do `next build` e pelo `typescript-eslint`). O novo padrão `noUncheckedSideEffectImports` foi atendido com `src/types/css.d.ts` (declaração dos imports de CSS), sem desligar a checagem.
  - **Vitest 5 / Vite 8:** `vitest.config.mts` passou a usar `resolve.tsconfigPaths` nativo e `oxc.jsx.runtime = 'automatic'` (causa raiz da falha "invalid JS syntax" no `ProfileForm.test.ts`: o `tsconfig` usa `jsx: preserve` para o Next); `vite-tsconfig-paths` removido.
  - **Zod 4:** `required_error` migrado para `error` preservando a semântica (mensagem só quando o valor está ausente); `z.coerce.number<number | string>()` e `useForm<Input, unknown, Output>` em AIConfigForm, CreateGoalModal, UpdateGoalProgressModal, onboarding e ProfileForm.
  - **DayPicker:** `react-day-picker` 8 (peer `react ^16-18`, incompatível com React 19) substituído por `@daypicker/react` 10; `ui/calendar.tsx` reescrito para a nova API (classNames do enum UI, `Chevron`, dropdown de mês/ano) com locale `pt-BR` padrão; `ui/date-picker.tsx` com `OnSelectHandler`, `autoFocus`, `startMonth`/`endMonth`.
  - **Recharts 3:** `ui/chart.tsx` tipado com `TooltipContentProps` e `DefaultLegendContentProps`, filtro de itens `type: 'none'` e chave estável (o `dataKey` pode ser função).
  - **react-resizable-panels 4:** `ui/resizable.tsx` com `Group`/`Separator`; no `SiteExperienceBuilder`, `direction` → `orientation` e tamanhos `44/36/56/40` → `"44%"` etc. (no v4 números são pixels).
  - **Stripe 23:** API fixada em `2026-09-30.endive` (changelog de 21, 22 e 23 revisado; `new Stripe()` e `webhooks.constructEvent` já eram usados).
  - **Demais:** Sentry 11.4, Puck 0.23, lucide-react 1.51.0 (1.52.0 bloqueado pela política `minimumReleaseAge` do pnpm 11 por ter menos de 24 h; a exclusão automática no `pnpm-workspace.yaml` foi desfeita), date-fns 4.4, `@types/node` 24 (alinhado ao Node 24 LTS), Radix, mysql2 3.24, jose, react-hook-form 7.89, prettier 3.9 (reformatou tabelas Markdown que não renderizavam por falta de linha em branco).
- **Evidências:** `pnpm peers check` → "No peer dependency issues found"; `check:format`, `check:lint`, `check:types` exit 0; `test` 82/82; `build` exit 0; `pnpm audit` de 146 para 113 avisos (críticos de 4 para 3, restantes em `next@15`).
- **Encaminhado:** Next.js 16, React 19.3 e ESLint 10 (tarefas 07 e 08), Tailwind 4 (tarefa 09), `overrides` para vulnerabilidades transitivas restantes (tarefa 19) e verificação visual do calendário, gráficos e painéis redimensionáveis no QA de navegador (tarefa 21).

### 07 · Migração Next.js

- **Status:** 🟢 finalizada · **Commit:** `cf912ac` · **Push:** `7ed5d7c..cf912ac main -> main` (confirmado)
- **Pesquisa (guia oficial "How to upgrade to version 16", Next.js 16.3.8):** Turbopack padrão em `dev`/`build`, remoção de `next lint`, ESLint em flat config, async Request APIs obrigatórias, `middleware` → `proxy`, novos padrões de `next/image`, React 19.2+ e Node ≥ 20.9.
- **Next.js 15.3.4 → 16.3.8:**
  - `next.config.ts` reescrito: removidos aliases/fallbacks de webpack herdados do Transformers.js (sem nenhum uso no código); loader Dyad (`@dyad-sh/nextjs-webpack-component-tagger`) testado no Turbopack e reprovado (`Reading source code for parsing failed`), por isso só é registrado com `ENABLE_DYAD_COMPONENT_TAGGER=true` no novo script `pnpm dev:webpack` (testado: atributos `data-dyad-id` gerados). Build e `pnpm dev` padrão seguem em Turbopack.
  - Async Request APIs já estavam aplicadas (`await params`, `await cookies()`); a validação de tipos de rotas do Next 16 revelou `params` tipado como união em `/api/admin/plans/[planKey]`, agora validado em runtime com `z.enum(PLAN_KEYS)` (antes aceitava qualquer chave).
  - O Next 16 ajustou o `tsconfig.json` (`jsx: react-jsx`, tipos de `.next/dev`) e adicionou ao `AGENTS.md` o bloco oficial de regras para agentes (documentação em `node_modules/next/dist/docs/`); a configuração `oxc` do Vitest deixou de ser necessária e foi removida.
- **ESLint 8.57 (EOL desde 2026-08-06) → 10.12 + eslint-config-next 16.3.8:** `.eslintrc.json`/`.eslintignore` substituídos por `eslint.config.mjs` (core-web-vitals + typescript). Os plugins `eslint-plugin-react` 7.37.5, `import` e `jsx-a11y` exigidos pelo `eslint-config-next` quebram no ESLint 10 (`contextOrFilename.getFilename is not a function`); a correção oficial adotada é o `fixupConfigRules` do `@eslint/compat` (mantido pelo time do ESLint). Scripts `lint`/`check:lint`/`fix:lint` sem a flag `--ext` (removida). `package.json` renomeado de `next-template` para `lyra-metacare`.
- **76 achados reais da nova configuração corrigidos sem desabilitar regras:** 33 `react-hooks/set-state-in-effect` (cargas separadas em consulta pura + aplicação do resultado, estado derivado durante a renderização, `useSyncExternalStore` para Embla, localStorage e capacidade Web Bluetooth; novos hooks `useKeyedResource`, `useAccountResource` e `useLocalStorageValue`), 6 `purity` (`Date.now`/`Math.random` no render), 2 `static-components`, 1 `refs`, 2 `preserve-manual-memoization`, 3 `incompatible-library` (`watch()` → `useWatch`), 11 `no-explicit-any` (tipos reais, Zod e augment de `Navigator.bluetooth`), 16 `no-unused-vars` e 2 diretivas `eslint-disable` órfãs.
- **Defeitos funcionais encontrados e corrigidos pela causa raiz:**
  - Sentry nunca era inicializado (os `sentry.*.config.ts` não eram carregados por nenhum arquivo): criados `src/instrumentation.ts`, `src/instrumentation-client.ts` e `src/app/global-error.tsx`; `withSentryConfig` só faz upload de source maps com `SENTRY_AUTH_TOKEN/ORG/PROJECT`; `dataCollection` do Sentry 11 desliga usuário, cookies, cabeçalhos, corpos, dados de banco, entradas/saídas de IA e variáveis locais (dados de saúde).
  - O login ignorava a configuração editada no Site Experience Builder (regressão do redesign #45, `overrideConfig` sem uso) e o checkbox "Lembrar-me" não tinha efeito: textos, escalas tipográficas, tamanhos, destaques e link de volta reconectados; "Lembrar-me" agora cria sessão de 7 dias (cookie com `Max-Age`) e, desmarcado, sessão de navegador (sem `Max-Age`, token de 12 h); campos com `label` acessível e `autocomplete`.
  - Leituras ao vivo (monitor BLE e canal em tempo real) eram descartadas quando não havia runtime nativo de saúde; o `HealthOrchestrator` passou a combinar a sincronização com as leituras ao vivo e `triggerManualSync` retorna o resultado (o FAB não observa mais estado em efeito).
  - O `DatePicker` apagava a data digitada parcialmente quando o campo já tinha valor.
  - O Modo Privacidade mantinha estado isolado por componente (alternar no dashboard não refletia no chat); agora é um store compartilhado entre componentes e abas. A chave BYOK deixou de disparar um toast a cada tecla.
  - `POST /api/data/user-assessments` aceitava qualquer payload (`any`): agora usa união discriminada Zod com escalas válidas (humor 1–5, WHO-5 0–5 com as 5 respostas, NPS 0–10).
  - `GET /api/public/ui-config` devolvia `config: null` em falha de banco; agora registra o erro e responde 500.
  - O gráfico de peso do perfil exibia meses em inglês; agora usa `ptBR`.
- **Evidências:** `check:format`, `check:lint` (0 problemas), `check:types` exit 0; `test` 84/84 (2 testes novos de fallback de papel em `use-is-admin`); `build` exit 0 em Turbopack; `pnpm start` com `/`, `/login`, `/admin/dashboard`, `/chat`, `/profile`, `/goals`, `/api/public/plans`, `/api/public/ui-config` em HTTP 200; login com `remember:false` sem `Max-Age` e com `remember:true` com `Max-Age=604800`; avaliação WHO-5 inválida → 400 e válida → 200 (score 84); `pnpm audit` sem críticos (de 3 para 0; 72 avisos restantes, tarefa 19).
- **Encaminhado:** React 19.3 (tarefa 08), mensagens de erro Zod amigáveis nas APIs (tarefa 18), cookie `Secure` exige HTTPS fora de `localhost` (documentação, tarefa 23).

### 08 · Migração React

- **Status:** 🟢 finalizada · **Commit:** `ae0ead5` · **Push:** `e7b7ccc..ae0ead5 main -> main` (confirmado)
- **Pesquisa:** registry npm consultado em 2026-10-04: React 19.3.0 é a versão estável mais recente (publicada em 2026-09-09); o Next.js 16.3.8 declara `react ^19.0.0` como peer. Nenhuma versão canary ou experimental foi usada.
- **Implementado:**
  - `react` e `react-dom` 19.2.5 → 19.3.0 (`@types/react`/`@types/react-dom` 19.3.0 já instalados na tarefa 06).
  - Revisão de APIs depreciadas com os tipos oficiais do React 19.3: `React.ElementRef` (depreciado em favor de `React.ComponentRef`) substituído nas 61 ocorrências de 21 componentes `src/components/ui/*`; `FormEvent` (marcado como depreciado: "FormEvent doesn't actually exist") substituído por `SubmitEvent<HTMLFormElement>` nos handlers de envio de `LoginExperience`, `LandingPage` e `AIKnowledgeManager`. Sem uso de `defaultProps` em componentes de função, string refs, `findDOMNode`, `ReactDOM.render` ou `propTypes` (as ocorrências de `defaultProps` são da configuração do Puck, não do React).
  - Refs, efeitos, hidratação e estado derivado já haviam sido revistos na tarefa 07 pelas regras do React Compiler (`react-hooks` 7).
  - `pnpm-workspace.yaml` passou a declarar em `peerDependencyRules.allowedVersions` a compatibilidade, verificada na tarefa 07, entre o ESLint 10 e os plugins `react`, `import` e `jsx-a11y` exigidos pelo `eslint-config-next`.
- **Evidências:** Prova de Morte `rg "ElementRef<|MutableRefObject|PropsWithRef|FormEvent|LegacyRef" src` → nenhum resultado; `pnpm peers check` → "No peer dependency issues found"; `check:format`, `check:lint`, `check:types` exit 0; `test` 84/84; `build` exit 0; `pnpm start` com `/`, `/login`, `/admin/dashboard`, `/chat`, `/profile`, `/appointments`, `/plan`, `/monitoring`, `/connect` e `/onboarding` em HTTP 200, sem erros no log do servidor.

### 09 · Migração Tailwind/shadcn/UI dependencies

- **Status:** 🟢 finalizada · **Commit:** `4db2b68` · **Push:** `7cbf0f3..4db2b68 main -> main` (confirmado)
- **Pesquisa (registro npm em 2026-10-04):** `tailwindcss`, `@tailwindcss/postcss` e `@tailwindcss/upgrade` 4.3.3 (publicados em 2026-09-25) e `tw-animate-css` 1.4.0. O `tailwindcss-animate` não tem suporte ao Tailwind 4; o `tw-animate-css` é o substituto adotado pelo shadcn/ui.
- **Implementado:**
  - Execução única da ferramenta oficial `@tailwindcss/upgrade` 4.3.3, seguida de revisão manual linha a linha. Removido `tailwind.config.ts`; tema CSS-first no `globals.css`; PostCSS com `@tailwindcss/postcss`. A ferramenta renomeou classes em 63 templates (`outline-none` → `outline-hidden`, `backdrop-blur` → `backdrop-blur-sm`, `flex-shrink-0` → `shrink-0`, `bg-gradient-to-*` → `bg-linear-to-*`, seletores arbitrários etc.).
  - Tema reorganizado:
    - `@theme inline` para cores e fontes, resolvidas no elemento onde `.dark` e as variáveis do next/font são aplicadas.
    - `@theme static` para raios e sombras, eliminando os tokens autorreferentes gerados pela ferramenta (`--radius-sm: var(--radius-sm)`).
  - `tailwindcss-animate` substituído por `tw-animate-css` nas 31 ocorrências de `animate-in`, `fade-*`, `zoom-*` e `slide-in-from-*`.
  - `components.json` com `tailwind.config` vazio, padrão do shadcn para Tailwind 4. README com a stack real (Next.js 16, React 19.3, TypeScript 6, Tailwind 4, Recharts 3).
- **Defeitos da conversão automática corrigidos pela causa raiz:**
  - O valor de dado `'outline'` (variante de botão do Puck, persistida no banco) foi trocado por `'outline-solid'`; restaurado.
  - A variável local `--color-border` do indicador de gráfico virou o token global `border-border`; agora é `border-(--color-border)`.
  - As classes de componente da Lyra (`.glass`, `.nav-pill`, `.surface-panel` etc.) viraram `@utility` e passaram a sobrescrever utilitários. Por exemplo, o `.glass` apagava o `border-border/80` do cabeçalho. Voltaram para `@layer components`, preservando a precedência do Tailwind 3.
  - O CSS do react-big-calendar foi inlinado com `@charset` dentro de `@layer`, o que gerava aviso no build. Foi movido para `src/components/appointments/agenda.css`, importado pelo componente `Agenda`, e saiu do bundle global (cerca de 12 KB a menos nas demais páginas).
- **Defeitos pré-existentes revelados pelo QA visual e corrigidos:**
  - A landing usava a classe `cosmic-orb`, removida no commit `f5abd4e`. Os halos nunca eram posicionados nem desfocados, e o `bg-accent/10` já aparecia como retângulo rosa no Tailwind 3. Agora usa `orchestrated-orb`.
  - O Tailwind 3 descartava em silêncio opacidades fora da escala padrão (`/92`, `/12`, `/88` etc.). Comprovação: `bg-white/92`, `border-primary/12` e `bg-card/92` ausentes do CSS do v3, enquanto os controles `/80` e `/90` estavam presentes. O v4 passou a aplicar o design escrito. Com isso, o painel do slot vazio do Puck surgia como uma faixa branca; agora ele fica oculto fora do editor quando não há blocos.
- **Removido com evidência (Prova de Morte):**
  - Keyframes e classes `.animate-*` duplicados (idênticos aos do tema, comparados por script).
  - Utilidades `bg-gradient-*` e `shadow-*` que o CSS gerado pelo config já sobrescrevia no v3.
  - `container` customizado (zero uso de `container` como classe).
  - `rg "tailwind\.config|tailwindcss-animate|@tailwind |cosmic-orb"` em código e configs → nenhum resultado.
- **Mudança consciente registrada:** com a escala tipográfica do Site Experience Builder aplicada via `font-size` inline, a entrelinha de `text-*` passou de absoluta (v3) para proporcional (v4). Isso evita linhas espremidas quando a escala aumenta.
- **Evidências:**
  - `check:format`, `check:lint` e `check:types` com exit 0; `test` 87/87.
  - `build` com exit 0 e **zero avisos**.
  - `pnpm start` com capturas reais de 14 páginas em 1440×900 e 390×844, comparadas pixel a pixel com a baseline do Tailwind 3: zero erros de console; diferenças restantes inspecionadas e justificadas acima.
  - O painel de slot vazio retorna `display: none` em `/appointments`.
- **Encaminhado:** o editor `/admin/puck` quebra com React #185, defeito pré-existente comprovado no commit `7cbf0f3`, tratado na tarefa 25. Os documentos históricos de redesign que citam `tailwind.config.ts` serão revistos na tarefa 23.

### 24 · Correção crítica: vazamento de conexões MySQL em produção

- **Status:** 🟢 finalizada · **Commit:** `991961b` · **Push:** `faa4c1b..991961b main -> main` (confirmado)
- **Origem:** tarefa criada durante o QA visual de baseline da tarefa 09. Com `pnpm start`, a navegação por 12 páginas autenticadas gerou 115 erros de console e respostas 500 com `Too many connections`.
- **Causa raiz:** `src/lib/mysql/pool.ts` só reaproveitava o pool fora de produção. Em `next start`, cada consulta criava um pool novo (até 20 conexões e 10 ociosas com keep-alive) que nunca era fechado, esgotando o `max_connections` do MySQL. `src/lib/billing/stripe.ts` repetia o padrão e criava um cliente Stripe, com agente HTTP próprio, a cada uso.
- **Implementado:**
  - Pool único por processo em qualquer ambiente, guardado em `globalThis` com tipo próprio.
  - Mesmo tratamento para o cliente Stripe.
  - Novo `src/lib/mysql/pool.test.ts` com 3 testes: pool único em produção, pool único em desenvolvimento e mensagem clara quando falta variável obrigatória. O teste de produção falha contra o código anterior.
- **Evidências:**
  - `SHOW STATUS LIKE 'Threads_connected'` caiu de 90 para 7 após a mesma navegação.
  - Erros de console caíram de 115 para 0.
  - `check:format`, `check:lint` e `check:types` com exit 0; `test` 87/87; `build` com exit 0.
