-- Limite de tentativas (rate limiting) das rotas de autenticação.
-- Janela fixa por chave: `bucket_key` é o SHA-256 (hex) de "<escopo>:<valor>",
-- então e-mails e IPs nunca ficam gravados em texto. Linhas com janela vencida
-- são reaproveitadas no próximo acesso e removidas periodicamente pela
-- própria aplicação (src/lib/security/rate-limit.ts).

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  bucket_key CHAR(64) NOT NULL,
  window_started_at DATETIME NOT NULL,
  hits INT UNSIGNED NOT NULL,
  PRIMARY KEY (bucket_key),
  KEY idx_rate_limit_buckets_window (window_started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
