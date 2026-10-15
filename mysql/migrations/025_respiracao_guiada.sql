-- Respiração guiada (tarefa 44, parte B).
--
-- Cada sessão concluída (ou interrompida depois de pelo menos um ciclo
-- completo e 30 segundos) fica registrada com a técnica, os ciclos feitos e
-- a duração real. Os minutos (`minutes_logged`) são somados ao
-- `daily_metrics.meditation_minutes` do mesmo dia local, o que atualiza a
-- meta automática de meditação e a sequência "meditação registrada".
-- Técnicas: '4-7-8' (inspira 4, segura 7, solta 8), 'quadrada' (4-4-4-4) e
-- 'nadi_shodhana' (respiração alternada pelas narinas, sem retenção).
-- É dado pessoal do titular: entra na exportação da LGPD e é apagado junto
-- com a conta (ON DELETE CASCADE).
CREATE TABLE IF NOT EXISTS breathing_sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  session_date DATE NOT NULL,
  technique VARCHAR(24) NOT NULL,
  cycles SMALLINT UNSIGNED NOT NULL,
  duration_seconds SMALLINT UNSIGNED NOT NULL,
  minutes_logged SMALLINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ck_breathing_sessions_technique CHECK (
    technique IN ('4-7-8', 'quadrada', 'nadi_shodhana')
  ),
  CONSTRAINT ck_breathing_sessions_cycles CHECK (cycles BETWEEN 1 AND 200),
  CONSTRAINT ck_breathing_sessions_duration CHECK (duration_seconds BETWEEN 30 AND 3600),
  CONSTRAINT ck_breathing_sessions_minutes CHECK (minutes_logged BETWEEN 1 AND 60),
  CONSTRAINT fk_breathing_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_breathing_sessions_user_date ON breathing_sessions (user_id, session_date);
