-- Reflexão da noite (tarefa 44, parte A).
--
-- Fechamento do dia pela própria pessoa: como esteve a parte emocional, o
-- corpo e a parte espiritual (1 a 5, as mesmas três dimensões da leitura
-- védica do "Seu dia") e uma frase opcional. Uma reflexão por data local da
-- pessoa (a mesma data do coach diário); gravar de novo na mesma data
-- substitui a anterior. Alimenta a retrospectiva "Sua semana" e fica ao lado
-- da avaliação da leitura do dia. É dado pessoal do titular: entra na
-- exportação da LGPD e é apagado junto com a conta (ON DELETE CASCADE).
CREATE TABLE IF NOT EXISTS daily_reflections (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  reflection_date DATE NOT NULL,
  emotional_score TINYINT UNSIGNED NOT NULL,
  body_score TINYINT UNSIGNED NOT NULL,
  spiritual_score TINYINT UNSIGNED NOT NULL,
  note VARCHAR(280) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_daily_reflections_user_date UNIQUE (user_id, reflection_date),
  CONSTRAINT ck_daily_reflections_emotional CHECK (emotional_score BETWEEN 1 AND 5),
  CONSTRAINT ck_daily_reflections_body CHECK (body_score BETWEEN 1 AND 5),
  CONSTRAINT ck_daily_reflections_spiritual CHECK (spiritual_score BETWEEN 1 AND 5),
  CONSTRAINT fk_daily_reflections_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
