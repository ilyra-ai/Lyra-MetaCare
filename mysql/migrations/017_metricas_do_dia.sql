-- Métricas reais gravadas (tarefa 40).
--
-- energy_level: energia percebida no check-in do dia (1 a 5, mesma escala do
-- humor), usada pelo coach diário. Antes não havia onde registrar a energia.
--
-- sensor_heart_rate_avg e sensor_minutes: média da frequência cardíaca e
-- minutos somados das sessões da pulseira Bluetooth no dia. A média do dia é
-- recalculada a cada sessão, ponderada pela duração.
--
-- metrics_updated_at: quando o registro do dia foi alterado pela última vez
-- (check-in ou pulseira), usado pela rotina diária do coach.
ALTER TABLE daily_metrics
  ADD COLUMN energy_level TINYINT UNSIGNED NULL AFTER mood_score,
  ADD COLUMN sensor_heart_rate_avg DECIMAL(5,1) NULL AFTER resting_heart_rate_max,
  ADD COLUMN sensor_minutes DECIMAL(7,1) NULL AFTER sensor_heart_rate_avg,
  ADD COLUMN metrics_updated_at DATETIME NULL;
