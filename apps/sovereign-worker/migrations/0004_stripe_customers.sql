PRAGMA foreign_keys = ON;

ALTER TABLE stripe_customers ADD COLUMN email_normalized TEXT;
CREATE INDEX stripe_customers_customer_idx ON stripe_customers(stripe_customer_id);
