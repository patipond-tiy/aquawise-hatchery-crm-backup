<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# messages

## Purpose
Translation bundles for `next-intl`. One JSON per supported locale.

`th.json` is the **source of truth** — Thai-first product. `en.json` is currently smaller because the English UI is gated behind `<ComingSoon />`; over time it will mirror `th.json` key-for-key.

## Key Files

| File | Description |
|------|-------------|
| `th.json` | Thai strings — the working set. Update first when adding a new key |
| `en.json` | English strings — must mirror every key in `th.json` (will be enforced by CI) |

## For AI Agents

### Working In This Directory
- **Both files must contain the same keys.** Missing-key behavior: dev shows `⚠️ {key}`, prod falls back to English. CI is intended to fail on key drift.
- **Add Thai first, then mirror in English.** Never the other way around — Thai-speaking users are the primary audience.
- **Keep nesting shallow** (≤2 levels) — `nav.dashboard`, `billing.trial_days_left`. Deeper nesting makes ICU pluralization rules awkward.
- **ICU placeholders** look like `"Hello, {name}"` and `"Free trial — {days} days left"`. Pluralization (when needed): `"{count, plural, one {# customer} other {# customers}}"`.
- **Pipe-delimited lists** are used for compact bullet copy, e.g., `billing.pro_features`: `"a|b|c"`. Split in the consumer.

### Common Patterns
- Top-level groups: `app`, `nav`, `common`, `user`, `stub`, `billing`, plus per-page groups when they grow.
- Currency strings include the unit literally (`"5,000 ฿ / month"`) to avoid awkward `Intl.NumberFormat` combinators in templates.
- Buddhist calendar formatting (Thai year) is handled in component code via `Intl.DateTimeFormat('th-TH-u-ca-buddhist')`, not by storing pre-formatted dates here.

## Dependencies

### Internal
- Loaded by `i18n/request.ts` via dynamic import based on the resolved locale.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
