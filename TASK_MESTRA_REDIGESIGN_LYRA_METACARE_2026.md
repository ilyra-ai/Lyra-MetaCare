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
- Commit e push deixaram de ser obrigacao do agente nesta etapa e ficam sob responsabilidade direta do usuario.

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
- [~] Componentes UI base amplamente reestilizados, ainda com alguns acabamentos e revisoes pendentes.
- [~] Landing page reescrita estruturalmente e em ajuste fino de atmosfera, aguardando validacao tecnica final.
- [~] Login reescrito estruturalmente e em ajuste fino de atmosfera, aguardando validacao tecnica final.
- [ ] Dashboard principal revisado contra a nova direcao astrologica moderna + IA.
- [ ] Demais modulos do paciente finalizados no novo padrao.
- [ ] Modulos de billing finalizados no novo padrao.
- [ ] Modulos administrativos finalizados no novo padrao.
- [ ] Configuracao final do admin `admin@coragem.pet` validada em banco.
- [ ] Navegacao visual completa validada.
- [ ] Checks finais, commits por bloco e pushs concluidos.

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
- [~] `src/components/ui/chart.tsx`
- [ ] `src/components/ui/sidebar.tsx`

## Pendencias imediatas em execucao

### Bloco imediato 1 - saneamento tecnico do bloco ja alterado

- [ ] Corrigir warnings e erros atuais de lint.
- [ ] Revalidar formatacao.
- [ ] Revalidar tipagem.
- [ ] Entregar bloco fundacao + shell + UI base validado para commit manual do usuario.

### Bloco imediato 2 - direcao visual central corrigida pelo usuario

- [~] Reescrever `src/components/landing/LandingPage.tsx` do zero.
- [~] Reescrever `src/app/login/page.tsx` do zero.
- [ ] Garantir que a narrativa visual nao pareca clinica.
- [ ] Garantir linguagem de astrologia moderna, toque esoterico sofisticado e fusao com modelos de IA.
- [ ] Garantir que a landing pareca premium, luminosa, linda, delicada e inovadora.
- [ ] Garantir que o login acompanhe exatamente a mesma identidade.
- [ ] Validar types, lint e format.
- [ ] Entregar bloco landing + auth validado para commit manual do usuario.

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
- [~] `chart.tsx`
- [ ] `sidebar.tsx` de UI

### Fase 4 - Paginas principais do paciente

- [~] `src/components/dashboard/dashboard.tsx`
- [~] `src/components/dashboard/MetricGrid.tsx`
- [~] `src/components/dashboard/AITipsCard.tsx`
- [~] `src/components/dashboard/QuickScanFAB.tsx`
- [~] `src/components/ai-plan/AIPlanContent.tsx`
- [~] `src/components/goals/GoalTrackingContent.tsx`
- [~] `src/components/goals/CreateGoalModal.tsx`
- [~] `src/components/goals/UpdateGoalProgressModal.tsx`
- [~] `src/components/appointments/AppointmentsContent.tsx`
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

- [~] `src/components/landing/LandingPage.tsx`
- [~] `src/app/login/page.tsx`

### Fase 8 - Finalizacao

- [~] `src/components/made-with-ilyra.tsx`
- [ ] Configurar admin `admin@coragem.pet`
- [ ] Testar navegacao visual completa
- [ ] Corrigir warnings e erros restantes
- [ ] Executar checks finais completos
- [ ] Entregar estado final validado para commit manual do usuario

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
