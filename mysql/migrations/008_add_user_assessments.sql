-- Migração 008: Tabela de Avaliações Subjetivas e KPIs (WHO-5, NPS, Adherence)

CREATE TABLE IF NOT EXISTS user_assessments (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  assessment_type ENUM('who5', 'nps', 'mood', 'adherence') NOT NULL,
  
  -- Para WHO-5 (0-25) ou NPS (0-10) ou Mood (1-5) ou Adherence (0-100)
  score_value DECIMAL(5, 2) NOT NULL,
  
  -- Respostas brutas em JSON caso haja múltiplas perguntas
  raw_responses JSON,
  
  -- Notas e feedback (especialmente útil para NPS)
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX idx_user_assessments_type ON user_assessments(assessment_type);
CREATE INDEX idx_user_assessments_created_at ON user_assessments(created_at);

-- Adicionar Tabela de Consistência (Streaks)
CREATE TABLE IF NOT EXISTS user_streaks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  streak_type VARCHAR(50) NOT NULL, -- ex: 'daily_login', 'meditation', 'hydration'
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_streak_type (user_id, streak_type),
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
