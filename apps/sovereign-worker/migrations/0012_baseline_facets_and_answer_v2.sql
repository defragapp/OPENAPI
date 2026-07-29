PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS baseline_facet_profiles (
  account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  input_hash TEXT NOT NULL,
  calculation_version TEXT NOT NULL,
  facet_contract_version TEXT NOT NULL,
  model_version TEXT NOT NULL,
  profile_json TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS baseline_facet_profiles_contract_idx
  ON baseline_facet_profiles(calculation_version, facet_contract_version, model_version);
