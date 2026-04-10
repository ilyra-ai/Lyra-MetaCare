CREATE TABLE IF NOT EXISTS `puck_documents` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `document_key` VARCHAR(64) NOT NULL UNIQUE,
  `draft_data` JSON NOT NULL,
  `published_data` JSON NOT NULL,
  `updated_by_user_id` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_puck_documents_updated_by`
    FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
