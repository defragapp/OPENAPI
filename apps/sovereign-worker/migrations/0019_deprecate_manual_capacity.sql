-- Deprecate manual D1 capacity tracking in favor of edge-native Cloudflare AI Gateway
-- This retains the historical ledger without destroying data while preventing active writes.
ALTER TABLE workers_ai_daily_capacity RENAME TO legacy_workers_ai_daily_capacity;
ALTER TABLE workers_ai_capacity_reservations RENAME TO legacy_workers_ai_capacity_reservations;
