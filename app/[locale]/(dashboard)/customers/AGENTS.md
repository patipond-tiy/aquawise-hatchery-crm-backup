<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# customers

## Purpose
Customers (= the farms that buy PL from this nursery). List + detail.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | List view — search box, status-filter tabs (`all` / `active` / `restock-soon` / `restock-now` / `concern` / `quiet`), 2-col grid of customer cards. Each card shows farm name, zone, batches purchased, LTV, last buy, status chip |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `[id]/` | Customer detail — `page.tsx` with header, 4 stat cards (LTV, batches, D30 trend, retention), sparkline of D30 history, contact card (phone, LINE id), purchase history table |

## For AI Agents

### Working In This Directory
- **Reads via `listCustomers()` / `getCustomer(id)`** from `@/lib/api`. Mutations (`addCustomer`) are triggered from `<AddCustomerModal>` (opened via `useModal().open('addCustomer')` from a button in the header).
- **Status drives the chip color**: `active` → mint, `restock-soon` → amber, `restock-now` → bad, `concern` → bad, `quiet` → ink-3. The mapping lives in `components/aw/v3-chip.tsx` callers, not in a shared util — extract one if you add a 6th status.
- **The detail page should call `notFound()`** when `getCustomer(id)` returns `null`, not show an empty state.
- Server-actions for customer mutations (planned): `actions.ts` co-located here.

## Dependencies

### Internal
- `@/lib/api` (`listCustomers`, `getCustomer`, `addCustomer`)
- `@/lib/types` (`Customer`, `CustomerStatus`)
- `@/components/aw/*` (chip, card, avatar, ring, sparkline)
- `@/lib/store/modal` (open `addCustomer` / `sendLine` / `quote` / `schedule` modals)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
