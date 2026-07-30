CREATE TABLE IF NOT EXISTS workers_ai_daily_capacity (
  usage_day TEXT PRIMARY KEY,
  reserved_neurons INTEGER NOT NULL DEFAULT 0 CHECK (reserved_neurons >= 0),
  request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS workers_ai_daily_capacity_updated_idx
  ON workers_ai_daily_capacity(updated_at);
