# Story Review — By Day — 2026-05-04 2:14am

Human review of `docs/bmad/prd.md`, `docs/bmad/stories/` cross-referenced against `docs/product-spec/01-personas.md`,
`docs/product-spec/02-feature-inventory.md`, and `docs/product-spec/03-user-stories.md`.

> Reviewed PRD and stories. UAT review scheduled for next morning.
> Fixes applied in commit following this review.

---

## 0. PRD Review — No issues found

### Correct review scope for the current development cycle

- **Vision lens:** J1-J5 only. Every H1 feature should trace to one of these five jobs.
- **Story scope:** H1-tagged stories only (A1-A3, B1-B3, C1-C4, D1-D2, E1/E3, G1/G2/G3', H1/H3/H4).
- **Do not review or implement:**
  - H2/H3-tagged stories - sequenced after first tenant
  - `stories/_hypotheses/` (F1-F4, G3) - HJ territory, blocked until 2027 P'Bunjong validation

---

## 1. Unclear Features (clarifications added to stories)

| Story | Issue | Resolution |
|---|---|---|
| B4 | "call" implies VoIP but no in-app call feature exists | Added clarification: reminder tool only, not VoIP/click-to-call |
| A3 | "LINE OA" field sounds like credentials | Added clarification: co-branding metadata for shared @aquawise OA |

---

## 2. Missing Features (new stories created)

| Feature | Resolution |
|---|---|
| Sign out ("ออกจากระบบ") | Created `A4.sign-out.md` |
| Dashboard computed stats | Created `A5.dashboard-computed-stats.md` |
| H2 export (no-op buttons) | Already exists as H2 story, Phase H2 scope - no action needed |

---

## 3. Persona/Role Fixes (applied to stories)

| Story | Issue | Fix Applied |
|---|---|---|
| B1 | Lab (lab_tech) incorrectly granted page access | RBAC section updated: page access excludes lab_tech |
| B3 | "As an Owner" should be "As a Rep" + Lab/Auditor excluded | Story persona changed to Rep (P3); RBAC excludes lab_tech + auditor |
| C2 | "As an Auditor" should be "As a Manager" | Story persona changed to Manager (P2) |
| D1 | Lab and Auditor incorrectly granted page access | RBAC section updated: page access is owner + counter_staff only |
| H1 | Auditor incorrectly granted notification settings access | Story persona updated to exclude auditor; AC #5 updated |

All persona corrections cross-checked against `docs/product-spec/01-personas.md` persona x page matrix.

---

## Reference files used

- PRD: `docs/bmad/prd.md`
- Persona matrix: `docs/product-spec/01-personas.md`
- Feature inventory: `docs/product-spec/02-feature-inventory.md`
- User stories: `docs/product-spec/03-user-stories.md`
- LINE integration model: `docs/product-spec/05-line-integration.md`
- RBAC rules: `lib/rbac.ts`
