<div align="center">

# Lyra MetaCare

**Plataforma premium de bem-estar e longevidade que une biometria de wearables, inteligência artificial e sabedoria integrativa — com privacidade no centro.**

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-087EA4?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Billing-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com/)
[![Vitest](https://img.shields.io/badge/Vitest-82_testes-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
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
| ⚙️ **Operação**          | Subida local de ponta a ponta com um único comando (`./run.sh`): banco, migrações e aplicação.                                 |

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

| Camada              | Tecnologias                                                                  |
| ------------------- | ---------------------------------------------------------------------------- |
| **Framework**       | Next.js 15 (App Router) · React 19 · TypeScript 5                            |
| **UI**              | Tailwind CSS 3.4 · shadcn/ui (Radix) · lucide-react · Recharts · sonner      |
| **Backend**         | Rotas API do Next.js · MySQL 8 (mysql2) · autenticação com `jose`/`bcryptjs` |
| **Pagamentos**      | Stripe (checkout, portal, webhooks)                                          |
| **Conteúdo**        | Puck (`@puckeditor/core`) · Site Experience Builder                          |
| **IA**              | Motores determinísticos próprios · Google Gemini opcional via BYOK           |
| **Observabilidade** | Sentry                                                                       |
| **Qualidade**       | Vitest · ESLint · Prettier · TypeScript estrito                              |
| **Infra local**     | Docker Compose (MySQL) · pnpm (via Corepack) · `run.sh`                      |

---

## ⚡ Começando

### Pré-requisitos

- **Node.js 20+**
- **Docker** (Engine/Desktop) com Docker Compose
- **pnpm** (ativado automaticamente via Corepack)
- **Bash** (Linux, macOS ou Git Bash no Windows) para o orquestrador `run.sh`

### Caminho recomendado — um único comando

O projeto inclui um orquestrador real (`run.sh`) que faz **preflight de dependências com autocorreção**, **descobre portas livres**, sobe o **MySQL via Docker**, aplica **migrações + bootstrap de administradores** e inicia a **aplicação** — com menu interativo e barra de progresso fixa no terminal.

```bash
./run.sh            # menu interativo (subir tudo, banco, app, doctor, status…)
./run.sh up         # sobe banco + migrações + app de ponta a ponta
./run.sh doctor     # diagnóstico do ambiente (somente leitura)
./run.sh fix        # repara o ambiente pela causa raiz
./run.sh stop       # para aplicação e banco
```

Ao final, a aplicação responde em **http://localhost:3000** e o MySQL em **127.0.0.1:3307**.

### Caminho manual

```bash
pnpm install                 # instala as dependências
docker compose up -d mysql   # sobe o banco
pnpm db:migrate              # aplica migrações + bootstrap de admins
pnpm dev                     # inicia o servidor de desenvolvimento
```

<details>
<summary><strong>Variáveis de ambiente (.env.local)</strong></summary>

O `run.sh` gera o `.env.local` automaticamente com valores locais coerentes. Para configuração manual:

```dotenv
MYSQL_HOST=127.0.0.1
MYSQL_HOST_PORT=3307
MYSQL_PORT=3307
MYSQL_USER=lyra
MYSQL_PASSWORD=lyra_mysql_local_2026
MYSQL_ROOT_PASSWORD=lyra_mysql_root_2026
MYSQL_DATABASE=lyra_metacare
AUTH_SECRET=<256 bits de entropia>
# Opcional — IA externa via Google AI Studio:
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.5-flash
```

**Administrador de desenvolvimento local:** `admin@admin.com` / `admin123` (provisionado pelo bootstrap; use apenas em ambiente local).

</details>

---

## 📜 Scripts disponíveis

| Comando                                              | Descrição                                 |
| ---------------------------------------------------- | ----------------------------------------- |
| `pnpm dev`                                           | Servidor de desenvolvimento (Next.js)     |
| `pnpm build` / `pnpm start`                          | Build de produção / execução              |
| `pnpm test`                                          | Suíte de testes (Vitest)                  |
| `pnpm check:types`                                   | Verificação de tipos (`tsc --noEmit`)     |
| `pnpm check:lint` / `pnpm fix:lint`                  | Lint (ESLint) — checar / corrigir         |
| `pnpm check:format` / `pnpm fix:format`              | Formatação (Prettier) — checar / corrigir |
| `pnpm db:start` / `pnpm db:migrate` / `pnpm db:stop` | Banco: subir+migrar / migrar / parar      |

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
scripts/               # mysql-migrate.mjs (migração + bootstrap)
run.sh                 # Orquestrador local (preflight, portas, banco, app)
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
- [x] Orquestrador local `run.sh`
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
