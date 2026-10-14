-- Ausência não é zero (tarefa 43).
--
-- Desde o schema inicial, 14 colunas de daily_metrics eram NOT NULL DEFAULT 0:
-- um check-in só com o humor criava o dia com 0 passos, 0 min de sono e 0 L
-- de água, e painel, scores, agente e coach liam esses zeros como medidas
-- reais ("Aumente o movimento: 0 passos", "Hidratação 0,0 L"). As colunas
-- passam a aceitar NULL (sem registro) e o padrão vira NULL.
--
-- Valores 0 já gravados ficam NULL: o schema antigo não distinguia "não
-- informado" de "zero", e zero de sono, passos, água ou macronutrientes num
-- dia inteiro não é uma medida plausível. Daqui em diante, um 0 informado no
-- check-in (ex.: nenhuma cafeína) fica gravado como 0.
ALTER TABLE daily_metrics
  MODIFY COLUMN steps INT NULL DEFAULT NULL,
  MODIFY COLUMN sleep_duration_minutes INT NULL DEFAULT NULL,
  MODIFY COLUMN deep_sleep_minutes INT NULL DEFAULT NULL,
  MODIFY COLUMN total_distance_km DECIMAL(10,2) NULL DEFAULT NULL,
  MODIFY COLUMN active_minutes INT NULL DEFAULT NULL,
  MODIFY COLUMN workout_calories DECIMAL(10,2) NULL DEFAULT NULL,
  MODIFY COLUMN rem_sleep_minutes INT NULL DEFAULT NULL,
  MODIFY COLUMN light_sleep_minutes INT NULL DEFAULT NULL,
  MODIFY COLUMN protein_grams DECIMAL(10,2) NULL DEFAULT NULL,
  MODIFY COLUMN carb_grams DECIMAL(10,2) NULL DEFAULT NULL,
  MODIFY COLUMN fat_grams DECIMAL(10,2) NULL DEFAULT NULL,
  MODIFY COLUMN water_liters DECIMAL(10,2) NULL DEFAULT NULL,
  MODIFY COLUMN caffeine_mg DECIMAL(10,2) NULL DEFAULT NULL,
  MODIFY COLUMN meditation_minutes INT NULL DEFAULT NULL;

UPDATE daily_metrics
   SET steps = NULLIF(steps, 0),
       sleep_duration_minutes = NULLIF(sleep_duration_minutes, 0),
       deep_sleep_minutes = NULLIF(deep_sleep_minutes, 0),
       total_distance_km = NULLIF(total_distance_km, 0),
       active_minutes = NULLIF(active_minutes, 0),
       workout_calories = NULLIF(workout_calories, 0),
       rem_sleep_minutes = NULLIF(rem_sleep_minutes, 0),
       light_sleep_minutes = NULLIF(light_sleep_minutes, 0),
       protein_grams = NULLIF(protein_grams, 0),
       carb_grams = NULLIF(carb_grams, 0),
       fat_grams = NULLIF(fat_grams, 0),
       water_liters = NULLIF(water_liters, 0),
       caffeine_mg = NULLIF(caffeine_mg, 0),
       meditation_minutes = NULLIF(meditation_minutes, 0);
