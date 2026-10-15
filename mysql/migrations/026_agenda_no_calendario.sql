-- Agenda védica no calendário (tarefa 44, parte C).
--
-- Link de assinatura privado (iCalendar) com as janelas do dia (Brahma
-- Muhurta, Abhijit Muhurta, Rahu Kalam e o pôr do sol) dos próximos dias,
-- recalculado a cada leitura pelo app de calendário da pessoa (Google,
-- Apple, Outlook). Um link por pessoa:
--   token_hash        SHA-256 do token do link: é por ele que a rota pública
--                     encontra a pessoa (o token em si não fica legível no
--                     banco);
--   token_ciphertext  o mesmo token cifrado com AES-256-GCM (chave derivada
--                     do AUTH_SECRET), para mostrar o link de novo à própria
--                     pessoa sem precisar trocá-lo;
--   last_access_at    última leitura pelo app de calendário.
-- Gerar um novo link substitui o anterior (que para de funcionar); desativar
-- apaga a linha. Dado do titular: entra na exportação da LGPD (sem o hash e
-- sem o token) e é apagado junto com a conta (ON DELETE CASCADE).
CREATE TABLE IF NOT EXISTS calendar_feeds (
  user_id CHAR(36) PRIMARY KEY,
  token_hash CHAR(64) NOT NULL,
  token_ciphertext VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_access_at DATETIME NULL,
  CONSTRAINT uq_calendar_feeds_token UNIQUE (token_hash),
  CONSTRAINT fk_calendar_feeds_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
