<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# lib/utils

## Purpose
Small, dependency-light utility functions. Distinct from the sibling file `lib/utils.ts` (which holds `cn()` — the clsx + tailwind-merge class composer). This directory is for standalone utilities that don't belong to a domain area.

## Key Files

| File | Description |
|------|-------------|
| `mock-mode.ts` | `isMockMode()` — mirrors the gate in `lib/api/index.ts`: returns `true` when `NEXT_PUBLIC_USE_MOCK`/`USE_MOCK` ≠ `'false'` OR `NEXT_PUBLIC_SUPABASE_URL` is unset. Lets server actions short-circuit with a friendly result instead of letting `createClient()` throw when Supabase env is absent (e.g. a Vercel preview before provisioning) |

## For AI Agents

### Working In This Directory
- **`isMockMode()` must stay in sync with the facade's mock gate** in `lib/api/index.ts`. If the env logic changes there, change it here too — divergence means actions and reads disagree about which backend is live.
- Server actions should call `isMockMode()` and early-return a graceful result rather than calling Supabase when mock mode is on (no provisioned project).
- Keep utilities here pure and dependency-light. `cn()` stays in `lib/utils.ts`, not here.

### Testing Requirements
- No dedicated suite; the behavior is implicitly covered through action tests under `tests/` that run in mock mode.

### Common Patterns
- Read env defensively (`process.env.X ?? process.env.Y`), return a boolean/primitive, no side effects.

## Dependencies

### Internal
- Conceptually paired with `@/lib/api` (same mock gate)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
