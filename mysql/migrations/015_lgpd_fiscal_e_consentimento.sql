-- LGPD (tarefa 28): registros fiscais retidos e registro de consentimento.

-- Registros fiscais: um por fatura paga (evento `invoice.paid` da Stripe).
-- São a única informação de compra que sobrevive à exclusão da conta, por
-- obrigação legal de guarda de documentos fiscais. Por isso:
--   - `user_id` vira NULL quando a conta é excluída (ON DELETE SET NULL):
--     o registro fica desvinculado do perfil, da saúde e de todo o resto;
--   - os dados do comprador ficam em "fotografia" (nome, e-mail, documento
--     fiscal e endereço do momento da compra), que é o que a obrigação fiscal
--     exige, sem nenhum dado de saúde;
--   - a aplicação não tem rota de alteração nem de exclusão desta tabela, e
--     ela não faz parte da API de dados; só o administrador a consulta
--     (/api/admin/fiscal-records) e o titular vê as próprias compras
--     enquanto a conta existe (/api/account/purchases).
CREATE TABLE IF NOT EXISTS fiscal_records (
  id CHAR(36) PRIMARY KEY,
  provider VARCHAR(32) NOT NULL,
  external_invoice_id VARCHAR(255) NOT NULL,
  invoice_number VARCHAR(255) NULL,
  user_id CHAR(36) NULL,
  external_customer_id VARCHAR(255) NULL,
  buyer_name VARCHAR(255) NULL,
  buyer_email VARCHAR(255) NULL,
  buyer_tax_id_type VARCHAR(32) NULL,
  buyer_tax_id VARCHAR(64) NULL,
  buyer_address JSON NULL,
  description VARCHAR(255) NULL,
  plan_key VARCHAR(32) NULL,
  billing_interval VARCHAR(32) NULL,
  currency_code CHAR(3) NOT NULL,
  amount_subtotal BIGINT NOT NULL,
  amount_tax BIGINT NOT NULL DEFAULT 0,
  amount_total BIGINT NOT NULL,
  period_start DATETIME NULL,
  period_end DATETIME NULL,
  paid_at DATETIME NOT NULL,
  hosted_invoice_url TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_fiscal_records_provider_invoice UNIQUE (provider, external_invoice_id),
  CONSTRAINT fk_fiscal_records_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_fiscal_records_user_paid ON fiscal_records (user_id, paid_at);
CREATE INDEX idx_fiscal_records_paid ON fiscal_records (paid_at);

-- Registro de consentimento: quem aceitou qual documento, em qual versão e
-- quando. Pertence ao titular e é apagado com a conta.
CREATE TABLE IF NOT EXISTS consent_records (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  consent_type VARCHAR(48) NOT NULL,
  document_version VARCHAR(32) NOT NULL,
  accepted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_agent VARCHAR(255) NULL,
  CONSTRAINT fk_consent_records_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_consent_records_user_type_version UNIQUE (user_id, consent_type, document_version)
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
