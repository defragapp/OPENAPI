PRAGMA foreign_keys = ON;

CREATE TABLE thread_turn_states (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  seq INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('started','streaming','completed','failed','interrupted')),
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  error_code TEXT,
  UNIQUE(thread_id, idempotency_key),
  UNIQUE(thread_id, seq)
);
CREATE INDEX thread_turn_states_account_thread_idx ON thread_turn_states(account_id, thread_id, updated_at DESC);
