<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# modals

## Purpose
Modal stack with a single source of truth (`lib/store/modal.ts`). One modal can be open at a time, identified by `kind: ModalKind`. `ModalRoot` is mounted once in `<Providers>` and dispatches to the right modal body based on the current `kind`.

The 8 modals correspond 1:1 with the prototype.

## Key Files

| File | Description |
|------|-------------|
| `modal-root.tsx` | Switch on `kind` and render the correct modal body. Backdrop click → close. Mounted once in `<Providers>` |
| `modal-shell.tsx` | Header + body + footer slots; consistent padding and close button. Most modal bodies wrap their content in this |
| `add-customer-modal.tsx` | Form: name, farm, zone, phone. Calls `addCustomer` from the API facade |
| `add-batch-modal.tsx` | 3-step stepper (basics → PCR → review). Calls `addBatch` |
| `send-line-modal.tsx` | Compose LINE message to a customer. Currently fires a toast (no real LINE OA wired) |
| `quote-modal.tsx` | Generate a price quote — pulls from `getPrices` |
| `cert-modal.tsx` | Display PCR certificate for a batch. Read-only |
| `invite-team-modal.tsx` | Invite a team member by email/phone with a role (`admin`/`editor`/`viewer`) |
| `close-alert-modal.tsx` | Provide a reason and close an alert. Calls `closeAlert` |
| `schedule-modal.tsx` | Schedule a follow-up call/visit with a customer. Toast-only for now |

## For AI Agents

### Working In This Directory
- **Adding a new modal**:
  1. Add a component file here following the pattern `<kind>-modal.tsx`.
  2. Extend `ModalKind` union and `ModalProps` type in `@/lib/store/modal.ts`.
  3. Add a branch to the `kind === '...'` ladder in `modal-root.tsx`.
  4. Open from anywhere via `useModal().open('myKind', { customer: c })`.
- **All modal bodies are `'use client'`** — they use forms, react-hook-form, and event handlers.
- **Mutations go through `@/lib/api`**, not directly to Supabase. The facade swaps to mock when `USE_MOCK=true`.
- **Forms use react-hook-form + zod resolver** (Phase 5 work in progress) — newly added forms should follow that pattern, not naked controlled inputs.
- **The backdrop is a plain `<div onClick={close}>`** with `e.stopPropagation()` on the inner panel; we are not using Radix Dialog because the prototype's animation is custom (`aw3-fade` / `aw3-slip` keyframes in `globals.css`). If accessibility audit (Phase 5) requires it, swap to Radix Dialog as a wholesale change, not piecemeal.

### Common Patterns
- Modals fire a toast (`sonner`) on success and close themselves via `useModal().close()`.
- Optional props (`customer`, `batch`, `alert`) are passed through `useModal().props` — modals destructure what they need.
- Stepper UX (in `add-batch-modal`) tracks step state locally with `useState`, not in the global modal store.

## Dependencies

### Internal
- `@/lib/store/modal` (the store)
- `@/lib/api` (mutations)
- `@/lib/types` (Customer/Batch/Alert)
- `@/components/aw/*` (V3 primitives)

### External
- `react-hook-form`, `zod`, `@hookform/resolvers`, `sonner`, Radix UI primitives (some forms use Select/Switch/RadioGroup), `lucide-react`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
