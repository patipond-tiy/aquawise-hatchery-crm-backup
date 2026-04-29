<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# scorecard

## Purpose
The **public scorecard** that customers can view by scanning a QR code. Mostly a configurator — choose what to show (D30 trend, PCR status, retention rate, volume, customer reviews) and what to hide. The actual public-facing scorecard rendering will live elsewhere (separate Vercel project or `/score/[id]` route — see `docs/PLAN.md` open question).

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Two-column layout: left is a live preview of the public scorecard, right is the toggle panel (5 visibility switches + the `public` master switch) + a QR card with shareable link |

## For AI Agents

### Working In This Directory
- **Reads via `getScorecardSettings()`**, writes via `updateScorecardSettings(patch)` — both go through `@/lib/api`.
- **Toggles are partial updates**: each switch fires `updateScorecardSettings({ showD30: false })` independently, not a full payload. The mock and Supabase impls both support partials.
- **The QR / shareable URL** isn't fully wired yet — placeholder uses `https://aquawise.com/s/<hatchery-slug>`. When the public scorecard route lands, replace this with the real URL.
- **Live preview**: render with the same logic the public surface will use, gated by the toggles. Keep the preview component reusable so it can be lifted out when the public scorecard route is built.

## Dependencies

### Internal
- `@/lib/api` (`getScorecardSettings`, `updateScorecardSettings`)
- `@/lib/types` (`ScorecardSettings`)
- Radix `@radix-ui/react-switch`

<!-- MANUAL: -->
