CREATE TABLE IF NOT EXISTS site_page_configs (
  id CHAR(36) PRIMARY KEY,
  page_key VARCHAR(32) NOT NULL UNIQUE,
  draft_config JSON NOT NULL,
  published_config JSON NOT NULL,
  updated_by_user_id CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_site_page_configs_updated_by
    FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);
