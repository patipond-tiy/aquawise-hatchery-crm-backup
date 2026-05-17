# AI-Agent-Dev Readiness — Nursery CRM

Repo-specific instantiation of the umbrella gate:
`../../../docs/ai-agent-dev-readiness.md` (canonical — read it for the full
rationale and the system-wide Go/No-Go). Status **2026-05-17 (WS5 final
verification)**.

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
| Green-build gate green | ✅ **250/250 tests, build ok (2026-05-17)** |
| Documented backlog (Epics A–H, S, X, K producer) shipped real-flow | ✅ STORY-CHECKLIST.md all ✅ (A6 separate track — see residuals) |
| Epic K producer side ratified + cross-process e2e | ✅ `../../../docs/temp-docs/epic-k-e2e-evidence.md` (handshake green 2026-05-17) |
| Playwright-MCP QA loop documented + wired into story flow | ✅ |
| Color/radii/animation conformance | ✅ hex-identical to canonical |
| Shadow / spacing / type-scale tokens | ⚠️ partial — `--shadow-app/-modal`, `--sp-*`, `--t-*` not ported (sanctioned substitution, conformance doc gap list) |
| English surface | ⚠️ gated to `<ComingSoon />`; only `/th` is QA-able (deliberate) |
| Security DB advisor state (supabase-hatchery) | ✅ only documented intentional residuals (see below) |

## Green-build evidence (2026-05-17, WS5)

- `pnpm typecheck` → OK (tsc --noEmit, strict, clean)
- `pnpm lint` → OK (eslint . exit 0; S9 §18 bans active)
- `pnpm test` → **250 passed (45 files), 0 failed** (regression floor ≥83 — far exceeded)
- `pnpm build` → Compiled successfully in 14.8s, 24/24 static pages generated
- HEAD `54b22a7` (`main`); story commit ledger `4a4b8fc`→`2cb0fce`→`71b087f`→`7e2018b`→`162362a`→`5eb9a3b`→`b4be8ef`→`fc29dde`→`871fb20`→`54b22a7` all present + verified.
- Epic K producer ratified at `162362a` + contract `41dda0e`; live cross-process e2e green (`docs/temp-docs/epic-k-e2e-evidence.md`).

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

## In-flight separate track (NOT a WS5 blocker)

- **A6 social-sign-in (Google + LINE OIDC bridge)** — `draft — PENDING PO
  APPROVAL`, held on `feat/google-line-auth`, NOT on `main`. D-006/D-007 are a
  separate parallel scope explicitly **out of WS5**. Readiness is NOT gated on
  it. The frozen conformance gate §3 already carries the sanctioned D-007
  4th-service-role-site carve-out for when A6 lands.

## Verdict (this repo)

**CONDITIONAL GO.**

The **documented backlog (Epics A–H, S, X, and the K producer side) is
complete, real-flow, green (250/250), conformance-checked, and pushed to
`main`.** Per-story *and* full-backlog AI-agent autonomy for this repo is **GO**
— green gate + wired QA loop + ratified Epic K contract + clean advisor state.

The **CONDITIONAL** qualifier applies only to *production launch* (not the
dev-environment build): the six honest residuals above are external/operational
(Stripe secret paste, dashboard toggles, infra WAF, live CI proofs, cross-
product secret exchange) and are owned by the PO/ops, not the agent build. None
is a code defect or regression. A6 social sign-in is a separate in-flight track,
explicitly out of scope here.

System-wide verdict: see the umbrella doc — now **GO** with Epic K ratified.
