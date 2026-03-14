CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  id CHAR(36) PRIMARY KEY,
  first_name VARCHAR(120) NULL,
  last_name VARCHAR(120) NULL,
  email VARCHAR(255) NOT NULL,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  role VARCHAR(32) NOT NULL DEFAULT 'patient',
  age INT NULL,
  gender VARCHAR(32) NULL,
  activity_level INT NULL,
  goals JSON NULL,
  birth_date DATE NULL,
  birth_time TIME NULL,
  birth_location VARCHAR(255) NULL,
  avatar_url TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_metrics (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  date DATE NOT NULL,
  steps INT NOT NULL DEFAULT 0,
  sleep_duration_minutes INT NOT NULL DEFAULT 0,
  resting_heart_rate DECIMAL(8, 2) NULL,
  calories_burned DECIMAL(10, 2) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  hrv_ms DECIMAL(8, 2) NULL,
  deep_sleep_minutes INT NOT NULL DEFAULT 0,
  resting_heart_rate_min DECIMAL(8, 2) NULL,
  resting_heart_rate_max DECIMAL(8, 2) NULL,
  spo2_average DECIMAL(8, 2) NULL,
  respiratory_rate DECIMAL(8, 2) NULL,
  body_temperature_celsius DECIMAL(8, 2) NULL,
  total_distance_km DECIMAL(10, 2) NOT NULL DEFAULT 0,
  active_minutes INT NOT NULL DEFAULT 0,
  workout_calories DECIMAL(10, 2) NOT NULL DEFAULT 0,
  vo2_max DECIMAL(8, 2) NULL,
  sleep_latency_minutes DECIMAL(8, 2) NULL,
  rem_sleep_minutes INT NOT NULL DEFAULT 0,
  light_sleep_minutes INT NOT NULL DEFAULT 0,
  sleep_efficiency DECIMAL(8, 2) NULL,
  sleep_score DECIMAL(8, 2) NULL,
  protein_grams DECIMAL(10, 2) NOT NULL DEFAULT 0,
  carb_grams DECIMAL(10, 2) NOT NULL DEFAULT 0,
  fat_grams DECIMAL(10, 2) NOT NULL DEFAULT 0,
  water_liters DECIMAL(10, 2) NOT NULL DEFAULT 0,
  caffeine_mg DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stress_score DECIMAL(8, 2) NULL,
  recovery_score DECIMAL(8, 2) NULL,
  readiness_score DECIMAL(8, 2) NULL,
  blood_glucose_mgdl DECIMAL(8, 2) NULL,
  blood_pressure_systolic DECIMAL(8, 2) NULL,
  blood_pressure_diastolic DECIMAL(8, 2) NULL,
  weight_kg DECIMAL(8, 2) NULL,
  mood_score DECIMAL(8, 2) NULL,
  meditation_minutes INT NOT NULL DEFAULT 0,
  hrr_1min_bpm DECIMAL(8, 2) NULL,
  sleep_regularity_index DECIMAL(8, 2) NULL,
  social_jetlag_hours DECIMAL(8, 2) NULL,
  waso_minutes DECIMAL(8, 2) NULL,
  training_load_epoc DECIMAL(10, 2) NULL,
  daily_strain DECIMAL(8, 2) NULL,
  sedentary_hours DECIMAL(8, 2) NULL,
  sedentary_breaks DECIMAL(8, 2) NULL,
  time_in_range_percent DECIMAL(8, 2) NULL,
  glycemic_variability_cv DECIMAL(8, 2) NULL,
  gmi_percent DECIMAL(8, 2) NULL,
  post_prandial_peak_mgdl DECIMAL(8, 2) NULL,
  time_below_range_percent DECIMAL(8, 2) NULL,
  iauc_per_meal_mgdl_h DECIMAL(10, 2) NULL,
  whtr_ratio DECIMAL(8, 4) NULL,
  protein_g_per_kg DECIMAL(8, 2) NULL,
  dietary_fiber_grams DECIMAL(10, 2) NULL,
  eating_window_hours DECIMAL(8, 2) NULL,
  sodium_potassium_ratio DECIMAL(8, 2) NULL,
  hydration_ml_per_kg DECIMAL(8, 2) NULL,
  reaction_time_pvt_ms DECIMAL(10, 2) NULL,
  pvt_lapses_count DECIMAL(8, 2) NULL,
  cognitive_test_score DECIMAL(8, 2) NULL,
  hrv_stress_index DECIMAL(8, 2) NULL,
  eda_tonic_microsiemens DECIMAL(10, 4) NULL,
  afib_history_percent DECIMAL(8, 2) NULL,
  CONSTRAINT fk_daily_metrics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_daily_metrics_user_date UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS goals (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  category VARCHAR(120) NULL,
  target_value DECIMAL(10, 2) NULL,
  current_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit VARCHAR(64) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'in_progress',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS habits (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  frequency VARCHAR(120) NOT NULL DEFAULT 'Diário',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_habits_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS suggested_habits (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  frequency VARCHAR(120) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_tips (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  detail TEXT NOT NULL,
  category VARCHAR(120) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_config (
  id CHAR(36) PRIMARY KEY,
  mission TEXT NOT NULL,
  key_objectives TEXT NOT NULL,
  weight_hrv DECIMAL(8, 2) NOT NULL DEFAULT 30,
  weight_sleep DECIMAL(8, 2) NOT NULL DEFAULT 30,
  weight_activity DECIMAL(8, 2) NOT NULL DEFAULT 25,
  weight_nutrition DECIMAL(8, 2) NOT NULL DEFAULT 15,
  model_name VARCHAR(120) NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_plans (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  plan_data JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_plans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS professionals (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  contact VARCHAR(255) NULL,
  avatar_url TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_professionals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  professional_id CHAR(36) NOT NULL,
  appointment_time DATETIME NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'scheduled',
  notes TEXT NULL,
  meeting_link TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_appointments_professional FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS instruments (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

INSERT INTO instruments (name)
SELECT * FROM (
  SELECT 'HRV' AS name UNION ALL
  SELECT 'Sono' UNION ALL
  SELECT 'Glicose' UNION ALL
  SELECT 'Peso'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM instruments LIMIT 1);

INSERT INTO suggested_habits (id, name, frequency, is_active)
SELECT * FROM (
  SELECT UUID(), 'Meditar 10 minutos', 'Diário', TRUE UNION ALL
  SELECT UUID(), 'Beber 2L de água', 'Diário', TRUE UNION ALL
  SELECT UUID(), 'Caminhar 30 minutos', 'Diário', TRUE UNION ALL
  SELECT UUID(), 'Desligar telas 1h antes de dormir', 'Diário', TRUE UNION ALL
  SELECT UUID(), 'Treino de força', 'Semanal (2x)', TRUE
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM suggested_habits LIMIT 1);

INSERT INTO ai_tips (id, title, detail, category, is_active)
SELECT * FROM (
  SELECT UUID(), 'Otimize o Sono Profundo', 'Seu histórico recente favorece rotina consistente, redução de luz azul e resfriamento leve do ambiente antes de dormir.', 'Sono', TRUE UNION ALL
  SELECT UUID(), 'Aumente a Proteína', 'Distribua proteína ao longo do dia para apoiar recuperação, saciedade e preservação de massa magra.', 'Nutrição', TRUE UNION ALL
  SELECT UUID(), 'Hidratação Estratégica', 'Ajuste água e eletrólitos conforme atividade, sono e temperatura corporal para sustentar prontidão.', 'Hidratação', TRUE
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM ai_tips LIMIT 1);

INSERT INTO ai_config (
  id,
  mission,
  key_objectives,
  weight_hrv,
  weight_sleep,
  weight_activity,
  weight_nutrition,
  model_name
)
SELECT
  UUID(),
  'Orquestrar sinais biométricos e contexto astrológico com foco em saúde preventiva, autonomia e decisões de baixo risco.',
  'Priorizar recuperação, qualidade do sono, aderência a hábitos, estabilidade glicêmica e carga de treino proporcional ao estado do usuário.',
  30,
  30,
  25,
  15,
  'lyra-local-orchestrator-v1'
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM ai_config LIMIT 1);
