PRAGMA foreign_keys = ON;

CREATE TABLE stripe_customers (
  account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email_normalized TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX stripe_customers_customer_idx ON stripe_customers(stripe_customer_id);
