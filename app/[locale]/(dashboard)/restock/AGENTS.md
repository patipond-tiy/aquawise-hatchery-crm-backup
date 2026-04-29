<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# restock

## Purpose
Customers grouped by **how soon they're due to restock**. Drives outbound sales: today, this week, next 30 days, dormant.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | 4 summary chips (overdue / now / soon / future) + 4 grouped sections of customer cards, each section sorted by `restockIn` ascending |

## For AI Agents

### Working In This Directory
- **Reads via `listCustomers()`** then groups client-side by `customer.restockIn`:
  - `<= 0` → "now / overdue" (red tone)
  - `<= 7` → "this week" (amber)
  - `<= 30` → "this month" (sky)
  - else / null → "future / dormant"
- **Quick actions on each card**: `useModal().open('sendLine', { customer })` and `useModal().open('quote', { customer })` are the typical CTAs from this page.
- The thresholds (7, 30) match the prototype — change them in lock-step with the chip labels in `messages/{en,th}.json`.

## Dependencies

### Internal
- `@/lib/api` (`listCustomers`)
- `@/lib/types` (`Customer`)
- `@/components/aw/v3-chip`, `@/components/aw/v3-card`
- `@/lib/store/modal`

<!-- MANUAL: -->
