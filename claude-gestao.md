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
| Progresso          | `██████████████████░░` **89%** |
| Tarefas totais     | 27                             |
| 🟢 Finalizadas     | 24                             |
| 🔵 Em andamento    | 1                              |
| 🔴 Bloqueadas      | 0                              |
| ⚪ A iniciar       | 2                              |
| Branch de trabalho | `main` (única permitida)       |
| Última atualização | 2026-10-09                     |

> Cálculo: tarefas finalizadas ÷ tarefas totais (24 ÷ 27 = 88,9%). Cada bloco da barra representa 5% (arredondamento para o bloco mais próximo).

---

## Tópico 2 · Tarefas em Andamento ou Bloqueadas

### ANDAMENTO

| Nº  | Tarefa                                                         | O que está sendo realizado                                                                                                                                                                                                                                                                                                                                                           |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 27  | Simplificação visual premium (pedido do usuário em 2026-10-09) | Proposta de design mais simples, moderna e premium, sem perder funções: pesquisa de referências de 2026 e protótipo das telas-chave (login, dashboard e página interna) comparado ao visual atual, **enviado para aprovação do usuário antes de qualquer alteração no código**. Após aprovado: aplicação nos tokens e componentes compartilhados, com QA visual de todas as páginas. |

### BLOQUEADAS

Nenhuma tarefa bloqueada no momento.

---

## Tópico 3 · Tarefas a Iniciar

### 22 · QA responsivo e acessibilidade

_Instrução: Tarefa 20 · itens 36 e 37._

- Testar desktop, tablet e mobile em múltiplos viewports: overflow, cortes, truncamento, cards, tabelas, charts, modais, sidebars, menus, scroll, z-index, contraste, foco, estados hover/focus/active, loading, vazios e erros.
- Validar HTML semântico, labels, forms, navegação por teclado, foco visível, ARIA somente quando necessário, contraste, modais, menus, landmarks, headings e alt texts.
- Remover o `maximumScale: 1` do viewport em `src/app/layout.tsx`, que impede o zoom no celular (WCAG 1.4.4), registrado na tarefa 19.
- Registrado na tarefa 21: botões só com ícone sem nome acessível (ações da tabela de usuários e de conteúdo); duas `<h1>` por página (cabeçalho do app e título do conteúdo); `/instruments` sem `<h1>`; navegação da landing feita com `<button>` em vez de links.

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
  - `check:format`, `check:lint` e `check:types` com exit 0; `test` 87/87 nesta tarefa.
  - `build` com exit 0 e **zero avisos**.
  - `pnpm start` com capturas reais de 14 páginas em 1440×900 e 390×844, comparadas pixel a pixel com a baseline do Tailwind 3: zero erros de console; diferenças restantes inspecionadas e justificadas acima.
  - O painel de slot vazio retorna `display: none` em `/appointments`.
- **Encaminhado:** o editor `/admin/puck` quebra com React #185, defeito pré-existente comprovado no commit `7cbf0f3`, tratado na tarefa 25. Os documentos históricos de redesign que citam `tailwind.config.ts` serão revistos na tarefa 23.

### 10 · Modernização Node/pnpm/toolchain

- **Status:** 🟢 finalizada · **Commit:** `dcae3a4` · **Push:** `012138a..dcae3a4 main -> main` (confirmado)
- **Pesquisa (cronograma oficial `nodejs/Release` e `nodejs.org/dist/index.json` em 2026-10-04):**
  - Node 24 "Krypton" é **Active LTS**: entra em manutenção em 2026-10-20 e tem suporte até 2028-04-30. A última release é a 24.21.0 (2026-09-07) e a última de segurança, a 24.18.1.
  - Node 26 continua **Current** até virar LTS em 2026-10-28.
  - Node 22 está em manutenção até 2027-04-30; Node 20 está em EOL desde 2026-04-30.
  - Escolha: **Node 24 LTS**, por estabilidade e suporte, conforme o item 63 da instrução.
- **Implementado:**
  - `.nvmrc` e `.node-version` com `24.21.0`.
  - `engines.node` `^24.18.1` no `package.json`, com piso na última release de segurança da linha 24 e sem aceitar linhas Current.
  - `engineStrict: true` no `pnpm-workspace.yaml`.
  - `codemagic.yaml` com Node `24.21.0` fixo (antes era `lts` flutuante) e `corepack install` para a versão e o sha512 do `packageManager`. Antes o CI usava `corepack prepare pnpm@latest --activate`, que ativaria o pnpm 12, incompatível com o Corepack segundo a tarefa 04, e ignoraria a versão fixada.
  - README com os pré-requisitos reais.
- **Evidências:**
  - Tarball oficial do Node 24.21.0 verificado por SHA-256 (`SHASUMS256.txt`). O Node 24 inclui o Corepack 0.36.0, que resolve o pnpm 11.28.4 do `packageManager`.
  - `corepack install` num `COREPACK_HOME` vazio baixa e verifica o pnpm exato.
  - Com Node 22, `pnpm install --frozen-lockfile` sai com exit 1 e `ERR_PNPM_UNSUPPORTED_ENGINE` (Expected `^24.18.1`, Got `v22.22.0`).
  - Com Node 24.21.0, instalação limpa (sem `node_modules` e `.next`) com exit 0 e zero avisos.
  - `check:format`, `check:lint` e `check:types` com exit 0; `test` 112/112; `build` com exit 0 e zero avisos; `pnpm db:migrate` com exit 0 e idempotente.
  - `pnpm start` com capturas das 14 páginas sem erros, zero avisos de console e editor Puck salvando rascunho.
- **Encaminhado:** `run.sh` (mensagem "Node.js 20+"), `run.py` e `run_windows.py` ainda não validam a versão do Node pelo `.nvmrc`; isso será tratado nas tarefas 13 a 15.

### 11 · Modernização MySQL e autenticação

- **Status:** 🟢 finalizada · **Commit:** `c24421a` · **Push:** `bd7028c..c24421a main -> main` (confirmado)
- **Pesquisa (fontes primárias em 2026-10-04):**
  - MySQL 8.0, a versão do projeto (8.0.45), está em **fim de vida desde 2026-04-30**.
  - A tag oficial `lts` do Docker Hub aponta para o digest da **9.7.2** (LTS, suporte até 2034). A 8.4.11 é a LTS anterior; a 26.7 é Innovation e foi descartada.
  - O manual ("Upgrade Paths") só suporta upgrade de uma série LTS/Bugfix para a **próxima** LTS. Rota obrigatória: 8.0 → 8.4 → 9.7.
- **Evidências que motivaram as mudanças:**
  - O 9.7.2 sobre um datadir 8.0 encerra com `MY-014060 Cannot upgrade from 80045 to 90702`, sem tocar nos dados (o 8.0.45 sobe de novo na mesma cópia).
  - `lyra@%`, `root@%` e `root@localhost` usavam `mysql_native_password`, que vem desligado no 8.4 e foi removido no 9.x. O resultado seria perda total de acesso.
  - `VALUES(col)` em `ON DUPLICATE KEY UPDATE` gerava o warning 1287 no 8.0.45.
- **Implementado:**
  - `compose.yaml` com `mysql:9.7.2` e remoção de `--default-authentication-plugin`, opção removida no 8.4 com a qual o servidor nem inicia.
  - **`scripts/mysql-upgrade.mjs` (`pnpm db:upgrade`)**, idempotente:
    - backup a frio verificado (bytes e quantidade de arquivos);
    - detecção da versão do datadir pela imagem mais antiga da cadeia (recusa de downgrade sem alterar dados);
    - migração dos usuários para `caching_sha2_password` na série atual;
    - um passo por série LTS, com validação final;
    - `--restaurar <volume>`.
    - Imagem-alvo, volume e credenciais vêm do `docker compose config`; as senhas entram por variável de ambiente herdada (`-e MYSQL_PWD`), nunca nos argumentos visíveis no `ps`.
  - Os cinco upserts (`data-api`, `plans`, `billing`, `ai_plans`, `ui_config`) passaram a usar o alias de linha `AS novo`.
  - `run.py` com `mysql:9.7.2` sem o plugin nativo.
  - README com badges, stack e instrução do `db:upgrade`.
- **Defeitos do próprio script encontrados nos testes e corrigidos antes do commit:**
  - Regex de detecção sem o texto real de downgrade (`Cannot downgrade from 90702 to 80045`).
  - Backup de cerca de 200 MB repetido em toda reexecução; agora há um caminho rápido quando o serviço já está na série-alvo.
  - Restauração tentava `docker volume rm` num volume referenciado pelo container parado do compose; agora o conteúdo é substituído, preservando nome e rótulos.
  - Abordagens avaliadas e descartadas com evidência: `ibd2sdi` (ausente das imagens oficiais), `--innodb-read-only` (o InnoDB recusa iniciar, com md5 provando que não altera o datadir) e o "creator" do redo log (não é regravado no upgrade).
- **Evidências:**
  - **Banco existente:** `pnpm db:upgrade` real em 34 s, com o servidor registrando `8.0.45 → 8.4.11` e `8.4.11 → 9.7.2`. As 27 tabelas têm contagem idêntica a um backup independente em 8.0.45 (86 linhas).
  - **Restore testado:** `--restaurar` devolveu o datadir 8.0, que sobe no 8.0.45; o novo upgrade completo também ficou idêntico à referência.
  - **Idempotência:** com o serviço parado em 9.7, detecta e valida; com o serviço saudável, termina sem backup.
  - **Banco vazio:** 12 migrations aplicadas no 9.7.2, reexecução 12× "Já aplicada", usuário em `caching_sha2_password` e 27 tabelas `utf8mb4_unicode_ci`.
  - **mysql2:** autenticação `caching_sha2_password` completa (cache vazio após restart, TCP sem TLS) com `pnpm db:migrate` exit 0.
  - **Upserts em runtime pelas APIs reais** (`PATCH /api/admin/plans/free`, `POST /api/admin/ui-config`, `POST /api/data/profiles`, duas gerações de plano de IA): HTTP 200 e **0 warnings** no `performance_schema`. Billing validado com o SQL exato em transação com `ROLLBACK`.
  - Ao todo, 1.200 instruções da aplicação com 0 warnings.
  - `check:format`, `check:lint` e `check:types` com exit 0; `test` 112/112; `build` com exit 0 e zero avisos; 14 páginas sem erros de console; editor Puck salvando.
  - Avisos restantes do servidor são da imagem oficial e legítimos (item 59): CA TLS autoassinada gerada automaticamente e diretório `/var/run/mysqld` da imagem.
- **Encaminhado:**
  - Senha de root fixa no `compose.yaml` → tarefa 12.
  - `run.py` com `docker rm -f` e volume anônimo (destrói dados) e encerramento de processos na porta 3306 → tarefa 13.
  - `POST /api/data/*` devolvendo 500 com a mensagem crua do banco para payload inválido → tarefa 18.

### 12 · Compose, env e secrets

- **Status:** 🟢 finalizada · **Commit:** `a5b5e12` · **Push:** `8b54dec..a5b5e12 main -> main` (confirmado)
- **Auditoria de segredos** (todos os arquivos versionados, termos do item 20, chaves `sk_`/`whsec_`/`AIza`/`ghp_`, chaves privadas e DSNs):
  - O código da aplicação estava limpo: `AUTH_SECRET` obrigatório, sem fallbacks secretos, e nenhum `.env`, chave ou certificado versionado.
  - Havia senhas fixas no `compose.yaml` (inclusive no healthcheck), no `run.sh`, no `run_windows.py`, no `run.py`, no README e em manuais (`lyra_mysql_*`, `admin123`, `Lyra123#` e um admin extra `admin@admin.com`/`admin123`).
  - Havia três geradores de `.env.local` divergentes, um por launcher.
- **Implementado:**
  - **Fonte única de configuração:** `.env.example` versionado (25 variáveis levantadas do código, sem segredos) e `pnpm env:init` (`scripts/env-init.mjs` + `scripts/lib/env-file.mjs`).
    - Gera `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `AUTH_SECRET` e `ADMIN_BOOTSTRAP_PASSWORD` com aleatoriedade criptográfica (base64url, seguro para o dotenv do Next, para o Compose e para o shell).
    - Nunca sobrescreve valores, grava com permissão 0600 e não imprime segredos.
    - O `mysql-migrate.mjs` passou a usar o parser comum, removendo a duplicação.
  - **`compose.yaml`:**
    - credenciais interpoladas do `.env.local`, com erro orientado se faltarem;
    - porta publicada só em `127.0.0.1` (antes exposta em todas as interfaces);
    - **healthcheck real**, que autentica o usuário da aplicação via TCP no banco da aplicação. O `mysqladmin ping` anterior retornava 0 até com senha errada (comprovado). A senha vem do ambiente do container e não aparece no comando.
  - **Launchers e scripts:**
    - `pnpm db:*`, `db:upgrade`, `run.sh` e `run_windows.py` usam `docker compose --env-file .env.local` e delegam o `.env.local` ao `env:init`.
    - Removido o fallback de cerca de 30 bits do `run.sh` (`lyra_fallback_$RANDOM_$RANDOM`).
    - Um JSON inválido em `ADMIN_BOOTSTRAP_ADDITIONAL_ADMINS` passa a ser erro, em vez de ser substituído por um admin com senha fixa.
    - O `run_windows.py` decodifica a saída do Node como UTF-8, porque o cp1252 do Windows quebraria com bytes como o de "Á".
  - **`AUTH_SECRET`:** mínimo de 32 bytes (HS256, RFC 7518 §3.2). Além disso, `verifySessionToken` deixou de converter erro de configuração em "sessão inválida" silenciosa.
  - **`.gitignore`:** exceção para o `.env.example`, com os finais de linha mistos normalizados para LF.
  - README, manual e prompt de redesign atualizados: sem senhas padrão, com o fluxo real.
- **Evidências:**
  - 13 testes novos: 7 do gerador (`.env.example` sem segredos, idempotência, preservação, preenchimento no lugar, `AUTH_SECRET` fraco, entropia e charset) e 6 da sessão.
  - **`.env.local` existente:** 16 chaves acrescentadas e as 12 existentes com hash idêntico; a 2ª execução não altera nada; permissão 600.
  - **Instalação nova:** 28 variáveis, permissão 0600 mesmo com `umask 022`, segredos com 32/32/48/24 bytes e nenhum segredo na saída.
  - **Compose:** sem `--env-file`, erro orientado (exit 1). Com o serviço recriado: saudável, `PortBindings` em `127.0.0.1:3307` e healthcheck sem senha. Healthcheck novo com senha errada ou banco inexistente: exit 1; `mysqladmin ping` antigo com senha errada: exit 0.
  - **Ponta a ponta com segredos gerados** (projeto compose isolado, volume novo): migrations aplicadas, login do admin com a senha gerada 200, sessão válida e `admin123` com 401. O volume de teste foi removido em seguida.
  - **Launchers:**
    - `pnpm db:start` e `./run.sh db` com exit 0;
    - `./run.sh doctor`: ambiente saudável;
    - `python3 run_windows.py setup-env` e `db-start`: exit 0; com Node ausente, mensagem clara e exit 1, sem traceback;
    - `db:upgrade`: caminho rápido com exit 0; sem `.env.local`, erro orientado.
  - `check:format`, `check:lint` e `check:types` com exit 0; `test` 125/125; `build` com exit 0 e zero avisos.
  - `shellcheck` 0.11 no `run.sh`: só três variáveis sem uso pré-existentes, fora das linhas alteradas. `ruff` (E, F, W) no `run_windows.py`: sem achados.
- **Encaminhado:**
  - O `run.py` ainda cria o próprio container via `docker run` com `Lyra123#`/`admin123`; ele será reescrito sobre o Compose e o `env:init` na tarefa 13.
  - Variáveis sem uso no `run.sh` → tarefa 14.
  - A `INSTRUCAO_REIMPLEMENTACAO_UI_UX_LYRA_2026.md` ainda descreve o bootstrap antigo → tarefa 23.

### 13 · Correção e modernização completa do run.py

- **Status:** 🟢 finalizada · **Commit:** `4f1f169` · **Push:** `901a067..4f1f169 main -> main` (confirmado)
- **Diagnóstico do `run.py` anterior (2.947 linhas):**
  - Instalava o Rich com `pip --break-system-packages` no Python do sistema e reexecutava (item 22).
  - Tinha remoção automática do MySQL nativo (`apt purge`, `rm -rf` de diretórios do sistema) e encerrava processos na porta 3306 (itens 23 e 27).
  - Recriava o próprio container com `docker rm -f` e volume anônimo, perdendo os dados, e fixava senhas (`Lyra123#`, `admin123`).
- **Implementado** (reescrita completa sobre o Docker Compose e o `env:init`):
  - **Comandos:** `up [--prod]`, `app`, `db`, `migrate`, `doctor`, `fix`, `repair [--sim]`, `purge --confirmar-purge`, `status`, `logs [app|db] [--seguir]`, `stop [app|db]`, `help` e menu interativo (Rich). Códigos de saída 0/1/2/130.
  - **Separação `doctor`/`fix`/`repair`/`purge`** sem `apt` nem `sudo`:
    - `repair` recria `.next`, `node_modules` e o container, preservando o volume;
    - `purge` exige confirmação explícita e faz backup verificado do volume antes de apagar.
  - **Python reproduzível:** venv `.lyra-run/venv` com `requirements-run.txt` (Rich 15.0.0, markdown-it-py 4.2.0, mdurl 0.1.2, Pygments 2.21.0), hashes SHA-256 conferidos contra os digests do PyPI, `--require-hashes --only-binary=:all:`, reinstalação quando o manifesto muda e modo texto completo sem Rich. Mínimo Python 3.10, exigência do markdown-it-py.
  - **`doctor`:** plataforma (WSL2/WSL1/Linux), Ubuntu ≥ 22.04, Python, Node contra `.nvmrc`/`engines`, Corepack/pnpm contra `packageManager`, Docker Engine ≥ 25, Compose ≥ 2.20, `.env.local` (completude e permissão), dependências (lockfile instalado idêntico ao `pnpm-lock.yaml`), portas com dono, MySQL, migrations e aplicação.
  - **Portas:** dono identificado por `docker ps` e `/proc/net/tcp`/`fd` (PID, comando, usuário), e processos de terceiros nunca são encerrados.
    - A aplicação sobe na próxima porta livre, com `PORT`, `APP_BASE_URL` e `NEXT_PUBLIC_APP_URL` coerentes.
    - O MySQL é realocado com `MYSQL_HOST_PORT` e `MYSQL_PORT` atualizados juntos.
  - **Processos:** o `stop` encerra a **árvore** da aplicação. Causa raiz encontrada: o `next dev` faz `setsid`, então o grupo do PID registrado não contém o servidor. Só grupos formados exclusivamente pela aplicação recebem sinal; há SIGTERM com espera de 20 s, depois SIGKILL, e a confirmação da porta livre. Interopera com a aplicação iniciada pelo `run.sh`, descobrindo a porta pelos sockets da árvore.
  - **Logs:** `.logs/run-py-<data>-<comando>.log`, com cada comando, a saída integral, o exit code, a causa provável (13 padrões, incluindo os formatos do Next 16) e o caminho do log. Nenhum traceback no terminal, e subprocessos sem stdin herdado.
  - **`GET /api/health`:** prontidão sem segredos, com número de migrations aplicadas e 503 sem detalhes internos (testado). É usado na verificação ponta a ponta do `up` junto com `/`, `/login` e o login do admin.
  - **`mysql-upgrade.mjs`:** `--backup` avulso e restauração para volume removido, recriado pelo Compose com os rótulos do projeto.
  - **Documentação:** `docs/launchers.md` (contrato comum e matriz de paridade) e README.
- **Defeitos encontrados nos próprios testes e corrigidos antes do commit:**
  - `status` mostrava "MySQL ausente" com o Docker parado (agora: "não consultável" com a causa).
  - O padrão de erro de build não cobria o formato do Next 16.
  - O restore após purge criaria o volume sem os rótulos do Compose.
  - O menu tinha um traceback em EOF e subprocessos consumindo o stdin.
  - O `stop` dependia do grupo do PID registrado.
  - A porta da aplicação iniciada pelo `run.sh` não era descoberta.
- **Evidências (execução real; ambiente Linux Ubuntu 24.04, não WSL):**
  - **Bootstrap:** venv criado em 3,7 s; Rich só no venv (o Python do sistema continua sem ele).
  - **Fluxo principal:**
    - `doctor` com 14 verificações;
    - `up` de ponta a ponta em 25 s, com health, `/`, `/login` e login do admin;
    - segundo `up` idempotente (reutiliza o PID, sem processos duplicados);
    - `stop` com zero processos restantes e porta livre;
    - restart `up → stop → up`;
    - `up --prod` com build e `next start` em 81 s.
  - **Falhas controladas:**
    - Docker parado: diagnóstico e exit 1;
    - porta 3000 ocupada: app na 3001, ocupante intacto, URLs coerentes;
    - porta 3307 ocupada: MySQL na 3308 com `.env.local` coerente;
    - senha divergente e `.env.local` ausente: causa "senhas não correspondem ao volume";
    - `node_modules` ausente: reinstalação;
    - build com erro de tipo: arquivo, linha e causa;
    - migration inválida: falha sem registro nem tabela criada.
  - **Operações destrutivas:**
    - `purge` sem confirmação: exit 2, volume intacto;
    - `purge` confirmado seguido de restore: 27 tabelas idênticas (87 linhas);
    - `repair` sem `--sim` sem TTY: recusado;
    - `repair --sim`: container recriado e dados idênticos.
  - **Interface:** menu em TTY real via `script` (sessão completa e Ctrl+D com exit 0), modo texto e `logs --seguir` com Ctrl+C sem traceback.
  - **Qualidade:** `ruff` (E, F, W, B, UP, SIM, Pylint), `ruff format` e `mypy` sem achados. Prova de Morte de `break-system-packages`, `apt`, `rm -rf`, `fuser`, `docker run`, `Lyra123#` e `admin123`: nenhuma ocorrência executável.
  - `check:format`, `check:lint` e `check:types` com exit 0; `test` 127/127; `build` com exit 0 e zero avisos.
- **Limite do ambiente:** o sandbox não é WSL2, então a detecção de WSL2/WSL1 foi implementada pelo `/proc/version`, mas validada aqui só no ramo "Linux nativo". O teste em WSL2 real deve ser feito pelo operador com `python3 run.py doctor`.

### 14 · Correção e modernização completa do run.sh

- **Status:** 🟢 finalizada · **Commit:** `0e07294` · **Push:** `main -> main` (confirmado; `main...origin/main` sem divergência)
- **Diagnóstico do `run.sh` anterior:**
  - `kill_port` encerrava qualquer processo na porta da aplicação, inclusive de terceiros (item 27).
  - O ramo `ss` coletava os PIDs de **todas** as portas em escuta, não só da porta pedida.
  - `app_stop` encerrava só o PID registrado; o servidor do `next dev` (sessão própria via `setsid`) ficava vivo.
  - Faltavam `up --prod`, `repair`, `purge` com backup e a verificação ponta a ponta; sem TTY, executava `up` em vez de mostrar a ajuda.
- **Implementado** (reescrita completa, mesmos comandos, contrato e códigos de saída do `run.py`):
  - **Comandos:** `up [--prod]`, `app [--prod]`, `db`, `migrate`, `doctor`, `fix`, `repair [--sim]`, `purge --confirmar-purge`, `status`, `logs [app|db] [--seguir]`, `stop [app|db]`, `help` e menu numerado. Argumentos inválidos dão exit 2; Ctrl+C dá exit 130.
  - **Plataforma:** Git Bash (MINGW/MSYS) com build do Windows via `cmd.exe /c ver` (Windows 11 = build ≥ 22000), Linux equivalente, Cygwin recusado e macOS com aviso; exige bash 4+.
  - **Portas:** dono por `docker ps`; no Windows, `netstat -ano` filtrando o endereço remoto `0.0.0.0:0` (independe do idioma) e `tasklist /V`; no Linux, `ss`/`lsof` com a linha de comando de `/proc`. Terceiros nunca são encerrados.
  - **Processos:** no Windows, `taskkill /PID <winpid> /T /F` só na árvore da aplicação (o PID Windows vem de `/proc/<pid>/winpid`); no Linux, SIGTERM na árvore capturada antes do sinal, SIGKILL após 20 s e confirmação da porta livre.
  - **Verificação ponta a ponta** compartilhada: novo `scripts/verificar-app.mjs <porta>` (`/api/health` com todas as migrations, `/` e `/login` com 200, login do admin).
  - **Logs:** `.logs/run-sh-<data>-<comando>.log` com comandos reais (não os nomes das funções auxiliares), saída integral, exit code e causa provável (13 padrões).
  - **Correções no `run.py` encontradas nos testes cruzados:** a origem da aplicação passou a vir do `app.json` (antes, uma app do `run.sh` aparecia como "iniciada pelo run.py"); padrão do Docker 29+ ("failed to connect to the docker API") para Docker indisponível, que não era reconhecido; parada do MySQL pelo nome do container quando falta o `.env.local`; `iniciado_em` com fuso nos dois launchers; `mypy --strict` e `ruff` (regras padrão do 0.16) sem achados.
  - **`mysql-migrate.mjs`:** o erro passa a citar a migration que falhou.
  - **Documentação:** `docs/launchers.md` (seção do `run.sh`, garantias por plataforma, interoperabilidade, validações e matriz de paridade completa) e README.
- **Defeitos encontrados nos próprios testes e corrigidos antes do commit:** variável inexistente na verificação do `.env.local`; colunas desalinhadas com acentos (o `printf` conta bytes); estado "exited unhealthy" para container parado; linha `=====` na ajuda; argumentos extras ignorados em silêncio; dono da porta sem a linha de comando quando só há `lsof`.
- **Evidências (execução real em Linux, bash 5.2):**
  - **Fluxo principal:** `doctor` (13 verificações, 1,1 s); `up` em 7 s com health, `/`, `/login` e login do admin; segundo `up` idempotente; `status`; `logs app`/`logs db`; `stop app` (5 processos encerrados, porta livre); `stop` (app + MySQL); restart com banco parado; `up --prod` com build e `next start` em 18 s; app em modo diferente já em execução (aviso, sem duplicar).
  - **Falhas controladas:** porta 3000 ocupada (app na 3001, URLs coerentes no processo, ocupante intacto); porta 3307 ocupada (MySQL na 3308, `.env.local` coerente e permissão 600, ocupante intacto); Docker indisponível (causa e exit 1); `.env.local` ausente; `node_modules` ausente (reinstalado); build com erro de tipo (arquivo, linha e causa); migration inválida (arquivo e erro do MySQL).
  - **Operações destrutivas:** `purge` sem confirmação (exit 2); `purge --confirmar-purge` com backup verificado e restauração com 27 tabelas e 87 linhas idênticas; `repair` sem `--sim` e sem TTY recusado (exit 1, igual ao `run.py`); `repair --sim` concluído em 13 s.
  - **Interface:** menu em pseudo-terminal (opção, opção inválida, EOF), Ctrl+C no menu, em `logs --seguir` e durante o `up` (exit 130; a aplicação continua registrada e o `stop` a encerra).
  - **Interoperabilidade:** app iniciada pelo `run.sh` vista e parada pelo `run.py` e vice-versa.
  - **Segredos:** nenhuma das quatro senhas do `.env.local` aparece nos logs.
  - **Qualidade:** `bash -n` e `shellcheck -S warning` sem achados; Prova de Morte de `kill_port`, `bar.state` e `app_stop`: nenhuma ocorrência. `check:format`, `check:lint` e `check:types` com exit 0; `test` 127/127; `build` com exit 0.
- **Limite do ambiente:** o sandbox não tem Windows; os ramos exclusivos do Git Bash (`netstat`, `tasklist`, `taskkill`, `winpid`, `cmd.exe /c ver`) foram validados só estaticamente. O teste real deve ser feito pelo operador no Windows 11 com `./run.sh doctor`, `./run.sh up`, `./run.sh status` e `./run.sh stop`.

### 15 · Revisão do run_windows.py e eliminação de redundância

- **Status:** 🟢 finalizada · **Commit:** `d92005f` · **Push:** `main -> main` (confirmado; `main...origin/main` sem divergência)
- **Por que o arquivo existia:** criado (commit `71e04a0`) porque o `run.py` da época era só para WSL/Ubuntu; virou uma segunda implementação do launcher no Windows, paralela ao `run.sh`.
- **Divergências encontradas na versão anterior (661 linhas):**
  - recorria ao `npm` sem `pnpm` no PATH e instalava sem `--frozen-lockfile`, fora do Corepack;
  - `stop` com `Stop-Process` só no PID registrado (o servidor Next.js filho ficava vivo — mesma causa raiz corrigida no `run.py` e no `run.sh`);
  - apagava o `.next` a cada subida e reiniciava a aplicação mesmo saudável;
  - estado próprio em `.lyra-run-windows/`, invisível para os outros launchers;
  - sem identificação de donos de portas, MySQL "pronto" só pela porta TCP, prontidão HTTP aceitando qualquer status < 500 e `doctor` que só verificava o PATH.
- **Decisão (opção B, documentada em `docs/launchers.md`):** uma só implementação no Windows (`run.sh`) e o `run_windows.py` como wrapper fino. A opção A manteria duas implementações divergentes para o mesmo sistema; a C quebraria PowerShell/CMD e os documentos que citam `python run_windows.py`.
- **Implementado:**
  - Wrapper só com biblioteca padrão (Python 3.9+) que localiza o `bin\bash.exe` do Git for Windows (`LYRA_GIT_BASH`, `git.exe` do PATH, registro `GitForWindows`, pastas padrão), recusa o `bash.exe` do WSL e valida por `uname -s` (MINGW/MSYS), explicando cada recusa.
  - Delegação ao `run.sh` com `LANG=C.UTF-8` e código de saída repassado (130 no Ctrl+C).
  - Comandos antigos aceitos com aviso (`dev`, `prod`, `start-dev`, `start-prod`, `db-start`, `db-stop`, `stop-app`, `stop-all`, `setup-env`, `install-deps`, `health`); `build` recusado (exit 2) com orientação.
  - Aviso sobre estado legado em `.lyra-run-windows/` (mantido no `.gitignore`, agora comentado).
  - Manual completo (seções 10.5, 11, 25.2, 26 e 27), README e `docs/launchers.md` (decisão, funcionamento, tabela de aliases, validação e matriz de paridade) atualizados.
- **Evidências (execução real em Linux, via delegação ao `bash` do sistema):**
  - ajuda sem terminal e com `--help`; menu em pseudo-terminal com EOF;
  - comando desconhecido e argumento inválido (exit 2 vindo do `run.sh`); `build` recusado (exit 2);
  - alias `dev` com subida completa e verificação ponta a ponta; `health` (doctor saudável); `stop-all` (app e MySQL parados, nenhum processo restante);
  - `status` pelo wrapper e pelo `run.py` mostrando a mesma aplicação;
  - Ctrl+C em `logs --seguir` com exit 130;
  - descoberta do Git Bash com estrutura de pastas simulada: ordem dos candidatos para `cmd\git.exe` e `mingw64\bin\git.exe`, `uname` MINGW aceito e `bash.exe` da pasta do Windows recusado como WSL;
  - `ruff`, `ruff format`, `mypy --strict` (Linux e `--platform win32`) e sintaxe Python 3.9 sem achados;
  - Prova de Morte de `run_windows_`, `app.meta.json`, `install.hash`, `EnvManager` e `Stop-Process`: só restam menções históricas (`TASK_MESTRA_REDIGESIGN_LYRA_METACARE_2026.md`, revisada na tarefa 23) e a descrição da versão anterior em `docs/launchers.md`;
  - `check:format`, `check:lint` e `check:types` com exit 0; `test` 127/127; `build` com exit 0.
- **Limite do ambiente:** sem Windows no sandbox; a execução real de `py run_windows.py doctor` e `py run_windows.py up` no Windows 11 (PowerShell) fica para o operador, junto com o teste do `run.sh` no Git Bash.

### 16 · Migrations e banco

- **Status:** 🟢 finalizada · **Commit:** `f220da8` · **Push:** `main -> main` (confirmado; `main...origin/main` sem divergência)
- **Auditoria das 12 migrations (via `information_schema` do banco real):**
  - Ordenação determinística por código de caractere (os três arquivos `005_*` têm ordem estável); checksum SHA-256 com fins de linha normalizados e recusa de conteúdo divergente.
  - 27 tabelas InnoDB, todas `utf8mb4_unicode_ci`, nenhuma coluna com collation divergente; servidor com `sql_mode` estrito.
  - 22 FKs com regras coerentes (CASCADE para dados do usuário, SET NULL para autoria, RESTRICT para plano de assinatura); nenhuma coluna `*_id` interna sem FK (as restantes são IDs externos do Stripe); nenhum índice redundante.
  - **Inconsistências encontradas:** `user_assessments` e `user_streaks` (migração 008) com ids `VARCHAR(36)` (o resto do schema e a própria `profiles.id` usam `CHAR(36)`), `created_at`/`updated_at` `TIMESTAMP` anuláveis (as únicas 4 de 53 colunas temporais; as demais são `DATETIME NOT NULL`), contadores anuláveis e FKs com nome gerado.
  - **Fuso:** o servidor estava em `SYSTEM` (UTC só por acaso da imagem) e o mysql2 serializava parâmetros `Date` no fuso local do Node.js, divergindo de `NOW()` numa máquina em -03:00.
  - **Bootstrap admin:** cada `db:migrate` regravava o hash da senha (bcrypt com sal novo), alterando a linha a cada subida.
- **Implementado:**
  - **Migração `011_normalize_assessments_streaks.sql`:** tipos alinhados, nulos tratados antes do `NOT NULL` e FKs `fk_user_assessments_profile`/`fk_user_streaks_profile`. Idempotente via `information_schema` + `PREPARE`, porque DDL faz commit implícito.
  - **UTC explícito:** `--default-time-zone=+00:00` no `compose.yaml` e `timezone: 'Z'` no pool da aplicação e no das migrations.
  - **Bootstrap idempotente:** `bcrypt.compare` antes de regravar; o e-mail só é normalizado se diferir.
  - **`pnpm db:backup` e `pnpm db:restore <volume>`**, e a seção "Banco de dados: migrations, fuso e backup" no README.
- **Evidências (execução real):**
  - **Banco existente → upgrade:** backup a frio verificado, aplicação da 011 e contagem de linhas idêntica nas 27 tabelas (só `_lyra_schema_migrations` +1). Colunas e FKs conferidas no `information_schema`; `@@global.time_zone = +00:00` e `NOW() = UTC_TIMESTAMP()`.
  - **Reexecução manual da 011:** exit 0, sem alterações.
  - **Bootstrap:** segunda execução com `updated_at` e hash idênticos; com outra senha imprime "Senha do bootstrap admin atualizada" e volta ao valor do `.env.local` na execução seguinte.
  - **Banco vazio → migrations → aplicação:** MySQL 9.7.2 temporário em volume próprio; 13 migrations aplicadas e segunda execução com 13 "Já aplicada"; `mysqldump --no-data` idêntico ao do banco atualizado (558 linhas; só o GTID difere). `next start` contra ele com `/api/health` = 13 migrations, `/`, `/login` e login do admin; avaliação WHO-5 (score 72) e streak gravados com `created_at` em UTC. Container e volume temporários removidos.
  - **Restore real:** restauração do backup pré-011 (12 migrations, `TIMESTAMP`) seguida de `./run.sh migrate` (011 reaplicada) com dados idênticos ao estado pós-011.
  - **Qualidade:** `docker compose config` válido; `check:format`, `check:lint` e `check:types` com exit 0; `test` 127/127; `build` com exit 0 e zero avisos; `./run.sh up` com verificação ponta a ponta.
- **Observação registrada:** o `initial-data` do Puck (`src/lib/puck/config/initial-data.ts`) ainda usa o formato legado `zones`, convertido em tempo de execução pelo `migrate()` oficial (tarefa 25). Não é dado de banco; fica como débito de código para a tarefa 20.

### 17 · Testes automatizados

- **Status:** 🟢 finalizada · **Commit:** `a3bfb5b` · **Push:** `main -> main` (confirmado; `main...origin/main` sem divergência)
- **Diagnóstico:** 127 testes unitários, sem nenhum teste contra banco real; cobertura de linhas 8,6% (data-api, planos, billing, migrations, motores de IA e de saúde com 0%).
- **Infraestrutura:**
  - Vitest com projetos `unit` (`pnpm test`) e `integration` (`pnpm test:integration`). O setup global cria `<MYSQL_DATABASE>_test` com o root do `.env.local`, aplica as migrations reais e remove o banco ao final; o banco de desenvolvimento e o `process.env` do processo principal não são alterados.
  - `pnpm test:coverage` com `@vitest/coverage-v8` 5.0.3 (par exato do Vitest 5.0.3); `pnpm test:launchers` com `unittest` do Python.
  - `closeMysqlPool()`; regras puras do runner isoladas em `scripts/lib/migrations.mjs`.
- **Defeitos encontrados pelos testes e corrigidos** (prova: 11 testes de data-api e o de assinaturas simultâneas falham no código anterior):
  - **data-api (autorização):** autopromoção a admin via `profiles.role`; troca do e-mail do perfil; upsert com id de outro usuário sobrescrevia a linha dele (inclusive perfis); UPDATE transferia a linha para outro usuário; UPDATE/DELETE sem filtro atingiam todas as linhas; filtros desconhecidos, OR malformado e `not` inválido ignorados em silêncio; objetos como valor viravam `coluna` = valor no SQL; LIMIT/OFFSET sem validação; ações do admin sobre perfis de outros usuários sem efeito; admin podia remover a própria conta. `stringifyObjects` no mysql2 como defesa em profundidade.
  - **Planos:** chamadas simultâneas criavam duas assinaturas ativas; o consumo de cota abria outra conexão dentro da transação e travava o pool (20 consumos simultâneos ficavam presos). Bloqueio por usuário (`users ... FOR UPDATE`) e reuso da conexão.
  - **Motor de score:** métrica ausente contava como 0 (pior nota) em vez de neutra; prontidão com pesos somando 1,1; pesos de configuração agora são proporções; nulos contavam como preenchidos na completude.
  - **WHO-5 e NPS** validam a escala; **doshas** somam exatamente 100% (maior resto); **chat local** reconhece "olá" (limites de palavra Unicode).
  - **Bootstrap admin:** e-mail e senha vazios desativam o bootstrap (o nome padrão tornava esse caminho inalcançável).
- **Testes adicionados:**
  - **Integração (36, MySQL real):** data-api (leitura, escopo, filtros, paginação, escrita, autorização, tipos JSON/booleano/data); planos (assinatura, troca pelo admin, matriz, recursos, cotas e concorrência); webhook Stripe com assinatura HMAC gerada e verificada localmente pela SDK (sem assinatura, forjada, corpo adulterado, ativação, reentrega idempotente, cancelamento → plano gratuito, price id desconhecido registrado como erro). O `checkout.session.completed` consulta a API da Stripe e exige credencial real: fronteira externa, não testada.
  - **Unitários (64 novos):** WHO-5, NPS, aderência, score de longevidade, plano local, contexto astrológico (Lahiri, Lua Cheia e Nova de 2026, sankrantis), motores integrativos (propriedades de escala, nível e resposta a dados), chat local, migração de documentos Puck, senhas bcrypt e regras do runner de migrations.
  - **Launchers (17):** diagnóstico, URLs, versões, `.env.local` com 0600, portas ocupadas, árvore de processos com `setsid`, parser e códigos de saída do `run.py`; tradução de comandos legados, descoberta do Git Bash e delegação do `run_windows.py`.
- **Evidências:** `pnpm test` 191/191; `pnpm test:integration` 36/36; `pnpm test:launchers` 17/17; cobertura combinada de linhas 8,6% → 25,8% (data-api 77,8%, planos 71,9%, motores 91–100%; o restante é UI, coberto pelo QA de navegador nas tarefas 21 e 22). `check:format`, `check:lint` e `check:types` com exit 0; `build` com exit 0 e zero avisos; `./run.sh up` com verificação ponta a ponta; banco de teste removido e banco de desenvolvimento com contagens idênticas.
- **Pendências registradas para tarefas seguintes:** validação Zod nas rotas (JSON inválido em `filters` ainda vira 500) na tarefa 18; sanitizador de rich text do servidor na tarefa 19.

### 18 · APIs e CRUD

- **Status:** 🟢 finalizada · **Commit:** `f8e3460` · **Push:** `main -> main` (confirmado; `main...origin/main` sem divergência)
- **Mapa:** as 32 Route Handlers documentadas em `docs/api.md` (método, rota, autenticação, autorização, entrada, saída, erros e tabelas).
- **Contrato comum:** `src/lib/http/api.ts` (`lerJson`, `respostaDeErro`): JSON malformado e campos inválidos → 400 com os campos; `HttpError` com status próprio; chave duplicada do MySQL → 409; erro de dados → 400; qualquer outra falha → 500 genérico, com o detalhe só no log do servidor (antes, SQL e caminhos internos vazavam na resposta).
- **Defeitos encontrados e corrigidos** (prova: 19 testes de rota falham no código anterior):
  - **Travessia de diretório no storage:** `GET /api/storage/avatars/..%2F..%2F.env.local` devolvia o `.env.local` sem autenticação (reproduzido com curl). Agora `src/lib/storage/local.ts` aceita só buckets conhecidos, segmentos simples e caminho resolvido dentro do bucket → 404.
  - **Upload:** aceitava qualquer conteúdo (SVG/HTML servidos como página) e qualquer caminho. Agora só PNG/JPEG/WebP/GIF identificados pelos bytes, até 5 MB, com o caminho iniciando pelo id do dono; resposta com `nosniff` e CSP `sandbox`.
  - **Login:** mensagens distintas permitiam enumerar e-mails; agora 401 único e bcrypt de custo constante para e-mail inexistente.
  - **Cadastro:** corrida no primeiro usuário e duplicado virando 500; agora transação com bloqueio e 409.
  - **IA:** chave do Gemini ia na URL (vazava em logs); agora no cabeçalho `x-goog-api-key`, com timeout de 20 s e cota consumida antes da chamada externa.
  - **Validação:** todas as rotas com Zod (UUID, cores hexadecimais, ISO 4217, faixas plausíveis de métricas, datas 1800–2200, tipos de atividade); chaves Puck/página inválidas → 404; webhook com assinatura inválida → 400 e falha interna → 5xx (a Stripe reenvia).
  - **Admin:** troca de plano bloqueia a linha do usuário e responde 404 para usuário inexistente.
- **Testes:** `src/app/api/{auth-storage,dados-admin,funcoes}.integration.test.ts` (29 testes) chamam as Route Handlers reais contra o MySQL de teste, cobrindo sucesso, validação, não autenticado, sem permissão, inexistente e payload inválido, com o CRUD confirmado direto no banco.
- **Evidências:** `pnpm test` 191/191; `pnpm test:integration` 65/65; `check:format`, `check:lint` e `check:types` com exit 0; `build` com exit 0 e zero avisos. Smoke HTTP no servidor real: login admin 200, upload PNG 200 servido como `image/png` com `nosniff`, login errado 401, travessia 404 e filtros malformados 400.
- **Encaminhado:** `ui-config` sem chamador no cliente (tarefa 20).

### 19 · Segurança

- **Status:** 🟢 finalizada · **Commit:** `2b6b73a` · **Push:** `beed629..2b6b73a main -> main` (confirmado)
- **Documentação:** novo `docs/seguranca.md` com o modelo completo (sessão, rate limiting, CSRF, cabeçalhos, XSS, upload, dados de saúde, Sentry, Stripe e dependências); `docs/api.md` e `.env.example` atualizados.
- **Vulnerabilidades encontradas e corrigidas:**
  - **XSS no SSR do rich text do Puck:** o sanitizador do servidor usava regex e `<a href='x" onmouseover="alert(1)'>` virava atributo de evento; `java&#115;cript:` também passava. Substituído pelo parse5 8.0.1 (parser HTML5 WHATWG) com reconstrução por lista de permissões e escape; a mesma função roda no servidor e no navegador (antes DOMParser × regex, com risco de divergência na hidratação). 6 dos 10 testes novos falham no código anterior.
  - **JWT exposto ao JavaScript:** `/api/auth/session`, login e cadastro devolviam o `access_token`, anulando o `httpOnly`. Removido do tipo `AppSession` (prova de morte: `grep access_token` sem ocorrências no código).
  - **Papel desatualizado na sessão:** o papel vinha do JWT (até 7 dias); agora papel e e-mail vêm do banco a cada requisição e conta removida perde a sessão. Os 2 testes falham no `server-auth.ts` anterior.
  - **Sem limite de tentativas:** novo `src/lib/security/rate-limit.ts` com janela fixa no MySQL (migration `012_add_rate_limit_buckets.sql`, chaves SHA-256, upsert e leitura na mesma transação). Login: 10 falhas por conta (não depende de IP) e 50 tentativas por IP em 15 min; cadastro: 10 por hora por IP; 429 com `Retry-After`.
  - **CSRF:** `src/proxy.ts` (convenção do Next.js 16) recusa escrita em `/api/*` com `Sec-Fetch-Site` cross-site/same-site ou `Origin` de outra origem; webhook da Stripe isento (assinatura própria).
  - **Cabeçalhos ausentes:** CSP (`frame-ancestors`, `object-src`, `base-uri`, `form-action`), `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP, HSTS em produção e `X-Powered-By` desligado. Encontrado no smoke: a CSP global substituía a CSP `sandbox` de `/api/storage`; o caminho foi excluído da regra global e a CSP da rota voltou a valer.
  - **Dados de saúde em logs:** o log de erro gravava o objeto do mysql2 com o SQL interpolado; `src/lib/observability/log-seguro.ts` registra só tipo, código e pilha.
  - **Stripe:** URLs de retorno não usam mais o `Host` da requisição em produção.
  - **Dependências:** `pnpm update --depth Infinity --no-save` e `overrides` restritos às faixas afetadas (brace-expansion, fast-uri, browserslist, baseline-browser-mapping, source-map-js): `pnpm audit` de 75 avisos (1 crítico, 31 altos) para 1; `pnpm audit --prod` sem vulnerabilidades. O restante, `braces` (GHSA-vfj7-8cjw-p6xm), não tem versão corrigida publicada e só chega por ferramentas de desenvolvimento.
  - **Texto do BYOK:** dizia "On-Device" e "fica apenas no seu navegador", mas a chave vai ao servidor a cada pergunta; corrigido, com placeholder de chave do Gemini.
  - **README:** a tabela de scripts tinha sido partida em duas na tarefa 18; reunificada.
- **Auditado sem alteração:** cookies (`httpOnly`, `SameSite=Lax`, `Secure` em produção), Sentry (opcional sem DSN, `dataCollection` sem PII, Replay mascarado), webhook da Stripe (assinatura e idempotência já cobertas na tarefa 17), SQL injection (consultas parametrizadas e identificadores validados na data-api), SSRF (somente URL fixa do Gemini) e open redirect (nenhum redirecionamento com destino vindo do cliente).
- **Testes:** `src/lib/puck/sanitization/rich-text.test.ts` (10), `src/lib/security/csrf.test.ts` (5), `src/lib/observability/log-seguro.test.ts` (3), teste de produção em `src/lib/billing/config.test.ts` e `src/app/api/seguranca.integration.test.ts` (8: bloqueio por conta com `Retry-After`, zeragem após acerto, limite por IP, limite de cadastro, 25 registros simultâneos sem perda, sessão sem JWT, admin rebaixado e conta removida).
- **Evidências:** `pnpm test` 210/210; `pnpm test:integration` 73/73; `pnpm test:launchers` 17/17; `check:format`, `check:lint` e `check:types` com exit 0; `build` com exit 0 e zero avisos (`ƒ Proxy (Middleware)` registrado). Smoke real: cabeçalhos em `/login`, HSTS no `pnpm start`, POST cross-site 403 e same-origin 200, 10 logins errados → 401 e o 11º → 429 com `Retry-After: 897`, `/api/storage` com `default-src 'none'; sandbox`, editor Puck sem erros de console, `./run.sh up` com 14 migrations e login do admin.
- **Encaminhado:** `maximumScale: 1` do viewport (acessibilidade) para a tarefa 22.

### 20 · Performance

- **Status:** 🟢 finalizada · **Commit:** `616aa53` · **Push:** `c5125ec..616aa53 main -> main` (confirmado)
- **Método:** `pnpm build` + `pnpm start`, Chromium (Playwright) em contexto limpo e sem cache, somando os scripts transferidos (comprimidos); análise dos pacotes com `next experimental-analyze` e assinaturas dos chunks. Documento: `docs/performance.md`.
- **Gargalos encontrados e corrigidos:**
  - **Puck em todas as páginas (~307 KB):** cada página importava o runtime do Puck para renderizar o documento publicado da rota, mesmo vazio. O `PuckClientRenderer` agora só carrega o novo `PuckDocumentView` (via `next/dynamic`) quando há blocos (`src/lib/puck/conteudo.ts`). Defeito visual encontrado junto: com o documento vazio, o root exibia ao usuário final um cabeçalho técnico ("root app shell", "chave: patient-portal", "fonte: manual"); capturas antes e depois em `/goals`. Com um bloco publicado de teste o bloco aparece sem erros de console; o documento foi restaurado em seguida (conteúdo idêntico ao original).
  - **Sentry sem DSN (~157 KB):** o SDK e o Replay eram baixados mesmo sem `NEXT_PUBLIC_SENTRY_DSN`. `instrumentation-client.ts` e `global-error.tsx` passaram a importar o SDK dinamicamente, só com DSN.
  - **Zod nas páginas públicas (~90 KB):** o cliente revalidava a configuração que o servidor já entrega validada, e os padrões dividiam módulo com os schemas. Padrões movidos para `modules/lyra-customaze-ui-ux/src/site-page-config/defaults.ts` (comparados com os anteriores, idênticos nas três páginas); importações só de tipo marcadas com `import type`.
  - **Landing e dashboard juntos em `/`:** os dois são carregados conforme a sessão (`next/dynamic`); o visitante não baixa o dashboard nem o Recharts.
  - **Requisições duplicadas:** `src/lib/http/requisicao-compartilhada.ts` (chamadas simultâneas com a mesma chave reaproveitam a que está em andamento, sem cache além do voo) aplicado à configuração das páginas e aos recursos da conta; `/api/public/page-config/app` caiu de 4 para 1 chamada por página e `/chat` de 12 para 8 chamadas de API.
  - **Código e assets mortos (provas de morte com `grep`):** rotas `/api/admin/ui-config` e `/api/public/ui-config` sem chamador desde o commit `6774c18` (março de 2026; a tabela `ui_config` foi mantida para não descartar dados); 5 SVGs do create-next-app; protótipo `lyra-ui-preview.html` (carregava Tailwind e `lucide@latest` de CDN na origem da aplicação) e `mockup.png` (636 KB) movidos de `public/` para `docs/design/`; 7 classes de componente e 2 utilities do `globals.css` sem uso; `getHttpErrorStatus` duplicado do `statusDeErro` (testes migrados para `src/lib/http/api.test.ts`).
  - **Documentos iniciais do Puck:** reescritos em slots nativos; um teste temporário provou que a migração dos documentos antigos produz exatamente os novos nos 22 documentos, e os testes de migração passaram a gerar o formato legado a partir dos nativos.
- **Resultado (JS da página):** `/` visitante 817 → 235 KB; `/login` 382 → 189 KB; `/chat` 991 → 255 KB; `/plan` 1000 → 241 KB; `/goals` 1000 → 350 KB; `/profile` 991 → 517 KB; `/appointments` 1043 → 394 KB; `/admin/dashboard` 999 → 243 KB; `/admin/puck` 1132 → 590 KB. O prefetch das rotas do menu (padrão do `<Link>`) continua após o carregamento.
- **Verificado sem alteração:** fontes (`next/font` já serve da própria origem, subset latin), índices das consultas por usuário e pool único de conexões.
- **Evidências:** `pnpm test` 241/241; `pnpm test:integration` 73/73; `check:format`, `check:lint` e `check:types` com exit 0; `build` com exit 0 e zero avisos; console sem erros em `/`, `/login`, `/goals`, `/chat`, `/profile` e `/admin/puck` (modo dev); `./run.sh up` com verificação ponta a ponta.
- **Investigado e registrado (aviso de terceiro):** em `/appointments` (modo dev) o React avisa "outdated JSX transform". Causa: `uncontrollable` 7.2.1, dependência do `react-big-calendar` 1.20.0 (última versão, que exige `^7.2.1`), publicado com o transform clássico (`__self`). O aviso só existe em desenvolvimento e vem de pacote de terceiro; não há versão compatível que o elimine.

### 21 · QA funcional com navegador

- **Status:** 🟢 finalizada · **Commit:** `ce81722` · **Push:** `e2dbaaa..ce81722 main -> main` (confirmado)
- **Ambiente:** `pnpm build` + `pnpm start` (porta 3100) com MySQL 9.7.2; Chromium via Playwright, 1440×900.
- **Health check real:** processo `next-server` ativo, porta respondendo, `/api/health` com `status: ok`, `database: ok` e 14 migrations (sem segredos na resposta), página principal renderizada e login funcional.
- **Navegação:** 4 rotas como visitante (`/goals` e `/admin/dashboard` redirecionam para `/login`) e 21 como administrador, todas sem erro de console, sem resposta 4xx/5xx e com capturas.
- **Fluxos percorridos clicando na interface (todos aprovados):**
  - **Visitante:** botão para a seção de planos e CTA para o login.
  - **Cadastro e onboarding:** cadastro pela tela de login, depois onboarding em 5 passos (data por digitação, select de gênero, slider de atividade, checkbox de meta, consentimento) e dashboard. O MySQL confirmou o perfil completo (UTF-8 correto em "São Paulo"), o plano `free` e a assinatura ativa.
  - **Login e navegação do administrador:**
    - Login com "Lembrar-me": cookie `httpOnly` de 7 dias.
    - Cartão de harmonia com valor calculado.
    - Busca global (Ctrl K) até Metas.
  - **Metas:** criação e atualização de progresso no modal.
  - **Agenda:** novo profissional e consulta agendada (select, data e horário).
  - **Chat:** envio de mensagem com resposta 200.
  - **Plano de IA:** geração do plano.
  - **Perfil:** "Perfil atualizado com sucesso!".
  - **Dispositivos:** estado sem Bluetooth explicado.
  - **Monitoramento:** controles presentes.
  - **Sair:** menu do usuário e "Sair" removem o cookie, e as rotas protegidas voltam ao login.
  - **Área administrativa:**
    - Usuários: busca, ordenação, paginação e troca de plano no modal (PATCH 200 e evento de auditoria).
    - Matriz de planos salva.
    - Insight de IA e hábito sugerido criados nas abas de Conteúdo.
    - Configuração de IA salva e "Escanear Rede".
    - Exportação CSV de usuários baixada.
    - Saúde dos dados.
    - Construtor de UI e editor Puck: "Salvar rascunho".
  - Cada gravação foi confirmada direto no MySQL (metas, consulta, profissional, insight, hábito, assinatura e perfil).
- **Defeitos encontrados e corrigidos:**
  - **Valor fixo no dashboard:** "Harmonia atual" mostrava 94.2 para qualquer pessoa. O novo `HarmoniaAtualCard` exibe o ICQ real do `coherence-engine` (63/100 na sessão testada), com estados de carregamento e de plano sem acesso. A nota padrão deixou de afirmar "recuperação alta" sem dados. Prova de morte: `grep 94.2` só encontra o comentário histórico.
  - **Estouro horizontal:** em 11 páginas a coluna principal (`flex-1` sem `min-w-0`) crescia até a largura do conteúdo. Em `/admin/content` isso cortava a aba "Insights de IA", a prévia e o cabeçalho (capturas antes e depois). Causa encontrada medindo o elemento raiz do estouro; corrigida com `min-w-0`, como já fazia o `AppShell`.
- **Limpeza:** os dados de QA (contas `qa-*`, metas, profissionais, consulta, insight, hábito, rascunho de página, janelas de rate limit e local de nascimento do admin) foram removidos do banco de desenvolvimento ao final.
- **Evidências:** `pnpm test` 241/241; `pnpm test:integration` 73/73; `check:format`, `check:lint` e `check:types` com exit 0; `build` com exit 0 e zero avisos.
- **Encaminhado:**
  - **Tarefa 22 (acessibilidade):** botões só com ícone sem nome acessível; duas `<h1>` por página; `/instruments` sem `<h1>`; navegação da landing feita com botões.
  - **Tarefa 27 (redesign):**
    - "Atualizado por" no construtor de UI mostra o UUID do administrador.
    - Muitas páginas repetem a estrutura de Sidebar e Header em vez de usar o `AppShell`.
  - **Para decisão do usuário:** `/instruments` é uma página de demonstração herdada do template (lista a tabela `instruments` em JSON). Está ligada ao documento Puck `instruments`, então não foi removida.

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

### 25 · Correção crítica: editor Puck quebra ao abrir

- **Status:** 🟢 finalizada · **Commit:** `2fe2d05` · **Push:** `e491a10..2fe2d05 main -> main` (confirmado)
- **Origem:** encontrada no QA da tarefa 09. `/admin/puck` caía na tela de erro global com React #185. O mesmo erro ocorre no commit `7cbf0f3`, anterior à migração do Tailwind, o que comprova que o defeito é pré-existente.
- **Diagnóstico (modo dev, mensagem completa):** "Maximum update depth exceeded" no `refSetter` do `DraggableComponent` do Puck durante desmontagens sucessivas, acompanhado do aviso "DropZones have been deprecated in favor of slot fields".
- **Causa raiz:** os componentes de layout (`section-container`, `stack-container`, `fixed-columns`, `fluid-grid`) declaram `content` e as colunas como `type: 'slot'`, mas os documentos guardavam os filhos no formato legado `zones` (`"<id>:content"`). O Puck tratava a mesma área como DropZone e como slot e entrava em laço de montagem e desmontagem.
- **Implementado:**
  - `aplicarResolveAllDataLyra` aplica a migração oficial `migrate(data, config)` do Puck 0.23 antes do `resolveAllData`. O caminho é usado pelo editor, pelos previews e pelo renderizador público, e cobre também documentos legados já persistidos em outros ambientes.
  - Defeito encadeado corrigido: `normalizarDadosPuck` copiava as `zones` do documento de fallback quando o documento lido não as tinha. Isso misturava blocos de outro documento e reintroduzia DropZones logo após a migração.
  - Novo `src/lib/puck/dynamic/resolve-data.test.ts` com 25 testes: cada um dos documentos fica sem zonas e preserva a contagem total de blocos; os filhos vão para o slot correto e na mesma ordem; a migração é idempotente; e há um teste de regressão da normalização, que falha contra o código anterior (comprovado com `git stash`).
- **Evidências:**
  - Editor em dev e em produção com zero erros, zero avisos de DropZone e canvas (iframe) renderizando os blocos aninhados (`lyra-heading-block-editorial`, `lyra-fixed-columns-landing`).
  - Painel do slot visível no editor (`isEditing`).
  - CRUD real: "Salvar rascunho" exibe "Rascunho do Puck salvo com sucesso." e o MySQL registra `landing-home` com 0 zonas e 6 filhos no slot `content`.
  - `check:format`, `check:lint` e `check:types` com exit 0; `test` 112/112; `build` com exit 0 e zero avisos; capturas das 14 páginas sem erros de console.
- **Encaminhado:** o mesmo QA revelou que o `agenda.css` da tarefa 09 era pré-carregado em todas as páginas pelo prefetch de `/appointments`; isso é tratado na tarefa 26. Os dados iniciais em `initial-data.ts` continuam no formato legado e são convertidos na carga pela migração oficial; a reescrita para slots nativos fica para a tarefa 16 (migrations e dados).

### 26 · Correção: CSS da agenda pré-carregado em todas as páginas

- **Status:** 🟢 finalizada · **Commit:** `de0308a` · **Push:** `2ec8679..de0308a main -> main` (confirmado)
- **Origem:** regressão da tarefa 09, encontrada no QA da tarefa 25. Chrome registrava "preloaded using link preload but not used" em `/`, `/goals`, `/profile` e demais páginas autenticadas.
- **Causa raiz:** o `agenda.css`, criado na tarefa 09, era importado estaticamente pela rota `/appointments`. O prefetch dessa rota pelos links da navegação baixava e pré-carregava o CSS em todas as páginas, sem usá-lo.
- **Implementado:** o componente `Agenda` (react-big-calendar + `agenda.css`) passou a ser carregado com `next/dynamic` (`ssr: false`), com skeleton da mesma altura para não deslocar o layout. O tipo genérico é preservado pela expressão de instanciação `Agenda<Appointment>`, sem casts. O JS e o CSS do calendário agora só são baixados quando o calendário é exibido.
- **Evidências:**
  - Zero avisos ou erros de console em `/`, `/goals`, `/profile`, `/chat`, `/admin/dashboard` e `/admin/puck`.
  - O chunk com `.rbc-btn` é requisitado somente em `/appointments`, onde o calendário renderiza com 35 células, em pt-BR e com as personalizações Lyra aplicadas (raio de 24 px, botão ativo com gradiente).
  - `check:format`, `check:lint` e `check:types` com exit 0; `test` 112/112; `build` com exit 0 e zero avisos.
