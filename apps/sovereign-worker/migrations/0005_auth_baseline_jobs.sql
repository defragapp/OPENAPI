PRAGMA foreign_keys = ON;

CREATE TABLE auth_magic_links (
  id TEXT PRIMARY KEY,
  email_normalized TEXT NOT NULL,
  account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK(purpose IN ('signup','login')),
  token_hash TEXT NOT NULL UNIQUE,
  name TEXT,
  terms_accepted_at TEXT,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  requested_ip_hash TEXT,
  user_agent_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX auth_magic_links_email_created_idx ON auth_magic_links(email_normalized, created_at DESC);
CREATE INDEX auth_magic_links_expires_idx ON auth_magic_links(expires_at, used_at);

CREATE TABLE auth_sessions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  session_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT
);
CREATE INDEX auth_sessions_account_idx ON auth_sessions(account_id, revoked_at, expires_at);

CREATE TABLE baseline_onboarding (
  account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  input_hash TEXT NOT NULL,
  protected_input_json TEXT NOT NULL,
  reduced_context_json TEXT NOT NULL,
  computation_version TEXT NOT NULL,
  provenance_json TEXT NOT NULL,
  status TEXT NOT NULL,
  uncertainty TEXT NOT NULL,
  last_computed_at TEXT NOT NULL,
  provider_status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE current_conditions ADD COLUMN precision_used TEXT DEFAULT 'unavailable';
ALTER TABLE current_conditions ADD COLUMN provider_status TEXT DEFAULT 'unavailable';

CREATE TABLE export_artifacts (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES export_jobs(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL,
  byte_size INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX export_artifacts_account_idx ON export_artifacts(account_id, expires_at);

CREATE TABLE background_jobs (
  id TEXT PRIMARY KEY,
  account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  payload_json TEXT NOT NULL DEFAULT '{}',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  run_after TEXT NOT NULL DEFAULT (datetime('now')),
  last_error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX background_jobs_status_idx ON background_jobs(status, run_after);
