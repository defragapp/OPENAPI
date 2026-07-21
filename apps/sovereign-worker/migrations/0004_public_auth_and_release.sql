PRAGMA foreign_keys = ON;

ALTER TABLE accounts ADD COLUMN email TEXT;
ALTER TABLE accounts ADD COLUMN display_name TEXT;
ALTER TABLE accounts ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE accounts ADD COLUMN terms_version TEXT;
ALTER TABLE accounts ADD COLUMN privacy_version TEXT;
ALTER TABLE accounts ADD COLUMN email_verified_at TEXT;

CREATE UNIQUE INDEX accounts_email_unique_idx ON accounts(email) WHERE email IS NOT NULL;

CREATE TABLE account_auth_tokens (
  id TEXT PRIMARY KEY,
  account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  token_type TEXT NOT NULL CHECK(token_type IN ('email_verification','magic_link')),
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX account_auth_tokens_email_type_idx ON account_auth_tokens(email, token_type, expires_at);

CREATE TABLE account_sessions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  user_agent_hash TEXT
);
CREATE INDEX account_sessions_account_active_idx ON account_sessions(account_id, expires_at, revoked_at);

CREATE TABLE auth_attempts (
  id TEXT PRIMARY KEY,
  email TEXT,
  action TEXT NOT NULL,
  success INTEGER NOT NULL CHECK(success IN (0,1)),
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX auth_attempts_email_action_idx ON auth_attempts(email, action, created_at DESC);

CREATE TABLE turnstile_audit_events (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  success INTEGER NOT NULL CHECK(success IN (0,1)),
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE email_delivery_log (
  id TEXT PRIMARY KEY,
  account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  template TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE baseline_onboarding (
  account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  birth_date_hash TEXT NOT NULL,
  birth_time_certainty TEXT NOT NULL,
  birth_location_hash TEXT NOT NULL,
  current_location_mode TEXT NOT NULL DEFAULT 'unavailable',
  reduced_context_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
