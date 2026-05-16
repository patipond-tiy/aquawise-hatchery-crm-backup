-- D1: Per-nursery configurable restock thresholds.
-- Replaces the inline constants that were hardcoded in restock/page.tsx.
-- Default matches the original values: now<=0, week<=14, month<=45.

ALTER TABLE nurseries
  ADD COLUMN IF NOT EXISTS restock_thresholds jsonb
    NOT NULL DEFAULT '{"now": 0, "week": 14, "month": 45}'::jsonb;
