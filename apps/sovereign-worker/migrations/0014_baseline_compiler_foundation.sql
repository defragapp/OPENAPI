PRAGMA foreign_keys = ON;

CREATE TABLE baseline_place_resolutions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  query_hash TEXT NOT NULL,
  encryption_key_version TEXT NOT NULL,
  nonce_b64 TEXT NOT NULL,
  ciphertext_b64 TEXT NOT NULL,
  resolver_source TEXT NOT NULL,
  resolver_version TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK(confidence IN ('low','medium','high')),
  confirmed_at TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX baseline_place_resolutions_account_idx
  ON baseline_place_resolutions(account_id, expires_at DESC);

CREATE TABLE baseline_source_records (
  account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  source_contract_version TEXT NOT NULL,
  source_input_version TEXT NOT NULL,
  encryption_key_version TEXT NOT NULL,
  nonce_b64 TEXT NOT NULL,
  ciphertext_b64 TEXT NOT NULL,
  normalized_input_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending_confirmation','confirmed','superseded','deleted')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX baseline_source_records_input_hash_idx
  ON baseline_source_records(account_id, normalized_input_hash);

CREATE TABLE baseline_compiler_runs (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  source_input_hash TEXT NOT NULL,
  compiler_version TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN (
    'recompute_queued',
    'computing',
    'validation_failed',
    'facet_generation_pending',
    'ready',
    'degraded',
    'cancelled'
  )),
  current_stage TEXT,
  validation_status TEXT NOT NULL DEFAULT 'pending' CHECK(validation_status IN ('pending','supported_reduced','confirmed','failed')),
  failure_code TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(account_id, source_input_hash, compiler_version)
);

CREATE INDEX baseline_compiler_runs_account_status_idx
  ON baseline_compiler_runs(account_id, status, updated_at DESC);

CREATE TABLE baseline_compiler_stage_results (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES baseline_compiler_runs(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending','running','completed','unavailable','failed')),
  output_json TEXT NOT NULL DEFAULT '{}',
  validation_status TEXT NOT NULL DEFAULT 'pending' CHECK(validation_status IN ('pending','supported_reduced','confirmed','failed')),
  uncertainty TEXT NOT NULL DEFAULT 'high' CHECK(uncertainty IN ('low','medium','high')),
  source_version TEXT,
  failure_code TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(run_id, stage)
);

CREATE INDEX baseline_compiler_stage_results_run_idx
  ON baseline_compiler_stage_results(run_id, created_at);

ALTER TABLE background_jobs ADD COLUMN lease_token TEXT;
ALTER TABLE background_jobs ADD COLUMN lease_expires_at TEXT;
ALTER TABLE background_jobs ADD COLUMN error_code TEXT;
