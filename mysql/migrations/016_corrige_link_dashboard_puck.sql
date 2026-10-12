-- Links reais (tarefa 29): o painel principal fica em "/", e a rota
-- "/dashboard" nunca existiu (404). O conteúdo inicial do Puck gravou esse
-- link no card de recurso do documento landing-home; o código também foi
-- corrigido (initial-data, feature-card e rota pública do documento).
-- Só o valor exato "/dashboard" é trocado, em rascunho e publicação.
UPDATE puck_documents
SET draft_data = CAST(REPLACE(CAST(draft_data AS CHAR), '"/dashboard"', '"/"') AS JSON)
WHERE CAST(draft_data AS CHAR) LIKE '%"/dashboard"%';

UPDATE puck_documents
SET published_data = CAST(REPLACE(CAST(published_data AS CHAR), '"/dashboard"', '"/"') AS JSON)
WHERE published_data IS NOT NULL
  AND CAST(published_data AS CHAR) LIKE '%"/dashboard"%';
