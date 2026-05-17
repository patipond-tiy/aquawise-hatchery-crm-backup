-- Migration 031: add last_attempt_at to crm_event_log
-- Fixes exponential backoff anchor — without this column every retry was
-- anchored to posted_at, so once now > posted_at + 60 s every cron tick
-- would retry immediately regardless of attempt count.
-- Column is nullable; NULL means "never attempted" (backoff anchored to posted_at).

ALTER TABLE crm_event_log
  ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz;

COMMENT ON COLUMN crm_event_log.last_attempt_at IS
  'Set to now() on every delivery attempt (success or failure). '
  'Backoff due-time is anchored to max(posted_at, last_attempt_at) + 2^attempts seconds.';
