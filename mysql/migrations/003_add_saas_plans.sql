CREATE TABLE IF NOT EXISTS subscription_plans (
  id CHAR(36) PRIMARY KEY,
  plan_key VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  tagline VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  monthly_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  annual_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency_code CHAR(3) NOT NULL DEFAULT 'BRL',
  highlight_text VARCHAR(120) NULL,
  accent_from VARCHAR(32) NOT NULL DEFAULT '#0F766E',
  accent_to VARCHAR(32) NOT NULL DEFAULT '#0EA5E9',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan_features (
  id CHAR(36) PRIMARY KEY,
  feature_key VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(80) NOT NULL,
  feature_type VARCHAR(24) NOT NULL,
  meter_kind VARCHAR(32) NOT NULL,
  unit VARCHAR(32) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan_entitlements (
  id CHAR(36) PRIMARY KEY,
  plan_id CHAR(36) NOT NULL,
  feature_id CHAR(36) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  quota_value BIGINT NULL,
  reset_interval VARCHAR(32) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_plan_entitlements_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE,
  CONSTRAINT fk_plan_entitlements_feature FOREIGN KEY (feature_id) REFERENCES plan_features(id) ON DELETE CASCADE,
  CONSTRAINT uq_plan_entitlements_plan_feature UNIQUE (plan_id, feature_id)
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  plan_id CHAR(36) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  billing_interval VARCHAR(32) NOT NULL DEFAULT 'monthly',
  source VARCHAR(64) NOT NULL DEFAULT 'internal',
  starts_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  current_period_start DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  current_period_end DATETIME NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at DATETIME NULL,
  ended_at DATETIME NULL,
  external_customer_id VARCHAR(255) NULL,
  external_subscription_id VARCHAR(255) NULL,
  external_price_id VARCHAR(255) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_subscriptions_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT
);

CREATE INDEX idx_user_subscriptions_user_status
  ON user_subscriptions (user_id, status, current_period_end);

CREATE TABLE IF NOT EXISTS feature_usage_counters (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  feature_key VARCHAR(64) NOT NULL,
  period_start DATETIME NOT NULL,
  period_end DATETIME NOT NULL,
  used_value BIGINT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_feature_usage_counters_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_feature_usage_counters_user_feature_period UNIQUE (user_id, feature_key, period_start, period_end)
);

CREATE TABLE IF NOT EXISTS subscription_audit_events (
  id CHAR(36) PRIMARY KEY,
  subscription_id CHAR(36) NULL,
  user_id CHAR(36) NOT NULL,
  actor_user_id CHAR(36) NULL,
  event_type VARCHAR(64) NOT NULL,
  source VARCHAR(64) NOT NULL DEFAULT 'internal',
  payload JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_subscription_audit_events_subscription FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  CONSTRAINT fk_subscription_audit_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_subscription_audit_events_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO subscription_plans (
  id,
  plan_key,
  name,
  tagline,
  description,
  monthly_price,
  annual_price,
  currency_code,
  highlight_text,
  accent_from,
  accent_to,
  display_order,
  is_active,
  is_public
)
SELECT
  seed.id,
  seed.plan_key,
  seed.name,
  seed.tagline,
  seed.description,
  seed.monthly_price,
  seed.annual_price,
  seed.currency_code,
  seed.highlight_text,
  seed.accent_from,
  seed.accent_to,
  seed.display_order,
  seed.is_active,
  seed.is_public
FROM (
  SELECT
    UUID() AS id,
    'free' AS plan_key,
    'Free' AS name,
    'Base confiável para começar com clareza.' AS tagline,
    'Acesso essencial ao ecossistema Lyra MetaCare, com visão inicial dos indicadores, perfil e automações fundamentais.' AS description,
    0.00 AS monthly_price,
    0.00 AS annual_price,
    'BRL' AS currency_code,
    'Sem custo para começar' AS highlight_text,
    '#0F766E' AS accent_from,
    '#14B8A6' AS accent_to,
    1 AS display_order,
    TRUE AS is_active,
    TRUE AS is_public
  UNION ALL
  SELECT
    UUID(),
    'meta',
    'Meta',
    'Mais profundidade, dados e automação orientada por IA.',
    'Plano intermediário com capacidades expandidas de IA, conexão de dispositivos e observabilidade operacional para rotina contínua.',
    79.90,
    790.00,
    'BRL',
    'Mais inteligência e automação',
    '#0F172A',
    '#2563EB',
    2,
    TRUE,
    TRUE
  UNION ALL
  SELECT
    UUID(),
    'care',
    'Care',
    'A experiência mais completa, clínica e operacional do produto.',
    'Plano premium com a matriz completa de capacidades, máxima profundidade de acompanhamento, monitoramento avançado e governança plena da experiência.',
    249.90,
    2490.00,
    'BRL',
    'Experiência integral Lyra',
    '#7C2D12',
    '#F97316',
    3,
    TRUE,
    TRUE
) AS seed
LEFT JOIN subscription_plans existing
  ON existing.plan_key = seed.plan_key
WHERE existing.id IS NULL;

INSERT INTO plan_features (
  id,
  feature_key,
  name,
  description,
  category,
  feature_type,
  meter_kind,
  unit,
  sort_order
)
SELECT
  seed.id,
  seed.feature_key,
  seed.name,
  seed.description,
  seed.category,
  seed.feature_type,
  seed.meter_kind,
  seed.unit,
  seed.sort_order
FROM (
  SELECT
    UUID() AS id,
    'dashboard_access' AS feature_key,
    'Dashboard operacional' AS name,
    'Acesso à visão principal com cards, score e leitura central do produto.' AS description,
    'Essencial' AS category,
    'boolean' AS feature_type,
    'toggle' AS meter_kind,
    NULL AS unit,
    10 AS sort_order
  UNION ALL
  SELECT
    UUID(),
    'ai_scores',
    'Scores de longevidade',
    'Cálculo local da prontidão e longevidade com base em métricas recentes.',
    'Essencial',
    'boolean',
    'toggle',
    NULL,
    20
  UNION ALL
  SELECT
    UUID(),
    'ai_tips_feed',
    'Feed de dicas inteligentes',
    'Entrega de recomendações persistidas em MySQL para orientar a rotina.',
    'Essencial',
    'boolean',
    'toggle',
    NULL,
    30
  UNION ALL
  SELECT
    UUID(),
    'profile_management',
    'Gestão de perfil',
    'Cadastro, edição de identidade, avatar e dados de contexto pessoal.',
    'Essencial',
    'boolean',
    'toggle',
    NULL,
    40
  UNION ALL
  SELECT
    UUID(),
    'goal_progress_tracking',
    'Acompanhamento de metas',
    'Visualização e atualização de progresso de metas persistidas.',
    'Essencial',
    'boolean',
    'toggle',
    NULL,
    50
  UNION ALL
  SELECT
    UUID(),
    'wearable_bluetooth_connection',
    'Conexão Bluetooth',
    'Pareamento real com dispositivos BLE compatíveis para leitura em tempo real.',
    'Clínico',
    'boolean',
    'toggle',
    NULL,
    60
  UNION ALL
  SELECT
    UUID(),
    'realtime_monitoring',
    'Monitoramento em tempo real',
    'Painel de sinais ao vivo, alertas e fluxo contínuo de biomarcadores.',
    'Clínico',
    'boolean',
    'toggle',
    NULL,
    70
  UNION ALL
  SELECT
    UUID(),
    'voice_monitoring_updates',
    'Atualizações por voz',
    'Leitura falada de métricas em tempo real com síntese de voz local.',
    'Clínico',
    'boolean',
    'toggle',
    NULL,
    80
  UNION ALL
  SELECT
    UUID(),
    'ai_chat_messages',
    'Mensagens com assistente IA',
    'Volume mensal disponível para conversas contextuais com o assistente.',
    'IA',
    'quota',
    'usage_counter',
    'mensagens/mês',
    90
  UNION ALL
  SELECT
    UUID(),
    'ai_plan_generations',
    'Gerações de plano IA',
    'Quantidade de reprocessamentos do plano orquestrado por ciclo mensal.',
    'IA',
    'quota',
    'usage_counter',
    'gerações/mês',
    100
  UNION ALL
  SELECT
    UUID(),
    'professionals_total',
    'Profissionais cadastrados',
    'Capacidade total de profissionais e especialistas vinculados ao usuário.',
    'Operação',
    'quota',
    'active_rows',
    'profissionais',
    110
  UNION ALL
  SELECT
    UUID(),
    'appointments_active',
    'Consultas ativas',
    'Quantidade de consultas futuras que podem permanecer agendadas simultaneamente.',
    'Operação',
    'quota',
    'active_rows',
    'consultas ativas',
    120
  UNION ALL
  SELECT
    UUID(),
    'metrics_history_days',
    'Histórico biométrico',
    'Janela máxima de dias de dados biométricos disponível para consultas e gráficos.',
    'Operação',
    'quota',
    'rolling_days',
    'dias',
    130
) AS seed
LEFT JOIN plan_features existing
  ON existing.feature_key = seed.feature_key
WHERE existing.id IS NULL;

INSERT INTO plan_entitlements (
  id,
  plan_id,
  feature_id,
  enabled,
  quota_value,
  reset_interval
)
SELECT
  UUID(),
  plans.id,
  features.id,
  seed.enabled,
  seed.quota_value,
  seed.reset_interval
FROM (
  SELECT 'free' AS plan_key, 'dashboard_access' AS feature_key, TRUE AS enabled, NULL AS quota_value, NULL AS reset_interval
  UNION ALL SELECT 'free', 'ai_scores', TRUE, NULL, NULL
  UNION ALL SELECT 'free', 'ai_tips_feed', TRUE, NULL, NULL
  UNION ALL SELECT 'free', 'profile_management', TRUE, NULL, NULL
  UNION ALL SELECT 'free', 'goal_progress_tracking', TRUE, NULL, NULL
  UNION ALL SELECT 'free', 'wearable_bluetooth_connection', FALSE, NULL, NULL
  UNION ALL SELECT 'free', 'realtime_monitoring', FALSE, NULL, NULL
  UNION ALL SELECT 'free', 'voice_monitoring_updates', FALSE, NULL, NULL
  UNION ALL SELECT 'free', 'ai_chat_messages', TRUE, 15, 'monthly'
  UNION ALL SELECT 'free', 'ai_plan_generations', TRUE, 1, 'monthly'
  UNION ALL SELECT 'free', 'professionals_total', TRUE, 2, 'concurrent'
  UNION ALL SELECT 'free', 'appointments_active', TRUE, 2, 'concurrent'
  UNION ALL SELECT 'free', 'metrics_history_days', TRUE, 30, 'rolling'
  UNION ALL SELECT 'meta', 'dashboard_access', TRUE, NULL, NULL
  UNION ALL SELECT 'meta', 'ai_scores', TRUE, NULL, NULL
  UNION ALL SELECT 'meta', 'ai_tips_feed', TRUE, NULL, NULL
  UNION ALL SELECT 'meta', 'profile_management', TRUE, NULL, NULL
  UNION ALL SELECT 'meta', 'goal_progress_tracking', TRUE, NULL, NULL
  UNION ALL SELECT 'meta', 'wearable_bluetooth_connection', TRUE, NULL, NULL
  UNION ALL SELECT 'meta', 'realtime_monitoring', TRUE, NULL, NULL
  UNION ALL SELECT 'meta', 'voice_monitoring_updates', FALSE, NULL, NULL
  UNION ALL SELECT 'meta', 'ai_chat_messages', TRUE, 150, 'monthly'
  UNION ALL SELECT 'meta', 'ai_plan_generations', TRUE, 12, 'monthly'
  UNION ALL SELECT 'meta', 'professionals_total', TRUE, 10, 'concurrent'
  UNION ALL SELECT 'meta', 'appointments_active', TRUE, 20, 'concurrent'
  UNION ALL SELECT 'meta', 'metrics_history_days', TRUE, 180, 'rolling'
  UNION ALL SELECT 'care', 'dashboard_access', TRUE, NULL, NULL
  UNION ALL SELECT 'care', 'ai_scores', TRUE, NULL, NULL
  UNION ALL SELECT 'care', 'ai_tips_feed', TRUE, NULL, NULL
  UNION ALL SELECT 'care', 'profile_management', TRUE, NULL, NULL
  UNION ALL SELECT 'care', 'goal_progress_tracking', TRUE, NULL, NULL
  UNION ALL SELECT 'care', 'wearable_bluetooth_connection', TRUE, NULL, NULL
  UNION ALL SELECT 'care', 'realtime_monitoring', TRUE, NULL, NULL
  UNION ALL SELECT 'care', 'voice_monitoring_updates', TRUE, NULL, NULL
  UNION ALL SELECT 'care', 'ai_chat_messages', TRUE, 1000, 'monthly'
  UNION ALL SELECT 'care', 'ai_plan_generations', TRUE, 60, 'monthly'
  UNION ALL SELECT 'care', 'professionals_total', TRUE, NULL, 'concurrent'
  UNION ALL SELECT 'care', 'appointments_active', TRUE, NULL, 'concurrent'
  UNION ALL SELECT 'care', 'metrics_history_days', TRUE, 730, 'rolling'
) AS seed
INNER JOIN subscription_plans plans
  ON plans.plan_key = seed.plan_key
INNER JOIN plan_features features
  ON features.feature_key = seed.feature_key
LEFT JOIN plan_entitlements existing
  ON existing.plan_id = plans.id
 AND existing.feature_id = features.id
WHERE existing.id IS NULL;

INSERT INTO user_subscriptions (
  id,
  user_id,
  plan_id,
  status,
  billing_interval,
  source,
  starts_at,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  metadata
)
SELECT
  UUID(),
  users.id,
  plans.id,
  'active',
  'monthly',
  CASE
    WHEN profiles.role = 'admin' THEN 'bootstrap_admin'
    ELSE 'legacy_default'
  END,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 MONTH),
  FALSE,
  JSON_OBJECT(
    'reason',
    CASE
      WHEN profiles.role = 'admin' THEN 'seed_admin_care'
      ELSE 'seed_default_free'
    END
  )
FROM users
INNER JOIN profiles
  ON profiles.id = users.id
INNER JOIN subscription_plans plans
  ON plans.plan_key = CASE WHEN profiles.role = 'admin' THEN 'care' ELSE 'free' END
LEFT JOIN user_subscriptions current_subscription
  ON current_subscription.user_id = users.id
 AND current_subscription.status = 'active'
 AND (current_subscription.ended_at IS NULL OR current_subscription.ended_at > UTC_TIMESTAMP())
WHERE current_subscription.id IS NULL;
