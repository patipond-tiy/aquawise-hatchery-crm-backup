# Design-System Conformance — Nursery CRM

> **Canonical source of truth:** `../../../design-system-v1/` (umbrella-level).
> Read `design-system-v1/SKILL.md` + `README.md` + `colors_and_type.css` first.
> This repo does **not** re-specify the design system — it *conforms* to it via
> its own ported tokens. This file tracks the mapping and every divergence.
> Re-run this audit per release (and whenever `design-system-v1/` changes).

## Why a conformance doc instead of a copy

`design-system-v1/` lives at the umbrella root and is **not** a build
dependency of this repo (the two products don't share code — see
`[[tech-debt-2026-05-16]]`). Tokens are therefore **manually ported** into
`app/globals.css` (`@theme inline`, Tailwind 4 CSS-first). That port can
drift. The Playwright-MCP QA loop (`qa/05.playwright-mcp-evaluation-loop.md`)
evaluates rendered UI against `design-system-v1/preview/*.html` +
`ui_kits/crm/` and the table below is the written contract it checks.

## Token naming map

Same *values*, different *names* (Tailwind-4 build convention vs canonical):

| Canonical (`design-system-v1/colors_and_type.css`) | This repo (`app/globals.css`) |
|---|---|
| `--aw3-canvas/app/card/soft/soft-2/line/line-2` | `--color-canvas/app/card/soft/soft-2/line/line-2` |
| `--aw3-ink … --aw3-ink-5` | `--color-ink … --color-ink-5` |
| `--aw3-hero/hero-2/hero-soft/hero-tint` | `--color-hero/hero-2/hero-soft/hero-tint` |
| `--aw3-lav/peach/mint/sky/rose/amber` (+`-fg`) | `--color-lav/peach/mint/sky/rose/amber` (+`-fg`) |
| `--aw3-good/bad/warn` (+`-tint`) | `--color-good/bad/warn` (+`-tint`) |
| `--r-sm/r/r-lg/r-xl/r-pill` | `--radius-sm/radius/radius-lg/radius-xl/radius-pill` |
| `--font3-thai/en/mono` | `--font-sans/display/mono` (see Fonts row) |

## Conformance table

| Axis | Verdict | Evidence / location |
|---|---|---|
| **Colors** (canvas, ink ramp, hero, pastel pairs, status) | ✅ conforms | All hex values in `app/globals.css` `@theme inline` are **identical** to `design-system-v1/colors_and_type.css` `:root`. Only token names differ (map above). Verified hex-for-hex 2026-05-16. |
| **Radii** | ✅ conforms | `8/14/20/28/999` match canonical `--r-*`. |
| **Animation** | ✅ conforms | `@keyframes aw3-rise` = `translateY(6px)→0`, 0.1s, no opacity fade — matches the canonical "older users read fades as stalls" rule. `aw3-fade` reserved for modals only. |
| **Type families** | ✅ conforms *(reconciled 2026-05-16)* | Was ❌ (Plus Jakarta Sans was the default Latin/body face). Now per `app/[locale]/layout.tsx` + `globals.css`: **Inter** = `--font-sans` body/tables/forms/`.eyebrow`; **Plus Jakarta Sans** = `--font-display` (`h1/h2/h3` + `font-display` utility) — the canonical *sanctioned display exception* (`design-system-v1/README.md` Type §), explicitly flagged, never body; **Noto Sans Thai** = all Thai; **JetBrains Mono** = `.mono`. CSS tokens are wired to the real `next/font` vars (`--font-inter/-jakarta/-noto-thai/-jetbrains`), fixing a prior literal-name silent-fallback bug. |
| **No dark mode** | ✅ conforms | Light-only; enforced by `CLAUDE.md` brand gates. |
| **No emoji on professional surfaces** | ✅ conforms | Brand gate (`CLAUDE.md` + `aquawise-docs/00`). QA loop treats a violation as automatic ❌. |
| **Iconography** (inline SVG monoline) | ✅ conforms *(WS1 spot-audit 2026-05-16)* | Central `components/aw/icon.tsx` (14 glyphs): `strokeWidth: 1.8` (in 1.7–2.0), `strokeLinecap/Linejoin: 'round'`, `fill: 'none'`, no duotone/filled, no icon font. `v3-round-btn.tsx` inline SVG = `strokeWidth="1.8"` rounded. `v3-ring.tsx`/charts use `stroke` as a chart-geometry prop, not iconography (out of ICONOGRAPHY scope). No violation found. |
| **Shadows** | ✅ conforms *(WS1 2026-05-16)* | All four canonical shadows now in `app/globals.css` `@theme inline` — `--shadow-card`/`--shadow-pop`/`--shadow-app`/`--shadow-modal`, rgba-identical to canonical. `modals/modal-root.tsx` wired to `var(--shadow-modal)`. Two remaining hardcoded shadows (`modal-shell.tsx:171`, `right-rail.tsx:68`) are *non-canonical bespoke values* — flagged, not auto-changed (would alter rendered output). |
| **Spacing scale** | ✅ sanctioned substitution *(WS1 2026-05-16)* | Canonical `--sp-1..--sp-10` (4→40px) intentionally **not** ported: canonical labels it `SPACING (informal)` and Tailwind 4's default 4px-step scale already lands on the same pixel values (4/8/12/16/20/24/28/32/40). Porting `--sp-*` would add a parallel scale with zero visual delta and net drift risk. **Accepted: Tailwind default spacing is the sanctioned substitution.** Per-story gate enforces 4px-grid spacing utilities (no arbitrary `p-[Npx]`). |
| **Type scale** | ✅ sanctioned substitution *(WS1 2026-05-16)* | Canonical `--t-display..--t-eyebrow` not ported as CSS vars; Tailwind `text-*` utilities cover the same px set. Family is token-locked (Jakarta display / Inter body / Noto Thai / JetBrains mono). **Accepted: Tailwind type utilities are the sanctioned substitution; the family mapping is the conformance-critical axis and it is locked.** Per-story gate forbids arbitrary `text-[Npx]` outside the canonical size set. |

## Gap list (tracked, not all fixed in this pass)

1. ~~**`--shadow-app` / `--shadow-modal` missing**~~ — **CLOSED (WS1 2026-05-16):** ported into `@theme inline`; `modal-root` uses `var(--shadow-modal)`.
2. ~~**No `--sp-*` / `--t-*` tokens**~~ — **DECIDED (WS1 2026-05-16):** Tailwind default spacing + type utilities are the **sanctioned substitution** (canonical spacing is `informal`; pixel sets already coincide; porting adds parallel scales with zero visual delta). Conformance shifts to a per-story lint-style gate (no arbitrary `p-[Npx]`/`text-[Npx]` outside the canonical set) — see frozen checklist below.
3. **`design-system-v1/` is not a build dependency** — manual port per repo; drift risk is inherent. Future option (out of scope now): publish it as a shared package under the umbrella `packages/`.
4. **Naming drift in the canonical doc itself** — `design-system-v1/README.md` still says *"AquaWise Hatchery v3"* / *"shrimp-hatchery"*; this product is the **nursery** (`[[naming-nursery-crm]]`, `[[tech-debt-2026-05-16]]`). Visual truth is correct; the label is stale. Flag upstream.
5. ~~**Iconography not audited**~~ — **CLOSED (WS1 2026-05-16):** spot-audit done, `icon.tsx` + `v3-round-btn.tsx` conform; chart `stroke` props out of scope.
6. **English surface gated** — `[locale]/layout.tsx` renders `<ComingSoon />` for `en`; only the Thai surface is QA-able today.

## Change log

- **2026-05-16 (WS1 conformance pass)** — Shadows: ported `--shadow-app`/`--shadow-modal` (rgba-identical to canonical), `modal-root` wired to `var(--shadow-modal)`. Spacing/type-scale drift formally resolved as **sanctioned Tailwind-default substitution** (not ported by design). Iconography spot-audited → conforms. Two bespoke non-canonical shadows (`modal-shell.tsx:171`, `right-rail.tsx:68`) flagged as RECOMMEND (value change, not auto-applied). Baseline stayed GREEN (83/83 tests, clean typecheck).
- **2026-05-16** — Doc created. Typography reconciled to canonical (Plus Jakarta Sans demoted from default Latin/body face to the sanctioned display-headings exception; Inter adopted as body workhorse; `--font-*` tokens wired to `next/font` vars). Colors verified hex-identical. Shadows/spacing/type-scale drift logged.
