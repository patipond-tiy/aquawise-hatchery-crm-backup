<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# store

## Purpose
Ephemeral client UI state via Zustand. Two stores:

1. **`modal.ts`** — single-modal-at-a-time stack (`{ kind, props, open(), close() }`)
2. **`sidebar.ts`** — left-rail collapsed flag, **persisted to localStorage** under key `aw3-sidebar`

Server data state lives in TanStack Query, not here. Only put things in Zustand if they are pure UI ephemera or per-user persistence.

## Key Files

| File | Description |
|------|-------------|
| `modal.ts` | `useModal` — `{ kind: ModalKind \| null, props: ModalProps, open(kind, props), close() }`. `ModalKind` union: `addCustomer` \| `addBatch` \| `sendLine` \| `quote` \| `cert` \| `invite` \| `closeAlert` \| `schedule` |
| `sidebar.ts` | `useSidebar` — `{ collapsed, toggle, setCollapsed }`. Wrapped in `persist({ name: 'aw3-sidebar' })` so the toggle survives reloads |

## For AI Agents

### Working In This Directory
- **Both stores are `'use client'`** — they call `create()` at module load.
- **Adding a modal kind**: extend `ModalKind` AND extend `ModalProps` if you need new props, AND add a branch in `components/modals/modal-root.tsx`. Forgetting any of these is a TS error or a silent no-op.
- **Don't put server data here.** TanStack Query (`@tanstack/react-query`) is mounted in `<Providers>` and is the right place for cached server reads.
- **`persist` middleware** stores under `localStorage`. Values must be JSON-serializable — don't store `Date` objects or class instances.

## Dependencies

### Internal
- `@/lib/types` (Customer/Batch/Alert as modal payload shapes)

### External
- `zustand` ^5, `zustand/middleware` (`persist`)

<!-- MANUAL: -->
