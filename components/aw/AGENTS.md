<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# aw

## Purpose
**AquaWise V3 design-system primitives** — small, opinionated components ported from `prototypes/_archive/components/v3/v3-primitives.jsx`. They power the visual language of the prototype: rounded cards, pastel chips, soft photos, donut/ring progress, the AquaWise logo mark.

These primitives consume CSS custom properties (`var(--color-hero)`, `var(--radius-xl)`, etc.) defined in `app/globals.css` rather than Tailwind utility classes — so the look stays consistent whether a caller uses raw inline styles or Tailwind tokens.

## Key Files

| File | Description |
|------|-------------|
| `v3-mark.tsx` | The AquaWise logo. Wraps `next/image` over `/public/aquawise-logo.png` |
| `v3-chip.tsx` | Pill-shaped status/tone chip. Tones: `lav`/`peach`/`mint`/`sky`/`rose`/`amber`/`good`/`bad`/`warn` |
| `v3-card.tsx` | Rounded card surface with optional shadow |
| `v3-section.tsx` | Section header with title + optional action |
| `v3-grid.tsx` | Responsive 2/3/4-col grid wrapper |
| `v3-avatar.tsx` | Initial-based avatar with tone-coded background |
| `v3-ring.tsx` | Concentric SVG progress ring (D30/D60/cycle progress) |
| `v3-photo.tsx` | Gradient placeholder for missing photos (pond/farm) |
| `v3-round-btn.tsx` | Soft-rounded primary/secondary button |
| `icon.tsx` | Custom SVG icon set (some duplicates of lucide; some bespoke) |
| `stub-page.tsx` | Coming-soon page stub used by routes still under construction |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `charts/` | Hand-rolled SVG charts: sparkline, dist (histogram), donut, interactive bars (see `charts/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- **Use CSS variables, not Tailwind tokens, for design-system colors.** The prototype defines `--color-hero`, `--color-mint`, etc. in `app/globals.css`'s `@theme inline` block. Tailwind utilities work too (`bg-mint`), but inline styles using `var(...)` are preferred for parity with the prototype's loose styling.
- **Most primitives are server-safe** (no state, no event handlers). Don't add `'use client'` unless you wire interactivity — keeps RSC streaming intact.
- **Avoid taking Radix or shadcn primitives as "the new V3Card."** These bespoke primitives are intentional and named after the prototype. Use shadcn for form widgets (Dialog, Switch, Select) where Radix's accessibility wins matter; keep V3* for the visual surface.

### Common Patterns
- Tone prop is a string union typed against the pastel pairs in `globals.css`. Add a new tone: extend the type, add the `--color-<tone>` + `--color-<tone>-fg` pair in `globals.css`.
- SVG primitives (`v3-ring.tsx`) accept `size` and `stroke` props; defaults match the prototype values.

## Dependencies

### Internal
- `@/lib/utils` (`cn`)
- Token variables defined in `@/app/globals.css`

### External
- `lucide-react` (icons), `next/image` (logo)

<!-- MANUAL: -->
