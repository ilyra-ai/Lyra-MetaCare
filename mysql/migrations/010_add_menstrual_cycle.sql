-- Saúde da mulher: rastreio do ciclo menstrual e fases de vida.
-- Campos de configuração estável ficam no perfil; o fluxo observado por dia
-- fica em daily_metrics. Usados pelo motor de ciclo para calcular a fase atual
-- (menstrual/folicular/ovulatória/lútea), janela fértil e recomendações.

ALTER TABLE profiles
  ADD COLUMN tracks_menstrual_cycle BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN last_menstrual_period DATE NULL,
  ADD COLUMN menstrual_cycle_length INT NULL,
  ADD COLUMN menstrual_period_length INT NULL,
  ADD COLUMN menstrual_life_stage VARCHAR(32) NULL;

ALTER TABLE daily_metrics
  ADD COLUMN menstrual_flow VARCHAR(20) NULL;
