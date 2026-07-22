-- R2 object metadata and ownership. The binary/object payload lives in R2;
-- D1 remains the canonical ownership, lifecycle, and authorization index.

CREATE TABLE IF NOT EXISTS artifacts (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL UNIQUE,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('export','archive','report','audio','video','social_image')),
  source_job_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','ready','failed','deleted')),
  content_type TEXT,
  byte_length INTEGER,
  checksum_sha256 TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_artifacts_account_status ON artifacts(account_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_artifacts_source_job ON artifacts(source_job_id);
