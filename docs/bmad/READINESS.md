# AI-Agent-Dev Readiness — Nursery CRM

Repo-specific instantiation of the umbrella gate:
`../../../docs/ai-agent-dev-readiness.md` (canonical — read it for the full
rationale and the system-wide Go/No-Go). Status **2026-05-16**.

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
| Typography reconciled to canonical (Inter body / Plus Jakarta Sans display-only / Noto Sans Thai / JetBrains Mono) | ✅ green-verified 2026-05-16 |
| Green-build gate green | ✅ 83/83 tests, build ok |
| Playwright-MCP QA loop documented + wired into story flow | ✅ |
| No-real-auth mock entry | ⚠️ mock mode ✅; **verify the login wall is short-circuited for authed-dashboard stories before unattended agent runs** |
| Color/radii/animation conformance | ✅ hex-identical to canonical |
| Shadow / spacing / type-scale tokens | ⚠️ partial — `--shadow-app/-modal`, `--sp-*`, `--t-*` not ported (see conformance doc gap list) |
| English surface | ⚠️ gated to `<ComingSoon />`; only `/th` is QA-able |

## Verdict (this repo)

**Per-story agent autonomy: GO** — given the green gate + wired QA loop. Keep
agent work on the Thai surface; treat the shadow/spacing/type-scale token
drift as accepted-and-logged (not a blocker). The only thing to confirm
before *unattended* runs is the no-auth mock dashboard entry.

System-wide (with line-bot) autonomy is gated upstream — see the umbrella doc.
