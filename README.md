<div align="center">

# 🌌✨ Lyra MetaCare

**Seu Bem-Estar Orquestrado: Onde a Sabedoria Ancestral Encontra a Inteligência Artificial** 🧬🪐

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend_Mágico-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Estilo_Fluido-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Status: Beta Funcional](https://img.shields.io/badge/Status-Beta_Poderoso-FF6B6B?style=for-the-badge)](#)

*Uma aplicação web revolucionária desenhada para empoderar você, acompanhando sua jornada de longevidade, métricas de saúde, rotinas, consultas, e oferecendo um assistente de IA genial que conhece até as estrelas!* ✨

[**Explore a Magia**](#-1-a-essência-transformadora) • [**Visão UI/UX**](#-preview-da-interface-a-estética-2026) • [**A Arquitetura**](#-2-arquitetura-do-sistema-a-fundação-do-nosso-universo) • [**Seu Guia Rápido**](#-3-o-seu-guia-estelar-manual-do-usuário)

</div>

---

## 🖼️ Preview da Interface: A Estética 2026

Para que você possa sentir o poder do nosso design de ponta antes mesmo de rodar o projeto completo, nós codificamos uma **Visão UI/UX de Alta Fidelidade (Standalone)**. Ela simula o nosso *Bento Grid*, o majestoso *Glassmorphism* avançado e a harmonia das cores **Lyra Teal** e **Warm Coral**.

👉 **[Clique aqui para visualizar o Protótipo HTML UI (Dashboard)](public/assets/lyra-ui-preview.html)**

<details>
<summary><b>✨ Clique aqui para expandir e ver o código do protótipo UI 2026 (HTML/CSS Standalone)</b></summary>

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lyra MetaCare - UI Preview 2026</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'lyra-teal': '#144d56',
                        'lyra-teal-dark': '#0f2027',
                        'lyra-teal-light': '#203a43',
                        'warm-coral': '#FF7F50',
                        'warm-coral-light': '#FF9F7A'
                    },
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                    },
                    animation: {
                        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        'float': 'float 6s ease-in-out infinite',
                    },
                    keyframes: {
                        float: {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-10px)' },
                        }
                    }
                }
            }
        }
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #144d56 100%);
            color: #f8fafc;
            min-height: 100vh;
            margin: 0;
            overflow-x: hidden;
        }

        /* Glassmorphism Classes */
        .glass {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }

        .glass-card {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem;
            box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 50px -10px rgba(0,0,0,0.6);
            border: 1px solid rgba(255, 127, 80, 0.3); /* Warm coral subtle glow on hover */
        }

        /* Text Gradients */
        .text-gradient {
            background: linear-gradient(to right, #f8fafc, #cbd5e1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .text-gradient-accent {
            background: linear-gradient(135deg, #FF7F50, #FF9F7A);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,127,80,0.5); }
    </style>
</head>
<body class="antialiased relative">

    <!-- Background Ambient Glows -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-warm-coral rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse-slow"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-400 rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse-slow" style="animation-delay: 2s;"></div>
    </div>

    <!-- App Layout Container -->
    <div class="flex h-screen w-full max-w-[1600px] mx-auto p-4 md:p-6 gap-6">

        <!-- Sidebar Navigation (Glass) -->
        <aside class="hidden md:flex flex-col w-64 h-full glass rounded-[2rem] p-6 relative overflow-hidden">
            <!-- Logo area -->
            <div class="flex items-center gap-3 mb-12">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-warm-coral to-red-500 flex items-center justify-center shadow-lg shadow-warm-coral/30">
                    <i data-lucide="sparkles" class="text-white w-5 h-5"></i>
                </div>
                <span class="text-xl font-bold tracking-wider lowercase">lyra</span>
            </div>

            <!-- Nav Links -->
            <nav class="flex-1 space-y-2">
                <a href="#" class="flex items-center gap-4 px-4 py-3 rounded-xl bg-warm-coral/10 text-warm-coral font-medium border border-warm-coral/20">
                    <i data-lucide="layout-grid" class="w-5 h-5"></i> Dashboard
                </a>
                <a href="#" class="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                    <i data-lucide="activity" class="w-5 h-5"></i> Vitais (HealthKit)
                </a>
                <a href="#" class="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                    <i data-lucide="moon" class="w-5 h-5"></i> Trânsito Astral
                </a>
                <a href="#" class="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                    <i data-lucide="brain" class="w-5 h-5"></i> IA Longevidade
                </a>
                <a href="#" class="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                    <i data-lucide="calendar" class="w-5 h-5"></i> Consultas
                </a>
            </nav>

            <!-- User Mini Profile -->
            <div class="mt-auto pt-6 border-t border-white/10 flex items-center gap-3">
                <img src="https://i.pravatar.cc/150?img=32" alt="User" class="w-10 h-10 rounded-full border-2 border-white/20">
                <div>
                    <p class="text-sm font-medium">Você</p>
                    <p class="text-xs text-slate-400">Plano Sincronizado</p>
                </div>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 h-full flex flex-col gap-6 overflow-y-auto pr-2 pb-6">

            <!-- Header -->
            <header class="flex justify-between items-center px-2 pt-2">
                <div>
                    <h1 class="text-3xl font-bold text-gradient">Seu Bem-Estar Orquestrado 🧬</h1>
                    <p class="text-slate-400 mt-1">Sincronia perfeita entre seus dados biológicos e os astros hoje.</p>
                </div>
                <div class="flex items-center gap-4">
                    <button class="p-2 rounded-full glass hover:bg-white/10 transition-colors">
                        <i data-lucide="bell" class="w-5 h-5 text-slate-300"></i>
                    </button>
                    <button class="px-5 py-2.5 rounded-full bg-warm-coral hover:bg-warm-coral-light text-white font-medium shadow-lg shadow-warm-coral/20 transition-all flex items-center gap-2">
                        <i data-lucide="message-circle" class="w-4 h-4"></i> Chat IA (Local)
                    </button>
                </div>
            </header>

            <!-- Bento Grid System -->
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">

                <!-- Hero Metric: HRV (Spans 2 cols) -->
                <div class="glass-card col-span-1 md:col-span-2 p-6 flex flex-col justify-between min-h-[220px]">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-lg font-semibold text-slate-200 flex items-center gap-2">
                                <i data-lucide="heart-pulse" class="w-5 h-5 text-warm-coral"></i> Frequência Cardíaca (HRV)
                            </h2>
                            <p class="text-sm text-slate-400 mt-1">Sincronizado via Apple HealthKit há 2 min</p>
                        </div>
                        <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">Pico Harmônico</span>
                    </div>

                    <div class="flex items-end gap-6 mt-4">
                        <div class="text-5xl font-bold text-gradient-accent">72 <span class="text-2xl text-slate-400 font-medium">ms</span></div>

                        <!-- Simulated Chart Line -->
                        <div class="flex-1 h-12 flex items-end gap-1 opacity-80">
                            <div class="w-full h-[30%] bg-warm-coral/40 rounded-t-sm"></div>
                            <div class="w-full h-[50%] bg-warm-coral/50 rounded-t-sm"></div>
                            <div class="w-full h-[40%] bg-warm-coral/40 rounded-t-sm"></div>
                            <div class="w-full h-[70%] bg-warm-coral/70 rounded-t-sm"></div>
                            <div class="w-full h-[100%] bg-warm-coral rounded-t-sm relative shadow-[0_0_15px_rgba(255,127,80,0.5)]"></div>
                        </div>
                    </div>
                </div>

                <!-- Vedic Astrology Wheel (Spans 1 col) -->
                <div class="glass-card col-span-1 p-6 relative overflow-hidden group">
                    <!-- Rotating subtle background -->
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/5 rounded-full animate-[spin_60s_linear_infinite]"></div>
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full border-dashed animate-[spin_40s_linear_infinite_reverse]"></div>

                    <h2 class="text-lg font-semibold text-slate-200 relative z-10 flex items-center gap-2">
                        <i data-lucide="moon-star" class="w-5 h-5 text-teal-300"></i> Astro Atual
                    </h2>

                    <div class="mt-6 flex flex-col items-center justify-center relative z-10">
                        <div class="text-4xl mb-2 animate-float">♉</div>
                        <p class="font-medium text-white text-lg">Lua em Touro</p>
                        <p class="text-xs text-center text-teal-200 mt-2">Energia de aterramento. Excelente dia para recuperação muscular e refeições nutritivas.</p>
                    </div>
                </div>

                <!-- Sleep Score (Spans 1 col) -->
                <div class="glass-card col-span-1 p-6 flex flex-col justify-between">
                    <h2 class="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <i data-lucide="bed" class="w-5 h-5 text-indigo-400"></i> Sono Profundo
                    </h2>
                    <div class="mt-4">
                        <div class="flex justify-between items-end mb-2">
                            <span class="text-3xl font-bold">7h 42m</span>
                            <span class="text-sm text-slate-400">Meta: 8h</span>
                        </div>
                        <!-- Progress Bar -->
                        <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full" style="width: 90%;"></div>
                        </div>
                        <p class="text-xs text-slate-400 mt-4">Fase REM perfeita atingida durante a madrugada.</p>
                    </div>
                </div>

                <!-- AI On-Device Insight (Spans full width or large area) -->
                <div class="glass-card col-span-1 md:col-span-3 lg:col-span-4 p-1 flex relative overflow-hidden mt-2">
                    <!-- Magic border glow effect -->
                    <div class="absolute inset-0 bg-gradient-to-r from-warm-coral via-teal-400 to-warm-coral opacity-20 blur-xl"></div>

                    <div class="relative w-full h-full bg-[#0f2027]/80 backdrop-blur-3xl rounded-[1.4rem] p-6 flex flex-col md:flex-row gap-6 items-center">
                        <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <i data-lucide="cpu" class="w-8 h-8 text-warm-coral"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white">Insight Privado IA</span>
                                <span class="text-xs text-slate-400">Processado no seu dispositivo (Neural Engine)</span>
                            </div>
                            <h3 class="text-xl font-semibold text-white mb-2">Seu Protocolo de Treino para Hoje</h3>
                            <p class="text-slate-300 text-sm leading-relaxed">
                                Baseado na sua recuperação cardíaca (HRV) alta e no trânsito terrestre da lua, seu corpo está <strong>pronto para hipertrofia intensa</strong>. Sugiro concentrar os treinos de força entre as <span class="text-warm-coral font-semibold">14:30h e 15:15h</span> para máxima eficiência metabólica.
                            </p>
                        </div>
                        <button class="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 transition-colors whitespace-nowrap">
                            Ver Plano Completo
                        </button>
                    </div>
                </div>

            </div>
        </main>
    </div>

    <script>
        // Initialize Icons
        lucide.createIcons();
    </script>
</body>
</html>
```

</details>
*(Basta baixar/clonar e abrir o arquivo `.html` direto no seu navegador Chrome/Safari para interagir com o layout deslumbrante!)*

---

## 🧭 1. A Essência Transformadora: O Que Nos Move? ❤️‍🔥

A alma da **Lyra MetaCare** reside na união sagrada entre a **sabedoria milenar** e a **tecnologia de ponta**. Nós construímos este super-app para oferecer a você uma saúde preventiva *verdadeiramente personalizada*, assertiva e profundamente empoderadora.

Imagine um **ecossistema sincronizado em tempo real** pulsando no seu bolso, onde a precisão cirúrgica da **Inteligência Artificial local (on-device)** 🧠 encontra a profundidade cósmica da **Astrologia Védica** 🕉️. Aqui, não rastreamos apenas números frios; nós **orquestramos o seu bem-estar holístico** em um único e belo lugar.

### 🌟 Os Pilares Magnéticos do Nosso Ecossistema:

* 🧘🏽‍♀️ **Sincronia Holística em Tempo Real:** Sinta o poder de ter um "condutor" pessoal invisível! O app capta e integra seus dados vitais contemporâneos (seu 💤 sono profundo, ritmo do ❤️ coração, 🩸 glicose e muito mais) diretamente com os poderosos ciclos da astrologia védica. Essa fusão magistral permite que nossa IA *on-device* ofereça *insights proativos* que respeitam profundamente sua biologia única e a sua jornada cósmica – garantindo total privacidade (seus dados não saem do seu dispositivo!) e latência absolutamente zero.
* 💠 **Identidade Visual e Simbolismo Poderoso:**
  * 💫 **Símbolo:** Nossa marca unifica a gloriosa constelação de Lira 🌟 com os ícones universais de saúde (o coração amoroso ou a cruz protetora), evocando a sua verdadeira "estrela-guia". O design é uma obra de arte: um **"minimalismo geométrico fluido"** que respira, representando o movimento constante da sua vida e a perfeição absoluta da precisão dos astros.
  * ✍️ **Logotipo:** Usamos uma tipografia *sans-serif em caixa-baixa* para abraçar você logo no primeiro olhar. Queremos reforçar uma comunicação amigável, humana, empática e acessível. Nós somos o seu guia compassivo no caminho do bem-estar.
* 🎨 **Psicologia das Cores Que Transformam:**
  * 🌊 **Lyra Teal (Primária):** Feche os olhos e sinta a calma restauradora. Essa cor divina simboliza a mágica convergência entre o futurismo tecnológico brilhante e a naturalidade profunda e orgânica da sua saúde.
  * 🌅 **Warm Coral (Secundária):** Sinta o calor pulsar! Esta cor vibrante injeta o calor humano, a paixão, a energia radiante e o entusiasmo necessários para que você se engaje emocionalmente (e se vicie de forma positiva!) no seu autocuidado diário.
* 🎻 **O Conceito Encantador da "Orquestração":** *Seu Bem-Estar Orquestrado* não é apenas um slogan bonito; é o nosso mantra de vida. Ele sintetiza a harmonia perfeita entre os seus pilares biológicos da saúde e os grandiosos ciclos astrológicos, funcionando como uma organização incrivelmente inteligente e profundamente sua.
* 🚀 **Diretrizes e Inovação Sem Limites:** Nosso guia de marca estabelece regras intocáveis para manter a consistência visual deslumbrante (áreas de proteção sagradas e proibição absoluta de distorções), enquanto nos incentiva a voar cada vez mais alto, usando IA generativa para expandir a presença da nossa marca. Tudo isso, claro, sempre coroado com o insubstituível e afetuoso refinamento humano final.

---

## 🏗️ 2. Arquitetura do Sistema: A Fundação do Nosso Universo 🛠️

Para suportar algo tão grandioso e veloz, estruturamos uma base técnica de classe mundial. Segurança, velocidade e escalabilidade são o nosso DNA.

### 🏛️ Modelo Arquitetural
* 🖥️ **Front-end Monolítico Modular:** Vibrante, escalável e ultra-rápido usando o moderno **Next.js App Router**.
* ☁️ **Backend BaaS (Backend-as-a-Service):** Invisível, ágil e ultra-poderoso com a suite do **Supabase** (Auth, Postgres, Storage e Edge Functions).
* 👁️ **Observabilidade Total:** Implementamos o **Sentry** (client, server e edge) para garantir que possamos caçar bugs antes mesmo que eles pisquem na sua tela.

### 🧱 Stack Tecnológica Detalhada

| Camada Mágica 🌟 | Tecnologia Confirmada e Incrível 🛠️ |
|:---|:---|
| 🌐 **Aplicação Web** | **Next.js 15, React 19, TypeScript** (Performance imbatível e tipagem estrita!) |
| 🎨 **Beleza Visual (UI)** | **Tailwind CSS, Radix UI, shadcn/ui, Lucide** (Acessibilidade de fábrica com design de cair o queixo) |
| 📝 **Interação & Validação** | **React Hook Form + Zod** (Segurança cirúrgica e fluidez extrema em cada input) |
| 🔐 **Cofre & Identidade** | **Supabase JS, Supabase SSR, Auth UI** (Sua identidade blindada ponta a ponta) |
| 📊 **Vida aos Seus Dados** | **Recharts, Tremor, react-big-calendar** (Os números frios se transformam em gráficos vibrantes) |
| 🧪 **O Laboratório (Testes)** | **Vitest** (Nossa garantia de que a mágica nunca quebra em atualizações) |
| 🕵️‍♂️ **Olhos de Águia** | **Sentry (`@sentry/nextjs`)** (A telemetria silenciosa e protetora) |
| ⚡ **Cérebro na Nuvem** | **Supabase Edge Functions (Deno)** (Lógica e integração de IA ultrarrápida, direto na borda da rede) |

### 📐 O Fluxo Mágico (A Dança dos Dados)

```mermaid
flowchart TD
    A([💖 Você, o Usuário]) --> B{Login Supabase Auth}
    B -- "Nova Estrela?" --> C[🚀 O Despertar: Onboarding Empoderador]
    B -- "Já nos conhece!" --> D[🏡 Seu Centro de Comando: Home / Dashboard]
    C --> D
    D --> E[📊 Leitura de Métricas Vitais e Perfil Estelar]
    D --> F[📅 Agendamentos Suaves de Consultas]
    D --> G[🔮 Plano de IA: Seu Mapa do Tesouro]
    D --> H[🤖 Chat IA: Seu Guia Sábio e Compassivo]

    G --> I((⚡ Edge Function: generate-ai-plan))
    H --> J((⚡ Edge Function: ask-ai-assistant))

    D --> K{É um Guardião (Admin)?}
    K -- "Sim, com grandes poderes!" --> L[⚙️ Rotas /admin/* (Governança Total)]
```

*Nota técnica: Todo o sistema possui **RLS (Row Level Security)** estrito no banco e controle de acesso baseado em Roles (RBAC) através da função `is_admin()`. Seus dados não se misturam, nunca.*

---

## 👤 3. O Seu Guia Estelar: Manual Rápido do Usuário 📖✨

Pronto para compilar e dar o primeiro passo na sua jornada como desenvolvedor neste universo?

### 🛠️ Suas Ferramentas (Pré-requisitos)
* 🟢 **Node.js** instalado na sua máquina.
* 📦 **pnpm** (Altamente recomendado e respeitado pelo nosso `pnpm-lock.yaml`).
* ☁️ Um projeto **Supabase** pronto, com as migrações e *secrets* no lugar.

### 🪄 Instalação (Um Passe de Mágica)
Clone o repositório e rode:
```bash
pnpm install
```

### 🌍 As Chaves do Universo (Variáveis de Ambiente)
Crie o seu arquivo `.env.local` na raiz e insira a magia:

**Para o App Web (Client/Server):**
| Variável | O Poder Que Ela Traz ⚡ |
|:---|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | O portal de acesso direto ao seu banco Supabase. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | A chave pública que abre a porta de entrada. |
| `NEXT_PUBLIC_SENTRY_DSN` | Ativa o monitoramento constante e protetor (opcional em dev). |

**Para o Cérebro (Edge Functions Secrets):**
| Secret Oculta 🤫 | O Propósito Supremo 🔮 |
|:---|:---|
| `SUPABASE_URL` | Comunicação interna vital da function com o DB. |
| `SUPABASE_ANON_KEY` | O contexto puro para atuar em nome do usuário. |
| `SUPABASE_SERVICE_ROLE_KEY` | A "Master Key". Acesso supremo para ler configurações protegidas da IA. |
| `OPENAI_API_KEY` | A centelha de genialidade para as respostas reais e humanas do assistente! |

> **Observação de Ouro 🔐:** Lembre-se, segurança é hábito! Nunca faça commit de chaves reais. Sempre utilize `.env.local` e gerencie as *secrets* via CLI do Supabase para o ambiente de *Edge*.

### 🚀 Decolando em Modo Desenvolvimento
```bash
pnpm dev
```
Abra o portal na sua máquina interdimensional acessando: [**http://localhost:3000**](http://localhost:3000).

### ✅ Garantindo a Perfeição (Testes)
Nós amamos estabilidade. Antes de subir uma nova estrela, verifique se tudo brilha:
```bash
pnpm test
```

### 🏭 Construindo a Máquina para o Mundo (Produção)
```bash
pnpm build
pnpm start
```

---

## 🎨 4. Uma Experiência de Usuário (UI/UX) Que Vicia Positivamente 😍📱

Nós não desenhamos apenas telas; nós **esculpimos experiências**. A Lyra MetaCare foi projetada meticulosamente com as maiores tendências de 2024/2026: muito Glassmorphism suave, Bento Grids que abraçam as informações e animações que parecem respirar com você.

### 🛤️ Sua Jornada Fluida
1. **A Porta de Entrada**: Um login indolor e rápido (via redes sociais ou email mágico) na rota `/login`.
2. **O Despertar**: Um fluxo de onboarding imersivo que coleta suas informações com carinho e te insere no ecossistema sem atritos.
3. **O Centro do seu Universo**: O *Dashboard*, com navegação cristalina via sidebar e header responsivos.
4. **Módulos Profundos**: Áreas focadas para *Perfil*, *Metas*, *Monitoramento Diário*, *Chat Inteligente*, *Planos IA*, e *Agenda de Consultas*.
5. **A Torre de Controle**: Páginas administrativas isoladas e seguras (`/admin/*`) exclusivas para a governança dos deuses (Admins).

### 💖 A Beleza Nos Detalhes
* **Acolhimento Visual:** Uma gloriosa tela de carregamento (Splash screen) que elimina qualquer "pisco" (flicker) grosseiro e te acolhe suavemente no estado da aplicação.
* **Componentes Premium:** Estruturas elegantes com *cards de vidro* translúcidos (`backdrop-blur`), bordas amplas e arredondadas (`1rem` de raio), e *sombras glass* únicas, proporcionando uma sensação tátil de alta tecnologia.
* **Celebre Cada Vitória! 🥳:** Feedbacks instantâneos via pequenos "toasts" elegantes e animadíssimos (`sonner`) que estouram na tela a cada métrica preenchida ou consulta salva!

### 🚦 Estados da Interface que Conversam com Você
* **⏳ Carregando**: Ninguém gosta de tela em branco. Nossos *Skeletons* pulsantes (`pulse-slow`) fazem a transição parecer mágica.
* **🚨 Ups, Erro**: Toasts vermelhos, discretos porém firmes, avisam quando algo precisa da sua atenção, sem culpar o usuário.
* **✅ Sucesso Absoluto**: Confirmações verdes e felizes aparecem quando tudo dá certo!
* **🛑 Acesso Negado**: Você tentou entrar onde não deve? Um card gentil explicará que a área é restrita, sem mensagens hostis.

---

## ⚙️ 5. O Cérebro Por Trás da Magia (Para os Mestres de Dados) 🧙‍♂️📊

A inteligência da Lyra MetaCare é altamente configurável e paramétrica.

### 🎛️ Os Controles da Nave (Configurações da IA via Painel Admin)
Os administradores podem moldar o comportamento exato da IA configurando a tabela `ai_config` diretamente na tela:
* `mission` 🎯 (A diretriz mestre de comportamento).
* `key_objectives` 🏆 (Os alvos de melhoria do usuário).
* `weight_hrv`, `weight_sleep`, `weight_activity`, `weight_nutrition` ⚖️ (Pesos dinâmicos para a orquestração do seu score único).
* `model_name` 🤖 (Facilidade para chavear entre GPT-4o, Claude 3, etc., via contrato).

---

## 🛡️ 6. A Fortaleza Indestrutível: Segurança e Performance ⚡🔒

Nós levamos a sua paz de espírito – e a velocidade da sua experiência – incrivelmente a sério!

### 💪 Nossos Escudos de Defesa de Dados
* **Validação de Aço**: A biblioteca `Zod` analisa e sanitiza impecavelmente todos os formulários. Lixo não entra, lixo não sai.
* **Muralhas de Dados Pessoais (RLS)**: Cada linha no banco de dados tem Row Level Security rigoroso baseado em `auth.uid()`. Seus dados são criptograficamente *apenas seus*. Ninguém mais vê.
* **Guardiões dos Portões (RBAC)**: Controle de acesso implacável usando *roles* (papéis de usuário) e a função SQL nativa `is_admin()`.

### 🏎️ Performance Que Desafia a Luz
* **Sem Gargalos na Rede**: Nossas telas fazem consultas ao banco de dados utilizando paralelismo brutal via `Promise.all()`. O tempo de carregamento cai instantaneamente pela metade!
* **Inteligência Cirúrgica de Carga**: O padrão de busca para dados pesados (ex: sorteio de tabelas gigantes) nunca puxa tudo. Nós buscamos o `count` total primeiro, e injetamos o `range(index, index)` no Supabase para puxar a linha exata. Milissegundos!

---

## 🗺️ 7. O Horizonte Infinito: Nosso Roadmap 🌠🔭

Nossa jornada está apenas começando e as estrelas são o limite. O que já está no nosso radar de inovação:

1. 🤝 **Contrato Universal IA-UI:** Consolidar o grande pacto versionado de *request/response* entre a bela Interface e as Edge Functions, pavimentando o caminho para o uso agnóstico de qualquer grande modelo fundacional de IA do mercado.
2. 🛡️ **Expandir a Armadura de Testes:** Aumentar massivamente a cobertura de *End-to-End* (E2E) E testes automatizados nas Edge Functions (para dormirmos ainda mais tranquilos).
3. 📜 **O Grande Livro de Feitiços (Runbook):** Escrever a enciclopédia operacional definitiva para provisionamentos, deploys *zero-downtime* e estratégias infalíveis de rollback majestoso.

---

<div align="center">

### 🌟 Venha Orquestrar o Seu Bem-Estar com a Gente! 🌟
**Lyra MetaCare** não é apenas código. É um manifesto revolucionário de longevidade, amor próprio profundo e inteligência tecnológica sem limites. O universo, e a sua melhor versão, te esperam! 🚀✨💖

*Feito com suor, dados e pó de estrelas.*

</div>
