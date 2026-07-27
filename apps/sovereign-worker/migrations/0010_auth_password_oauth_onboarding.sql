PRAGMA foreign_keys = ON;

CREATE TABLE auth_password_credentials (
  account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  email_normalized TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_iterations INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE auth_password_resets (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  requested_ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX auth_password_resets_account_created_idx
  ON auth_password_resets(account_id, created_at DESC);
CREATE INDEX auth_password_resets_expiry_idx
  ON auth_password_resets(expires_at, used_at);
CREATE INDEX auth_password_resets_ip_created_idx
  ON auth_password_resets(requested_ip_hash, created_at DESC);

CREATE TABLE auth_login_attempts (
  id TEXT PRIMARY KEY,
  email_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  succeeded INTEGER NOT NULL CHECK(succeeded IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX auth_login_attempts_email_created_idx
  ON auth_login_attempts(email_hash, created_at DESC);
CREATE INDEX auth_login_attempts_ip_created_idx
  ON auth_login_attempts(ip_hash, created_at DESC);

CREATE TABLE auth_external_identities (
  provider TEXT NOT NULL CHECK(provider IN ('apple', 'google')),
  provider_subject TEXT NOT NULL,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  email_normalized TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (provider, provider_subject),
  UNIQUE (provider, account_id)
);
CREATE INDEX auth_external_identities_email_idx
  ON auth_external_identities(email_normalized, provider);

CREATE TABLE auth_oauth_states (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL CHECK(provider IN ('apple', 'google')),
  intent TEXT NOT NULL CHECK(intent IN ('signup', 'login')),
  state_hash TEXT NOT NULL UNIQUE,
  nonce_hash TEXT NOT NULL,
  return_path TEXT NOT NULL,
  plan_key TEXT CHECK(plan_key IN ('free', 'sovereign_plus')),
  billing_interval TEXT CHECK(billing_interval IN ('monthly', 'annual')),
  terms_accepted_at TEXT,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX auth_oauth_states_expiry_idx
  ON auth_oauth_states(expires_at, used_at);

CREATE TABLE account_onboarding (
  account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  selected_plan TEXT NOT NULL CHECK(selected_plan IN ('free', 'sovereign_plus')),
  billing_interval TEXT CHECK(billing_interval IN ('monthly', 'annual')),
  stage TEXT NOT NULL CHECK(stage IN ('plan', 'baseline', 'complete')),
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX account_onboarding_stage_idx
  ON account_onboarding(stage, updated_at);
