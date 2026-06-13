-- Documentos de conhecimento, skills e treinamentos que orientam o
-- comportamento da IA da Lyra: o que o modelo deve saber, fazer e executar.
-- Sao injetados em tempo real no contexto do assistente (local e Gemini).
CREATE TABLE IF NOT EXISTS ai_knowledge_documents (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(120) NOT NULL DEFAULT 'skill',
  content MEDIUMTEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  priority INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_knowledge_active
  ON ai_knowledge_documents (is_active, priority);
