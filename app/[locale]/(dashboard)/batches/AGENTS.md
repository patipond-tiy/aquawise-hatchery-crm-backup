<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# batches

## Purpose
Batches of post-larvae produced and sold. List + detail.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | List view — 2-col grid of batch cards. Each card: batch id (`B-2604-A`), source genetics line, date, PL produced, PL sold, farms count, mean D30, PCR status chip |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `[id]/` | Batch detail — header with batch metadata, 4 stat cards (PL produced/sold, mean D30, farms served), `<V3DistChart>` of size distribution, PCR results card (per-disease status), buyers table (linked customers + PL purchased + their D30) |

## For AI Agents

### Working In This Directory
- **Reads via `listBatches()` / `getBatch(id)`** from `@/lib/api`. Adding a batch is via `<AddBatchModal>` (3-step stepper).
- **PCR status drives a tone**: `clean` → mint chip, `flagged` → bad chip, `pending` → amber chip.
- **Batch ids are human-readable**, not UUIDs (e.g., `B-2604-A` = April 2026, batch A). The mock layer's id-generation is deterministic; the Supabase layer's is `B-${YYMM}-${random2}`. Don't switch to UUIDs without coordinating.
- **PCR certificates**: opening one fires `useModal().open('cert', { batch })` — see `components/modals/cert-modal.tsx`.

## Dependencies

### Internal
- `@/lib/api` (`listBatches`, `getBatch`, `addBatch`)
- `@/lib/types` (`Batch`, `PcrStatus`)
- `@/components/aw/charts/v3-dist-chart`, `@/components/aw/v3-chip`
- `@/lib/store/modal` (open `addBatch` / `cert`)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
