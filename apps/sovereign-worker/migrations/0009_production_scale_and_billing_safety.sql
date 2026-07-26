PRAGMA foreign_keys = ON;

CREATE INDEX auth_magic_links_ip_created_idx
  ON auth_magic_links(requested_ip_hash, created_at DESC);

CREATE INDEX webhook_events_pending_idx
  ON webhook_events(provider, processed_at, received_at);

CREATE INDEX background_jobs_account_kind_due_idx
  ON background_jobs(account_id, kind, status, run_after);

CREATE INDEX deletion_jobs_due_idx
  ON deletion_jobs(status, scheduled_for, account_id);
