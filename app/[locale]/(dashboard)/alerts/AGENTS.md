<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# alerts

## Purpose
Active disease and quality alerts. Each alert links back to the source batch and the affected farms, so the nursery can take corrective action (e.g., re-PCR, contact farms, reduce feed).

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | 3 severity chips at the top (`high` / `medium` / `low` counts) + a list of alert cards. Each card: severity badge, title, description, source batch link, affected farms, recommended action, "Close alert" button |

## For AI Agents

### Working In This Directory
- **Reads via `listAlerts()`** — only returns `closed: false`.
- **Closing an alert** opens `<CloseAlertModal>` (collects a reason) which calls `closeAlert(id)`.
- **Severity drives the badge tone**: `high` → bad, `medium` → amber, `low` → sky.
- **Affected farms render as chips** from `alert.farms[]` — these are Thai farm names (or `'+5'` style overflow indicators in the seed). When wired to real data, this comes from the `alert_farms` join table in Supabase.

## Dependencies

### Internal
- `@/lib/api` (`listAlerts`, `closeAlert`)
- `@/lib/types` (`Alert`, `AlertSeverity`)
- `@/lib/store/modal` (open `closeAlert`)
- `@/components/aw/v3-chip`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
