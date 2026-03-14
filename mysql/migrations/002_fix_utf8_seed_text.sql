SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;

ALTER TABLE suggested_habits
  CONVERT TO CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

ALTER TABLE ai_tips
  CONVERT TO CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

ALTER TABLE ai_config
  CONVERT TO CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

UPDATE suggested_habits
SET
  name = 'Meditar 10 minutos',
  frequency = 'Diário'
WHERE name = 'Meditar 10 minutos'
  AND frequency = 'DiÃ¡rio';

UPDATE suggested_habits
SET
  name = 'Beber 2L de água',
  frequency = 'Diário'
WHERE name IN ('Beber 2L de Ã¡gua', 'Beber 2L de água');

UPDATE suggested_habits
SET
  name = 'Caminhar 30 minutos',
  frequency = 'Diário'
WHERE name = 'Caminhar 30 minutos'
  AND frequency = 'DiÃ¡rio';

UPDATE suggested_habits
SET
  name = 'Desligar telas 1h antes de dormir',
  frequency = 'Diário'
WHERE name = 'Desligar telas 1h antes de dormir'
  AND frequency = 'DiÃ¡rio';

UPDATE suggested_habits
SET
  name = 'Treino de força',
  frequency = 'Semanal (2x)'
WHERE name IN ('Treino de forÃ§a', 'Treino de força');

UPDATE ai_tips
SET
  title = 'Otimize o Sono Profundo',
  detail = 'Seu histórico recente favorece rotina consistente, redução de luz azul e resfriamento leve do ambiente antes de dormir.',
  category = 'Sono'
WHERE title = 'Otimize o Sono Profundo'
  AND detail = 'Seu histÃ³rico recente favorece rotina consistente, reduÃ§Ã£o de luz azul e resfriamento leve do ambiente antes de dormir.';

UPDATE ai_tips
SET
  title = 'Aumente a Proteína',
  detail = 'Distribua proteína ao longo do dia para apoiar recuperação, saciedade e preservação de massa magra.',
  category = 'Nutrição'
WHERE title IN ('Aumente a ProteÃ­na', 'Aumente a Proteína');

UPDATE ai_tips
SET
  title = 'Hidratação Estratégica',
  detail = 'Ajuste água e eletrólitos conforme atividade, sono e temperatura corporal para sustentar prontidão.',
  category = 'Hidratação'
WHERE title IN ('HidrataÃ§Ã£o EstratÃ©gica', 'Hidratação Estratégica');

UPDATE ai_config
SET
  mission = 'Orquestrar sinais biométricos e contexto astrológico com foco em saúde preventiva, autonomia e decisões de baixo risco.',
  key_objectives = 'Priorizar recuperação, qualidade do sono, aderência a hábitos, estabilidade glicêmica e carga de treino proporcional ao estado do usuário.'
WHERE model_name = 'lyra-local-orchestrator-v1';
