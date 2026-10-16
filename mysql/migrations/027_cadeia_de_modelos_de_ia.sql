-- Vários provedores e modelos de IA ao mesmo tempo, com ordem de uso e troca
-- automática (tarefa 54).
--
-- 1. ai_provider_connections: um provedor configurado por linha (Ollama, LM
--    Studio, OpenAI, Gemini...), no máximo uma linha por preset. Guarda a URL
--    base, a chave cifrada (AES-256-GCM com chave derivada do AUTH_SECRET,
--    como antes), o tempo máximo, a temperatura e a lista dos modelos
--    escolhidos pelo administrador (models, lista JSON de textos).
-- 2. ai_model_chain: a ordem de uso, com até 5 posições. Cada posição é o
--    motor da Lyra (connection_id NULL e model NULL) ou um modelo de um
--    provedor configurado. Quando o modelo da vez falha (erro, tempo
--    esgotado, cota ou tokens acabando), o seguinte assume; se a resposta
--    foi cortada no limite de tokens, o seguinte continua o texto de onde
--    ela parou. O motor da Lyra encerra a cadeia: dali em diante a leitura é
--    a do motor. Há no máximo uma posição do motor (garantido pela rota).
-- 3. A configuração única anterior (ai_provider_settings, migração 023) é
--    copiada para as tabelas novas e removida.
CREATE TABLE IF NOT EXISTS ai_provider_connections (
  id CHAR(36) PRIMARY KEY,
  preset VARCHAR(32) NOT NULL,
  provider_type VARCHAR(32) NOT NULL,
  base_url VARCHAR(500) NULL,
  api_key_ciphertext TEXT NULL,
  api_key_last4 VARCHAR(4) NULL,
  models JSON NOT NULL,
  timeout_seconds SMALLINT UNSIGNED NOT NULL DEFAULT 90,
  temperature DECIMAL(3, 2) NOT NULL DEFAULT 0.70,
  updated_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_ai_provider_connections_preset UNIQUE (preset),
  CONSTRAINT ck_ai_provider_connections_tipo CHECK (
    provider_type IN ('openai_compativel', 'gemini', 'anthropic')
  ),
  CONSTRAINT ck_ai_provider_connections_modelos CHECK (JSON_TYPE(models) = 'ARRAY'),
  CONSTRAINT ck_ai_provider_connections_tempo CHECK (timeout_seconds BETWEEN 10 AND 600),
  CONSTRAINT ck_ai_provider_connections_temperatura CHECK (temperature BETWEEN 0 AND 2),
  CONSTRAINT fk_ai_provider_connections_usuario FOREIGN KEY (updated_by)
    REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_model_chain (
  position TINYINT UNSIGNED PRIMARY KEY,
  connection_id CHAR(36) NULL,
  model VARCHAR(200) NULL,
  updated_by CHAR(36) NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT ck_ai_model_chain_posicao CHECK (position BETWEEN 1 AND 5),
  CONSTRAINT ck_ai_model_chain_elo CHECK (
    (connection_id IS NULL AND model IS NULL)
    OR (connection_id IS NOT NULL AND model IS NOT NULL)
  ),
  CONSTRAINT uq_ai_model_chain_modelo UNIQUE (connection_id, model),
  -- Sem ação referencial: o MySQL não aceita CHECK em coluna com ON DELETE
  -- CASCADE. A rota administrativa grava provedores e ordem na mesma
  -- transação, tirando da ordem os modelos de um provedor removido.
  CONSTRAINT fk_ai_model_chain_conexao FOREIGN KEY (connection_id)
    REFERENCES ai_provider_connections(id),
  CONSTRAINT fk_ai_model_chain_usuario FOREIGN KEY (updated_by)
    REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cópia da configuração única anterior: o provedor salvo vira a conexão do
-- seu preset (com o modelo escolhido) e ocupa a 1ª posição; o motor da Lyra
-- fica na posição seguinte. Sem provedor (só o motor), o motor é a 1ª.
INSERT INTO ai_provider_connections (
  id, preset, provider_type, base_url, api_key_ciphertext, api_key_last4,
  models, timeout_seconds, temperature, updated_by, updated_at
)
SELECT UUID(), COALESCE(preset, 'personalizado'), provider_type, base_url,
       api_key_ciphertext, api_key_last4, JSON_ARRAY(model), timeout_seconds,
       temperature, updated_by, updated_at
  FROM ai_provider_settings
 WHERE id = 1 AND provider_type <> 'lyra_local' AND model IS NOT NULL;

INSERT INTO ai_model_chain (position, connection_id, model, updated_by)
SELECT 1, c.id, s.model, s.updated_by
  FROM ai_provider_settings s
  JOIN ai_provider_connections c ON c.preset = COALESCE(s.preset, 'personalizado')
 WHERE s.id = 1 AND s.provider_type <> 'lyra_local' AND s.model IS NOT NULL;

INSERT INTO ai_model_chain (position, connection_id, model)
SELECT COALESCE(MAX(position), 0) + 1, NULL, NULL FROM ai_model_chain;

DROP TABLE ai_provider_settings;
