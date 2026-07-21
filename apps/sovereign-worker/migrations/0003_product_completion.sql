PRAGMA foreign_keys = ON;

CREATE TABLE stripe_subscriptions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_key TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_end TEXT,
  cancel_at_period_end INTEGER NOT NULL DEFAULT 0 CHECK(cancel_at_period_end IN (0,1)),
  source_event_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX stripe_subscriptions_account_status_idx ON stripe_subscriptions(account_id, status, updated_at DESC);

CREATE TABLE account_privacy_settings (
  account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  location_mode TEXT NOT NULL DEFAULT 'unavailable' CHECK(location_mode IN ('unavailable','approximate','city_or_regional','ephemeral_current','stored_permitted')),
  location_precision_label TEXT NOT NULL DEFAULT 'unavailable',
  data_retention_days INTEGER,
  accessibility_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX invitations_person_status_idx ON invitations(invited_person_id, status);
CREATE INDEX consent_versions_person_created_idx ON consent_versions(person_id, created_at DESC);
CREATE INDEX saved_understandings_thread_idx ON saved_understandings(thread_id, updated_at DESC);
CREATE INDEX deletion_jobs_account_status_idx ON deletion_jobs(account_id, status, requested_at DESC);
CREATE INDEX export_jobs_account_status_idx ON export_jobs(account_id, status, requested_at DESC);
