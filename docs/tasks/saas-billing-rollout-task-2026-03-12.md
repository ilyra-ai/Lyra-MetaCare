# Task Técnica: Fechamento SaaS, Billing Externo e Operação Comercial

Data de abertura: 2026-03-12

## Objetivo

Fechar as pendências reais restantes da camada SaaS do produto, com prioridade máxima para billing externo, gestão comercial de assinatura, enforcement completo e validação integral.

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
- Redesenhar por completo a landing page, elevando a direção visual para um padrão 2026:
  - mais moderna;
  - mais harmoniosa;
  - mais amigável;
  - mais bonita;
  - diferente do padrão genérico;
  - com linguagem premium e inovadora.

Critério de aceite:

- fluxo navegável de assinatura, sem placeholders;
- feedback claro quando o ambiente não estiver configurado com credenciais reais.
- landing page redesenhada de ponta a ponta, com consistência visual entre branding, tipografia, composição, CTA, hierarchy e responsividade;
- implementação real em código, sem mock visual e sem remendos cosméticos.

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
