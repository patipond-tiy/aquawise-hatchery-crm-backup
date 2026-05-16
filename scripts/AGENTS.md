<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# scripts

## Purpose
One-shot Node helper scripts for dev/ops tasks that sit outside the app runtime. Not bundled, not imported by app code.

## Key Files

| File | Description |
|------|-------------|
| `e2e-magic-link.mjs` | Bypasses email-based magic-link auth for E2E/manual testing. Reads `.env.local`, creates (or finds) a test user via the Supabase admin client, and prints a usable magic-link URL. Run: `node scripts/e2e-magic-link.mjs` |

## For AI Agents

### Working In This Directory
- Plain ESM (`.mjs`), run directly with `node` — **not** via `pnpm <script>` (these aren't in `package.json` `scripts`).
- `e2e-magic-link.mjs` parses `.env.local` by hand and uses the **service-role / admin** Supabase key. It is a local dev tool only — never wire it into the app, CI artifacts, or anything client-reachable, and never commit generated links or the key.
- Add a new helper here only if it's a standalone task; anything the app needs at runtime belongs in `lib/`.

### Testing Requirements
- Not unit-tested (excluded from the `tests/**` glob). Validate by running locally against a dev Supabase project.

### Common Patterns
- Read config from `.env.local`, use `@supabase/supabase-js` directly, print a result to stdout, exit.

## Dependencies

### External
- `@supabase/supabase-js`, Node `node:fs` — requires a provisioned Supabase project + `.env.local`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
