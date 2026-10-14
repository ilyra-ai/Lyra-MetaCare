-- Metas automáticas e prazos (tarefa 43).
--
-- metric_key: métrica do registro do dia que alimenta a meta (passos, sono,
-- água, meditação, minutos ativos ou peso). Com ela, o servidor recalcula o
-- progresso a cada check-in ou sessão da pulseira; sem ela, a meta é manual.
-- metric_direction: 'up' (chegar a pelo menos o alvo) ou 'down' (chegar a no
-- máximo o alvo, ex.: peso).
-- auto_sample_days: quantos dias com registro entraram no último cálculo.
-- deadline: prazo opcional; vencido sem atingir o alvo, a meta fica "Em
-- atraso" (status 'missed', que antes nunca era atribuído).
ALTER TABLE goals
  ADD COLUMN metric_key VARCHAR(32) NULL AFTER unit,
  ADD COLUMN metric_direction VARCHAR(8) NULL AFTER metric_key,
  ADD COLUMN deadline DATE NULL AFTER metric_direction,
  ADD COLUMN auto_sample_days INT NULL AFTER deadline,
  ADD COLUMN auto_updated_at DATETIME NULL AFTER auto_sample_days;

CREATE INDEX idx_goals_user_metric ON goals (user_id, metric_key);
