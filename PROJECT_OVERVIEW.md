# Visão Geral do Projeto

Este documento resume as principais tecnologias, funcionalidades e estrutura do projeto `next-template` em português.

## Tecnologias Principais

O projeto utiliza uma stack moderna e robusta baseada em React e TypeScript:

*   **Framework**: Next.js 15 (App Router).
*   **Linguagem**: TypeScript.
*   **Interface do Usuário (UI)**:
    *   **Componentes**: Shadcn/UI (baseado em Radix UI).
    *   **Estilização**: Tailwind CSS.
    *   **Ícones**: Lucide React.
    *   **Animações**: `tailwindcss-animate`, Radix UI.
    *   **Notificações**: Sonner.
    *   **Gráficos**: Recharts, Tremor React.
*   **Formulários**: React Hook Form com validação Zod.
*   **Backend & Banco de Dados**: Supabase (Autenticação, Banco de Dados, Funções Edge).
*   **Gerenciamento de Estado**: React Context API, Hooks (`useState`, `useReducer`).
*   **Monitoramento**: Sentry.
*   **Outras Bibliotecas Importantes**:
    *   `date-fns` para manipulação de datas.
    *   `react-big-calendar` para calendários.
    *   `vaul` para drawers.

## Estrutura de Funcionalidades (`src/app`)

A estrutura de diretórios em `src/app` revela as principais áreas funcionais da aplicação:

*   **`admin`**: Área administrativa.
*   **`appointments`**: Agendamento e gerenciamento de consultas.
*   **`chat`**: Funcionalidade de comunicação em tempo real.
*   **`connect`**: Possível funcionalidade de integração ou conexão social.
*   **`goals`**: Definição e acompanhamento de metas/objetivos.
*   **`instruments`**: Provavelmente refere-se a ferramentas de avaliação, questionários ou instrumentos clínicos/psicométricos.
*   **`login`**: Autenticação e acesso.
*   **`monitoring`**: Monitoramento de progresso ou métricas.
*   **`onboarding`**: Fluxo de introdução para novos usuários.
*   **`plan`**: Planos de ação ou assinaturas.
*   **`profile`**: Perfil do usuário.

## Diretrizes de Desenvolvimento (`AI_RULES.md`)

O projeto segue regras estritas para manter a qualidade e consistência do código, conforme definido em `AI_RULES.md`:

1.  Priorizar componentes Shadcn/UI (`src/components/ui/`).
2.  Usar exclusivamente Tailwind CSS para estilização (evitar CSS-in-JS ou arquivos CSS globais excessivos).
3.  Utilizar React Hook Form + Zod para todos os formulários.
4.  Gerenciar estado local com Hooks e estado global simples com Context API (evitar Redux/Zustand a menos que estritamente necessário).
5.  Usar Next.js App Router para roteamento.
6.  Buscar dados via Fetch API ou Server Actions.
7.  Usar TypeScript estrito (evitar `any`).

## Observações Adicionais

*   O projeto usa fontes otimizadas com `next/font` (Geist).
*   Está configurado para deploy na Vercel.
*   A aplicação parece ser voltada para gestão de saúde, coaching ou desenvolvimento pessoal, dada a presença de "goals", "monitoring", "instruments" e "plan".
