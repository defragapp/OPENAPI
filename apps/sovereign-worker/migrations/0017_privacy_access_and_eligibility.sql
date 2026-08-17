PRAGMA foreign_keys = ON;

ALTER TABLE auth_magic_links ADD COLUMN eligibility_confirmed_at TEXT;
ALTER TABLE auth_magic_links ADD COLUMN eligibility_rule_version TEXT;

ALTER TABLE accounts ADD COLUMN eligibility_confirmed_at TEXT;
ALTER TABLE accounts ADD COLUMN eligibility_rule_version TEXT;

CREATE TABLE privacy_request_events (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK(request_type IN ('access_export','policy_update')),
  status TEXT NOT NULL CHECK(status IN ('completed','rejected')),
  policy_version TEXT,
  release_sha TEXT CHECK(release_sha IS NULL OR (length(release_sha) = 40 AND release_sha NOT GLOB '*[^0-9a-f]*')),
  requested_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX privacy_request_events_account_created_idx
  ON privacy_request_events(account_id, created_at DESC);
