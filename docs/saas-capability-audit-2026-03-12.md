# Auditoria SaaS, Entitlements e Tendências 2026

Data da auditoria: 2026-03-12

## Objetivo

Este documento inventaria as funções, funcionalidades, recursos e pontos de acesso do app que precisam ser governados por plano. Ele também registra as referências oficiais usadas para o desenho SaaS atual.

## Catálogo atual de planos

Fonte estrutural: `mysql/migrations/003_add_saas_plans.sql`

| Plano  | Propósito                           | Capacidades-chave                                                                                                                                             |
| ------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `free` | Entrada, onboarding e uso essencial | dashboard, scores, feed de dicas, perfil, metas, 15 mensagens IA/mês, 1 geração de plano IA/mês, 2 profissionais, 2 agendamentos ativos, 30 dias de histórico |
| `meta` | Continuidade com mais IA e operação | wearable, monitoramento, 150 mensagens IA/mês, 12 gerações de plano IA/mês, 10 profissionais, 20 agendamentos ativos, 180 dias de histórico                   |
| `care` | Cobertura integral premium          | matriz completa, voz em monitoramento, 1000 mensagens IA/mês, 60 gerações de plano IA/mês, quotas clínicas sem teto numérico, 730 dias de histórico           |

## Inventário de capacidades do produto

| Feature key                     | Superfícies reais do app                                                                                                                  | Enforcement real atual                                                       | Observações de desenho                                                                                                |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `dashboard_access`              | `src/app/page.tsx`, `src/components/dashboard/dashboard.tsx`                                                                              | Bloqueio de UI no dashboard                                                  | Mantido no nível de experiência. Não bloqueia leituras internas necessárias para outros motores.                      |
| `ai_scores`                     | `src/hooks/use-ai-scores.tsx`, `src/app/api/functions/calculate-longevity-score/route.ts`                                                 | Bloqueio de UI e bloqueio no backend da função                               | Fecha o score tanto na tela quanto na rota.                                                                           |
| `ai_tips_feed`                  | `src/components/dashboard/AITipsCard.tsx`, tabela `ai_tips`                                                                               | Bloqueio de UI e leitura protegida no `data-api`                             | O feed segue ativo apenas para admins em CRUD.                                                                        |
| `profile_management`            | `src/app/profile/page.tsx`, `src/components/profile/ProfileForm.tsx`                                                                      | Bloqueio de UI                                                               | O CRUD bruto de `profiles` não foi bloqueado globalmente porque auth, bootstrap de perfil e onboarding dependem dele. |
| `goal_progress_tracking`        | `src/app/goals/page.tsx`, `src/components/goals/*`, tabela `goals`                                                                        | Bloqueio de UI e leitura/escrita protegidas no `data-api`                    | Fecha o acesso direto por API genérica.                                                                               |
| `wearable_bluetooth_connection` | `src/app/connect/page.tsx`, `src/components/data-connection/WearableConnection.tsx`                                                       | Bloqueio de UI                                                               | Não há rota específica de backend dedicada a Bluetooth neste momento.                                                 |
| `realtime_monitoring`           | `src/app/monitoring/page.tsx`, `src/components/monitoring/RealTimeMonitoringContent.tsx`                                                  | Bloqueio de UI                                                               | O canal em tempo real continua funcional apenas onde a tela está liberada.                                            |
| `voice_monitoring_updates`      | `src/app/monitoring/page.tsx`, `src/components/monitoring/RealTimeMonitoringContent.tsx`                                                  | Bloqueio funcional no botão de voz                                           | A síntese de voz não é disparada quando o entitlement está desligado.                                                 |
| `ai_chat_messages`              | `src/app/chat/page.tsx`, `src/app/api/functions/ask-ai-assistant/route.ts`                                                                | Bloqueio de UI e consumo de quota real no backend                            | Uso mensal controlado em `feature_usage_counters`.                                                                    |
| `ai_plan_generations`           | `src/app/plan/page.tsx`, `src/components/ai-plan/AIPlanContent.tsx`, `src/app/api/functions/generate-ai-plan/route.ts`, tabela `ai_plans` | Bloqueio de UI, quota no backend e proteção de leitura/escrita em `ai_plans` | Fecha tanto a geração quanto o acesso direto aos planos persistidos.                                                  |
| `professionals_total`           | `src/components/appointments/AppointmentsContent.tsx`, tabela `professionals`                                                             | Quota real no `data-api` para inserts                                        | A contagem é validada por usuário no backend.                                                                         |
| `appointments_active`           | `src/components/appointments/AppointmentsContent.tsx`, tabela `appointments`                                                              | Quota real no `data-api` para inserts e updates futuros                      | Considera agendamentos futuros ativos.                                                                                |
| `metrics_history_days`          | `src/hooks/use-daily-metrics.tsx`, `src/lib/mysql/data-api.ts`, tabela `daily_metrics`                                                    | Restrição real de janela temporal no backend                                 | O corte é aplicado por data antes do select.                                                                          |

## Inventário das áreas principais do app

| Área                      | Arquivos principais                                                                                                          | Dependências de plano                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Landing e entrada         | `src/app/page.tsx`, `src/components/dashboard/dashboard.tsx`                                                                 | `dashboard_access`, `ai_scores`, `ai_tips_feed`        |
| Perfil                    | `src/app/profile/page.tsx`, `src/components/profile/ProfileForm.tsx`                                                         | `profile_management`                                   |
| Metas                     | `src/app/goals/page.tsx`, `src/components/goals/GoalTrackingContent.tsx`                                                     | `goal_progress_tracking`                               |
| Chat IA                   | `src/app/chat/page.tsx`, `src/app/api/functions/ask-ai-assistant/route.ts`                                                   | `ai_chat_messages`                                     |
| Plano IA                  | `src/app/plan/page.tsx`, `src/components/ai-plan/AIPlanContent.tsx`, `src/app/api/functions/generate-ai-plan/route.ts`       | `ai_plan_generations`                                  |
| Conexão wearable          | `src/app/connect/page.tsx`, `src/components/data-connection/WearableConnection.tsx`                                          | `wearable_bluetooth_connection`                        |
| Monitoramento             | `src/app/monitoring/page.tsx`, `src/components/monitoring/RealTimeMonitoringContent.tsx`                                     | `realtime_monitoring`, `voice_monitoring_updates`      |
| Rede clínica              | `src/app/appointments/page.tsx`, `src/components/appointments/AppointmentsContent.tsx`                                       | `professionals_total`, `appointments_active`           |
| Administração de planos   | `src/app/admin/plans/page.tsx`, `src/components/admin/AdminPlanMatrixContent.tsx`                                            | Acesso por role `admin`                                |
| Administração de usuários | `src/app/admin/users/page.tsx`, `src/components/admin/UserManagementContent.tsx`, `src/components/admin/UserDetailModal.tsx` | Acesso por role `admin`, com gestão real de assinatura |

## Tendências e práticas 2026 usadas no desenho

As linhas abaixo combinam fatos explícitos das fontes oficiais com inferências aplicadas ao produto.

### Billing e catálogo comercial

- O [Stripe Billing](https://docs.stripe.com/billing) continua sendo a base mais madura para catálogo, assinatura, invoices, portal e pricing híbrido.
- O [Stripe Entitlements](https://docs.stripe.com/billing/entitlements) formaliza a separação entre produto comercial e feature técnica. Inferência aplicada: o app deve continuar tratando `subscription_plans` e `plan_entitlements` como o contrato central, sem espalhar regras de plano em componentes isolados.
- A documentação [How subscriptions work](https://docs.stripe.com/billing/subscriptions/overview) reforça que o provisionamento ideal acontece com base em subscription status e active entitlements. Inferência aplicada: o backend deve continuar sendo a fonte de verdade para grant e revoke.
- A mudança [depreca legacy usage-based billing](https://docs.stripe.com/changelog/basil/2025-03-31/deprecate-legacy-usage-based-billing) confirma a transição para meters. Inferência aplicada: as quotas internas do app foram modeladas com `feature_usage_counters`, `reset_interval` e `meter_kind` para manter compatibilidade conceitual com billing moderno.
- A recomendação de [flexible billing mode](https://docs.stripe.com/billing/subscriptions/billing-mode) para novas assinaturas indica que novos fluxos externos devem nascer em modo flexível, não clássico.

### Self-service premium de assinatura

- O [customer portal](https://docs.stripe.com/customer-management) permanece o caminho oficial mais simples para autosserviço de cobrança e assinatura.
- A configuração do portal permite [switch plan, update quantities e proration](https://docs.stripe.com/customer-management/configure-portal), que é o padrão atual para modelos good-better-best.
- A integração por API do portal exige [portal sessions efêmeras e redirecionamento autenticado](https://docs.stripe.com/customer-management/integrate-customer-portal). Inferência aplicada: qualquer integração externa futura deve partir do usuário autenticado e nunca expor IDs Stripe no cliente.
- A validação de eventos de cobrança continua exigindo [verificação da assinatura do webhook](https://docs.stripe.com/webhooks/signature) e políticas de [idempotência para POST](https://docs.stripe.com/error-low-level). Inferência aplicada: troca de plano, renovação e baixa externa precisam ser processadas de forma idempotente.

### RBAC, entitlements e evolução para SaaS multi-tenant

- O [RBAC do WorkOS](https://workos.com/docs/rbac) segue defendendo papéis e permissões por organização como base para SaaS B2B.
- O suporte a [múltiplos papéis por membership](https://workos.com/blog/multiple-roles) reduz explosão de papéis. Inferência aplicada: role de usuário e plano comercial devem continuar separados.
- A [FGA do WorkOS](https://workos.com/docs/reference/fga/access-check) já trata checks por recurso específico e herança. Inferência aplicada: o app deve preservar a matriz de planos como camada comercial e deixar espaço para, no futuro, checks recurso-específicos por clínica, workspace ou tenant.

### UX premium e handoff de design

- O [Dev Mode do Figma](https://help.figma.com/hc/pt-br/articles/15023124644247-Guia-para-o-Dev-Mode) e a visão [Ready for Dev](https://help.figma.com/hc/pt-br/articles/23918228264855-Visualiza%C3%A7%C3%A3o-Ready-for-Dev-do-Dev-Mode) reforçam handoff estruturado e rastreável.
- As [variáveis no Figma](https://help.figma.com/hc/pt-br/articles/15145852043927-Criar-e-gerenciar-vari%C3%A1veis-e-cole%C3%A7%C3%B5es) e [variáveis no Dev Mode](https://help.figma.com/hc/pt-br/articles/27882809912471-Vari%C3%A1veis-no-Dev-Mode) consolidam tokenização real de cor, spacing e modos.
- O [Code Connect](https://help.figma.com/hc/pt-br/articles/23920389749655-Code-Connect) conecta componentes reais do código ao Dev Mode. Inferência aplicada: a camada visual premium do app deve continuar orientada por componentes reais, e não por snippets genéricos ou telas desconectadas do código.

## Estado atual da implementação

### Já aplicado de forma real

- Catálogo de planos em MySQL com quotas e entitlements.
- Assinatura ativa por usuário com histórico em `user_subscriptions`.
- Eventos de auditoria em `subscription_audit_events`.
- Consumo mensal real para chat IA e geração de plano IA.
- Restrição real de quotas clínicas e histórico temporal.
- Gestão admin da matriz de capacidades.
- Gestão admin da assinatura do usuário em `/admin/users`.

### Deliberações conscientes

- `profiles` não recebe bloqueio bruto por plano no `data-api` porque autenticação, bootstrap de perfil e onboarding dependem dele. O bloqueio do perfil fica na experiência do produto, não na infraestrutura mínima de sessão.
- `dashboard_access`, `wearable_bluetooth_connection` e `realtime_monitoring` hoje são governados principalmente pela camada de experiência porque não existem endpoints dedicados equivalentes que precisem ser fechados além da UI atual.

## Revalidação objetiva em 2026-03-13

### Billing externo Stripe

- Confirmado em código:
  - checkout em `src/app/api/billing/checkout/route.ts`;
  - portal em `src/app/api/billing/portal/route.ts`;
  - webhook assinado em `src/app/api/webhooks/stripe/route.ts`;
  - sincronização e persistência em `src/lib/billing/service.ts`.
- Confirmado no ambiente auditado:
  - `.env.local` sem `STRIPE_SECRET_KEY`;
  - `.env.local` sem `STRIPE_WEBHOOK_SECRET`;
  - shell desta thread sem `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `APP_BASE_URL` e `NEXT_PUBLIC_APP_URL` exportadas.
- Conclusão: a implementação existe, mas o billing externo real permanece bloqueado neste ambiente por ausência de credenciais Stripe comprováveis. O `origin` da request cobre URL base em runtime, porém não substitui as chaves secretas e de webhook.

### Multi-tenant

- Busca por `tenant`, `workspace`, `organization`, `org_id`, `tenant_id` e `membership` em `src`, `mysql` e `docs` retornou apenas referências documentais.
- As migrações `001_schema.sql`, `003_add_saas_plans.sql` e `004_add_stripe_billing.sql` não criam tabelas ou chaves de tenant, workspace, organização ou membership.
- Conclusão: não existe fundação estrutural multi-tenant pronta no estado atual do código. Qualquer implementação agora exigiria mudança arquitetural real em schema, auth, isolamento de dados e governança de acesso.

### Enforcement que segue no nível de experiência

- `profile_management`: a edição do perfil continua bloqueada na UX porque `profiles` é superfície estrutural usada por autenticação, bootstrap e onboarding.
- `dashboard_access`: bloqueio concentrado na experiência do dashboard; não há endpoint dedicado independente além das leituras já necessárias a outros fluxos.
- `wearable_bluetooth_connection`: não existe backend próprio de pareamento para endurecer além da tela.
- `realtime_monitoring`: não existe endpoint exclusivo separado do conteúdo já governado pela própria experiência de monitoramento.

## Próximo encaixe natural de evolução

Quando a integração de billing externo for ligada, o encaixe correto é:

1. mapear `subscription_plans.plan_key` para produtos e preços do provedor;
2. sincronizar `external_customer_id`, `external_subscription_id` e `external_price_id`;
3. receber webhooks assinados e idempotentes;
4. refletir status, downgrade, renovação e cancelamento em `user_subscriptions`;
5. manter `plan_entitlements` como fonte de autorização do app.
