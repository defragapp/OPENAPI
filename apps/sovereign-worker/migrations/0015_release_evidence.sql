PRAGMA foreign_keys = ON;

CREATE TABLE release_evidence (
  sha TEXT PRIMARY KEY CHECK(length(sha) = 40),
  contract TEXT NOT NULL CHECK(contract = 'sovereign-production-release-evidence.v1'),
  evidence_b64 TEXT NOT NULL CHECK(length(evidence_b64) > 0),
  status TEXT NOT NULL CHECK(status = 'success'),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX release_evidence_status_updated_idx ON release_evidence(status, updated_at DESC);

CREATE TABLE release_progress (
  sha TEXT NOT NULL CHECK(length(sha) = 40),
  stage TEXT NOT NULL CHECK(length(stage) BETWEEN 2 AND 80),
  status TEXT NOT NULL CHECK(status = 'failure'),
  summary_b64 TEXT NOT NULL CHECK(length(summary_b64) > 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (sha, stage)
);
CREATE INDEX release_progress_status_updated_idx ON release_progress(status, updated_at DESC);
