# Lyra MetaCare

Aplicação Next.js 15 para saúde preventiva com persistência em MySQL, autenticação local, storage local, motores de cálculo locais e correlação entre biomarcadores e contexto astrológico védico computacional.

## Estado atual auditado

Esta base foi migrada estruturalmente para MySQL.

Itens comprovados no código:

- Autenticação local com `bcryptjs`, JWT assinado com `jose` e cookie HTTP-only.
- CRUD real para `profiles`, `daily_metrics`, `goals`, `habits`, `suggested_habits`, `ai_tips`, `ai_config`, `ai_plans`, `professionals`, `appointments` e `instruments`.
- Camada cliente compatível com o frontend existente via `src/integrations/mysql/client.ts`.
- API de dados em `src/app/api/data/[table]/route.ts`.
- RPC local em `src/app/api/rpc/get-data-health-metrics/route.ts`.
- Storage local servido por `src/app/api/storage`.
- Geração local de score, plano e respostas do assistente via rotas Next.js.
- Engine astrológica local em `src/lib/astrology/engine.ts` com longitude sideral ajustada por ayanamsha de Lahiri aproximado, cálculo de nakshatra, tithi e paksha.

Itens que o repositório ainda não comprova de ponta a ponta neste ambiente:

- HealthKit e Google Health Connect nativos não podem ser validados integralmente neste workspace porque o projeto atual não possui shell iOS/Android com Capacitor, React Native ou código nativo embarcado.
- O módulo `src/lib/health/healthConnect.ts` falha de forma explícita quando o ambiente não fornece ponte nativa compatível, em vez de simular dados.
- O cálculo de Dasha não é fechado com precisão profissional porque o schema atual não armazena timestamp de nascimento em UTC nem timezone de nascimento, o que é requisito para cálculo rigoroso.

## Arquitetura vigente

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

### Backend local

- Next.js Route Handlers em runtime `nodejs`
- MySQL 8
- `mysql2/promise`
- JWT local com `jose`
- Hash de senha com `bcryptjs`

### Motores locais

- `src/lib/ai/score-engine.ts`
- `src/lib/ai/plan-engine.ts`
- `src/lib/ai/chat-engine.ts`
- `src/lib/astrology/engine.ts`

## Banco de dados MySQL

O schema inicial está em [mysql/init/001_schema.sql](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/mysql/init/001_schema.sql).

Tabelas persistidas:

- `users`
- `profiles`
- `daily_metrics`
- `goals`
- `habits`
- `suggested_habits`
- `ai_tips`
- `ai_config`
- `ai_plans`
- `professionals`
- `appointments`
- `instruments`

## CRUDs disponíveis

Os CRUDs são servidos pela rota [src/app/api/data/[table]/route.ts](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/app/api/data/[table]/route.ts).

Operações implementadas:

- `SELECT` com filtros `eq`, `gte`, `lte`, `not`, `or`
- `COUNT`
- `HEAD`
- `single`
- `maybeSingle`
- `range`
- `INSERT`
- `UPDATE`
- `DELETE`
- `UPSERT`

## Autenticação

Rotas implementadas:

- [src/app/api/auth/register/route.ts](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/app/api/auth/register/route.ts)
- [src/app/api/auth/login/route.ts](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/app/api/auth/login/route.ts)
- [src/app/api/auth/logout/route.ts](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/app/api/auth/logout/route.ts)
- [src/app/api/auth/session/route.ts](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/app/api/auth/session/route.ts)

Fluxo:

1. Cadastro grava `users` e `profiles`.
2. Login valida senha com `bcryptjs`.
3. Sessão é assinada com `AUTH_SECRET`.
4. Cookie `lyra_metacare_session` é gravado no navegador.

## Storage local

Rotas:

- [src/app/api/storage/upload/route.ts](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/app/api/storage/upload/route.ts)
- [src/app/api/storage/[bucket]/[...filePath]/route.ts](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/app/api/storage/[bucket]/[...filePath]/route.ts)

Os uploads são persistidos localmente no diretório `storage/` da aplicação e servidos pela própria API.

## IA local

### Score

A rota [src/app/api/functions/calculate-longevity-score/route.ts](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/app/api/functions/calculate-longevity-score/route.ts) lê a última métrica do usuário e os pesos configurados em `ai_config`.

### Plano

A rota [src/app/api/functions/generate-ai-plan/route.ts](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/app/api/functions/generate-ai-plan/route.ts):

- autentica o usuário;
- lê perfil e metas no MySQL;
- lê a última linha de `daily_metrics`;
- mescla métricas vivas do cliente com o histórico persistido;
- calcula o contexto astrológico atual;
- persiste o plano em `ai_plans`.

### Assistente

A rota [src/app/api/functions/ask-ai-assistant/route.ts](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/app/api/functions/ask-ai-assistant/route.ts) responde localmente, sem enviar dados sensíveis para provedores externos.

## Astrologia védica computacional

Engine principal:

- [src/lib/astrology/engine.ts](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/lib/astrology/engine.ts)

O que ela entrega hoje:

- longitude sideral do Sol e da Lua;
- ayanamsha de Lahiri aproximado;
- signo sideral;
- nakshatra;
- tithi;
- paksha;
- recomendações de impacto em sono, energia e estresse.

Limite técnico atual:

- sem timezone de nascimento persistido, não é possível afirmar Dasha com precisão profissional auditável.

## Integrações de saúde

Arquivo principal:

- [src/lib/health/healthConnect.ts](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/lib/health/healthConnect.ts)

Comportamento real:

- tenta usar ponte nativa quando o ambiente expõe `window.plugins.health`;
- solicita autorização para `heart_rate`, `sleep`, `blood_glucose` e `weight`;
- se o ambiente não expõe ponte nativa e não suporta o fluxo necessário, interrompe com erro explícito;
- não injeta dados simulados.

Status honesto:

- sem shell nativo no repositório, esta integração não está operacional de ponta a ponta no navegador puro.

## Ambiente local

### Requisitos

- Node.js 20+
- npm 10+ ou pnpm 9+
- Docker e Docker Compose

### Subir o MySQL

O `compose.yaml` usa a porta de host `3307` por padrão para evitar conflito com instalações locais já ocupando `3306`.

```bash
cd /mnt/c/temp/lyra-metacare/Lyra-MetaCare
docker compose up -d mysql
```

### Variáveis obrigatórias

Exemplo de sessão local:

```bash
cd /mnt/c/temp/lyra-metacare/Lyra-MetaCare
export MYSQL_HOST=127.0.0.1
export MYSQL_PORT=3307
export MYSQL_USER=lyra
export MYSQL_PASSWORD=lyra_mysql_local_2026
export MYSQL_DATABASE=lyra_metacare
export AUTH_SECRET="$(openssl rand -hex 32)"
```

### Instalar dependências

```bash
cd /mnt/c/temp/lyra-metacare/Lyra-MetaCare
pnpm install
```

### Rodar aplicação

```bash
cd /mnt/c/temp/lyra-metacare/Lyra-MetaCare
npm run dev
```

## Checagens obrigatórias

```bash
cd /mnt/c/temp/lyra-metacare/Lyra-MetaCare
npm run fix:format
npm run fix:lint
npm run check:lint
npm run check:format
npm run check:types
```

## Arquivos centrais da migração MySQL

- [compose.yaml](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/compose.yaml)
- [package.json](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/package.json)
- [src/lib/mysql/pool.ts](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/lib/mysql/pool.ts)
- [src/lib/mysql/data-api.ts](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/lib/mysql/data-api.ts)
- [src/lib/auth/session.ts](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/lib/auth/session.ts)
- [src/context/AuthContext.tsx](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/context/AuthContext.tsx)
- [src/integrations/mysql/client.ts](/mnt/c/temp/lyra-metacare/Lyra-MetaCare/src/integrations/mysql/client.ts)

## Diretriz operacional

Se houver divergência entre discurso e código, a referência válida é o código implementado e testado. Este `README` foi reescrito para refletir somente o que o repositório atual comprova ou o que ele ainda não consegue comprovar de forma auditável.
