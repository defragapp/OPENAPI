PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS auth_email_codes (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  email_normalized TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  return_to TEXT NOT NULL DEFAULT '/app',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  requested_ip_hash TEXT,
  user_agent_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS auth_email_codes_email_created_idx
  ON auth_email_codes(email_normalized, created_at DESC);

CREATE INDEX IF NOT EXISTS auth_email_codes_account_active_idx
  ON auth_email_codes(account_id, used_at, expires_at);

CREATE INDEX IF NOT EXISTS auth_email_codes_ip_created_idx
  ON auth_email_codes(requested_ip_hash, created_at DESC);
