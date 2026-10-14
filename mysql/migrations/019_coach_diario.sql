-- Coach diário (tarefa 42).
--
-- daily_briefings: o "Seu dia" de cada pessoa em cada data local, gerado pelo
-- motor do coach a partir do mapa védico, do Panchang do lugar onde a pessoa
-- mora e das métricas reais dos últimos dias. `inputs_hash` é o SHA-256 das
-- entradas usadas: quando a pessoa registra o check-in ou a pulseira grava
-- uma sessão, as entradas mudam e o briefing é refeito com os dados novos.
-- `feedback` guarda a resposta a "isso te ajudou?" (1 sim, -1 não).
-- Guardado por 90 dias (a rotina diária apaga os mais antigos).
CREATE TABLE IF NOT EXISTS daily_briefings (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  briefing_date DATE NOT NULL,
  content JSON NOT NULL,
  source VARCHAR(16) NOT NULL,
  inputs_hash CHAR(64) NOT NULL,
  feedback TINYINT NULL,
  feedback_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_daily_briefings_user_date UNIQUE (user_id, briefing_date),
  CONSTRAINT fk_daily_briefings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_daily_briefings_date ON daily_briefings (briefing_date);

-- user_notifications: o sino do app ("Seu dia está pronto", Chandrashtama,
-- sinais precoces). `dedupe_key` impede a mesma notificação duas vezes
-- (ex.: "dia:2026-10-14"). Guardadas por 90 dias.
CREATE TABLE IF NOT EXISTS user_notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  kind VARCHAR(32) NOT NULL,
  title VARCHAR(160) NOT NULL,
  body VARCHAR(500) NOT NULL,
  link VARCHAR(255) NULL,
  dedupe_key VARCHAR(120) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME NULL,
  CONSTRAINT uq_user_notifications_user_key UNIQUE (user_id, dedupe_key),
  CONSTRAINT fk_user_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_user_notifications_user_created ON user_notifications (user_id, created_at);
