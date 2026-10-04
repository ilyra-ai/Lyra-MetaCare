# INSTRUÇÃO MESTRA — REIMPLEMENTAÇÃO VISUAL (UI/UX) DO APP LYRA METACARE

> **Para o modelo de IA executor:** este documento descreve TODAS as funções, funcionalidades, recursos, dashboards, KPIs, métricas, telas, componentes, APIs e regras do app **Lyra MetaCare**. Sua tarefa é reimplementar **somente a camada visual (UI/UX, layout web gráfico CSS, mobile e desktop)** em um novo template visual, preservando 100% das funcionalidades, dados, lógicas e integrações descritas abaixo. Nada do comportamento pode ser perdido, simulado ou reduzido.

---

## 1. IDENTIDADE DO PRODUTO

- **Nome:** Lyra MetaCare.
- **O que é:** plataforma premium de bem-estar e longevidade que funde **dados biométricos de wearables + inteligência artificial + astrologia moderna + sabedoria védica (Ayurveda, Chakras, Prana, Koshas, Coerência Quântica)**.
- **O que NÃO é:** **não é um app de clínica médica**. É proibida qualquer estética hospitalar, clínica ou fria.
- **Direção visual obrigatória:** astrologia moderna, aura esotérica luminosa, fusão com tecnologia de modelos de IA, luxo suave, serenidade, claridade e acessibilidade.
- **Tema:** **claro obrigatório** (cores claras, etéreas e luminosas). Glassmorphism, gradientes suaves (teal → violeta cósmico → coral), cantos generosamente arredondados (12–32 px), sombras coloridas suaves, micro-animações discretas (respeitando `prefers-reduced-motion`).
- **Idioma de toda a interface:** **pt-BR**.
- **Regra de unificação:** deve existir **UM ÚNICO design system/layout** em todo o app. Remover/recusar qualquer segundo tema, paleta paralela ou estilo legado (ex.: cinzas `gray/slate`, azuis `blue-600`, variantes `dark:` soltas). Todas as cores devem vir de tokens CSS centralizados.
- **Tipografia atual (referência):** Inter (texto), Space Grotesk (display/títulos), JetBrains Mono (números/métricas tabulares).
- **Responsividade:** mobile-first; sidebar fixa no desktop (largura configurável via builder), sheet/drawer deslizante no mobile; alvos de toque ≥ 44 px; grids fluidos 1→2→3 colunas.

## 2. STACK TÉCNICA (NÃO ALTERAR)

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript.
- **Estilo:** Tailwind CSS 3.4 + tokens CSS em `src/app/globals.css` + `tailwind.config.ts`. Componentes base shadcn/ui (Radix UI). Ícones: lucide-react. Toasts: sonner. Charts: Recharts (+ Tremor disponível). Calendário: react-big-calendar + react-day-picker. Carrossel: embla. Drawer: vaul.
- **Backend:** rotas API do próprio Next.js + MySQL (mysql2, Docker, porta 3307). Autenticação própria com sessão via cookie (jose/bcryptjs). Billing: Stripe. Monitoramento de erros: Sentry. Editor visual: Puck (`@puckeditor/core`).
- **Gerenciador de pacotes:** pnpm. Checks obrigatórios: `fix:format`, `fix:lint`, `check:lint`, `check:format`, `check:types`.
- **Proibições:** sem novas dependências de UI/CSS/animação; sem placeholders; sem hardcode; sem remover funcionalidades; sem quebrar APIs.

## 3. NAVEGAÇÃO E SHELL DO APP

Estrutura do shell autenticado: **Sidebar (desktop) + Header sticky com glassmorphism + conteúdo + rodapé "Made with iLyra" + MobileSidebar (sheet)**.

### 3.1 Seções e rotas da navegação (com descrições oficiais)

**Principal**

| Rota     | Label       | Descrição                                                         | Atalho |
| -------- | ----------- | ----------------------------------------------------------------- | ------ |
| `/`      | Dashboard   | Visão central da energia, sono, astro e insights de IA.           | G D    |
| `/plan`  | Plano de IA | Protocolos personalizados de foco, ritmo, nutrição e recuperação. | G P    |
| `/goals` | Metas       | Evolução diária com progresso, streaks e prioridades suaves.      | G M    |

**Fluxo Guiado**

| Rota            | Label         | Descrição                                                         | Atalho |
| --------------- | ------------- | ----------------------------------------------------------------- | ------ |
| `/appointments` | Agendamentos  | Agenda de encontros, profissionais e organização do seu fluxo.    | G A    |
| `/monitoring`   | Monitoramento | Leituras em tempo real, tendências e estados do momento.          | G R    |
| `/chat`         | Chat IA       | Conversa inteligente com contexto biométrico, emocional e astral. | G C    |

**Pessoal**

| Rota       | Label        | Descrição                                            |
| ---------- | ------------ | ---------------------------------------------------- |
| `/connect` | Dispositivos | Conexão e sincronização com wearables e integrações. |
| `/profile` | Perfil       | Dados pessoais, hábitos, preferências e avatar.      |

**Administração (somente admin)**

| Rota                  | Label              | Descrição                                                                |
| --------------------- | ------------------ | ------------------------------------------------------------------------ |
| `/admin/dashboard`    | Visão Geral Admin  | Métricas de negócio, saúde da plataforma e alertas.                      |
| `/admin/users`        | Usuários           | Gestão de contas, perfis e permissões.                                   |
| `/admin/plans`        | Planos             | Matriz comercial, capacidades e precificação.                            |
| `/admin/data-health`  | Saúde dos Dados    | Integridade, latência e confiabilidade dos dados.                        |
| `/admin/content`      | Conteúdo           | Curadoria de hábitos sugeridos, mensagens e recomendações (AI Tips).     |
| `/admin/ai-config`    | Configuração de IA | Pesos, missão, parâmetros e segurança operacional da IA.                 |
| `/admin/reports`      | Relatórios         | Leituras analíticas e exportação executiva.                              |
| `/admin/page-builder` | Construtor UI      | Gestão visual da landing, login e app interno (Site Experience Builder). |
| `/admin/puck`         | Editor Puck        | Editor visual drag-and-drop com persistência real.                       |

**Rotas públicas/auxiliares:** Landing page (`/` deslogado), `/login` (login + registro), `/onboarding` (wizard pós-cadastro), `/billing/success`, `/billing/cancel`, `/instruments` (demo SSR).

### 3.2 Header (autenticado)

- Breadcrumb (Seção › Página), título e descrição da página (tamanhos escaláveis via builder).
- **Busca global Cmd/Ctrl+K** (CommandDialog) listando toda a navegação com ícone, descrição e atalhos.
- Botão de notificações (com ponto pulsante), CTA "Falar com a Lyra" (vai para `/chat`, rótulo configurável), menu do usuário (avatar, nome, e-mail, badge do plano, links Perfil/Preferências/Sair).

### 3.3 Sidebar

- Branding (título + eyebrow configuráveis), navegação agrupada por seção com rótulos de seção configuráveis, item ativo com indicador lateral e gradiente suave, descrição secundária por item, footer com avatar/nome/e-mail do usuário, badge do plano e link para o perfil.
- Itens admin só aparecem para `role = 'admin'`. Visibilidade e rótulos dos itens são configuráveis via `page-config/app` (builder).

## 4. AUTENTICAÇÃO E ONBOARDING

- **Login/Registro** (`/login`): layout split; alterna entre entrar e criar conta; sessão via cookie HttpOnly; logout; guarda de rotas (redireciona deslogado para login; `session === undefined` exibe SplashScreen).
- **Bootstrap multi-admin** via env (`admin@coragem.pet`, `admin@admin.com` e adicionais).
- **Onboarding** (`/onboarding`): wizard em carrossel de **5 passos** com dots de progresso e validação por passo (Zod + react-hook-form):
  1. Boas-vindas;
  2. Dados pessoais (nome, sobrenome, data de nascimento com DatePicker, idade calculada automaticamente por `differenceInYears`, gênero, **hora exata de nascimento (HH:MM)** e **local de nascimento** — usados pela astrologia/cronobiologia);
  3. Nível de atividade (slider 1–5);
  4. Objetivos (14 opções multi-select com ícones: perder peso, ganhar músculo, melhorar resistência, reduzir estresse crônico, comer de forma saudável, otimizar HRV, melhorar prontidão, regular duração do sono, aumentar eficiência do sono, reduzir social jetlag, aumentar VO₂max, cumprir diretrizes de atividade, otimizar proteínas, gerenciar picos de glicose);
  5. Consentimento LGPD + submit (`onboarding_completed = true`).

## 5. DASHBOARD PRINCIPAL (`/`)

- **Hero claro premium** com saudação personalizada, contexto astrológico do dia e CTAs.
- **AssessmentCard interativo:** check-ins de **humor (mood), WHO-5 (bem-estar, 5 perguntas 0–5 → score 0–100) e NPS (0–10)** persistidos em `user_assessments`.
- **Streaks:** sequência de dias de adesão (tabela `user_streaks`, API `/api/data/streaks`), com cálculo de adesão.
- **AITipsCard:** feed real de dicas (`ai_tips`) com título, detalhe e categoria.
- **QuickScanFAB:** botão flutuante de ações rápidas.
- **VedicDashboard:** painel védico com **Pancha Koshas** (5 corpos: annamaya, pranamaya, manomaya, vijnanamaya, anandamaya), tendências de insight védico, controles de conexão Bluetooth.
- **MetricGrid — catálogo completo de métricas biométricas** (cards com valor, unidade, meta/faixa, tendência), organizado em grupos:
  - **Recuperação e resiliência:** HRV (rMSSD), Prontidão, FC repouso, Recuperação FC, Temperatura, SpO₂ noturna.
  - **Cardio e atividade física:** VO₂max, Minutos moderados/vigorosos, Passos, Carga (EPOC), Strain diário, Sedentarismo.
  - **Sono e cronobiologia:** Duração, Eficiência, Regularidade (SRI), Social jetlag, Sono REM, Sono profundo.
  - **Metabolismo e glicose:** Tempo em faixa, Variabilidade (CV), GMI (A1c), Pico pós-prandial, Abaixo da faixa, iAUC/refeição.
  - (Mais grupos no mesmo padrão: nutrição/composição corporal e carga subjetiva — preservar todos os cards existentes no componente.)
- Conteúdo editorial do dashboard (títulos/eyebrows/descrições) é configurável via `page-config/app.dashboard`.

## 6. ENGINES DE CÁLCULO (KPIs e índices — lógica de domínio, NÃO alterar)

| Engine                     | Função principal                                               | Saída                                                                                                        |
| -------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `ai/score-engine`          | `calculateLongevityScores(MetricSnapshot[])`                   | **Longevity Score** ponderado pelos pesos do admin (HRV, sono, atividade, nutrição) + completude de métricas |
| `kpi/assessment-engine`    | `calculateWHO5Score`, `calculateAdherenceScore`, `classifyNPS` | WHO-5 (0–100 + classificação), adesão por streaks, NPS (detrator/neutro/promotor)                            |
| `astrology/engine`         | `getAstrologicalContext` (usa astronomy-engine + nascimento)   | Contexto astral do dia (signos, trânsitos, mensagens)                                                        |
| `ayurveda/dosha-engine`    | `calculateDynamicDosha`                                        | Dosha dinâmico (Vata/Pitta/Kapha) a partir de métricas                                                       |
| `chakra/alignment-engine`  | `calculateChakraAlignment`                                     | Score de alinhamento dos 7 chakras                                                                           |
| `prana/prana-engine`       | `calculatePranicIndex`                                         | Índice prânico + scores dos 5 Vayus                                                                          |
| `quantum/coherence-engine` | `calculateQuantumCoherence`                                    | Índice de coerência (HRV/respiração)                                                                         |
| `vedanta/kosha-engine`     | `calculateKoshas`                                              | Estado dos 5 Koshas + insights para dashboard e chat                                                         |
| `ai/plan-engine`           | geração do Plano de IA                                         | 3 pilares + recomendações persistidas em `ai_plans`                                                          |
| `ai/chat-engine`           | orquestração da conversa                                       | resposta com contexto biométrico/astral/perfil                                                               |

## 7. MÓDULOS DO USUÁRIO

### 7.1 Plano de IA (`/plan`)

- Hero editorial com contexto astrológico real; botão "Gerar plano" → chama `generate-ai-plan`; persiste em `ai_plans` (MySQL).
- Resultado: **tabs premium por pilar** (ex.: foco, ritmo, recuperação) com cards de recomendação reais (sem placeholders), estados de carregamento (skeleton) e vazio.

### 7.2 Metas (`/goals`)

- Cards-resumo (total, progresso médio), lista real de metas com progresso, **CreateGoalModal** (criar meta manual: nome, alvo, unidade, prazo) e **UpdateGoalProgressModal** (atualizar progresso); toasts de sucesso/erro; persistência na tabela `goals`.

### 7.3 Agendamentos (`/appointments`)

- **Agenda** (react-big-calendar) com eventos estilizados; visões mês/semana/agenda.
- Fluxo de marcação: **ProfessionalCard** (avatar, especialidade, rating com estrela, bio; selecionável) → **DatePicker** → **TimeSlotPicker** (slots de 30 min, 9h–17h, desabilita passados/ocupados) → **BookingConfirmationModal** (resumo profissional/data/hora + confirmação async).
- CRUD admin de profissionais: **ProfessionalFormModal** + **ProfessionalAvatarUploader** (upload real de avatar para storage local).
- **AppointmentFormModal** para criar/editar consultas. Tabelas: `appointments`, `professionals`.

### 7.4 Monitoramento (`/monitoring`)

- **RealTimeMetricCard** (métricas vivas), **LiveHeartRateChart** (gráfico de FC em tempo real), feed local de eventos, controles de voz/alerta, **MapPlaceholder** (área de mapa), canal realtime ativo.

### 7.5 Chat IA (`/chat`)

- Header do módulo com identidade da assistente, status online e popover de **integrações** (API local Next.js, contexto fisiológico vivo, orquestração Lyra, agenda sincronizada, perfil e hábitos, ritmo diário).
- **BYOK (Bring Your Own Key):** campo para chave de LLM armazenada apenas no navegador (localStorage), com aviso de privacidade.
- Conversa: **ChatBubble** (usuário vs IA, efeito de digitação da IA, partículas/aura no avatar da IA, ações de copiar e **regenerar resposta**), **TypingIndicator** (3 pontos), **QuickReply** (respostas rápidas configuráveis), **ChatInput** (textarea autosize, contador de caracteres ≥75%, envio com Enter, **ditado por voz Web Speech API pt-BR** com estados de gravação/erro), botão de scroll para o fim.
- Todos os textos do módulo configuráveis via `page-config/app.chat`.
- Backend: função `ask-ai-assistant` (com `userApiKey` opcional).

### 7.6 Dispositivos (`/connect`)

- **WearableConnection:** fluxo real de **Web Bluetooth** com 4 estados (idle/connecting/connected/error), detecção de suporte do navegador, mensagens configuráveis via `page-config/app.connect`, conectar/desconectar GATT, toasts.

### 7.7 Perfil (`/profile`)

- **ProfileForm:** dados pessoais + cronobiologia (nome, sobrenome, nascimento, idade calculada, gênero, hora e local de nascimento), validação Zod.
- **ProgressChart:** gráfico de linha do peso (últimos 6 meses, `daily_metrics.weight_kg`).
- **AvatarUploader:** upload real (limite 5 MB) para storage com URL pública.
- **HabitList:** hábitos de longevidade com switch ativa/desativa e inicialização a partir de `suggested_habits`.
- **AccountSubscriptionCard + BillingActionPanel:** plano atual, status, ciclo e ações de upgrade/portal Stripe.
- Ações da conta: sair do app.

## 8. BILLING (Stripe)

- **Planos:** `free`, `meta`, `care` (badges com ícones Sparkles/ShieldCheck/Crown). Matriz plano×capacidade vinda do banco (`plans`, features) com gating real de recursos (`plans/access`).
- **PlanUpgradeNotice:** aviso de recurso bloqueado com CTA.
- **Checkout:** `/api/billing/checkout` (Stripe Checkout) e `/api/billing/portal` (portal do cliente); webhook assinado em `/api/webhooks/stripe` provisiona a assinatura no MySQL.
- **Retorno:** `/billing/success` e `/billing/cancel` → **BillingReturnExperience** (estados success/cancel, alerta de sincronização de webhook pendente, referência do checkout `session_id`, botão "Atualizar assinatura", retomar assinatura no cancel).

## 9. SUITE ADMINISTRATIVA

- **Guarda padrão:** páginas admin exibem card "Acesso Negado" para não-admin.
- **AdminDashboardContent:** StatCards — Total de Usuários, Novos Usuários (7d), Taxa de Onboarding (%) + lista de usuários recentes (avatar, nome, e-mail, data).
- **UserManagementContent + UserDetailModal:** tabela de usuários com busca/filtros, detalhe completo (perfil, assinatura, ações), alterar plano/assinatura do usuário (`/api/admin/users/[userId]/subscription`), ativar/desativar.
- **AdminPlanMatrixContent:** edição da matriz comercial (planos, preços, features on/off) com publicação real (`/api/admin/plans`).
- **AIConfigForm:** seleção do **motor de IA local** (scan de modelos via `test-ai-connection`), missão operacional (textarea), objetivos-chave (textarea), **pesos dos biomarcadores** (HRV, Sono, Atividade, Nutrição — inputs numéricos 0–100) salvos em `ai_config`; cards laterais de estado operacional.
- **AdminContentManagement:** CRUD de **hábitos sugeridos** (AITipFormModal/SuggestedHabitFormModal) e **AI Tips** com dropdown editar/remover + diálogo de confirmação.
- **AdminReportsContent:** relatórios e exportação (linhas de export com botões de download).
- **DataHealthContent:** RPC `get-data-health-metrics` — taxas de integridade com semáforo (>80% ok, >50% atenção, senão crítico), estado vazio com check verde.
- **Site Experience Builder (`/admin/page-builder`):** edição guiada com rascunho/publicação (draft/publish) de:
  - **Landing** e **Login** (textos, blocos, tipografia com sliders);
  - **App interno** (`page-config/app`): branding da sidebar, rótulos de seção, itens de navegação (visibilidade/labels), header (placeholder de busca, CTA), tipografia (pageTitle, pageBody, cardTitle, cardBody, navLabel, buttonLabel), sizing (sidebarWidth, iconScale), e domínios **dashboard, chat, connect, appointments, monitoring, profile** — com **preview administrativo ao vivo** e reflexo imediato no app após publicar.
  - APIs: `/api/admin/page-config/[pageKey]` (auth admin) e `/api/public/page-config/[pageKey]` (pública).
- **Editor Puck (`/admin/puck`):** editor drag-and-drop com categorias de blocos, campos dinâmicos (hero, metric-card), fontes de dados externas (documents, plans), migrações de dados, viewports (desktop/tablet/mobile), permissões, sanitização de rich text, persistência via `/api/admin/puck/documents` e renderização pública via **PuckClientRenderer** (presente em praticamente todas as páginas com `documentKey` próprio: `onboarding`, `instruments`, `admin-dashboard`, `admin-users`, etc.).

## 10. MODELO DE DADOS (MySQL — tabelas expostas pela Data API `/api/data/[table]`)

`profiles` (dados pessoais + nascimento + objetivos + onboarding_completed + avatar_url), `daily_metrics` (todas as métricas biométricas diárias, incl. weight_kg), `goals`, `habits`, `suggested_habits`, `ai_tips`, `ai_config` (mission, key_objectives, weight_hrv, weight_sleep, weight_activity, weight_nutrition, model_name), `ai_plans` (plan_data JSON), `appointments`, `professionals`, `instruments`, `user_assessments` (type: who5|nps|mood|adherence, score, responses), `user_streaks` (current_streak, longest_streak, last_activity), + tabelas de auth/planos/assinaturas/page-config/puck.

## 11. APIs INTERNAS (manter contratos)

- **Auth:** `/api/auth/login|logout|register|session`.
- **Dados:** `/api/data/[table]` (CRUD genérico com whitelist), `/api/data/streaks`, `/api/data/user-assessments`.
- **Funções de IA:** `/api/functions/ask-ai-assistant`, `generate-ai-plan`, `calculate-longevity-score`, `test-ai-connection`.
- **Astrologia:** `/api/astrology/ephemeris`.
- **RPC:** `/api/rpc/get-data-health-metrics`.
- **Storage:** `/api/storage/upload`, `/api/storage/[bucket]/[...filePath]` (avatars etc.).
- **Billing:** `/api/billing/checkout|portal`, `/api/webhooks/stripe`, `/api/account/billing|subscription`.
- **Admin:** `/api/admin/users[...]`, `/api/admin/plans[...]`, `/api/admin/page-config/[pageKey]`, `/api/admin/puck/documents[...]`, `/api/admin/ui-config`.
- **Público:** `/api/public/page-config/[pageKey]`, `/api/public/plans`, `/api/public/puck/documents[...]`, `/api/public/ui-config`.

## 12. MÓDULO PORTÁVEL "LYRA CUSTOMAZE UI UX"

- Vive em `modules/lyra-customaze-ui-ux` (schema, registry, runtime com `scalePx`/`scaleRem`, storage genérico, contrato de integração). Instalador real: `implement_elementor_lyra.py` (`pnpm lyra-customaze:install`). O novo template DEVE continuar consumindo `scalePx`/`scaleRem` e o `page-config` para que o builder administrativo siga funcionando de verdade.

## 13. REQUISITOS TRANSVERSAIS DE UI/UX (obrigatórios no novo template)

1. **Estados completos** em toda tela: loading (skeleton), vazio (empty state acolhedor), erro (mensagem real + retry) e sucesso (toast).
2. **Acessibilidade:** focus-visible com anel, aria-labels (já existentes — preservar), `role=status` em indicadores vivos, contraste AA, skip-nav, leitores de tela nos inputs de chat.
3. **`prefers-reduced-motion`:** desligar animações/transições.
4. **Escalabilidade tipográfica via builder:** todo título/corpo/label relevante usa `scaleRem(base, escala)` e ícones usam `scalePx` — manter.
5. **Tokens centralizados:** paleta semântica (primary/teal, accent/coral, cosmic/violeta, golden, success, warning, info, destructive, muted, border, card, sidebar-\*, chart-1..5), raios, sombras e gradientes em CSS variables.
6. **Charts** com tooltips glass, cores dos tokens `--chart-*`.
7. **pt-BR em 100% dos textos**, datas com `date-fns/locale/ptBR`.
8. **Sem linguagem clínica/hospitalar** em microcopy.
9. **Mobile:** navegação em sheet, FAB acessível, grids colapsando para 1 coluna, inputs altos (h-11/h-12).
10. **Um único layout final** — remover qualquer resquício de temas/estilos paralelos.

## 14. CRITÉRIOS DE ACEITE

- Todas as rotas e fluxos da seção 3–9 funcionam exatamente como descritos, com o novo visual.
- `pnpm run check:lint && pnpm run check:format && pnpm run check:types` passam sem erros.
- Grep de classes legadas retorna vazio: `(text|bg|border|from|via|to|ring|shadow)-(gray|slate|zinc|neutral|stone|violet|fuchsia|cyan|blue|purple|red|orange|green|amber|emerald|indigo|rose|pink|sky|lime|yellow|teal)-[0-9]` em `src/`.
- Builder administrativo publica e o app reflete imediatamente (landing, login e app interno).
- Nenhuma funcionalidade, API, tabela ou engine foi alterada ou removida.
