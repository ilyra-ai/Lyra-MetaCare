# Task Técnica: Fechamento SaaS, Billing Externo e Operação Comercial

Data de abertura: 2026-03-12

## Objetivo

Fechar as pendências reais restantes da camada SaaS do produto, com prioridade máxima para billing externo, gestão comercial de assinatura, enforcement completo e validação integral.

## Consolidação do escopo ativo em 2026-03-13

- O redesenho da landing page foi removido do escopo ativo desta rodada e não deve ser tratado como pendência deste ciclo.
- Billing externo Stripe segue como prioridade, mas a ativação operacional depende de credenciais reais ausentes no ambiente auditado em 2026-03-13:
  - `.env.local` sem `STRIPE_SECRET_KEY`;
  - `.env.local` sem `STRIPE_WEBHOOK_SECRET`;
  - shell desta thread sem variáveis Stripe exportadas.
- Multi-tenant continua fora de implementação nesta rodada porque o código e as migrações atuais não trazem fundação estrutural de tenant, workspace, organização ou membership.

## Status consolidado em 2026-03-13

### 1. Billing externo real

Status atual:

- camada Stripe implementada para checkout, portal, webhook assinado, vínculo de customer e sincronização de subscription IDs;
- bloqueada operacionalmente neste ambiente por ausência comprovada de credenciais Stripe;
- UX comercial ajustada para expor estado de configuração e permitir ativação do mesmo plano atual quando a assinatura ainda estiver em origem interna.

Critério de aceite desta rodada:

- manter o código pronto para checkout, portal e webhook sem simulação;
- quando faltar credencial real, reportar bloqueio com evidência objetiva e não marcar como validado;
- quando houver credencial real, validar ponta a ponta em navegador e webhook assinado.

## Lista operacional da retomada em 2026-03-13

- [x] Consolidar o escopo real da rodada e remover a landing page da lista de pendências ativas.
- [x] Portar as páginas reais de retorno de billing (`/billing/success` e `/billing/cancel`) para o clone principal.
- [x] Endurecer a rota de checkout com validação estrutural de payload e erro HTTP explícito para JSON inválido.
- [x] Ajustar a jornada comercial do perfil bloqueado para manter upgrade real e visibilidade da assinatura atual na mesma tela.
- [x] Permitir ativação de cobrança Stripe para o mesmo plano atual quando a assinatura ainda estiver em origem interna.
- [x] Cobrir helpers críticos de billing, access e http-error com testes automatizados.
- [x] Registrar no material técnico os bloqueios reais de Stripe e a ausência de fundação multi-tenant.
- [x] Validar compilação integral do app com `next build`, incluindo as novas rotas de retorno do billing.
- [x] Executar `fix:format`, `fix:lint`, `check:lint`, `check:format` e `check:types`.
- [ ] Validar checkout, portal e webhook Stripe com credenciais reais e endpoint assinado disponíveis.

## Itens desta task

### 1. Billing externo real

- Integrar provedor de billing com suporte real a:
  - checkout de assinatura;
  - customer portal;
  - webhooks assinados;
  - sincronização de customer/subscription/price IDs;
  - atualização de `user_subscriptions` no MySQL;
  - idempotência de eventos.

Critério de aceite:

- criação de sessão de checkout funcionando em ambiente configurado;
- criação de sessão de portal funcionando em ambiente configurado;
- persistência de `external_customer_id`, `external_subscription_id` e `external_price_id`;
- eventos processados com registro e sem duplicidade.

### 2. Enforcements restantes

- Revisar as áreas ainda controladas prioritariamente por UI:
  - `dashboard_access`;
  - `profile_management`;
  - `wearable_bluetooth_connection`;
  - `realtime_monitoring`.

Critério de aceite:

- documentar o motivo técnico de qualquer enforcement que permaneça no nível de experiência;
- endurecer no backend tudo o que possuir superfície de API separável.

### 3. UX premium comercial

- Consolidar a jornada de assinatura do usuário final no app, incluindo:
  - visualização de plano;
  - ações comerciais;
  - retorno de checkout;
  - acesso ao portal de cobrança;
  - estado de configuração do billing.

Critério de aceite:

- fluxo navegável de assinatura, sem placeholders;
- feedback claro quando o ambiente não estiver configurado com credenciais reais;
- sem tratar landing page como pendência desta rodada.

### 4. Multi-tenant e IAM evolutivo

- Auditar a necessidade real de tenant/workspace/organização;
- estruturar fundações apenas se houver capacidade comprovável de implementação consistente no estado atual do produto.

Critério de aceite:

- não criar abstração vazia;
- se não for viável concluir agora, registrar bloqueio técnico e de produto com evidência.

### 5. Cobertura de testes e validação

- Cobrir o núcleo SaaS com testes automatizados onde fizer sentido;
- validar em navegador real os fluxos comerciais e administrativos.

Critério de aceite:

- checagens obrigatórias passando;
- validação operacional em browser real;
- publicação em `main`.

### 6. Commit e push obrigatórios

- Realizar commit e push para a `main` principal ao concluir cada marco relevante desta task.
- O fechamento final desta task só é considerado completo após:
  - `git status` limpo;
  - `HEAD` igual a `origin/main`;
  - publicação confirmada no repositório principal.

Critério de aceite:

- todo bloco concluído com impacto real no produto deve ser versionado;
- a entrega final deve estar publicada em `main`, sem ficar apenas no workspace local.

## Restrições obrigatórias

- Sem hardcode de IDs de preço, segredos ou URLs falsas.
- Sem placeholders funcionais.
- Sem simulação de checkout, portal ou webhook.
- Qualquer bloqueio externo deve ser declarado explicitamente com evidência.
