ALTER TABLE subscription_plans
  ADD COLUMN IF NOT EXISTS external_product_id VARCHAR(255) NULL AFTER is_public,
  ADD COLUMN IF NOT EXISTS external_monthly_price_id VARCHAR(255) NULL AFTER external_product_id,
  ADD COLUMN IF NOT EXISTS external_annual_price_id VARCHAR(255) NULL AFTER external_monthly_price_id;

CREATE TABLE IF NOT EXISTS billing_customers (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  provider VARCHAR(32) NOT NULL,
  external_customer_id VARCHAR(255) NOT NULL,
  email_snapshot VARCHAR(255) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_billing_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_billing_customers_provider_user UNIQUE (provider, user_id),
  CONSTRAINT uq_billing_customers_provider_customer UNIQUE (provider, external_customer_id)
);

CREATE TABLE IF NOT EXISTS billing_webhook_events (
  id CHAR(36) PRIMARY KEY,
  provider VARCHAR(32) NOT NULL,
  external_event_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'received',
  payload JSON NULL,
  processed_at DATETIME NULL,
  error_message TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_billing_webhook_events_provider_event UNIQUE (provider, external_event_id)
);
