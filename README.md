<div align="center">

# Lyra MetaCare

**Plataforma premium de bem-estar e longevidade que une biometria de wearables, inteligência artificial e sabedoria integrativa — com privacidade no centro.**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-087EA4?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-9.7_LTS-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Node.js](https://img.shields.io/badge/Node.js-24_LTS-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Billing-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com/)
[![Vitest](https://img.shields.io/badge/Vitest-112_testes-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Licença](https://img.shields.io/badge/Licença-MIT-22C55E?style=flat-square)](#-licença)

[Visão geral](#-visão-geral) · [Novidades 2026](#-novidades-2026) · [Recursos](#-recursos) · [Stack](#-stack-tecnológica) · [Começando](#-começando) · [Arquitetura](#-arquitetura) · [Testes](#-testes--qualidade) · [Segurança](#-segurança--privacidade)

</div>

> [!IMPORTANT]
> **O Lyra MetaCare não é um aplicativo de clínica médica.** É uma plataforma de **bem-estar, longevidade e autoconhecimento** que combina dados fisiológicos reais, inteligência artificial e uma camada de sabedoria integrativa (astrologia moderna e tradição védica). Nenhuma informação aqui substitui avaliação profissional de saúde.

---

## 📌 Visão geral

O **Lyra MetaCare** transforma dados de wearables, hábitos e contexto pessoal em **orientação acionável de longevidade**. A plataforma cruza biometria contínua (HRV, sono, glicose, VO₂max, oxigenação, entre dezenas de métricas) com motores determinísticos próprios e com uma camada de IA configurável, entregando ao usuário um painel claro, premium e calculado — sempre que possível — **no próprio dispositivo**.

|                          |                                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 🎯 **Proposta de valor** | Converter sinais fisiológicos dispersos em ações diárias priorizadas, com idade biológica, detecção precoce e saúde da mulher. |
| 🧠 **Inteligência**      | Motores isomórficos determinísticos (testáveis) + IA configurável por documentos/skills, com opção de modelo externo via BYOK. |
| 🔒 **Privacidade**       | Modo Privacidade real: índices calculados no navegador; conversas processadas apenas pelo motor local quando ativado.          |
| 🎨 **Experiência**       | Design system único 2026 (tema claro, glassmorphism, gradientes suaves), 100% responsivo e em **pt-BR**.                       |
| ⚙️ **Operação**          | Subida local de ponta a ponta com um único comando (`run.py` no WSL2, `run.sh` no Git Bash): banco, migrações e aplicação.     |

---

## ✨ Novidades 2026

Cinco melhorias baseadas em tendências reais de 2026, **todas implementadas de forma determinística e executadas on-device** (motores isomórficos cobertos por testes):

| Recurso                                   | O que entrega                                                                                                                                                                            |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🤖 **Assistente Agêntico Proativo**       | Em vez de só responder, a Lyra observa os sinais do dia e gera **ações priorizadas e categorizadas** (recuperação, movimento, sono, ciclo, longevidade…).                                |
| 🩺 **Detecção Precoce Multimodal**        | Cruza desvios da linha de base pessoal (HRV, FC de repouso, temperatura, SpO₂, respiração) para sinalizar padrões — ex.: resposta imunológica precoce — com recomendações acionáveis.    |
| ⏳ **Idade Biológica (proxy fenotípico)** | Estima idade biológica, **ritmo de envelhecimento** e vitalidade a partir de biomarcadores reais. Honesto por design: **não é teste epigenético de DNA**.                                |
| 🌙 **Saúde da Mulher**                    | Fase do ciclo (menstrual/folicular/ovulatória/lútea), janela fértil e recomendações por fase; trata perimenopausa/menopausa com orientação própria. Visível apenas para perfil feminino. |
| 🔐 **IA Privacy-First / On-Device**       | Índices calculados no navegador; **Modo Privacidade** roteia o chat apenas para o motor local, sem enviar dados a modelos externos.                                                      |

---

## 🚀 Recursos

<details open>
<summary><strong>Experiência do usuário</strong></summary>

- **Dashboard** com pulso vital, contexto astrológico do dia, sono, dicas de IA e a seção **Inteligência Lyra 2026**.
- **Plano de IA** com pilares personalizados (foco, ritmo, nutrição, recuperação) persistidos no banco.
- **Metas** com progresso, streaks e prioridades.
- **Monitoramento** em tempo real (gráficos vivos, voz/alertas, Bluetooth).
- **Chat IA** com voz (Web Speech API), respostas rápidas, regeneração e **BYOK**.
- **Dispositivos** (Web Bluetooth) e **Perfil** completo (dados, cronobiologia, hábitos, ciclo, avatar).
- **Métricas biométricas** organizadas por pilares (recuperação, cardio, sono, metabolismo, nutrição, cognição).

</details>

<details>
<summary><strong>Inteligência e motores</strong></summary>

- Motores determinísticos isomórficos: **score de longevidade**, **idade biológica**, **detecção precoce**, **ciclo menstrual**, **assistente agêntico**, além de Ayurveda (dosha), Chakras, Prana, Koshas e Coerência Quântica.
- **Documentos, Skills e Treinamentos da IA** (admin): base de conhecimento injetada em tempo real no contexto do assistente.
- IA configurável: missão, objetivos, pesos de biomarcadores e seleção de motor.

</details>

<details>
<summary><strong>Plataforma e administração</strong></summary>

- **Billing** com Stripe (planos `free`, `meta`, `care`), gating real de recursos e webhooks.
- **Suite administrativa**: usuários, planos, saúde dos dados, conteúdo, configuração de IA, relatórios.
- **Site Experience Builder** e **Editor Puck** (drag-and-drop) para personalizar landing, login e app.
- Autenticação própria (cookie de sessão), bootstrap multi-admin e onboarding em wizard.

</details>

---

## 🧰 Stack tecnológica

| Camada              | Tecnologias                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Framework**       | Next.js 16 (App Router, Turbopack) · React 19.3 · TypeScript 6                                              |
| **UI**              | Tailwind CSS 4 (CSS-first) · shadcn/ui (Radix) · lucide-react · Recharts 3 · sonner                         |
| **Backend**         | Rotas API do Next.js · MySQL 9.7 LTS (mysql2, `caching_sha2_password`) · autenticação com `jose`/`bcryptjs` |
| **Pagamentos**      | Stripe (checkout, portal, webhooks)                                                                         |
| **Conteúdo**        | Puck (`@puckeditor/core`) · Site Experience Builder                                                         |
| **IA**              | Motores determinísticos próprios · Google Gemini opcional via BYOK                                          |
| **Observabilidade** | Sentry                                                                                                      |
| **Qualidade**       | Vitest · ESLint · Prettier · TypeScript estrito                                                             |
| **Infra local**     | Docker Compose (MySQL) · pnpm (via Corepack) · `run.py` (WSL2) · `run.sh` (Git Bash)                        |

---

## ⚡ Começando

### Pré-requisitos

- **Node.js 24 LTS** (versão exata em `.nvmrc` e `.node-version`, hoje 24.21.0; o `pnpm install` recusa versões fora de `^24.18.1`). Com nvm: `nvm install && nvm use`; fnm e nodenv leem o `.node-version` automaticamente.
- **Docker** (Engine/Desktop) com Docker Compose
- **pnpm 11** via Corepack, incluído no Node.js 24: `corepack enable && corepack install` ativa a versão exata do campo `packageManager`, sem instalação global.
- **Python 3.10+** para o launcher `run.py` (WSL2 Ubuntu / Linux) ou **Bash** (Git Bash no Windows) para o `run.sh`

### Caminho recomendado — um único comando

Os launchers fazem o preflight do ambiente, preparam o `.env.local`, instalam as dependências conforme o lockfile, sobem o **MySQL via Docker Compose**, aplicam as **migrations + administrador inicial**, iniciam a **aplicação** e verificam a saúde ponta a ponta (`/api/health`, páginas e login). Comandos, garantias de segurança e matriz de paridade: [`docs/launchers.md`](./docs/launchers.md).

**WSL2 Ubuntu / Linux** — `run.py`:

```bash
python3 run.py              # menu interativo
python3 run.py up           # tudo, em desenvolvimento (use --prod para build + start)
python3 run.py doctor       # diagnóstico (somente leitura)
python3 run.py fix          # correções seguras e idempotentes
python3 run.py status       # estado consolidado
python3 run.py stop         # para aplicação e banco (dados preservados)
```

**Windows 11 (Git Bash)** — `run.sh` (mesmos comandos e garantias do `run.py`; abra o Git Bash na pasta do projeto, pois CMD e PowerShell não executam `.sh`):

```bash
./run.sh            # menu interativo
./run.sh up         # tudo, em desenvolvimento (use --prod para build + start)
./run.sh doctor     # diagnóstico (somente leitura)
./run.sh fix        # correções seguras e idempotentes
./run.sh status     # estado consolidado
./run.sh stop       # para aplicação e banco (dados preservados)
```

No PowerShell ou CMD, `py run_windows.py <comando>` localiza o Git Bash e executa o mesmo `run.sh`.

Ao final, a aplicação responde em **http://localhost:3000** e o MySQL em **127.0.0.1:3307**. Se uma dessas portas estiver ocupada por outro programa, os launchers não o encerram: usam a próxima porta livre e informam qual.

### Caminho manual

```bash
pnpm install                 # instala as dependências
pnpm env:init                # cria o .env.local (segredos gerados) a partir do .env.example
pnpm db:start                # sobe o MySQL (docker compose --env-file .env.local) e aplica as migrações
pnpm dev                     # inicia o servidor de desenvolvimento
```

> [!IMPORTANT]
> **Banco criado com MySQL 8.0?** O MySQL 8.0 está em fim de vida desde 2026-04-30 e o projeto usa o **MySQL 9.7 LTS**. O MySQL não aceita o salto direto 8.0 → 9.7 (recusa o datadir com `MY-014060`, sem alterar os dados). Antes de subir o banco com o `compose.yaml` atual, rode uma vez:
>
> ```bash
> pnpm db:upgrade   # backup a frio do volume → usuários para caching_sha2_password → 8.0 → 8.4 LTS → 9.7 LTS
> ```
>
> O comando é idempotente, faz backup verificado antes de qualquer alteração e informa como desfazer (`node scripts/mysql-upgrade.mjs --restaurar <volume_de_backup>`).

<details>
<summary><strong>Banco de dados: migrations, fuso e backup</strong></summary>

- **Migrations** (`mysql/migrations/*.sql`, aplicadas por `pnpm db:migrate` em ordem de nome): cada arquivo é registrado em `_lyra_schema_migrations` com o SHA-256 do conteúdo (fins de linha normalizados). Uma migration já aplicada nunca é editada — o runner recusa conteúdo divergente; correções entram em um arquivo novo. Como o MySQL faz commit implícito em DDL, migrations com `ALTER` verificam o estado no `information_schema` antes de alterar, para que uma reexecução após falha parcial seja segura. Uma falha informa o arquivo e o erro do MySQL.
- **Fuso:** o servidor roda em UTC (`--default-time-zone=+00:00` no `compose.yaml`) e a aplicação envia datas em UTC (`timezone: 'Z'` no mysql2), então `NOW()`, `UTC_TIMESTAMP()` e as datas gravadas pelo Node.js são coerentes em qualquer fuso da máquina. Em um MySQL fora do Compose, configure o mesmo `default-time-zone`.
- **Administradores de bootstrap:** criados por `pnpm db:migrate` a partir do `.env.local`; reexecuções não alteram a linha, e a senha só é regravada quando o valor do `.env.local` muda. Deixar `ADMIN_BOOTSTRAP_EMAIL` e `ADMIN_BOOTSTRAP_PASSWORD` vazios desativa o bootstrap.
- **Testes de integração** (`pnpm test:integration`): com o MySQL do projeto em execução, criam `<MYSQL_DATABASE>_test` (via `MYSQL_ROOT_PASSWORD`), aplicam as migrations reais, testam API de dados, planos e webhook da Stripe contra esse banco e o removem ao final; o banco de desenvolvimento não é tocado.
- **Backup e restauração:** `pnpm db:backup` para o MySQL, copia o volume para `lyra-metacare_mysql_data_backup_<data>`, confere a cópia e religa o banco se ele estava ativo; `pnpm db:restore <volume>` restaura (recriando o volume pelo Compose se necessário). Os volumes de backup aparecem em `docker volume ls --filter name=_backup_`. O `purge` dos launchers e o `pnpm db:upgrade` fazem esse backup antes de qualquer alteração.

</details>

<details>
<summary><strong>Variáveis de ambiente (.env.local)</strong></summary>

O `.env.local` é a **fonte única de configuração**, lida pelo Next.js, pelos scripts do banco, pelo Docker Compose (`--env-file .env.local`) e pelos launchers. Ele é criado ou completado por `pnpm env:init` (os launchers chamam o mesmo comando) a partir do [`.env.example`](./.env.example), que documenta cada variável:

- os segredos (`MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `AUTH_SECRET` e `ADMIN_BOOTSTRAP_PASSWORD`) são gerados com aleatoriedade criptográfica — não existem senhas padrão;
- valores existentes nunca são sobrescritos, e o arquivo é gravado com permissão `0600`;
- `AUTH_SECRET` precisa ter pelo menos 32 bytes (HS256): a aplicação recusa um valor mais curto.

**Administrador de desenvolvimento local:** o e-mail é `ADMIN_BOOTSTRAP_EMAIL` (padrão `admin@lyra.local`) e a senha é o valor gerado em `ADMIN_BOOTSTRAP_PASSWORD` no seu `.env.local`.

> [!NOTE]
> Bancos criados antes desta versão foram inicializados com as senhas fixas do `compose.yaml` antigo. O MySQL só aplica `MYSQL_PASSWORD` e `MYSQL_ROOT_PASSWORD` na criação do volume: mantenha no `.env.local` os valores com que o seu banco foi criado (o `pnpm env:init` não altera valores existentes).

</details>

---

## 📜 Scripts disponíveis

| Comando                                              | Descrição                                                            |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| `pnpm dev`                                           | Servidor de desenvolvimento (Next.js)                                |
| `pnpm build` / `pnpm start`                          | Build de produção / execução                                         |
| `pnpm test`                                          | Testes unitários (Vitest), sem infraestrutura externa                |
| `pnpm test:integration`                              | Testes contra o MySQL real em um banco isolado `<banco>_test`        |
| `pnpm test:coverage`                                 | Unitários + integração com relatório de cobertura (`coverage/`)      |
| `pnpm test:launchers`                                | Testes do `run.py` e do `run_windows.py` (unittest do Python)        |
| `pnpm check:types`                                   | Verificação de tipos (`tsc --noEmit`)                                |
| `pnpm check:lint` / `pnpm fix:lint`                  | Lint (ESLint) — checar / corrigir                                    |
| `pnpm check:format` / `pnpm fix:format`              | Formatação (Prettier) — checar / corrigir                            |
| `pnpm db:start` / `pnpm db:migrate` / `pnpm db:stop` | Banco: subir+migrar / migrar / parar                                 |
| `pnpm db:upgrade`                                    | Upgrade controlado do volume MySQL (8.0 → 8.4 → 9.7 LTS) com backup  |
| `pnpm db:backup`                                     | Backup a frio verificado do volume do MySQL (`BACKUP_VOLUME=<nome>`) |
| `pnpm db:restore <volume_de_backup>`                 | Restaura o volume a partir de um backup                              |

- Mapa das rotas da API (autenticação, entrada, saída, erros e tabelas): [`docs/api.md`](./docs/api.md).
- Modelo de segurança (sessão, CSRF, limites de tentativa, cabeçalhos, XSS, dados de saúde, Stripe e Sentry): [`docs/seguranca.md`](./docs/seguranca.md).
- Performance (medições por rota, gargalos corrigidos e como medir): [`docs/performance.md`](./docs/performance.md).

---

## 🏗️ Arquitetura

Aplicação Next.js full-stack: **backend (rotas API) e frontend convivem no mesmo servidor**, com MySQL como persistência e motores de domínio isomórficos (executáveis no servidor **e** no cliente).

```
src/
├─ app/                # Rotas (App Router): dashboard, plano, metas, chat, admin, APIs…
├─ components/         # UI por domínio (dashboard, chat, profile, admin, layout, ui/…)
├─ hooks/              # Hooks de dados e estado (use-daily-metrics, use-profile, use-privacy-mode…)
├─ context/            # Contextos (auth, orquestrador de saúde)
├─ integrations/mysql/ # Cliente de dados (builder estilo query)
└─ lib/
   ├─ ai/              # chat-engine, plan-engine, score-engine, agent-engine
   ├─ longevity/       # biological-age-engine (idade biológica)
   ├─ health/          # early-warning-engine (detecção precoce)
   ├─ cycle/           # menstrual-engine (saúde da mulher)
   ├─ ayurveda · chakra · prana · vedanta · quantum   # motores integrativos
   ├─ mysql/           # pool, data-api, table-config, types
   ├─ plans/           # billing/entitlements
   └─ site-page-config · puck   # builder visual e conteúdo dinâmico

mysql/migrations/      # Migrações versionadas e idempotentes (checksum)
scripts/               # migrações, env-init, upgrade/backup do MySQL e verificação da app
run.py                 # Launcher oficial do WSL2 Ubuntu / Linux
run.sh                 # Launcher do Windows 11 com Git Bash (mesmos comandos do run.py)
```

**Princípio-chave:** os motores em `lib/` são puros e determinísticos. Isso os torna **testáveis** e permite que idade biológica, detecção precoce, ciclo e ações proativas rodem **no dispositivo do usuário**, sustentando o Modo Privacidade.

---

## 🧪 Testes & Qualidade

- **82 testes** automatizados (Vitest), incluindo cobertura dos novos motores (idade biológica, detecção precoce, ciclo e assistente agêntico).
- Portões de qualidade obrigatórios antes de cada entrega:

```bash
pnpm fix:format && pnpm fix:lint
pnpm check:lint && pnpm check:format && pnpm check:types
pnpm test
```

Política de engenharia: correção sempre pela **causa raiz**, sem placeholders, sem hardcode e sem cortes de código.

---

## 🔐 Segurança & Privacidade

- **Modo Privacidade:** índices de inteligência calculados no navegador; com o modo ativo, o chat é atendido **apenas pelo motor local**, sem enviar dados a modelos externos.
- **BYOK (Bring Your Own Key):** a chave do modelo externo (Gemini) permanece no dispositivo do usuário; o app nunca a persiste.
- **Autenticação:** sessão via cookie assinado; rotas administrativas protegidas por papel (`role = 'admin'`).
- **Dados sensíveis:** segredos ficam em `.env.local` (fora do versionamento); migrações idempotentes com verificação de checksum.
- **Observabilidade:** Sentry para rastreamento de erros.

---

## 🗺️ Roadmap

- [x] Design system único 2026 (tema claro, responsivo, pt-BR)
- [x] Documentos/Skills da IA configuráveis
- [x] Inteligência Lyra 2026 (agêntico, idade biológica, detecção precoce, saúde da mulher, privacidade)
- [x] Launchers locais `run.py` (WSL2) e `run.sh` (Git Bash) com paridade de comandos
- [ ] Registro diário de fluxo e sintomas (saúde da mulher)
- [ ] Inferência de modelo no navegador (WebGPU) para chat 100% on-device
- [ ] Exportação de relatórios de longevidade

---

## 🤝 Contribuição

1. Crie uma branch a partir de `main`.
2. Garanta os portões de qualidade verdes (`check:types`, `check:lint`, `check:format`, `test`).
3. Escreva no mesmo padrão do código existente, em **pt-BR**, sem placeholders.
4. Abra um Pull Request descrevendo a mudança e as evidências de validação.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo `LICENSE` para os termos completos.

---

<div align="center">

Feito com cuidado por **iLyra AI** — bem-estar, longevidade e tecnologia em harmonia.

</div>
