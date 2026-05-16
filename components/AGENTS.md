<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# components

## Purpose
React components grouped by role:

- `aw/` — **AquaWise V3 design-system primitives** ported from the prototype (`V3Mark`, `V3Chip`, `V3Avatar`, `V3Ring`, `V3Card`, `V3Section`, `V3Photo`, `V3RoundBtn`, `V3Grid`, plus interactive charts). These use CSS variables (`var(--color-*)`) directly so they work with both raw Tailwind utilities and inline-style escape hatches.
- `layout/` — **Shell scaffolding** (`Shell`, `LeftRail`, `TopBar`, `RightRail`, `TrialBanner`). The 3-column shell is desktop-first.
- `modals/` — **Single-modal-at-a-time stack** driven by `lib/store/modal.ts`; `ModalRoot` is mounted once in `Providers` and switches on `kind`.
- Top-level helpers — `providers.tsx` (TanStack Query + ModalRoot + sonner Toaster) and `coming-soon.tsx` (English-locale gate today).

## Key Files

| File | Description |
|------|-------------|
| `providers.tsx` | Mounts QueryClient (30s staleTime, no refetch on focus) + `<ModalRoot />` + Toaster (dark ink bg, sans font). Imported from `[locale]/layout.tsx` |
| `coming-soon.tsx` | Rendered when `locale === 'en'` — the English UI is intentionally gated until Phase-5 copy review |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `aw/` | AquaWise V3 design primitives + custom charts (see `aw/AGENTS.md`) |
| `layout/` | 3-column shell, top bar, side rails, trial banner (see `layout/AGENTS.md`) |
| `modals/` | 8 modal bodies + ModalShell + ModalRoot dispatcher (see `modals/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- **Server vs client**: layout pieces (`Shell`, `LeftRail`, `TopBar`, `RightRail`, `TrialBanner`), all modals, and `Providers` are `'use client'`. Most `aw/` primitives are server-safe (no state); add `'use client'` only when you wire interactivity.
- **Inline styles are okay here.** The prototype's design uses plenty of `style={{...}}` with CSS-var references. Don't rewrite that into Tailwind classes wholesale — the intent is parity with `prototypes/AquaWise Hatchery v3 - Standalone.html`.
- **Adding a modal**: (1) add component to `modals/`, (2) extend the `ModalKind` union in `lib/store/modal.ts`, (3) wire the new branch in `modals/modal-root.tsx`. Open via `useModal().open('myKind', { customer })`.
- **Adding a chart**: place under `aw/charts/`. Hand-rolled SVG is fine; `recharts` is installed but most prototype charts are bespoke.

### Common Patterns
- Components use the `cn()` helper from `@/lib/utils` (clsx + tailwind-merge) for class composition.
- Icons come from `lucide-react`; avoid mixing with other icon libraries.
- `<Image>` from `next/image` is used for the AquaWise logo; raw `<img>` for prototype-fidelity-only cases.

## Dependencies

### Internal
- `@/lib/store/modal` (modal stack), `@/lib/store/sidebar` (collapsed flag), `@/lib/api` (data), `@/lib/utils` (`cn`)

### External
- Radix primitives (`@radix-ui/react-*`), `lucide-react`, `sonner`, `framer-motion` (sparingly), `@tanstack/react-query`, `recharts`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
