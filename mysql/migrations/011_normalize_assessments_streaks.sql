-- Migração 011: alinha user_assessments e user_streaks (criadas na 008) ao
-- padrão do restante do schema.
--
-- Diferenças encontradas na auditoria (tarefa 16):
--   * id e user_id em VARCHAR(36); todas as demais chaves UUID, inclusive
--     profiles.id referenciada pela FK, são CHAR(36);
--   * created_at/updated_at em TIMESTAMP anuláveis, os únicos do schema: o
--     valor depende do fuso da sessão e tem o limite de 2038; as demais 49
--     colunas temporais são DATETIME NOT NULL;
--   * current_streak/longest_streak anuláveis, embora o código sempre grave
--     números;
--   * chaves estrangeiras com nomes gerados (user_*_ibfk_1), fora do padrão
--     fk_<tabela>_<referência>.
--
-- Os dados são preservados: as conversões são de alargamento compatível
-- (VARCHAR(36) → CHAR(36) com UUIDs de 36 caracteres; TIMESTAMP → DATETIME
-- no fuso da sessão, UTC no servidor do projeto) e os nulos recebem valores
-- coerentes antes do NOT NULL.
--
-- Idempotente: DDL no MySQL faz commit implícito, então cada ALTER só é
-- executado se a FK antiga ainda existir; uma reexecução após falha parcial
-- continua do ponto em que parou.

UPDATE user_assessments
SET
  created_at = COALESCE(created_at, updated_at, CURRENT_TIMESTAMP),
  updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)
WHERE created_at IS NULL OR updated_at IS NULL;

UPDATE user_streaks
SET
  current_streak = COALESCE(current_streak, 0),
  longest_streak = COALESCE(longest_streak, current_streak, 0),
  created_at = COALESCE(created_at, updated_at, CURRENT_TIMESTAMP),
  updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)
WHERE current_streak IS NULL
  OR longest_streak IS NULL
  OR created_at IS NULL
  OR updated_at IS NULL;

SET @lyra_fk_assessments := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'user_assessments'
    AND CONSTRAINT_NAME = 'user_assessments_ibfk_1'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @lyra_ddl := IF(
  @lyra_fk_assessments > 0,
  'ALTER TABLE user_assessments
     DROP FOREIGN KEY user_assessments_ibfk_1,
     MODIFY id CHAR(36) NOT NULL,
     MODIFY user_id CHAR(36) NOT NULL,
     MODIFY created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     MODIFY updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     ADD CONSTRAINT fk_user_assessments_profile
       FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE',
  'DO 0'
);
PREPARE lyra_stmt FROM @lyra_ddl;
EXECUTE lyra_stmt;
DEALLOCATE PREPARE lyra_stmt;

SET @lyra_fk_streaks := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'user_streaks'
    AND CONSTRAINT_NAME = 'user_streaks_ibfk_1'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @lyra_ddl := IF(
  @lyra_fk_streaks > 0,
  'ALTER TABLE user_streaks
     DROP FOREIGN KEY user_streaks_ibfk_1,
     MODIFY id CHAR(36) NOT NULL,
     MODIFY user_id CHAR(36) NOT NULL,
     MODIFY current_streak INT NOT NULL DEFAULT 0,
     MODIFY longest_streak INT NOT NULL DEFAULT 0,
     MODIFY created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     MODIFY updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     ADD CONSTRAINT fk_user_streaks_profile
       FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE',
  'DO 0'
);
PREPARE lyra_stmt FROM @lyra_ddl;
EXECUTE lyra_stmt;
DEALLOCATE PREPARE lyra_stmt;
