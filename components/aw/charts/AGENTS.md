<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# charts

## Purpose
Hand-rolled SVG chart components ported from `prototypes/_archive/components/v3/v3-charts.jsx`. Bespoke instead of `recharts` because the prototype's hover behavior, soft-rounded bars, and pastel-tone scheme are non-trivial to reproduce with a charting library.

`recharts` is installed and available, but lean on it only when adding genuinely new chart types — keep the prototype-fidelity charts hand-rolled.

## Key Files

| File | Description |
|------|-------------|
| `v3-sparkline.tsx` | Tiny line+area trend, used in stat cards (D30, restock cadence) |
| `v3-dist-chart.tsx` | Histogram of size distribution at harvest. Hover shows tooltip with bin count |
| `v3-donut.tsx` | Concentric donut for proportions (PCR clean vs flagged, customer status mix) |
| `v3-bars-interactive.tsx` | Hoverable bar chart with per-bar tooltip and selection callback |

## For AI Agents

### Working In This Directory
- **Pure SVG, no canvas, no third-party.** Charts are server-renderable as static SVG; only the hover/select interactions need `'use client'`.
- **Sizes come from props** (`width`, `height`) with sensible defaults matching the prototype. Don't hardcode pixels — the dashboard's right-rail sparkline uses small dimensions, but stat cards use larger ones.
- **Color comes from CSS variables** (`var(--color-mint)`, `var(--color-hero)`) — themes propagate without prop plumbing.
- **Tooltip positioning** uses absolute-positioned divs anchored to mouse coordinates over the SVG. Watch for overflow when the chart is near a viewport edge — clamp coordinates.

### Common Patterns
- Each chart accepts `data: number[]` (or richer for `bars-interactive`) — keep input shapes minimal.
- Animated entry uses CSS `@keyframes` from `globals.css` (`aw3-rise`), not framer-motion, so the charts can render server-side without a layout shift.

## Dependencies

### Internal
- `@/lib/utils` (`cn`)
- Token CSS vars from `@/app/globals.css`

<!-- MANUAL: -->
