-- Texto do coach por IA externa (tarefa 43).
--
-- coach_external_ai_since: quando a pessoa ativou o consentimento para o
-- texto do "Seu dia" ser reescrito pelo Google Gemini com a chave do
-- servidor (GEMINI_API_KEY). NULL = desligado (padrão). Revogar volta a NULL
-- na hora e o dia é refeito só com o motor local. O aceite fica também em
-- consent_records (tipo coach_external_ai), com versão e data.
ALTER TABLE profiles
  ADD COLUMN coach_external_ai_since DATETIME NULL;
