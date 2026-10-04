# 🌌✨ Redesign Completo UI/UX — Lyra MetaCare 2026

## Objetivo

Redesenhar **do zero** todo o estilo visual, layout, CSS, UI e UX de toda a aplicação Lyra MetaCare — Landing Page, Dashboard, Sidebar, Header, componentes, gráficos, cards, formulários, modais, páginas de erro, autenticação, onboarding, e todos os módulos do sistema. O novo design será **luminoso, sofisticado, cósmico, acolhedor, moderno, inovador, elegante mas MEGA PREMIUM** — refletindo a identidade de uma plataforma de bem-estar holístico de altíssima qualidade que une Inteligência Artificial com Sabedoria Védica/Astral.

**IMPORTANTE:** O tema deve ser predominantemente **CLARO (Light Mode)** com tons suaves e luminosos — NÃO escuro/dark. O glassmorphism anterior com fundo teal-escuro será substituído por uma estética "Cosmic Light" — luminosa, etérea, com gradientes celestiais suaves e acentos quentes.

---

## 1. Filosofia de Design

- **Conceito:** "Cosmic Wellness Premium" — Elegância cósmica luminosa. Funde a precisão clínica de uma plataforma de saúde com a mística transcendente da astrologia védica. Cantos arredondados generosos, paleta de tons celestiais luminosos com acentos warm coral, ícones estelares e de saúde, micro-animações etéreas e flutuantes.
- **Tipografia:** Google Font **Inter** (principal — clean, moderno, legível) + **Space Grotesk** (display/headings — geométrico, futurista, premium)
- **Paleta:** Gradientes celestiais luminosos (lavanda, teal suave, coral quente, indigo leve, dourado estelar) com background ultra-claro
- **Iconografia:** Lucide React icons temáticos de saúde, cosmos e bem-estar (coração, cérebro, lua, estrela, atividade, sol, constelação)
- **Elevação:** Sombras coloridas suaves, bordas arredondadas (16px–24px), glassmorphism translúcido sobre fundo claro, aurora glow effects
- **Animações:** Transições fluidas, floating suave, pulse sutil, shimmer estelar, scale-in elegante

---

## 2. Stack Tecnológica (Manter/Respeitar)

| Camada          | Tecnologia                                                |
| --------------- | --------------------------------------------------------- |
| Framework       | Next.js 15, React 19, TypeScript 5                        |
| Estilização     | Tailwind CSS 4 + CSS Variables (Design Tokens)            |
| Componentes UI  | shadcn/ui + Radix UI (manter a base, customizar o visual) |
| Ícones          | Lucide React                                              |
| Gráficos        | Recharts + Tremor                                         |
| Calendário      | react-big-calendar                                        |
| Formulários     | React Hook Form + Zod                                     |
| Notificações    | sonner (toasts)                                           |
| Observabilidade | Sentry                                                    |

---

## 3. Arquivos Afetados — Mapa Completo

### CSS / Design System Global

- **[REESCREVER] `src/app/globals.css`** — CSS Tokens completos do zero com novo Design System "Cosmic Light"
- **[ATUALIZAR] `tailwind.config.ts`** — Novas cores, animações, sombras, fontes, keyframes

### Layout Base

- **[REESCREVER] `src/app/layout.tsx`** — Root layout com fontes, metadata, providers
- **[REESCREVER] `src/components/layout/sidebar.tsx`** — Sidebar redesenhada "Cosmic Light"
- **[REESCREVER] `src/components/layout/header.tsx`** — Header redesenhado
- **[REESCREVER] `src/components/layout/MobileSidebar.tsx`** — Sidebar mobile (drawer)
- **[REESCREVER] `src/components/layout/SidebarLink.tsx`** — Links da sidebar
- **[REESCREVER] `src/components/SplashScreen.tsx`** — Splash screen com nova identidade

### Landing Page

- **[REESCREVER] `src/components/landing/LandingPage.tsx`** — Landing page completa do zero
- **[REESCREVER] `src/app/page.tsx`** — Página raiz (Landing)

### Autenticação

- **[REDESENHAR] `src/app/login/page.tsx`** — Login/Registro com nova UI

### Onboarding

- **[REDESENHAR] `src/components/onboarding/onboarding-form.tsx`** — Fluxo de onboarding
- **[REDESENHAR] `src/components/onboarding/OnboardingNavigationDots.tsx`** — Dots de navegação

### Dashboard

- **[REDESENHAR] `src/components/dashboard/dashboard.tsx`** — Dashboard principal Bento Grid
- **[REDESENHAR] `src/components/dashboard/MetricGrid.tsx`** — Grid de métricas vitais
- **[REDESENHAR] `src/components/dashboard/AITipsCard.tsx`** — Card de dicas IA
- **[REDESENHAR] `src/components/dashboard/QuickScanFAB.tsx`** — Floating Action Button

### Chat IA

- **[REDESENHAR] `src/components/chat/ChatAssistantContent.tsx`** — Interface do chat
- **[REDESENHAR] `src/components/chat/ChatBubble.tsx`** — Bolhas de mensagem
- **[REDESENHAR] `src/components/chat/ChatInput.tsx`** — Input do chat
- **[REDESENHAR] `src/components/chat/QuickReply.tsx`** — Respostas rápidas
- **[REDESENHAR] `src/components/chat/TypingIndicator.tsx`** — Indicador de digitação

### Plano IA

- **[REDESENHAR] `src/components/ai-plan/AIPlanContent.tsx`** — Conteúdo do plano IA

### Consultas/Agenda

- **[REDESENHAR] `src/components/appointments/AppointmentsContent.tsx`** — Listagem de consultas
- **[REDESENHAR] `src/components/appointments/Agenda.tsx`** — Calendário/Agenda
- **[REDESENHAR] `src/components/appointments/AppointmentFormModal.tsx`** — Modal de agendamento
- **[REDESENHAR] `src/components/appointments/BookingConfirmationModal.tsx`** — Confirmação de booking
- **[REDESENHAR] `src/components/appointments/ProfessionalCard.tsx`** — Card de profissional
- **[REDESENHAR] `src/components/appointments/ProfessionalFormModal.tsx`** — Modal de profissional
- **[REDESENHAR] `src/components/appointments/ProfessionalAvatarUploader.tsx`** — Avatar uploader
- **[REDESENHAR] `src/components/appointments/TimeSlotPicker.tsx`** — Seletor de horários

### Metas/Goals

- **[REDESENHAR] `src/components/goals/GoalTrackingContent.tsx`** — Rastreio de metas
- **[REDESENHAR] `src/components/goals/CreateGoalModal.tsx`** — Modal de criação de meta
- **[REDESENHAR] `src/components/goals/UpdateGoalProgressModal.tsx`** — Modal de progresso

### Monitoramento

- **[REDESENHAR] `src/components/monitoring/RealTimeMonitoringContent.tsx`** — Monitor em tempo real
- **[REDESENHAR] `src/components/monitoring/RealTimeMetricCard.tsx`** — Card de métrica
- **[REDESENHAR] `src/components/monitoring/LiveHeartRateChart.tsx`** — Gráfico de frequência cardíaca
- **[REDESENHAR] `src/components/monitoring/MapPlaceholder.tsx`** — Placeholder de mapa

### Perfil

- **[REDESENHAR] `src/components/profile/ProfileForm.tsx`** — Formulário de perfil
- **[REDESENHAR] `src/components/profile/AvatarUploader.tsx`** — Upload de avatar
- **[REDESENHAR] `src/components/profile/HabitList.tsx`** — Lista de hábitos

### Assinatura/Billing

- **[REDESENHAR] `src/components/subscription/AccountSubscriptionCard.tsx`** — Card de assinatura
- **[REDESENHAR] `src/components/subscription/BillingActionPanel.tsx`** — Painel de cobrança
- **[REDESENHAR] `src/components/subscription/BillingReturnExperience.tsx`** — Retorno de billing
- **[REDESENHAR] `src/components/subscription/PlanBadge.tsx`** — Badge de plano
- **[REDESENHAR] `src/components/subscription/PlanUpgradeNotice.tsx`** — Aviso de upgrade

### Conexão de Dispositivos

- **[REDESENHAR] `src/components/data-connection/WearableConnection.tsx`** — Conexão wearables

### Painel Admin

- **[REDESENHAR] `src/components/admin/AdminDashboardContent.tsx`** — Dashboard admin
- **[REDESENHAR] `src/components/admin/UserManagementContent.tsx`** — Gestão de usuários
- **[REDESENHAR] `src/components/admin/UserDetailModal.tsx`** — Modal detalhe de usuário
- **[REDESENHAR] `src/components/admin/AIConfigForm.tsx`** — Config de IA
- **[REDESENHAR] `src/components/admin/AITipFormModal.tsx`** — Modal de dica IA
- **[REDESENHAR] `src/components/admin/AdminContentManagement.tsx`** — Gestão de conteúdo
- **[REDESENHAR] `src/components/admin/AdminPlanMatrixContent.tsx`** — Matriz de planos
- **[REDESENHAR] `src/components/admin/AdminReportsContent.tsx`** — Relatórios admin
- **[REDESENHAR] `src/components/admin/DataHealthContent.tsx`** — Saúde dos dados
- **[REDESENHAR] `src/components/admin/SuggestedHabitFormModal.tsx`** — Modal de hábito sugerido

### Componentes UI Base (shadcn/ui — customização visual)

Os componentes shadcn/ui em `src/components/ui/` devem ter suas variáveis CSS atualizadas para refletir a nova paleta "Cosmic Light". Os principais a revisar/customizar:

- `button.tsx` — Novos variants com gradientes
- `card.tsx` — Sombras e bordas "Cosmic Light"
- `dialog.tsx` — Modal com backdrop blur
- `input.tsx` — Focus ring celestial
- `select.tsx` — Dropdown estilizado
- `badge.tsx` — Badges com cores da nova paleta
- `table.tsx` — Tabelas com hover suave
- `tabs.tsx` — Tabs com indicador animado
- `skeleton.tsx` — Skeleton com shimmer estelar
- `progress.tsx` — Barra de progresso com gradiente
- `chart.tsx` — Wrapper de gráficos com nova paleta

### Utilitários

- **[REESCREVER] `src/components/ThemeProvider.tsx`** — Provider de tema (garantir Light como padrão)
- **[REDESENHAR] `src/components/made-with-ilyra.tsx`** — Branding footer

---

## 4. Paleta de Cores — "Cosmic Wellness Light"

### Light Mode (Padrão — Obrigatório)

| Token                      | Cor (HSL)     | Hex Referência | Uso                                                       |
| -------------------------- | ------------- | -------------- | --------------------------------------------------------- |
| `--background`             | `240 20% 98%` | `#F8F7FC`      | Background principal da app (lavanda ultra-claro)         |
| `--foreground`             | `240 24% 10%` | `#151525`      | Texto principal (índigo profundo)                         |
| `--card`                   | `0 0% 100%`   | `#FFFFFF`      | Cards, modais, superfícies                                |
| `--card-foreground`        | `240 24% 10%` | `#151525`      | Texto em cards                                            |
| `--popover`                | `0 0% 100%`   | `#FFFFFF`      | Popovers, dropdowns                                       |
| `--popover-foreground`     | `240 24% 10%` | `#151525`      | Texto em popovers                                         |
| `--primary`                | `174 62% 40%` | `#26A69A`      | Lyra Teal Premium — Ações principais, sidebar ativo, CTAs |
| `--primary-foreground`     | `0 0% 100%`   | `#FFFFFF`      | Texto sobre primary                                       |
| `--secondary`              | `240 15% 95%` | `#EEEDF5`      | Background secundário, cards sutis                        |
| `--secondary-foreground`   | `240 24% 10%` | `#151525`      | Texto sobre secondary                                     |
| `--muted`                  | `240 12% 92%` | `#E8E7EF`      | Elementos desativados, fundos suaves                      |
| `--muted-foreground`       | `240 10% 46%` | `#6B6A80`      | Texto secundário                                          |
| `--accent`                 | `16 85% 61%`  | `#F06543`      | Warm Coral — Destaques, notificações, urgência            |
| `--accent-foreground`      | `0 0% 100%`   | `#FFFFFF`      | Texto sobre accent                                        |
| `--destructive`            | `0 72% 51%`   | `#D32F2F`      | Erro, perigo, exclusão                                    |
| `--destructive-foreground` | `0 0% 100%`   | `#FFFFFF`      | Texto sobre destructive                                   |
| `--border`                 | `240 15% 90%` | `#E2E0ED`      | Bordas suaves                                             |
| `--input`                  | `240 15% 90%` | `#E2E0ED`      | Bordas de input                                           |
| `--ring`                   | `174 62% 40%` | `#26A69A`      | Focus ring (Lyra Teal)                                    |

### Cores Semânticas Adicionais (CSS Variables Extras)

| Token               | Cor                                                  | Uso                                           |
| ------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `--success`         | `#10B981` (Emerald 500)                              | Sucesso, saúde positiva, metas atingidas      |
| `--success-light`   | `#D1FAE5`                                            | Background sucesso                            |
| `--warning`         | `#F59E0B` (Amber 500)                                | Alertas, atenção necessária                   |
| `--warning-light`   | `#FEF3C7`                                            | Background warning                            |
| `--info`            | `#6366F1` (Indigo 500)                               | Informacional, dicas, insights astrais        |
| `--info-light`      | `#E0E7FF`                                            | Background info                               |
| `--cosmic`          | `#8B5CF6` (Violet 500)                               | Elementos astrológicos, cósmicos, espirituais |
| `--cosmic-light`    | `#EDE9FE`                                            | Background cósmico                            |
| `--golden`          | `#D4A017` (Gold premium)                             | Estrelas, destaques premium, conquistas       |
| `--golden-light`    | `#FEF9E7`                                            | Background dourado                            |
| `--coral-gradient`  | `linear-gradient(135deg, #F06543, #FF8A65)`          | Gradiente coral para CTAs                     |
| `--teal-gradient`   | `linear-gradient(135deg, #26A69A, #4DB6AC)`          | Gradiente teal para ações                     |
| `--cosmic-gradient` | `linear-gradient(135deg, #8B5CF6, #A78BFA)`          | Gradiente cósmico                             |
| `--aurora-gradient` | `linear-gradient(135deg, #E0E7FF, #EDE9FE, #FCE7F3)` | Gradiente aurora para backgrounds decorativos |

### Cores de Gráficos (Charts)

| Token       | Cor                | Uso                       |
| ----------- | ------------------ | ------------------------- |
| `--chart-1` | `#26A69A` (Teal)   | Primário em gráficos      |
| `--chart-2` | `#F06543` (Coral)  | Secundário em gráficos    |
| `--chart-3` | `#8B5CF6` (Violet) | Terciário — dados astrais |
| `--chart-4` | `#6366F1` (Indigo) | Quaternário               |
| `--chart-5` | `#F59E0B` (Amber)  | Quinário                  |

### Sidebar

| Token                          | Cor           | Uso                   |
| ------------------------------ | ------------- | --------------------- |
| `--sidebar-background`         | `240 20% 98%` | Background da sidebar |
| `--sidebar-foreground`         | `240 24% 10%` | Texto da sidebar      |
| `--sidebar-primary`            | `174 62% 40%` | Item ativo            |
| `--sidebar-primary-foreground` | `0 0% 100%`   | Texto item ativo      |
| `--sidebar-accent`             | `240 15% 95%` | Hover items           |
| `--sidebar-accent-foreground`  | `240 24% 10%` | Texto hover           |
| `--sidebar-border`             | `240 15% 90%` | Borda da sidebar      |
| `--sidebar-ring`               | `174 62% 40%` | Focus ring            |

### Dark Mode (Opcional — Secundário)

Manter um dark mode elegante como alternativa, porém o **default SEMPRE será Light**. O dark mode deve usar tons profundos de índigo/azul-escuro (não preto puro), mantendo os acentos Teal e Coral.

---

## 5. Tipografia

| Função             | Font                              | Peso               | Tamanho Base |
| ------------------ | --------------------------------- | ------------------ | ------------ |
| Display / Headings | **Space Grotesk** (Google Fonts)  | 600, 700           | 24–48px      |
| Body / UI          | **Inter** (Google Fonts)          | 300, 400, 500, 600 | 14–16px      |
| Monospace / Código | **JetBrains Mono** (Google Fonts) | 400                | 13px         |
| Números / Dados    | **Inter** (tabular-nums)          | 500, 600           | Variável     |

### Escala Tipográfica

| Token       | Tamanho | Line Height | Uso                       |
| ----------- | ------- | ----------- | ------------------------- |
| `text-xs`   | 12px    | 16px        | Captions, labels mínimos  |
| `text-sm`   | 14px    | 20px        | Body secundário, metadata |
| `text-base` | 16px    | 24px        | Body principal            |
| `text-lg`   | 18px    | 28px        | Subtítulos                |
| `text-xl`   | 20px    | 28px        | Títulos de seção          |
| `text-2xl`  | 24px    | 32px        | Títulos de página         |
| `text-3xl`  | 30px    | 36px        | Hero subtítulos           |
| `text-4xl`  | 36px    | 40px        | Display numbers           |
| `text-5xl`  | 48px    | 48px        | Hero títulos              |

---

## 6. Design Tokens

### Border Radius

| Token           | Valor  | Uso                            |
| --------------- | ------ | ------------------------------ |
| `--radius-sm`   | 8px    | Badges, chips pequenos         |
| `--radius`      | 12px   | Botões, inputs, selects        |
| `--radius-md`   | 16px   | Cards menores, modais pequenos |
| `--radius-lg`   | 20px   | Cards padrão                   |
| `--radius-xl`   | 24px   | Cards grandes, containers      |
| `--radius-2xl`  | 32px   | Sidebar, containers principais |
| `--radius-full` | 9999px | Avatares, pill buttons         |

### Sombras (Light Theme)

| Token           | Valor                                                                | Uso                              |
| --------------- | -------------------------------------------------------------------- | -------------------------------- |
| `shadow-sm`     | `0 1px 2px rgba(21,21,37,0.04)`                                      | Elementos sutis                  |
| `shadow`        | `0 2px 8px rgba(21,21,37,0.06)`                                      | Cards padrão                     |
| `shadow-md`     | `0 4px 16px rgba(21,21,37,0.08)`                                     | Cards hover                      |
| `shadow-lg`     | `0 8px 32px rgba(21,21,37,0.10)`                                     | Modais, popovers                 |
| `shadow-xl`     | `0 16px 48px rgba(21,21,37,0.12)`                                    | Elementos elevados               |
| `shadow-teal`   | `0 4px 20px rgba(38,166,154,0.15)`                                   | Glow teal em hover               |
| `shadow-coral`  | `0 4px 20px rgba(240,101,67,0.15)`                                   | Glow coral em hover              |
| `shadow-cosmic` | `0 4px 20px rgba(139,92,246,0.15)`                                   | Glow cósmico                     |
| `shadow-aurora` | `0 8px 32px rgba(99,102,241,0.08), 0 4px 16px rgba(139,92,246,0.06)` | Aurora para containers especiais |

### Espaçamento

Sistema de 4px: `4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96`

### Animações e Keyframes

| Nome           | Descrição                                    | Duração                   |
| -------------- | -------------------------------------------- | ------------------------- |
| `fadeIn`       | Opacity 0→1                                  | 300ms ease-out            |
| `fadeInUp`     | Opacity + translateY(10px→0)                 | 400ms ease-out            |
| `fadeInDown`   | Opacity + translateY(-10px→0)                | 400ms ease-out            |
| `scaleIn`      | Opacity + scale(0.95→1)                      | 300ms ease-out            |
| `slideInLeft`  | translateX(-100%→0)                          | 350ms ease-out            |
| `slideInRight` | translateX(100%→0)                           | 350ms ease-out            |
| `float`        | translateY(0→-5px→0)                         | 3s ease-in-out infinite   |
| `pulse-slow`   | Opacity 1→0.8→1                              | 4s ease infinite          |
| `shimmer`      | Background position shift (loading skeleton) | 1.5s ease-in-out infinite |
| `spin-slow`    | rotate(0→360deg)                             | 60s linear infinite       |
| `aurora-shift` | Background gradient position animation       | 10s ease infinite         |
| `glow-pulse`   | Box-shadow intensity pulse                   | 2s ease infinite          |

---

## 7. Componentes Redesenhados — Especificação Detalhada

### 7.1 Sidebar ("Cosmic Navigation")

**Conceito:** Painel lateral elegante, luminoso, com separação visual clara e hierarquia de navegação premium.

- **Background:** `var(--background)` com borda direita sutil `var(--border)`
- **Logo:** Ícone de constelação/lira (Lucide: `Sparkles` ou SVG custom) + nome "lyra" em Space Grotesk lowercase, peso 700, com gradiente teal→coral
- **Grupos de navegação:** Separados por labels em caps pequenas (`text-xs uppercase tracking-widest text-muted-foreground`)
- **Links inativos:** Ícone Lucide + texto em `text-muted-foreground`, padding `py-2.5 px-3`, `rounded-xl`
- **Link ativo:** Background `var(--primary)/10`, texto `var(--primary)`, borda-esquerda `3px solid var(--primary)`, fonte `font-medium`
- **Hover:** Background `var(--secondary)`, scale `1.01`, transição suave 200ms
- **Ícones temáticos por seção:**
  - Dashboard → `LayoutGrid`
  - Métricas Vitais → `Activity` ou `HeartPulse`
  - Trânsito Astral → `Moon` ou `Star`
  - Chat IA → `MessageCircle` ou `Brain`
  - Consultas → `Calendar`
  - Metas → `Target`
  - Monitoramento → `Radio`
  - Dispositivos → `Smartphone`
  - Plano IA → `Wand2`
  - Perfil → `User`
  - Admin → `Shield` (visível apenas para admin)
- **User Mini Profile (bottom):** Avatar circular com borda gradiente teal→coral, nome, badge de plano (ex: "Plano Estelar"), ícone de settings
- **Responsividade:** Em mobile, vira Sheet/Drawer com backdrop blur, acionado por hamburger no header
- **Animação de entrada:** `slideInLeft` ao abrir

### 7.2 Header ("Cosmic Header Bar")

**Conceito:** Barra superior limpa e funcional com glassmorphism leve sobre o conteúdo.

- **Background:** `rgba(248,247,252,0.85)` com `backdrop-blur-xl` e `border-bottom: 1px solid var(--border)`
- **Lado esquerdo:**
  - Hamburger menu (mobile only)
  - Breadcrumb com separadores `ChevronRight` (Lucide)
  - Título da página atual em `Space Grotesk font-semibold text-lg`
- **Centro (desktop):**
  - Campo de busca global: ícone `Search`, placeholder "Buscar em tudo...", `rounded-full`, background `var(--secondary)`, focus ring `var(--primary)`
- **Lado direito:**
  - Botão de notificações: ícone `Bell` com badge animado (dot vermelho pulsante) quando há notificações
  - Botão de tema (Sun/Moon toggle) — opcional
  - Avatar do usuário com dropdown (perfil, configurações, sair)
- **Sticky:** `position: sticky; top: 0; z-index: 40`

### 7.3 Cards ("Aurora Glass Cards")

**Conceito:** Cards com fundo branco puro, sombra suave, bordas arredondadas generosas e hover elegante.

- **Background:** `var(--card)` (branco)
- **Border:** `1px solid var(--border)` — sutil
- **Border Radius:** `var(--radius-lg)` (20px)
- **Padding:** `p-6`
- **Sombra padrão:** `shadow` (sutil)
- **Hover:** `shadow-md` + `scale(1.01)` + `border-color` levemente mais intenso — transição 200ms
- **Variante "Glass":** `background: rgba(255,255,255,0.7); backdrop-filter: blur(16px)` — para cards sobrepostos a backgrounds decorativos
- **Variante "Highlight":** Borda esquerda colorida (4px) com cor semântica (teal=saúde, coral=urgente, cosmic=astral, golden=premium)
- **Ícone decorativo:** Opcional, no canto superior direito, em `text-muted-foreground/20` — ícone temático grande (40-48px) como marca d'água

### 7.4 Botões

| Variante        | Background               | Texto                     | Border           | Hover                          | Uso                 |
| --------------- | ------------------------ | ------------------------- | ---------------- | ------------------------------ | ------------------- |
| **Primary**     | `var(--teal-gradient)`   | Branco                    | Nenhuma          | Saturação +10%, shadow-teal    | CTAs principais     |
| **Secondary**   | `var(--secondary)`       | `var(--foreground)`       | `var(--border)`  | Background intensificado       | Ações secundárias   |
| **Accent**      | `var(--coral-gradient)`  | Branco                    | Nenhuma          | Saturação +10%, shadow-coral   | Destaques, urgência |
| **Cosmic**      | `var(--cosmic-gradient)` | Branco                    | Nenhuma          | Shadow-cosmic                  | Ações astrais/IA    |
| **Ghost**       | Transparente             | `var(--muted-foreground)` | Nenhuma          | Background `var(--secondary)`  | Ações terciárias    |
| **Destructive** | `var(--destructive)`     | Branco                    | Nenhuma          | Escurecer 10%                  | Exclusão, perigo    |
| **Outline**     | Transparente             | `var(--primary)`          | `var(--primary)` | Background `var(--primary)/10` | Alternativas sutis  |

- **Shape:** `rounded-xl` (pill shape para CTAs importantes: `rounded-full`)
- **Padding:** `px-5 py-2.5` (default), `px-4 py-2` (sm), `px-6 py-3` (lg)
- **Transição:** `all 200ms ease`
- **Click:** Ripple effect sutil ou scale `0.97` + release

### 7.5 Formulários & Inputs

- **Campos:** `rounded-xl`, borda `var(--border)`, background `var(--card)`
- **Focus:** Ring `2px` cor `var(--ring)` (teal), borda se intensifica
- **Labels:** Acima do campo, `text-sm font-medium text-foreground`, spacing `mb-1.5`
- **Ícones inline:** Dentro do campo (lado esquerdo), cor `var(--muted-foreground)`
- **Placeholder:** `text-muted-foreground` com texto amigável
- **Validação visual:**
  - Sucesso: borda verde `var(--success)`, ícone `Check`
  - Erro: borda vermelha `var(--destructive)`, ícone `AlertCircle`, mensagem abaixo em vermelho
- **Textarea:** Mesma estilização, min-height 120px, resize vertical
- **Select:** Dropdown com `rounded-xl`, items com hover suave, checkmark na seleção
- **Checkbox/Radio:** Custom com animação de check, cor `var(--primary)` quando ativo
- **Switch/Toggle:** Pista arredondada, thumb com transição smooth, cor `var(--primary)` quando ativo

### 7.6 Tabelas

- **Container:** `rounded-xl` com overflow hidden e borda sutil
- **Header:** Background `var(--secondary)`, texto `font-semibold text-sm uppercase tracking-wider text-muted-foreground`
- **Rows:** Hover `var(--secondary)/50`, transição suave
- **Rows alternadas:** Background levemente diferente (zebra sutil)
- **Cells:** Padding `py-3.5 px-4`
- **Paginação:** Botões `rounded-lg`, current page com `var(--primary)` background

### 7.7 Alertas/Toasts

| Tipo    | Cor de fundo           | Cor de borda (esquerda 4px) | Ícone           |
| ------- | ---------------------- | --------------------------- | --------------- |
| Sucesso | `var(--success-light)` | `var(--success)`            | `CheckCircle`   |
| Warning | `var(--warning-light)` | `var(--warning)`            | `AlertTriangle` |
| Erro    | `#FEE2E2`              | `var(--destructive)`        | `XCircle`       |
| Info    | `var(--info-light)`    | `var(--info)`               | `Info`          |
| Cósmico | `var(--cosmic-light)`  | `var(--cosmic)`             | `Sparkles`      |

- **Shape:** `rounded-xl`
- **Animação:** `slideInRight` ao aparecer, `fadeOut` ao sair
- **Auto-dismiss:** Com progress bar sutil na base (4s default)
- **Toast (sonner):** Mesma estilização, posição `bottom-right`

### 7.8 Modais/Dialogs

- **Overlay:** `rgba(21,21,37,0.4)` com `backdrop-filter: blur(4px)`
- **Container:** `rounded-2xl`, background `var(--card)`, sombra `shadow-xl`, max-width contextual
- **Header:** Título em `Space Grotesk font-semibold text-xl`, botão fechar com ícone `X`
- **Footer:** Botões alinhados à direita com spacing adequado
- **Animação entrada:** `scaleIn` + `fadeIn`
- **Animação saída:** `fadeOut` + scale reverse

---

## 8. Páginas Específicas — Diretrizes

### 8.1 Landing Page ("Portal Cósmico")

**Conceito:** Uma experiência de chegada cinematográfica que transmite sofisticação, confiança e inovação. Fundo luminoso com elementos decorativos celestiais sutis.

**Seções (em ordem):**

1. **Hero Section:**
   - Background: Gradiente `var(--aurora-gradient)` com orbs flutuantes semi-transparentes (teal, coral, violet) em absolute positioning com blur
   - Headline em `Space Grotesk text-5xl font-bold` com gradiente no texto: "Seu Bem-Estar Orquestrado"
   - Subtítulo em `Inter text-xl text-muted-foreground`: "Onde a Sabedoria Ancestral Encontra a Inteligência Artificial"
   - Dois CTAs: "Comece Agora" (primary gradient) + "Saiba Mais" (outline)
   - Mockup/screenshot do dashboard flutuando com `shadow-aurora` e `animate-float`
   - Elemento decorativo: constelação SVG sutil no canto

2. **Logos/Parceiros:** Faixa com logos de tecnologias/integrações (Apple Health, Google Fit, etc.) em tons monocromáticos, scroll horizontal suave

3. **Features Grid (Bento):**
   - Grid 3 colunas com cards "glass" contendo:
     - 🧬 Métricas Vitais em Tempo Real
     - 🪐 Mapa Astral Personalizado
     - 🤖 IA Assistente Privada (On-Device)
     - 📊 Planos de Longevidade Inteligentes
     - 📅 Agendamento de Consultas Premium
     - 🎯 Rastreio de Metas de Saúde
   - Cada card com ícone grande em gradiente, título `Space Grotesk font-semibold text-lg`, descrição `text-muted-foreground text-sm`

4. **Como Funciona (3 passos):**
   - Timeline visual: Conecte → Sincronize → Evolua
   - Cards com numeração grande (`text-4xl font-bold` em cor gradient)

5. **Planos/Pricing:**
   - 3 cards comparativos: Gratuito / Estelar / Cósmico
   - Card premium com borda gradiente e badge "Mais Popular"
   - Checklist de features com ícones `Check`

6. **Depoimentos/Social Proof:**
   - Cards com avatar, nome, citação, rating (estrelas douradas)
   - Carrossel horizontal smooth

7. **CTA Final:**
   - Background gradiente coral suave
   - Headline forte: "Comece Sua Jornada Cósmica Hoje"
   - Input de email + botão "Quero Começar"

8. **Footer:**
   - Logo Lyra + links de navegação
   - Social links
   - Legal/Copyright
   - "Feito com ✨ por iLyra AI"

### 8.2 Login/Registro

- Container centralizado com card glass `max-w-md`
- Logo Lyra no topo
- Tabs: Login / Criar Conta
- Campos com ícones inline (Mail, Lock, User)
- Botão CTA gradient
- Link "Esqueci minha senha"
- Divider "ou" com linhas horizontais
- Background: Gradiente aurora sutil + orbs decorativos

### 8.3 Dashboard ("Centro de Comando Estelar")

**Layout:** Bento Grid responsivo com cards de diferentes tamanhos.

- **Saudação:** "Bom dia, [Nome]! ☀️" / "Boa noite, [Nome]! 🌙" (contextual)
- **Bento Grid:**
  - **Card HRV (2 cols):** Número grande `text-4xl font-bold text-gradient-accent`, mini gráfico sparkline, badge "Pico Harmônico"
  - **Card Astral (1 col):** Signo/trânsito atual com símbolo grande animado (`animate-float`), insight curto
  - **Card Sono (1 col):** Horas de sono, progress bar gradiente indigo→teal, meta
  - **Card Insight IA (full width):** Borda gradiente aurora, ícone CPU/Brain, insight personalizado do dia, botão "Ver Plano Completo"
  - **Cards de Métricas Menores:** Frequência cardíaca, passos, calorias, hidratação — em grid 2x2
  - **Card de Consultas Próximas:** Lista das próximas 2-3 consultas
  - **Card de Metas em Andamento:** Progress rings/bars das metas ativas

### 8.4 Chat IA

- Layout fullscreen-ish dentro do container
- Bolhas de mensagem: Usuário (background `var(--primary)`, texto branco, alinhado à direita) / IA (background `var(--secondary)`, texto escuro, alinhado à esquerda, ícone de estrela/robô)
- Input fixo no bottom com ícone de envio (Lucide: `Send`), attachment, mic
- Quick replies: Chips horizontais scrolláveis
- Typing indicator: 3 dots pulsantes em gradiente teal
- Contexto astral: Pequeno banner no topo mostrando o trânsito atual relevante

### 8.5 Painel Admin

- Layout com tabs ou subtabs no topo (Dashboard | Usuários | Planos | IA Config | Conteúdo | Relatórios | Saúde dos Dados)
- Cards de KPIs no topo: Total usuários, Novos esta semana, Planos ativos, Score médio
- Tabelas estilizadas com filtros e buscas
- Modais de edição com formulários completos
- Ações em batch (selecionar múltiplos, ações em massa)

---

## 9. Responsividade

| Breakpoint | Tamanho     | Layout                                                               |
| ---------- | ----------- | -------------------------------------------------------------------- |
| Mobile     | < 640px     | Single column, sidebar drawer, cards empilhados, header simplificado |
| Tablet     | 640–1024px  | 2 colunas em grids, sidebar colapsável                               |
| Desktop    | 1024–1280px | Layout completo 3-4 colunas                                          |
| Wide       | > 1280px    | Max-width container, mais espaço respirar                            |

- **Mobile-first approach** em todas as implementações
- **Sidebar:** Sheet/Drawer em mobile, fixa em desktop
- **Header:** Hamburger + logo em mobile, completo em desktop
- **Cards:** Stack vertical em mobile, grid em desktop
- **Touch-friendly:** Todos os alvos interativos com mínimo `44px`
- **Font sizes:** Escalam proporcionalmente (títulos reduzem em mobile)

---

## 10. Acessibilidade

- **Contraste:** WCAG AA+ em todos os textos sobre backgrounds
- **Focus:** Outlines visíveis e consistentes em TODOS os elementos interativos (focus-visible)
- **ARIA:** Labels em todos os elementos interativos sem texto visível
- **Keyboard:** Tab navigation funcional em toda a app, arrow keys em dropdowns/menus
- **Skip Navigation:** Link invisível que pula para o conteúdo principal
- **Semantic HTML:** `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`, `<section>`, `<article>`
- **Screen Reader:** Conteúdo decorativo marcado com `aria-hidden="true"`
- **Reduced Motion:** Respeitar `prefers-reduced-motion` desabilitando animações

---

## 11. Performance

- **Font loading:** `display: swap` em todas as Google Fonts
- **Imagens:** Next/Image com lazy loading e dimensões definidas
- **CSS:** Purge de classes não utilizadas via Tailwind
- **Componentes:** Code splitting via Next.js dynamic imports em modais pesados
- **Animações:** Usar `transform` e `opacity` exclusivamente (GPU accelerated)
- **Skeleton:** Em todos os estados de loading

---

## 12. Usuário Admin

Criar ou atualizar o usuário administrador com acesso FULL ao sistema:

| Campo         | Valor                                                                     |
| ------------- | ------------------------------------------------------------------------- |
| Email         | `ADMIN_BOOTSTRAP_EMAIL` (padrão `admin@lyra.local`)                       |
| Senha         | gerada em `ADMIN_BOOTSTRAP_PASSWORD` por `pnpm env:init` (sem senha fixa) |
| Perfil        | `admin` (Administrador Full)                                              |
| Primeiro Nome | `Admin`                                                                   |
| Último Nome   | `Lyra`                                                                    |
| Status        | `active`                                                                  |

**Permissões:** Acesso total a TODAS as páginas, configurações, funcionalidades, funções, recursos, tabelas, banco de dados, edição, criação, manutenção, gestão de acessos, perfis, usuários, planos, API, modelos de AI, e qualquer outra funcionalidade presente ou futura do sistema.

---

## 13. Verificação de Qualidade

### Checklist Obrigatório (rodar e corrigir até passar):

```bash
npm run fix:format
npm run fix:lint
npm run check:lint
npm run check:format
npm run check:types
```

### Validação Visual:

- [ ] Navegar por TODAS as páginas verificando consistência visual
- [ ] Testar responsividade em 3 viewports (mobile 375px, tablet 768px, desktop 1440px)
- [ ] Verificar acessibilidade com tab navigation
- [ ] Verificar contrastes de cor
- [ ] Testar com dados reais (não placeholder)
- [ ] Verificar transições e animações
- [ ] Testar dark mode (se implementado)

### Correções:

- [ ] Zero erros de TypeScript
- [ ] Zero erros de lint relevantes
- [ ] Zero warnings de console (errors/warnings)
- [ ] Formatação consistente (Prettier)

---

## 14. Git — Commits e Push

**OBRIGATÓRIO:** No final de cada item/tarefa, realizar commit e push para a branch main:

```bash
git add .
git commit -m "feat(redesign): [descrição do item completado]"
git push origin main
```

### Credenciais Git (temporárias):

- **Usuário:** `ilyra-ai`
- **Token:** _(utilizar token pessoal configurado no ambiente local — NÃO commitar segredos)_

---

## 15. Proibições Explícitas

- ❌ Proibido simular validações, execuções, logs ou resultados
- ❌ Proibido placeholder, TODOs funcionais, exemplos falsos
- ❌ Proibido hardcode de segredos/valores sensíveis/URLs falsas/IDs fictícios
- ❌ Proibido cortar código quando a entrega exigir implementação real
- ❌ Proibido links simbólicos quando forem solicitados links reais
- ❌ Proibido finalizar com pendências, inconsistências, warnings relevantes ou "pontas soltas"
- ❌ Proibido usar tema escuro como padrão (Light Mode é obrigatório)
- ❌ Proibido usar fontes genéricas sem importar as Google Fonts especificadas
- ❌ Proibido usar cores fora da paleta definida (exceto variações necessárias com justificativa)

---

## 16. Resumo Executivo

| Aspecto        | De (Atual)                               | Para (Novo)                                   |
| -------------- | ---------------------------------------- | --------------------------------------------- |
| **Tema**       | Glassmorphism escuro (teal dark)         | "Cosmic Wellness Light" (luminoso, celestial) |
| **Background** | Gradiente escuro `#0f2027→#144d56`       | Lavanda ultra-claro `#F8F7FC`                 |
| **Primary**    | Teal escuro `#144d56`                    | Teal premium `#26A69A`                        |
| **Accent**     | Coral vibrante `#FF7F50`                 | Coral sofisticado `#F06543`                   |
| **Texto**      | Branco sobre escuro                      | Índigo profundo sobre claro `#151525`         |
| **Fontes**     | Inter only                               | Space Grotesk (display) + Inter (body)        |
| **Cards**      | Glass com fundo semi-transparente escuro | Branco puro com sombras suaves coloridas      |
| **Sidebar**    | Glass escuro com gradiente               | Luminosa com borda sutil, ícones coloridos    |
| **Animações**  | Básicas (pulse, float)                   | Expandidas (aurora, shimmer, glow, scale)     |
| **Vibe**       | High-tech futurista escuro               | Wellness premium luminoso cósmico             |

---

**Este prompt deve ser executado na íntegra, linha a linha, sem pular nenhum item, priorizando qualidade PREMIUM sobre velocidade, com implementações reais e completas.**

_"Seu Bem-Estar Orquestrado: Onde a Sabedoria Ancestral Encontra a Inteligência Artificial"_ ✨🧬🪐
