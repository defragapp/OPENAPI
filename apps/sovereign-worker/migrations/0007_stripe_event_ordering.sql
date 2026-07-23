PRAGMA foreign_keys = ON;

ALTER TABLE stripe_subscriptions ADD COLUMN last_event_created INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stripe_subscriptions ADD COLUMN last_event_id TEXT;
CREATE INDEX stripe_subscriptions_event_order_idx ON stripe_subscriptions(account_id, last_event_created DESC);
