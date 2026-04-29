<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# docs

## Purpose
Project planning + integration runbooks. Hand-written, not auto-generated.

## Key Files

| File | Description |
|------|-------------|
| `PLAN.md` | The 5-phase delivery plan + stack decisions + risks + status table. Update the status table at the top of each phase |
| `CHECKLIST.md` | Granular per-phase task list. Tick boxes as work lands |
| `STRIPE.md` | Stripe Pro plan setup runbook (price provisioning, webhook config, env-var checklist) |
| `MIRROR.md` | CI-driven personal backup repo (mirror to a secondary remote on every push + daily cron) |
| `work-breakdown/` | Team-assignable execution layer — every user story × FR-ID × code state, decomposed into implement/test/verify subtasks. Forward-looking H1/H2/H3 paying-tenant work; complements (does not replace) `PLAN.md`/`CHECKLIST.md`. See `work-breakdown/AGENTS.md` |

## For AI Agents

### Working In This Directory
- **These are reference docs**, not code. AI agents should read them to understand context before making non-trivial changes, but rarely write here unless the user asks.
- When the user lands a new phase or makes a stack decision, update `PLAN.md`'s status table and `CHECKLIST.md`'s tick boxes — don't write a new doc.
- Keep timestamps absolute (`2026-04-26`), not relative (`yesterday`).

### Common Patterns
- Conventional-commits style (`feat(scope):`, `fix(scope):`, `chore(scope):`) is the working agreement noted in `PLAN.md`.
- "Demo gate" sections in `CHECKLIST.md` are the acceptance criteria that close out a phase.

<!-- MANUAL: -->
