PRAGMA foreign_keys = ON;

CREATE TABLE auth_passkeys (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key_jwk TEXT NOT NULL,
  sign_count INTEGER NOT NULL DEFAULT 0 CHECK(sign_count >= 0),
  transports_json TEXT NOT NULL DEFAULT '[]',
  label TEXT NOT NULL DEFAULT 'Passkey',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_used_at TEXT
);
CREATE INDEX auth_passkeys_account_created_idx ON auth_passkeys(account_id, created_at DESC);

CREATE TABLE auth_passkey_challenges (
  id TEXT PRIMARY KEY,
  account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK(purpose IN ('register','login')),
  challenge_hash TEXT NOT NULL,
  origin TEXT NOT NULL,
  rp_id TEXT NOT NULL,
  return_to TEXT NOT NULL DEFAULT '/app',
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX auth_passkey_challenges_expiry_idx ON auth_passkey_challenges(expires_at, used_at);
CREATE INDEX auth_passkey_challenges_account_idx ON auth_passkey_challenges(account_id, purpose, created_at DESC);
