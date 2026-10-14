-- Mapa védico real (tarefa 41).
--
-- Local de nascimento escolhido da base de cidades (GeoNames): coordenadas e
-- fuso IANA, sem os quais não existem Lagna, casas e Vimshottari corretos.
-- `birth_location` continua sendo o nome exibido ("Campinas, São Paulo,
-- Brasil"); perfis antigos com texto livre ficam sem coordenadas até a pessoa
-- escolher a cidade.
--
-- Local de moradia: nascer e pôr do sol, Rahu Kalam, Choghadiya e o dia do
-- coach são do lugar onde a pessoa vive.
ALTER TABLE profiles
  ADD COLUMN birth_city_id INT UNSIGNED NULL AFTER birth_location,
  ADD COLUMN birth_latitude DECIMAL(9,6) NULL AFTER birth_city_id,
  ADD COLUMN birth_longitude DECIMAL(9,6) NULL AFTER birth_latitude,
  ADD COLUMN birth_timezone VARCHAR(64) NULL AFTER birth_longitude,
  ADD COLUMN residence_location VARCHAR(255) NULL AFTER birth_timezone,
  ADD COLUMN residence_city_id INT UNSIGNED NULL AFTER residence_location,
  ADD COLUMN residence_latitude DECIMAL(9,6) NULL AFTER residence_city_id,
  ADD COLUMN residence_longitude DECIMAL(9,6) NULL AFTER residence_latitude,
  ADD COLUMN residence_timezone VARCHAR(64) NULL AFTER residence_longitude;
