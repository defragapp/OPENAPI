PRAGMA foreign_keys = ON;

CREATE TABLE ai_usage_windows (
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL,
  turns_used INTEGER NOT NULL DEFAULT 0 CHECK(turns_used >= 0),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY(account_id, period_key)
);
CREATE INDEX ai_usage_windows_period_idx ON ai_usage_windows(period_key, updated_at);
