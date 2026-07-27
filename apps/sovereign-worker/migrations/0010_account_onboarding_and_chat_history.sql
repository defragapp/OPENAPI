PRAGMA foreign_keys = ON;

ALTER TABLE accounts ADD COLUMN onboarding_completed_at TEXT;
ALTER TABLE accounts ADD COLUMN plan_intent TEXT NOT NULL DEFAULT 'free';

CREATE INDEX IF NOT EXISTS accounts_onboarding_idx
  ON accounts(onboarding_completed_at);
