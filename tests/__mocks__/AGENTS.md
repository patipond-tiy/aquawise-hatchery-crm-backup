<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# tests/__mocks__

## Purpose
Vitest module stubs for Next.js-only packages that can't run under jsdom.

## Key Files

| File | Description |
|------|-------------|
| `server-only.ts` | Default-exports an empty object. The real `server-only` package throws if imported into a client bundle; under Vitest there is no bundler boundary, so this no-op stub lets `'server-only'` modules (`lib/auth.ts`, `lib/auth/bootstrap.ts`, `lib/billing/guard.ts`, `lib/audit.ts`, `lib/query/server.ts`, `lib/stripe/server.ts`) import cleanly. Wired via the `server-only` alias in `vitest.config.ts` |

## For AI Agents

### Working In This Directory
- Add a stub here only when a Next-only package breaks under jsdom, and **wire it through `vitest.config.ts`'s `resolve.alias`** — dropping a file here alone does nothing.
- The `server-only` stub must stay a harmless no-op; do not give it behavior.

### Testing Requirements
- Not a test directory — supporting fixtures only. No suite runs from here (outside the `tests/**/*.test.*` glob).

### Common Patterns
- Stubs mirror the real module's import surface minimally (here: a default export).

## Dependencies

### Internal
- Referenced by `vitest.config.ts` (`resolve.alias['server-only']`)

### External
- `vitest`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
