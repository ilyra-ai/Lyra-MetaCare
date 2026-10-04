# Baseline forense · 2026-10-04

Fotografia técnica real do repositório `ilyra-ai/Lyra-MetaCare` (branch `main`, commit de partida `db86930`) antes das modificações da Instrução Mestra (`CLAUDE.md`). Todos os resultados abaixo foram obtidos por execução real no sandbox Linux (Ubuntu 24.04, x86_64).

## Ambiente

| Ferramenta     | Versão                       |
| -------------- | ---------------------------- |
| Node.js        | 22.22.0                      |
| npm            | 10.9.4                       |
| pnpm           | 10.28.0                      |
| Corepack       | 0.34.0                       |
| Python         | 3.13.16                      |
| Docker         | 29.8.2                       |
| Docker Compose | v5.5.1                       |
| Git            | 2.43.0                       |
| MySQL (imagem) | 8.0.45 (`mysql:8.0.45`)      |
| Next.js        | 15.3.4                       |
| React          | 19.2.5 (declarado `^19.0.0`) |
| Tailwind CSS   | 3.4.19                       |
| TypeScript     | 5.9.3                        |

## Quality gates

| Comando             | Exit | Resultado                                             |
| ------------------- | ---- | ----------------------------------------------------- |
| `pnpm install`      | 0    | Instalação concluída com pnpm 10.28.0                 |
| `pnpm check:lint`   | 0    | ESLint 8.57.1 sem erros nem warnings                  |
| `pnpm check:format` | 0    | Prettier sem divergências                             |
| `pnpm check:types`  | 0    | `tsc --noEmit` sem erros                              |
| `pnpm test`         | 0    | Vitest 2.1.9: 12 arquivos, 82 testes aprovados        |
| `pnpm build`        | 0    | Next.js 15.3.4: 49 páginas geradas, 31 Route Handlers |

## Runtime

| Verificação                                      | Resultado                                                                                                                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docker compose config`                          | válido                                                                                                                                                                   |
| `docker compose up -d` + healthcheck             | `healthy`                                                                                                                                                                |
| `pnpm db:migrate` em banco novo (Compose)        | **FALHA** em `005_add_ui_config.sql`: `Referencing column 'updated_by' and referenced column 'id' in foreign key constraint 'fk_ui_config_updated_by' are incompatible.` |
| `pnpm start` + `GET /`, `/login`                 | HTTP 200 (após correção das migrations)                                                                                                                                  |
| `GET /api/public/plans`, `/api/public/ui-config` | HTTP 200 com dados do MySQL                                                                                                                                              |
| `POST /api/auth/login` com admin bootstrap       | HTTP 200, cookie de sessão emitido e `/api/auth/session` retornando o usuário `admin`                                                                                    |

### Erro 1 · Migrations quebradas em banco novo criado pelo Compose

- **Causa raiz:** as tabelas das migrations `001` a `005_add_site_page_configs` não declaram collation e herdam o padrão do servidor. O `compose.yaml` não definia `--collation-server`, então o MySQL 8 usava `utf8mb4_0900_ai_ci`, enquanto `ui_config`, `puck_documents` e `user_assessments` declaram `utf8mb4_unicode_ci`. Chaves estrangeiras `CHAR(36)` exigem a mesma collation nos dois lados. O `run.py` iniciava o MySQL com `--collation-server=utf8mb4_unicode_ci`, o que mascarava o defeito apenas nesse caminho; `pnpm db:start`, `run.sh` e qualquer servidor com padrão diferente falhavam.
- **Correção:** nova migration `005_add_tables_unicode_collation.sql` (ordenada entre `005_add_site_page_configs` e `005_add_ui_config`) que alinha banco e tabelas a `utf8mb4_unicode_ci`; `compose.yaml` passou a iniciar o MySQL com `--character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci`; o runner `scripts/mysql-migrate.mjs` passou a ordenar as migrations por código de caractere, sem depender de locale/ICU.
- **Evidência:** banco com padrão `utf8mb4_0900_ai_ci` parcialmente migrado → `pnpm db:migrate` aplicou as 7 migrations restantes (exit 0); segunda execução apenas "Já aplicada" (idempotente); banco novo com o Compose corrigido → 12 migrations aplicadas, todas as tabelas em `utf8mb4_unicode_ci`.

## Warnings do MySQL 8.0.45 (tratados nas tarefas 11 e 12)

- `'default_authentication_plugin' is deprecated` e `mysql_native_password is deprecated`.
- `The syntax '--skip-host-cache' is deprecated` (vem do entrypoint da imagem 8.0).
- Credenciais fixas no `compose.yaml` (`MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD` e senha no healthcheck).

## Dependências desatualizadas (`pnpm outdated`)

Majors pendentes: `next` 15.3.4 → 16.3.8, `eslint` 8.57.1 → 10.12.0, `eslint-config-next` 15 → 16, `typescript` 5.9.3 → 7.0.2, `vitest` 2.1.9 → 5.0.3, `tailwindcss` 3.4.19 → 4.3.3, `zod` 3 → 4, `recharts` 2 → 3, `stripe` 20 → 23, `@sentry/nextjs` 10 → 11, `lucide-react` 0.511 → 1.52, `date-fns` 3 → 4, `react-day-picker` 8 → 10, `react-resizable-panels` 3 → 4, `vite-tsconfig-paths` 5 → 6, `@types/node` 20 → 26. Minors/patches: todas as bibliotecas Radix, `react`/`react-dom` 19.3.0, `mysql2` 3.24.5, `react-hook-form` 7.89.0, `@puckeditor/core` 0.23.0, `monaco-editor` 0.57.0, `shadcn` 4.21.1, `prettier` 3.9.9 e demais.

## Vulnerabilidades (`pnpm audit`)

146 avisos: 4 críticos, 50 altos, 80 moderados e 12 baixos. Origens diretas: `next` (crítico/alto/moderado/baixo), `vitest` (crítico), `@puckeditor/core` (via `@tiptap/core`, `uuid`), `eslint`/`eslint-config-next` (`brace-expansion`, `braces`, `js-yaml`), `@dyad-sh/nextjs-webpack-component-tagger` (`browserslist`, `fast-uri`), `shadcn` (`hono`, `ip-address`, `qs`, `body-parser`), `postcss`, `vite-tsconfig-paths` (`vite`, `esbuild`), `mysql2`, `@sentry/nextjs` (`@opentelemetry/core`), `monaco-editor` (`dompurify`), `react-big-calendar` (`moment`) e `tailwindcss` (`postcss-selector-parser`).

## Outras constatações para as próximas tarefas

- Três lockfiles concorrentes: `pnpm-lock.yaml`, `bun.lock` e `bun` declarado como dependência de runtime (o `package-lock.json` citado na instrução não existe no repositório).
- Artefatos temporários versionados apesar do `.gitignore`: 2 arquivos em `.logs/` e 52 em `.playwright-cli/`.
- Senhas padrão fixas nos launchers (`admin123`, `lyra_mysql_local_2026`, `lyra_mysql_root_2026`).
- Não existe `.env.example`.
- `/api/auth/session` devolve o `access_token` JWT no corpo da resposta (avaliado na tarefa 19).
