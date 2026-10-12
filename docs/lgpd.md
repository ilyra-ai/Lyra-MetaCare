# LGPD na Lyra MetaCare

Como a plataforma atende à Lei Geral de Proteção de Dados (Lei 13.709/2018) no código. Os textos para o público estão em `/privacidade` e `/termos`.

## Quem acessa o quê

| Dado                                                                            | Titular                        | Administrador                              |
| ------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------ |
| Saúde e bem-estar (métricas, ciclo, avaliações, hábitos, metas, planos, agenda) | lê, altera e apaga             | não lê, não altera, não apaga              |
| Perfil sensível (nascimento, gênero, idade, metas, atividade)                   | lê e altera                    | não lê                                     |
| Identificação (nome, e-mail, papel, onboarding, foto)                           | lê e altera (e-mail com senha) | lê; altera só papel e onboarding           |
| Métricas: quem registrou e quando (`id`, `user_id`, `date`, `created_at`)       | lê                             | lê (painel "Saúde dos dados"), sem valores |
| Histórico de compras (`/api/account/purchases`)                                 | lê as próprias faturas         | não tem rota de histórico por pessoa       |
| Registros fiscais (`fiscal_records`)                                            | vê as próprias compras         | lê todos (`/admin/fiscal`), só leitura     |

A regra está em `src/lib/mysql/table-config.ts` (`adminReadAll`, `adminReadColumns`, `adminWriteColumns`) e é aplicada em `src/lib/mysql/data-api.ts`:

- O administrador que consulta linhas de outras contas recebe `*` reduzido às colunas liberadas.
- Pedir, filtrar (inclusive `or`) ou ordenar por coluna não liberada responde 403.
- Alterar coluna não liberada ou apagar dados de outra conta responde 403.
- Tabelas sem `adminReadAll` (metas, hábitos, planos, agenda, profissionais, avaliações, sequências) ficam presas às linhas da própria conta, também para o administrador.
- Consultas filtradas pelo próprio id continuam completas: o administrador também é titular dos próprios dados.

A listagem `/api/admin/users` e o detalhe do usuário no painel trazem só identificação, papel, onboarding e plano.

## Consentimento

- **Cadastro:** exige `acceptTerms: true` e grava `terms_of_use` e `privacy_policy` na versão vigente, na mesma transação da conta.
- **Onboarding:** grava `health_data_processing` (art. 11, I) antes de qualquer dado de saúde ser salvo.
- **Registro:** `consent_records` guarda o tipo, a versão (`src/lib/lgpd/documentos.ts`), a data e o navegador. Um índice único impede duplicar o mesmo aceite.
- **Rotas:** `GET` e `POST /api/account/consents`. A lista aparece no perfil.

## Direitos do titular (art. 18)

| Direito                           | Onde                                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| Acesso e portabilidade            | Perfil → "Baixar meus dados" (`GET /api/account/export`, JSON, `no-store`, sem hash de senha) |
| Correção                          | Perfil (todos os dados do onboarding) e troca de e-mail (`PATCH /api/account/email`)          |
| Eliminação e revogação            | Perfil → "Excluir minha conta" (`DELETE /api/account`, senha + frase de confirmação)          |
| Informação sobre compartilhamento | `/privacidade`                                                                                |

O botão de exclusão chama `excluirConta` (`src/lib/lgpd/conta.ts`). O administrador usa o mesmo serviço em `DELETE /api/admin/users/:id`, mas não pode excluir a própria conta por essa rota.

A exclusão:

1. recusa se houver assinatura paga com renovação ativa (409), porque excluir a conta não cancela a cobrança na Stripe. A pessoa cancela a renovação no portal antes;
2. recusa a exclusão do último administrador (409);
3. apaga `users`. Todos os dados pessoais e de saúde saem em cascata (perfil, métricas, metas, hábitos, planos, agenda, avaliações, assinaturas, consentimentos, contadores e cliente de cobrança);
4. apaga as imagens enviadas (`<bucket>/<userId>`);
5. mantém os registros fiscais, com `user_id = NULL` (FK `ON DELETE SET NULL`).

A API de dados não apaga perfis (403): a exclusão é sempre da conta inteira.

## Registros fiscais (tarefa 28.1)

- **Origem:** o webhook `invoice.paid` da Stripe grava uma linha em `fiscal_records` por fatura (`src/lib/billing/service.ts`). A gravação é idempotente pelo id da fatura.
- **Conteúdo:**
  - valores (subtotal, impostos e total, em centavos), moeda, datas, número da fatura, plano e ciclo;
  - fotografia do comprador: nome, e-mail, documento fiscal (CPF/CNPJ quando coletado pela Stripe) e endereço;
  - nenhum dado de saúde.
- **Imutabilidade:** não existe rota de alteração ou exclusão, e a tabela não faz parte da API de dados. Os registros não são excluídos pela plataforma (CTN, art. 195, parágrafo único).
- **Acesso:** administrador em `/admin/fiscal` (filtro por período e exportação CSV); titular em `/api/account/purchases`, só as próprias faturas.

Recomendação para produção: revogar `UPDATE` e `DELETE` em `fiscal_records` para o usuário da aplicação no MySQL. Gatilhos não foram usados porque, com o log binário ligado (padrão do MySQL), criá-los exige o privilégio `SUPER`.

## Fronteiras externas

- **Stripe:** sem credencial real no ambiente de desenvolvimento, o `invoice.paid` foi validado com eventos assinados localmente pela SDK oficial (`src/app/api/lgpd.integration.test.ts`).
- **Identificação do controlador:** o e-mail do encarregado vem de `LGPD_CONTATO_EMAIL`. Razão social e CNPJ dependem da empresa que opera a instância e não foram inventados.

## Testes

`src/app/api/lgpd.integration.test.ts` cobre consentimento, segregação (colunas, filtros, ordenação, alteração e exclusão), lista administrativa, fatura paga → registro fiscal (idempotência e acesso), exportação, exclusão completa com retenção fiscal e as recusas.
