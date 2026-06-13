# TASK MESTRA - REDESIGN LYRA METACARE 2026

Data de criacao: 2026-03-20
Projeto: Lyra MetaCare
Workspace: `C:\temp\Lyra-MetaCare`
Responsavel pela execucao: Codex
Estilo: Astrologia moderna, aura esotérica luminosa e fusão com modelos de IA, sem linguagem nem atmosfera de clínica.

## Regra operacional permanente

- Este arquivo e a task mestre viva da execucao.
- Ele deve ser lido antes de continuar qualquer bloco relevante.
- Ele deve ser atualizado ao final de cada item ou grupo de itens concluidos.
- Se o usuario adicionar novas exigencias, elas devem ser incorporadas aqui sem apagar historico relevante.
- Nenhum bloco deve ser considerado concluido sem validacao real correspondente.
- Ao final de cada item ou grupo de itens relacionados, executar checks reais e atualizar o status deste documento.
- Commit e push voltaram a ser obrigacao do agente ao final de cada item ou bloco concluido.

## Direcao obrigatoria consolidada

- Idioma integral do app, comentarios, documentacao e relatorios: pt-BR.
- Nao resumir solicitacoes do usuario.
- Executar com qualidade premium, sem pressa e sem simplificacao rasa.
- Corrigir pela causa raiz, sem contorno.
- Nao usar placeholders, simulacoes, TODOs funcionais, hardcodes indevidos ou cortes de codigo.
- Nao remover funcionalidades existentes.
- Nao instalar novas dependencias de UI, CSS ou animacao.
- Tema visual principal obrigatorio: claro.
- Direcao visual corrigida pelo usuario:
  - nao parecer clinica;
  - nao comunicar estetica hospitalar;
  - puxar para astrologia moderna, toque esoterico sofisticado e fusao com tecnologia de modelos de IA;
  - manter confianca, serenidade, luxo suave, clareza e acessibilidade;
  - usar cores claras, etereas e luminosas.
- Nova obrigacao adicionada pelo usuario:
  - ao final da linha de implementacao do modulo Elementor/Lyra, criar `implement_elementor_lyra.py` na raiz;
  - o script deve instalar e configurar o modulo em qualquer outro app de forma real;
  - o modulo precisa ser portavel e segregado do app para viabilizar reaproveitamento.

## Regras de infraestrutura e operacao

- Python, quando necessario: usar `venv` na raiz do projeto.
- Stack web principal: `pnpm`, sem trocar a stack existente.
- Banco de dados MySQL: no Docker Desktop, nome `lyra-metacare`.
- O Docker pode ser iniciado pelo agente quando houver necessidade real de banco, migracao ou validacao runtime dependente de MySQL.
- Enquanto o Docker estiver desligado, focar em front-end, layout, validacoes de types, lint e format que nao dependam do banco.

## Status geral atual

- [x] Fundacao visual global iniciada e reescrita.
- [x] Layout raiz principal refeito.
- [x] Shell do app principal refeito.
- [x] Componentes UI base reestilizados e finalizados (chart.tsx conforme; ui/sidebar.tsx auditado como token-based e sem consumidores).
- [x] Landing page reescrita estruturalmente e validada com publicacao publica real.
- [x] Login reescrito estruturalmente, validado e tokenizado por completo (interface 100% em tokens do design system; ilustracao cenica preservada como arte).
- [x] Dashboard principal revisado contra a nova direcao astrologica moderna + IA.
- [x] Demais modulos do paciente finalizados no novo padrao (chat, perfil, onboarding, instruments, connect, goals, appointments, monitoring, VedicDashboard).
- [x] Modulos de billing finalizados no novo padrao (BillingReturnExperience, PlanUpgradeNotice, PlanBadge conformes).
- [x] Modulos administrativos finalizados no novo padrao (6 paginas admin, AIConfigForm, AdminContentManagement, AdminDashboardContent, AdminReportsContent, DataHealthContent, UserDetailModal, UserManagementContent, AdminPlanMatrixContent).
- [x] Configuracao final do admin `admin@coragem.pet` validada em banco.
- [x] Configuracao final do admin `admin@admin.com` validada em banco.
- [x] Bootstrap multi-admin validado com migracao real e login administrativo real.
- [x] Navegacao visual completa validada em navegador real (MySQL ativo, login admin@admin.com, percurso desktop+mobile: landing, login, dashboard, admin/ai-config, perfil e MobileSidebar).
- [x] Checks finais executados com sucesso (fix:format, fix:lint, check:lint, check:format, check:types e vitest 59/59) e bloco versionado.
- [x] Causa raiz de erro de hidratacao corrigida: `CardTitle` (`ui/card.tsx`) renderizava `<p>` e recebia `<div>` (boxes de icone) como filho — HTML proibe `<div>` dentro de `<p>`, gerando hydration error em todas as telas com titulo+icone; trocado para `<div>` (alinhado ao shadcn/ui atual). Prova no DOM: zero `<p>` com bloco aninhado em `/`, `/admin/ai-config` e `/profile`.
- [x] Causa raiz de falha no bootstrap multi-admin corrigida: `EnvManager.load` (`run_windows.py`) nao desfazia o escape do `json.dumps` aplicado por `upsert`, entregando JSON invalido ao `mysql-migrate.mjs`; round-trip tornado simetrico com `json.loads`.

## Infraestrutura local validada nesta etapa

- [x] `run.py` auditado e classificado como inadequado para Windows e desalinhado da stack real atual.
- [x] `run_windows.py` criado na raiz para orquestrar ambiente Windows real.
- [x] `run_windows.py` validado com:
  - `doctor`
  - `setup-env`
  - `start-dev`
- [x] MySQL validado em Docker Compose na porta `3307`.
- [x] Migracoes MySQL executadas de forma real.
- [x] App validado em `http://localhost:3000`.
- [x] Causa raiz do erro `500` na home encontrada e corrigida via limpeza controlada de `.next` antes da subida dev no Windows.
- [x] Teste administrativo de conectividade de IA ampliado para validar Gemini quando configurado no ambiente local.

## QA funcional real em andamento

- [x] Login administrativo real validado com `admin@admin.com`.
- [x] Sidebar administrativa validada em navegador real.
- [x] Dashboard validado em navegador real.
- [x] `admin/page-builder` validado em navegador real.
- [~] `appointments` em revisao estrutural e visual apos validacao runtime real.
- [x] `appointments` estabilizado sem erro fatal de runtime apos reestruturacao visual do modulo.
- [x] `profile` validado em navegador real e ajustado para o tema claro premium.
- [x] `monitoring` reescrito no padrao claro premium e validado tecnicamente.
- [x] `admin/page-builder` ampliado com controles reais de tipografia para landing e login.
- [x] Auditoria profunda inicial da pasta `ELEMENTOR` executada com inventario real dos pacotes locais.
- [x] Causa raiz identificada para a integracao direta do Elementor: dependencia de WordPress/PHP/core `elementor`, ausente na pasta auditada.
- [x] Task especifica `TASK_IMPLEMENTACAO_REFERENCIA_ELEMENTOR_LYRA.md` fortalecida com mapa completo de capacidades, bloqueios e proposta de engine reutilizavel.
- [x] `site-page-config` corrigido para suportar `landing`, `login` e `app` de forma coerente na tipagem.
- [x] `SiteExperienceBuilder` ampliado com contexto real de `App Interno`, incluindo preview administrativo e controles reais de sidebar, header, tipografia, sizing e modulos internos.
- [x] Causa raiz dos erros de `check:format` e `check:lint` apos a inclusao da pasta `ELEMENTOR` corrigida com isolamento apropriado nos arquivos de ignore.
- [x] Modulo reutilizavel `modules/lyra-customaze-ui-ux` fortalecido com contrato tecnico de integracao.
- [x] `implement_elementor_lyra.py` criado na raiz com instalacao real para projetos compativeis com Next.js App Router + TypeScript.
- [x] `package.json` atualizado com o script `lyra-customaze:install`.
- [x] `src/lib/site-page-config/index.ts` criado para consolidar os reexports do nucleo segregado.
- [x] `src/lib/site-page-config/service.ts` passou a consumir utilitarios genericos de armazenamento vindos do modulo reutilizavel.
- [x] `page-config/app` passou a ser consumido de forma real em `sidebar`, `header`, `mobile sidebar`, `appointments`, `monitoring` e `profile`.
- [x] Publicacao administrativa real do `page-config/app` validada com reflexo imediato no navegador.
- [x] `page-config/app.dashboard` passou a ser consumido de forma real na home principal e no `dashboard`.
- [x] `admin/page-builder` passou a expor edicao guiada real do `dashboard` no contexto `App interno`.
- [x] Publicacao administrativa real do `dashboard` validada com reflexo imediato na home, no dashboard e no preview do builder.
- [~] Varredura completa de menus, dropdowns, CRUDs, onboarding e configuracoes ainda em execucao.

## O que ja foi concluido de forma real

### Fase 1 - Fundacao

- [x] `src/app/globals.css`
- [x] `tailwind.config.ts`
- [x] `src/app/layout.tsx`
- [x] `src/app/page.tsx`

### Fase 2 - Shell do app

- [x] `src/components/layout/AppShell.tsx`
- [x] `src/components/layout/navigation.ts`
- [x] `src/components/layout/sidebar.tsx`
- [x] `src/components/layout/SidebarLink.tsx`

## Log de progresso recente

- 2026-03-27 00:08:15
  - publicacao real do `page-config/app` executada com autenticacao administrativa
  - novos campos de `dashboard` publicados no banco
  - reflexo validado em navegador real na home e no `admin/page-builder`
- [x] `src/components/layout/header.tsx`
- [x] `src/components/layout/MobileSidebar.tsx`
- [x] `src/components/SplashScreen.tsx`

### Fase 3 - UI base ja tratada

- [x] `src/components/ui/button.tsx`
- [x] `src/components/ui/card.tsx`
- [x] `src/components/ui/input.tsx`
- [x] `src/components/ui/badge.tsx`
- [x] `src/components/ui/dialog.tsx`
- [x] `src/components/ui/sheet.tsx`
- [x] `src/components/ui/select.tsx`
- [x] `src/components/ui/checkbox.tsx`
- [x] `src/components/ui/switch.tsx`
- [x] `src/components/ui/table.tsx`
- [x] `src/components/ui/progress.tsx`
- [x] `src/components/ui/skeleton.tsx`
- [x] `src/components/ui/avatar.tsx`
- [x] `src/components/ui/tooltip.tsx`
- [x] `src/components/ui/dropdown-menu.tsx`
- [x] `src/components/ui/popover.tsx`
- [x] `src/components/ui/slider.tsx`
- [x] `src/components/ui/accordion.tsx`
- [x] `src/components/ui/sonner.tsx`
- [x] `src/components/ui/calendar.tsx`
- [x] `src/components/ui/form.tsx`
- [x] `src/components/ui/pagination.tsx`
- [x] `src/components/ui/date-picker.tsx`
- [x] `src/components/ui/time-input.tsx`
- [x] `src/components/ui/alert.tsx`
- [x] `src/components/ui/drawer.tsx`
- [x] `src/components/ui/tabs.tsx`
- [x] `src/components/ui/chart.tsx`
- [x] `src/components/ui/sidebar.tsx` (auditado: token-based, sem consumidores)

### Fase 6.1 - Editor administrativo da experiencia web

- [x] `src/lib/site-page-config/schema.ts`
- [x] `src/lib/site-page-config/service.ts`
- [x] `src/lib/site-page-config/ui.ts`
- [x] `src/app/api/admin/page-config/[pageKey]/route.ts`
- [x] `src/app/api/public/page-config/[pageKey]/route.ts`
- [x] `src/components/admin/SiteExperienceBuilder.tsx`
- [x] `src/components/admin/AdminContentManagement.tsx`
- [x] `src/app/admin/content/page.tsx`
- [x] `src/app/admin/page-builder/page.tsx`
- [x] `src/components/admin/page-builder/PageBuilderContent.tsx`
- [x] Validacao real de rascunho/publicacao da landing e do login.
- [x] Validacao real da guarda admin nas rotas e APIs administrativas.

## Pendencias imediatas em execucao

### Bloco imediato 1 - saneamento tecnico do bloco ja alterado

- [x] Corrigir warnings e erros atuais de lint.
- [x] Revalidar formatacao.
- [x] Revalidar tipagem.
- [x] Entregar bloco fundacao + shell + UI base validado e versionado.

### Bloco imediato 2 - direcao visual central corrigida pelo usuario

- [x] Reescrever `src/components/landing/LandingPage.tsx` do zero.
- [x] Reescrever `src/app/login/page.tsx` do zero.
- [x] Garantir que a narrativa visual nao pareca clinica.
- [x] Garantir linguagem de astrologia moderna, toque esoterico sofisticado e fusao com modelos de IA.
- [x] Garantir que a landing pareca premium, luminosa, linda, delicada e inovadora.
- [x] Garantir que o login acompanhe exatamente a mesma identidade.
- [x] Validar types, lint e format.
- [x] Validar publicacao real da landing e do login via API publica e interface real.
- [x] Entregar bloco landing + auth validado e versionado.

## Checklist integral de execucao por fases

### Fase 1 - Fundacao do Design System

- [x] Reescrever `globals.css`
- [x] Reescrever `tailwind.config.ts`
- [x] Ajustar `src/app/layout.tsx`

### Fase 2 - Shell do App

- [x] Reescrever `sidebar.tsx`
- [x] Reescrever `SidebarLink.tsx`
- [x] Reescrever `header.tsx`
- [x] Reescrever `MobileSidebar.tsx`
- [x] Reescrever `SplashScreen.tsx`

### Fase 3 - Componentes UI Base

- [x] `button.tsx`
- [x] `card.tsx`
- [x] `input.tsx`
- [x] `badge.tsx`
- [x] `dialog.tsx`
- [x] `sheet.tsx`
- [x] `drawer.tsx`
- [x] `tabs.tsx`
- [x] `table.tsx`
- [x] `form.tsx`
- [x] `select.tsx`
- [x] `checkbox.tsx`
- [x] `switch.tsx`
- [x] `avatar.tsx`
- [x] `tooltip.tsx`
- [x] `dropdown-menu.tsx`
- [x] `popover.tsx`
- [x] `progress.tsx`
- [x] `skeleton.tsx`
- [x] `sonner.tsx`
- [x] `calendar.tsx`
- [x] `pagination.tsx`
- [x] `accordion.tsx`
- [x] `slider.tsx`
- [x] `date-picker.tsx`
- [x] `time-input.tsx`
- [x] `chart.tsx`
- [x] `sidebar.tsx` de UI (auditado: token-based, sem consumidores)

### Fase 4 - Paginas principais do paciente

- [x] `src/components/dashboard/dashboard.tsx`
- [x] `src/components/dashboard/MetricGrid.tsx`
- [x] `src/components/dashboard/AITipsCard.tsx`
- [x] `src/components/dashboard/QuickScanFAB.tsx`
- [x] `src/components/ai-plan/AIPlanContent.tsx`
- [x] `src/components/goals/GoalTrackingContent.tsx`
- [~] `src/components/goals/CreateGoalModal.tsx`
- [~] `src/components/goals/UpdateGoalProgressModal.tsx`
- [~] `src/components/appointments/AppointmentsContent.tsx`
- [x] `src/components/appointments/AppointmentsContent.tsx`
- [~] `src/components/appointments/Agenda.tsx`
- [~] `src/components/appointments/AppointmentFormModal.tsx`
- [~] `src/components/appointments/BookingConfirmationModal.tsx`
- [~] `src/components/appointments/ProfessionalCard.tsx`
- [~] `src/components/appointments/ProfessionalFormModal.tsx`
- [~] `src/components/appointments/ProfessionalAvatarUploader.tsx`
- [~] `src/components/appointments/TimeSlotPicker.tsx`
- [~] `src/components/monitoring/RealTimeMonitoringContent.tsx`
- [~] `src/components/monitoring/RealTimeMetricCard.tsx`
- [~] `src/components/monitoring/LiveHeartRateChart.tsx`
- [~] `src/components/monitoring/MapPlaceholder.tsx`
- [x] `src/components/monitoring/RealTimeMonitoringContent.tsx`
- [x] `src/components/monitoring/RealTimeMetricCard.tsx`
- [x] `src/components/monitoring/LiveHeartRateChart.tsx`
- [x] `src/components/monitoring/MapPlaceholder.tsx`
- [~] `src/components/chat/ChatAssistantContent.tsx`
- [~] `src/components/chat/ChatBubble.tsx`
- [~] `src/components/chat/ChatInput.tsx`
- [~] `src/components/chat/QuickReply.tsx`
- [~] `src/components/chat/TypingIndicator.tsx`
- [~] `src/components/data-connection/WearableConnection.tsx`
- [~] `src/components/profile/ProfileForm.tsx`
- [~] `src/components/profile/AvatarUploader.tsx`
- [~] `src/components/profile/HabitList.tsx`
- [~] `src/components/onboarding/onboarding-form.tsx`
- [~] `src/components/onboarding/OnboardingNavigationDots.tsx`

### Fase 5 - Billing

- [~] `src/components/subscription/AccountSubscriptionCard.tsx`
- [~] `src/components/subscription/BillingActionPanel.tsx`
- [~] `src/components/subscription/BillingReturnExperience.tsx`
- [ ] `src/components/subscription/PlanBadge.tsx`
- [~] `src/components/subscription/PlanUpgradeNotice.tsx`
- [~] `src/app/billing/success/page.tsx`
- [~] `src/app/billing/cancel/page.tsx`

### Fase 6 - Admin

- [~] `src/components/admin/AdminDashboardContent.tsx`
- [~] `src/components/admin/UserManagementContent.tsx`
- [~] `src/components/admin/UserDetailModal.tsx`
- [~] `src/components/admin/AdminPlanMatrixContent.tsx`
- [~] `src/components/admin/AIConfigForm.tsx`
- [~] `src/components/admin/AdminContentManagement.tsx`
- [~] `src/components/admin/AITipFormModal.tsx`
- [~] `src/components/admin/SuggestedHabitFormModal.tsx`
- [~] `src/components/admin/AdminReportsContent.tsx`
- [~] `src/components/admin/DataHealthContent.tsx`

### Fase 7 - Landing e Auth

- [x] `src/components/landing/LandingPage.tsx`
- [x] `src/app/login/page.tsx`

### Fase 8 - Finalizacao

- [x] `src/components/made-with-ilyra.tsx` (auditado: conforme)
- [x] Configurar admin `admin@coragem.pet`
- [x] Configurar admin `admin@admin.com`
- [x] Validar login real do admin `admin@admin.com`
- [~] Testar navegacao visual completa (validacao tecnica por grep ok; navegador real pendente de sessao com MySQL ativo)
- [x] Corrigir warnings e erros restantes
- [x] Executar checks finais completos (lint, format, types, vitest 59/59)
- [x] Entregar estado final validado e versionado

## Checks obrigatorios por bloco

Executar exatamente:

```bash
npm run fix:format
npm run fix:lint
npm run check:lint
npm run check:format
npm run check:types
```

## Log de progresso

- 2026-03-20 1: task mestre criada na raiz e consolidada como fonte viva da execucao.
- 2026-03-20 2: fundacao visual, shell principal e boa parte dos componentes UI base ja haviam sido reescritos.
- 2026-03-20 3: navigation, header, query-utils.test e PlanBadge receberam correcoes tecnicas e de linguagem.
- 2026-03-20 4: `src/components/landing/LandingPage.tsx` foi reescrita com direcao clara, astral, luminosa e sem promessas falsas; nesta etapa entrou em ajuste fino para ficar mais fofa, amigavel e acolhedora.
- 2026-03-20 5: `src/app/login/page.tsx` foi reescrita em layout split, mantendo auth real e adicionando linguagem visual mais suave e acolhedora; falta validacao tecnica final antes de marcar como concluida.
- 2026-03-20 6: `src/components/landing/LandingPage.tsx` e `src/app/login/page.tsx` validadas para types, lint e format com sucesso.
- 2026-03-25 7: editor administrativo da experiencia web validado com MySQL real, publicacao real da landing e do login, rota admin protegida sem sessao e guarda de API administrativa retornando 401 sem autenticacao.
- 2026-03-25 8: bootstrap de administradores ampliado para suportar multiplos admins via `ADMIN_BOOTSTRAP_ADDITIONAL_ADMINS`.
- 2026-03-25 9: administrador adicional `admin@admin.com` planejado para bootstrap local com acesso total por `role = 'admin'`, cobrindo rotas admin, CRUD administrativo, configuracoes, billing administrativo e guardas de API.
- 2026-03-25 10: causa raiz da falha de migracao identificada na `005_add_ui_config.sql`: collation `utf8mb4_general_ci` entrava em conflito com `users.id` em `utf8mb4_0900_ai_ci`, impedindo a foreign key de `updated_by`.
- 2026-03-25 11: `scripts/mysql-migrate.mjs` passou a normalizar checksums historicos por quebra de linha, eliminando falso conflito de migracao em arquivos ja aplicados.
- 2026-03-25 12: migracoes reais executadas com sucesso no MySQL local via Docker, incluindo `005_add_ui_config.sql` e `006_adjust_utf8_collation_to_unicode_ci.sql`.
- 2026-03-25 13: `admin@admin.com` validado de ponta a ponta com login HTTP real, sessao autenticada, cookie funcional e acesso bem-sucedido a `/api/admin/users`.
- 2026-03-25 14: `npm run fix:format`, `npm run fix:lint`, `npm run check:lint`, `npm run check:format` e `npm run check:types` executados com sucesso apos as correcoes do bloco de migracoes e bootstrap admin.
- 2026-03-25 15: bloco de migracoes e bootstrap multi-admin versionado e publicado em `main` no commit `02c8046`.
- 2026-03-25 16: dashboard principal refeito com hero claro premium, cards cosmicos, FAB real de acoes rapidas, `AITipsCard` conectado ao feed real `ai_tips`, `MetricGrid` migrado do estilo antigo para o design system atual e textos de navegacao/header corrigidos em pt-BR.
- 2026-03-25 17: causa raiz do ruído no console isolada em hot reload durante a troca integral do `MetricGrid`; validacao final em sessao limpa do Playwright confirmou dashboard real carregando sem erros e sem warnings de console alem dos avisos informativos do React DevTools.
- 2026-03-25 18: `HealthOrchestratorContext` passou a refletir sincronizacao parcial apenas no estado da UI, sem poluir o console com warning redundante, e `.playwright-cli` foi adicionado ao `.gitignore` para manter o versionamento limpo.
- 2026-03-25 19: experiencia `AIPlanContent` reescrita no novo design system claro, com hero editorial, contexto astrológico real, persistencia real em MySQL, tabs premium por pilar e cards de recomendacao sem placeholder.
- 2026-03-25 20: geracao do plano validada na propria interface em `/plan`, com retorno real de 3 pilares e 6 recomendacoes, console limpo no navegador e confirmacao da gravacao em `ai_plans` dentro do container MySQL `lyra-metacare-mysql`.
- 2026-03-25 21: `GoalTrackingContent` e a pagina `/goals` foram reescritos no design system claro atual, trocando o estado vazio antigo por uma experiencia editorial mais acolhedora, com cards-resumo, leitura de progresso medio e lista real de metas sem dados simulados.
- 2026-03-25 22: fluxo real de criacao manual de meta validado em `/goals` com Playwright, incluindo toast de sucesso na UI, exibicao imediata do card da meta criada e persistencia confirmada na tabela `goals` no MySQL local via Docker.
- 2026-03-26 23: modulo `monitoring` reescrito para o design system claro premium, removendo classes antigas `gray`, `dark` e sombras legadas, mantendo canal realtime, grafico, feed local e controles de voz/alerta em funcionamento real.
- 2026-03-26 24: `admin/page-builder` passou a expor controles visuais de tipografia para landing e login, com persistencia real em schema/configuracao publicada e reflexo direto no frontend publico.
- 2026-03-26 25: validacao em navegador real confirmou a presenca dos controles de tipografia no construtor administrativo da landing, incluindo sliders para hero, secoes, cards, botoes, painel introdutorio, card de auth, labels e rodape.
- 2026-03-26 26: `pnpm run fix:format`, `pnpm run fix:lint`, `pnpm run check:lint`, `pnpm run check:format` e `pnpm run check:types` executados com sucesso apos o bloco monitoring + tipografia do page builder.
- 2026-03-26 27: o modulo portavel `modules/lyra-customaze-ui-ux` recebeu contrato tecnico de integracao para apps consumidores, separando melhor o nucleo reutilizavel da Lyra.
- 2026-03-26 28: `implement_elementor_lyra.py` foi criado na raiz e validado em execucao real no proprio projeto, detectando o alvo compativel, alinhando os reexports e registrando o script `lyra-customaze:install` no `package.json`.
- 2026-03-26 29: a identidade do modulo foi renomeada para `Lyra Customaze UI UX`, mantendo o nome do instalador por compatibilidade com a exigencia anterior do projeto.
- 2026-03-26 30: a camada generica de armazenamento do builder foi extraida para `modules/lyra-customaze-ui-ux/src/site-page-config/storage.ts`, e o adapter MySQL da Lyra passou a consumir esses utilitarios em `src/lib/site-page-config/service.ts`.
- 2026-03-26 31: o modulo `Lyra Customaze UI UX` ganhou helpers reutilizaveis de runtime para escala visual, e o `page-config/app` deixou de ser apenas preview administrativo, passando a impactar de forma real `sidebar`, `header`, `mobile sidebar`, `appointments`, `monitoring` e `profile`.
- 2026-03-26 32: validacao real em navegador autenticado confirmou publicacao administrativa do `page-config/app` e reflexo imediato no app interno, incluindo atualizacao visivel de branding lateral, placeholder do header, CTA de chat e titulos de `appointments`.
- 2026-03-27 33: `page-config/app` foi expandido com o dominio real `chat`, cobrindo eyebrow, titulo, descricao, mensagem inicial da IA, respostas rapidas, placeholder do input e camada de integracoes.
- 2026-03-27 34: `admin/page-builder` passou a exibir edicao guiada real do bloco `Chat IA` no contexto `App interno`, alem do preview administrativo com resumo do modulo.
- 2026-03-27 35: `src/components/chat/ChatAssistantContent.tsx` e `src/app/chat/page.tsx` foram reescritos para consumir `page-config/app.chat` e abandonar o viés visual antigo, deixando o chat mais claro, acolhedor e configuravel.
- 2026-03-27 36: a causa raiz do travamento na validacao HTTP foi isolada na diferenca entre `127.0.0.1` e `localhost`; a instancia local desta etapa responde em `http://localhost:3000`, e a validacao administrativa passou a usar essa origem.
- 2026-03-27 37: login administrativo, `PUT` de rascunho e `POST` de publish em `/api/admin/page-config/app` foram executados com sucesso para o bloco `chat`.
- 2026-03-27 38: navegador real autenticado confirmou o reflexo do bloco publicado em `/admin/page-builder` e `/chat`, incluindo os textos `Chat Lyra publicado pelo builder com conversa mais clara e elegante`, `Perguntas iniciais editáveis` e `Base operacional da conversa`.
- 2026-03-27 39: `page-config/app` foi expandido com o dominio real `connect`, cobrindo linguagem editorial da pagina, estados de bluetooth, mensagens de compatibilidade, sucesso, erro e botoes do fluxo de conexao.
- 2026-03-27 40: `admin/page-builder` passou a expor edicao guiada real do modulo `Dispositivos` dentro de `App interno`, com preview administrativo refletindo o bloco publicado.
- 2026-03-27 41: `src/app/connect/page.tsx` e `src/components/data-connection/WearableConnection.tsx` foram conectados ao `page-config/app.connect`, deixando a tela de wearables configuravel pelo builder.
- 2026-03-27 42: publicacao administrativa real do bloco `connect` foi executada com sucesso na API de `page-config/app`.
- 2026-03-27 43: navegador real autenticado confirmou o reflexo do bloco `connect` em `/connect` e no preview do `App interno`, incluindo os textos `Conexão Lyra publicada pelo builder para wearables e bluetooth`, `Painel vivo de conexão bluetooth` e `Fluxo biométrico em recepção`.
- 2026-03-27 44: manual completo `MANUAL_COMPLETO_LYRA_CUSTOMAZE_UI_UX.md` criado na raiz do projeto, documentando instalacao, configuracao, operacao, persistencia, publicacao e troubleshooting do modulo para publico leigo em nivel premium.
- 2026-06-12 45: varredura matematica via grep identificou ~122 ocorrencias de classes visuais legadas (`gray/slate/teal-NNN`, `dark:`, hex fora do design system) em 24+ arquivos; execucao em blocos A-G iniciada.
- 2026-06-12 46: Bloco A concluido — `layout/sidebar.tsx` e `SidebarLink.tsx` reescritos com tokens do design system; causa raiz de regressao corrigida: `SidebarLink` recebia `iconScale`/`labelScale` do builder e nunca aplicava — agora aplica de verdade via `scalePx`/`scaleRem`; `PlanBadge` passou a ser renderizado de fato no footer da sidebar (import morto eliminado); `ui/chart.tsx` auditado como conforme (ocorrencia era suporte funcional a temas); `ui/sidebar.tsx` auditado como primitivo shadcn token-based sem consumidores.
- 2026-06-12 47: Bloco B concluido — chat 100% tokenizado (`ChatBubble`, `ChatInput`, `TypingIndicator`, `QuickReply`); placeholder proibido eliminado pela causa raiz: botao `Regenerar` do `ChatBubble` nao tinha handler — agora `ChatAssistantContent` expoe `handleRegenerate` real que remove a resposta e reinvoca `ask-ai-assistant` com a pergunta anterior.
- 2026-06-12 48: Bloco C concluido — `HabitList`, `onboarding/page`, `instruments/page` e `WearableConnection` migrados para tokens semanticos (`success`, `warning`, `info`, `destructive`, `muted`); `ProfileForm`, `AvatarUploader`, `onboarding-form` e `OnboardingNavigationDots` auditados como ja conformes.
- 2026-06-12 49: Bloco D concluido — `BookingConfirmationModal`, `ProfessionalCard`, `TimeSlotPicker` e `ProfessionalAvatarUploader` migrados de `blue/yellow/gray-NNN` para `primary`, `golden` e gradientes do sistema; goals auditado como conforme.
- 2026-06-12 50: Bloco E concluido — `BillingReturnExperience` e `PlanUpgradeNotice` tokenizados (emerald/amber/sky/slate -> success/warning/info/border/card), fonte fantasma `--font-geist-sans` removida do billing e das paginas admin.
- 2026-06-12 51: Bloco F concluido — 6 paginas admin padronizadas com `page-shell`, guarda `Acesso Negado` em `destructive`, `page-title`; `AIConfigForm` (36 ocorrencias) totalmente tokenizado, com microcopy `Missao Clinica-Operacional` corrigida para `Missao Operacional` e `privacidade medica` para `privacidade dos seus dados` (diretriz nao-clinica); `UserDetailModal`, `UserManagementContent`, `AdminPlanMatrixContent`, `AdminContentManagement`, `AdminDashboardContent`, `AdminReportsContent` e `DataHealthContent` migrados para tokens.
- 2026-06-12 52: varredura global final detectou residuos fora do mapa original: `LoginExperience` tokenizado por completo (ilustracao cenica em SVG preservada como camada de arte; botao morto `Esqueceu a senha?` removido pela causa raiz — nao existe fluxo de reset no backend), `VedicDashboard` migrado (doshas -> info/accent/success preservando semantica elemental; koshas/chakras header -> cosmic) e `plan-engine` com cores de pilares em tokens. Cores canonicas dos 7 chakras em `chakra/alignment-engine.ts` preservadas por semantica de dominio.
- 2026-06-12 53: documento `INSTRUCAO_REIMPLEMENTACAO_UI_UX_LYRA_2026.md` criado na raiz a pedido do usuario, catalogando todas as funcoes, modulos, KPIs, metricas, engines, APIs e criterios de aceite para reimplementacao visual por outro modelo de IA.
- 2026-06-12 54: prova de morte global executada — grep de classes legadas em `src/` retorna vazio (excecoes documentadas: cores canonicas dos chakras e fixture de teste); `check:lint`, `check:format`, `check:types` e `vitest` (59/59) todos verdes.
- 2026-06-13 55: ambiente real subido (Docker MySQL `lyra-metacare-mysql` healthy na 3307, migracoes 001-008 ja aplicadas, bootstrap dos admins `admin@coragem.pet` e `admin@admin.com` assegurado) e validacao visual executada no navegador real via Claude Preview em desktop e mobile (375px).
- 2026-06-13 56: causa raiz no orquestrador — `EnvManager.load` do `run_windows.py` removia apenas as aspas externas sem desfazer o escape do `json.dumps` feito no `upsert`, entregando `ADMIN_BOOTSTRAP_ADDITIONAL_ADMINS` como JSON invalido ao `mysql-migrate.mjs`; `load` tornado simetrico com `json.loads` e fallback seguro.
- 2026-06-13 57: causa raiz de hidratacao — primitivo `CardTitle` (`src/components/ui/card.tsx`) renderizava `<p>`, mas diversos titulos (ex.: `AIConfigForm` "Motor de Orquestracao") embutem um `<div>` com o box do icone; o parser HTML auto-fecha o `<p>` e o React acusa hydration error. `CardTitle` migrado de `<p>` para `<div>` (mantendo classes e alinhando ao shadcn/ui atual); prova deterministica no DOM: zero `<p>` com bloco aninhado nas rotas validadas.
- 2026-06-13 58: `.claude/launch.json` criado para orquestrar o dev server pelo Claude Preview; validacao em navegador confirmou landing, login (sem o botao morto "Esqueceu a senha?"), dashboard com `PlanBadge` real na sidebar, admin tokenizado, perfil e MobileSidebar — todos no design system unico, tema claro, pt-BR e sem erros de console novos.

## Politica obrigatoria de commit e push

- Nao criar branch.
- Trabalhar em `main`.
- Ao concluir item ou grupo de itens relacionados:

```bash
git add .
git commit -m "feat(redesign): descricao objetiva do bloco concluido"
git push origin main
```

## Registro de andamento

### 2026-03-20 - estado inicial desta task mestre

- Fundacao visual, shell principal e ampla parte do UI base ja foram reescritos.
- O proximo foco obrigatorio e: landing page, login page, saneamento de lint e primeiro commit validado do bloco tecnico.
- Docker permanece opcional nesta etapa visual e pode ser iniciado pelo agente quando a etapa exigir MySQL real.
