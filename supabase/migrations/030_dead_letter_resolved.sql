-- Story X1 — dead-letter retry/escalate support.
-- Band 030 (027 reserved A6; 028/028b = S2; 029/029b = S7).
--
-- 1. Add a `resolved` variant to line_event_status so "Mark Resolved" has a
--    real closed state distinct from `dead` (kept) and `sent` (delivered).
--    line_event_status is filtered, never ORDER BY-d for priority, so an
--    enum append is safe here (cf. MOCK-TO-PROD §8 — that hazard is only for
--    enums used in `ORDER BY <enum_col>`; this one is not).
-- 2. The once-daily dead-letter digest (X1 AC#7) is written as an
--    `audit_log` row (action='dead_letter_digest', payload={count,
--    digest_date}) — NOT a line_outbound_events row: that table's
--    customer_id + line_user_id are NOT NULL (customer-scoped) and a digest
--    is a nursery-level operational signal with no customer. Idempotency
--    (one per nursery per calendar day) is enforced in the cron by a
--    pre-insert existence check on audit_log for the same action +
--    payload->>'digest_date'; this partial index makes that check fast.

-- ADD VALUE cannot run inside a txn block in older PG and is auto-committed;
-- IF NOT EXISTS makes the migration idempotent on re-apply.
alter type public.line_event_status add value if not exists 'resolved';

create index if not exists audit_log_dead_letter_digest_idx
  on public.audit_log (nursery_id, (payload->>'digest_date'))
  where action = 'dead_letter_digest';
