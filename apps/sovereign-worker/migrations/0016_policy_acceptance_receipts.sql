PRAGMA foreign_keys = ON;

ALTER TABLE auth_magic_links ADD COLUMN terms_version TEXT;
ALTER TABLE auth_magic_links ADD COLUMN privacy_version TEXT;
ALTER TABLE auth_magic_links ADD COLUMN policy_content_hash TEXT;
ALTER TABLE auth_magic_links ADD COLUMN policy_release_sha TEXT;

CREATE TABLE policy_acceptance_receipts (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  policy_type TEXT NOT NULL CHECK(policy_type IN ('terms','privacy')),
  policy_version TEXT NOT NULL CHECK(length(policy_version) BETWEEN 8 AND 40),
  policy_content_hash TEXT NOT NULL CHECK(length(policy_content_hash) = 64),
  release_sha TEXT NOT NULL CHECK(length(release_sha) BETWEEN 1 AND 64),
  accepted_at TEXT NOT NULL,
  acceptance_surface TEXT NOT NULL CHECK(acceptance_surface IN ('signup','policy-update')),
  requested_ip_hash TEXT CHECK(requested_ip_hash IS NULL OR length(requested_ip_hash) = 64),
  user_agent_hash TEXT CHECK(user_agent_hash IS NULL OR length(user_agent_hash) = 64),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX policy_acceptance_account_created_idx
  ON policy_acceptance_receipts(account_id, created_at DESC);
CREATE INDEX policy_acceptance_version_idx
  ON policy_acceptance_receipts(policy_type, policy_version, created_at DESC);
