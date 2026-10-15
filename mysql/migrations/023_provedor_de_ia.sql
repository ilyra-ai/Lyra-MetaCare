-- Provedor de IA configurável e leitura védica do "Seu dia" (tarefa 43).
--
-- 1. O texto do dia deixa de depender de consentimento por pessoa: a leitura
--    só usa dados astrológicos (mapa natal derivado e céu do dia), sem nome,
--    e-mail, data, hora ou cidade de nascimento, métricas, ciclo nem sinais do
--    corpo. A preferência criada na migração 022 sai do perfil.
ALTER TABLE profiles
  DROP COLUMN coach_external_ai_since;

-- 2. "Motor local ativo" guardava nomes de motores fixos no código
--    (lyra-local-*), que não escolhiam nada. O modelo real passa a ficar em
--    ai_provider_settings.model.
ALTER TABLE ai_config
  DROP COLUMN model_name;

-- 3. Provedor de IA da plataforma, em uma única linha (id = 1), gravado só
--    pela rota administrativa /api/admin/ia (fora da API genérica de dados).
--    provider_type:
--      lyra_local         só o motor determinístico da Lyra (padrão)
--      openai_compativel  Ollama, LM Studio, Jan, llama.cpp, vLLM, OpenAI,
--                         OpenRouter, Groq, Mistral, DeepSeek e outros com a
--                         API de chat completions
--      gemini             Google Gemini (API nativa)
--      anthropic          Anthropic (API Messages)
--    api_key_ciphertext: chave cifrada com AES-256-GCM (chave derivada do
--    AUTH_SECRET por HKDF); a chave em texto nunca é gravada nem devolvida.
CREATE TABLE IF NOT EXISTS ai_provider_settings (
  id TINYINT UNSIGNED PRIMARY KEY,
  provider_type VARCHAR(32) NOT NULL DEFAULT 'lyra_local',
  preset VARCHAR(32) NULL,
  base_url VARCHAR(500) NULL,
  model VARCHAR(200) NULL,
  api_key_ciphertext TEXT NULL,
  api_key_last4 VARCHAR(4) NULL,
  timeout_seconds SMALLINT UNSIGNED NOT NULL DEFAULT 90,
  temperature DECIMAL(3, 2) NOT NULL DEFAULT 0.70,
  updated_by CHAR(36) NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT ck_ai_provider_settings_unica CHECK (id = 1),
  CONSTRAINT ck_ai_provider_settings_tipo CHECK (
    provider_type IN ('lyra_local', 'openai_compativel', 'gemini', 'anthropic')
  ),
  CONSTRAINT ck_ai_provider_settings_tempo CHECK (timeout_seconds BETWEEN 10 AND 600),
  CONSTRAINT ck_ai_provider_settings_temperatura CHECK (temperature BETWEEN 0 AND 2),
  CONSTRAINT fk_ai_provider_settings_usuario FOREIGN KEY (updated_by)
    REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO ai_provider_settings (id) VALUES (1);
