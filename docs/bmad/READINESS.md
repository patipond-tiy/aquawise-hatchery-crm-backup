# AI-Agent-Dev Readiness — Nursery CRM

Repo-specific instantiation of the umbrella gate:
`../../../docs/ai-agent-dev-readiness.md` (canonical — read it for the full
rationale and the system-wide Go/No-Go). Status **FINAL — 2026-05-17 (D-009
closeout: 707-row UAT executed, 0 FAIL / 0 NEEDS-PO / 0 DEFER; line-bot LIFF
rows verified local; nursery-crm sheet unchanged)**.

## FINAL verdict (this repo): **GO — dev-complete**

The documented backlog (Epics A–H, S, X, K producer) plus A6 is complete,
real-flow, green (**291/291 tests**, typecheck clean), conformance-checked, and
pushed to `main`. The full 707-row UAT (370 Nursery + 337 LINE Bot) has been
executed; **0 unresolved FAIL, 0 NEEDS-PO**. Per-story AND full-backlog
AI-agent autonomy for this repo is **GO**. The only residuals are
external/operational production-launch steps (enumerated below), PO/ops-owned —
none is a code defect or regression.

## Commands (the objective gates)

```bash
pnpm install
pnpm typecheck && pnpm lint && pnpm test && pnpm build   # green-build gate
pnpm dev            # http://localhost:3000/th  (mock mode, no real secrets)
# .env.local: MOCK_BILLING_STATE=trialing-25|trialing-2|trial_expired|active|past_due
```

Visual/functional QA: `qa/05.playwright-mcp-evaluation-loop.md`
(Playwright MCP vs `../../../design-system-v1/`).

## Status

| Item | Status |
|---|---|
| Spec layer (prd/arch/code-design/security, qa/01, qa/04) | ✅ |
| Canonical design system referenced + conformance doc | ✅ `design-system-conformance.md` |
| Typography reconciled to canonical (Inter body / Plus Jakarta Sans display-only / Noto Sans Thai / JetBrains Mono) | ✅ green-verified |
| Green-build gate green | ✅ **291/291 tests (57 files), typecheck clean (2026-05-17 D-009)** |
| Documented backlog (Epics A–H, S, X, K producer) shipped real-flow | ✅ STORY-CHECKLIST.md all ✅; **A6 now landed & ratified** |
| 707-row UAT executed (370 Nursery + 337 LINE Bot) | ✅ **0 FAIL, 0 NEEDS-PO, 0 DEFER** — `../../../docs/qa/uat-run/UAT-RESULTS.md` |
| Epic K producer side ratified + cross-process e2e | ✅ `../../../docs/temp-docs/epic-k-e2e-evidence.md` (handshake green 2026-05-17) |
| Playwright-MCP QA loop documented + wired into story flow | ✅ |
| Color/radii/animation conformance | ✅ hex-identical to canonical |
| Shadow / spacing / type-scale tokens | ⚠️ partial — `--shadow-app/-modal`, `--sp-*`, `--t-*` not ported (sanctioned substitution, conformance doc gap list) |
| English surface | ⚠️ gated to `<ComingSoon />`; only `/th` is QA-able (deliberate) |
| Security DB advisor state (supabase-hatchery) | ✅ only documented intentional residuals (see below) |

## Green-build evidence (2026-05-17, D-009 FINAL closeout)

- `pnpm typecheck` → OK (tsc --noEmit, strict, clean)
- `pnpm test` → **291 passed (57 files), 0 failed** (regression floor ≥83 — far
  exceeded; +41 over the WS5 250 baseline, zero regression)
- Branch `main`; WS5/G07 ledger plus the D-009 closeout tail all present +
  verified. (No nursery-crm code changed in D-009 — the closeout work was
  line-bot LIFF; the nursery sheet tally is unchanged.)
- Epic K producer ratified + contract; live cross-process e2e green
  (`docs/temp-docs/epic-k-e2e-evidence.md`).

## 707-row UAT evidence (D-009 FINAL)

- Master checklist `../../../docs/qa/uat-checklist (1).xlsx` re-merged from the
  updated result JSONs (both sheets, matched by normalized US_ID).
- **Final tally: 707 = 680 PASS + 6 PASS(AC corrected per D-008) + 21
  BLOCKED-EXTERNAL. 0 FAIL, 0 NEEDS-PO, 0 DEFER.** Nursery CRM sheet:
  **355 PASS + 15 BLOCKED-EXTERNAL = 370** (unchanged from prior FINAL — all
  D-009 deltas were on the LINE Bot side: 17 LIFF rows verified local, F2b +
  K4-resume defects fixed, F11a/F11b → plain PASS via built F13,
  US-P1-dm-deeplink → PASS, so DEFER went 1 → 0).
- Nursery-CRM BLOCKED-EXTERNAL (15) are genuine ops/external deps grouped by
  exact human action in `../../../docs/qa/uat-run/UAT-RESULTS.md`: real email
  inbox (A2e), live LINE delivery (D2-4, G3p-2/6), Stripe secret/CLI/Dashboard
  (H3-1b/2b/4/4c, S4f), Supabase Dashboard toggles (S2a/2c/2d/2e/2g, NEG-S2a).
- Defects **found and fixed by UAT** (closeout history): **K4c RLS
  cookie-bleed** (service-role-only posture, mig 027); **FCR fabrication →
  real FCR** (D-009 BUILT Story F13, mig 029, line-bot); **CSP
  unstyled-outage** (fixed). Full residual list:
  `../../../docs/qa/uat-run/UAT-RESULTS.md`.

## Security advisor state (supabase-hatchery, security) — 2026-05-17 final sweep

5× `authenticated_security_definer_function_executable` WARN +
1× `auth_leaked_password_protection` WARN. **All intentional / documented**
(cross-checked against `../../../docs/temp-docs/SECURITY-FINDINGS.md`
"Advisor net for the whole Epic-S tail"):

- `create_nursery`, `current_user_nursery_ids` — intentional (SF-002:
  authenticated onboarding + RLS-policy use).
- `run_d30_dip_alert_scan` — intentional (E2 SECURITY DEFINER scan engine).
- `dsr_anonymize_user`, `dsr_rate_check` — intentional (S7/SF-009: self-service
  DSR must be callable by the signed-in subject; anon revoked via mig 029b).
- `auth_leaked_password_protection` — SF-006 dashboard-only residual (LOW: project
  is magic-link only, no password surface today).

**No anon-executable, no ERROR, no high/critical advisory. Net-zero new findings
across the whole Epic-S tail.**

## Honest residuals (production-launch, not dev-build blockers)

These do NOT block the documented backlog being complete & green. They are
external/operational steps the platform owner must close before *production
launch*:

1. **Stripe in-app Checkout click-through** (H3 AC, S4 AC#7, D-004) — needs the
   sandbox `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` pasted into
   `.env.local`; Stripe MCP cannot expose them. Code/Stripe-object/webhook-
   idempotency/invoice-history all verified ✅. **Owner: platform owner (PO).**
2. **SF-006 leaked-password protection** — Supabase Dashboard → Auth toggle;
   not API/migration-doable. LOW risk (magic-link only). **Owner: PO/ops.**
3. **S2 dashboard-only residuals** — OTP-expiry 600s, redirect-allowlist,
   CAPTCHA-provider+secret enable, implicit-grant toggle. **Owner: PO/ops.**
4. **S5/S8 operational proofs** — live Monday Dependabot PR, inject-HIGH CI
   proof, GitHub failed-run screenshot + branch-protection UI. Config shipped
   & locally verified; live proof is operational. **Owner: PO/ops.**
5. **S7 Vercel WAF rule + pgTAP post-anon assertion** — infra/harness follow-up.
   **Owner: PO/ops.**
6. **Epic K end-to-end cross-product wiring** — dev keypairs generated; real
   shared `LINE_BOT_*` secrets + counterpart key placement need user/line-bot
   action (CONSUMER HANDOFF, PROGRESS-nursery.md). Contract is **ratified**
   and the live cross-process handshake **passed** with dev keypairs.
   **Owner: PO + line-bot ops.**

## A6 social sign-in — now LANDED & ratified

- **A6 social-sign-in (Google + LINE OIDC bridge)** — landed and ratified;
  exercised in the 707-row UAT. The D-007 4th-service-role-site carve-out in the
  conformance gate §3 is now active and conformant. No longer an in-flight
  separate track — it is part of the dev-complete backlog.

## Verdict (this repo)

**GO — dev-complete.**

The **documented backlog (Epics A–H, S, X, the K producer side, and A6) is
complete, real-flow, green (291/291), conformance-checked, and pushed to
`main`.** The full **707-row UAT is executed with 0 FAIL, 0 NEEDS-PO, and 0
DEFER** — every row is PASS, PASS-by-AC-correction (D-008), or genuinely
BLOCKED-EXTERNAL (each with its exact human action listed). Per-story *and*
full-backlog AI-agent autonomy for this repo is **GO**.

The remaining items are **production-launch residuals only** (NOT
dev-environment build blockers, NOT code defects/regressions) — they are
external/operational and PO/ops-owned:

1. **Stripe secrets** — sandbox `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
   paste (H3/S4, D-004); code + webhook idempotency + invoice history verified.
2. **Supabase dashboard toggles** — SF-006 leaked-password protection + S2
   OTP-expiry/redirect-allowlist/CAPTCHA/implicit-grant (dashboard-only).
3. **Live CI proofs** — S5/S8 live Monday Dependabot PR, inject-HIGH CI proof,
   GitHub failed-run + branch-protection UI; config shipped & locally verified.
4. **S7 Vercel WAF rule + pgTAP post-anon assertion** — infra follow-up.
5. **Epic K cross-product secret exchange** — real shared `LINE_BOT_*` creds +
   counterpart key placement; the live cross-process handshake **passed** with
   dev keypairs (`../../../docs/temp-docs/epic-k-e2e-evidence.md`).

System-wide verdict: see the umbrella doc — **system-wide GO** (full backlog +
A6 + Epic K ratified/e2e-green + 707-row UAT executed, all blocking issues
resolved or PO-dispositioned).
