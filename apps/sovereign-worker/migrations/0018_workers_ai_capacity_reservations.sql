-- Immutable upgrade from deployed 0017. Stores accounting metadata only; prompts,
-- responses, account identifiers, and provider payloads are never retained here.
CREATE TABLE workers_ai_capacity_reservations (
  reservation_id TEXT PRIMARY KEY,
  usage_day TEXT NOT NULL,
  reserved_neurons INTEGER NOT NULL CHECK (reserved_neurons > 0 AND reserved_neurons <= 7500),
  settled_neurons INTEGER CHECK (settled_neurons >= 0 AND settled_neurons <= reserved_neurons),
  settled_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK ((settled_at IS NULL AND settled_neurons IS NULL) OR (settled_at IS NOT NULL AND settled_neurons IS NOT NULL))
);

CREATE INDEX workers_ai_capacity_reservations_day_idx
  ON workers_ai_capacity_reservations(usage_day, created_at);
