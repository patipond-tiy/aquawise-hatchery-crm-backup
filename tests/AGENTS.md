<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# tests

## Purpose
Vitest unit + regression suites. Coverage is intentionally thin — `pnpm typecheck` and `pnpm lint` are the primary green-build gates; these tests pin behavior that broke (or could break) on specific BMAD stories. Each suite name carries the story ID it guards (e.g. `B1.i regression`, `H3 mutation guard`, `P2.10`, `D1 configurable thresholds`).

Run via `pnpm test` (once), `pnpm test:watch`, `pnpm test:ui`. Single file: `pnpm vitest run tests/<area>/<file>.test.ts`. By name: `pnpm vitest run -t "substring"`. Config: root `vitest.config.ts` (jsdom, globals, `@` alias, `server-only` stubbed).

## Key Files

| File | Description |
|------|-------------|
| `setup.ts` | Global setup — imports `@testing-library/jest-dom/vitest` matchers |
| `smoke.test.ts` | Minimal smoke test that the harness runs |
| `__mocks__/server-only.ts` | Stub for the Next-only `server-only` package so `'server-only'` modules import under Vitest (wired via the `server-only` alias in `vitest.config.ts`) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `api/` | API-facade behavior — `add-customer` (B2 plan persistence), `list-alerts` (E1 severity sort), `list-customers` (B1 regression) |
| `auth/` | `bootstrap` (`bootstrapNursery`), `signout` (P2.10 server action) |
| `billing/` | `guard` — `requireActiveSubscription` (H3 mutation guard) |
| `derive/` | `dashboard-stats` — `deriveDashboardStats` pure derivation |
| `rbac/` | `can` — role/action permission matrix |
| `restock/` | `threshold` — D1 configurable restock grouping |
| `settings/` | `profile` — `updateProfile` server action |
| `team/` | `invite` — `inviteTeamMember` |
| `__mocks__/` | Vitest module stubs (`server-only`) |

## For AI Agents

### Working In This Directory
- **One suite per story area; name the `describe` with the story ID** it regresses (matches existing convention — grep `describe(` to see the pattern).
- **`server-only` is aliased to a stub** in `vitest.config.ts`. Modules that `import 'server-only'` (`lib/auth.ts`, `lib/auth/bootstrap.ts`, `lib/billing/guard.ts`, `lib/audit.ts`) are testable; do not try to un-stub it.
- **Mock mode is the default test backend** — these suites exercise `@/lib/api` / `@/lib/mock`, not a live Supabase. Don't add tests that require network.
- **Test files match `tests/**/*.test.{ts,tsx}`** (the `include` glob). A file outside that pattern won't run.
- New regression: add it under the matching area subdir; create a new subdir only for a genuinely new domain area.

### Testing Requirements
- Keep tests deterministic — the mock layer uses stable, non-UUID ids on purpose so snapshots/assertions don't flake.
- A new test must pass under `pnpm test` and not depend on environment variables (set them in-test if a guard needs them).

### Common Patterns
- jsdom environment + `globals: true` — `describe/it/expect` are global, no imports needed.
- `@testing-library/jest-dom` matchers (`toBeInTheDocument`, etc.) are available via `setup.ts`.
- Pure helpers (`deriveDashboardStats`, `can`, billing trial helpers) are tested directly; server actions are tested against the mock facade.

## Dependencies

### Internal
- `@/lib/api`, `@/lib/mock/*`, `@/lib/rbac`, `@/lib/billing/*`, `@/lib/derive/*`, `@/lib/auth/*`, and the co-located server actions under `app/`

### External
- `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@vitejs/plugin-react`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
