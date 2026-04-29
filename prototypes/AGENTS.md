<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# prototypes

## Purpose
**Read-only design reference.** The standalone V3 HTML prototype + archived JSX sources used to drive the Phase 2 page port. Excluded from `tsconfig.json` (`exclude: ["prototypes"]`) and excluded from production builds.

When porting a page, **open the HTML prototype in a browser** and aim for visual parity with the live `/th/...` route — the prototype is the design intent; the codebase is the implementation.

## Key Files

| File | Description |
|------|-------------|
| `AquaWise Hatchery v3 - Standalone.html` | Single-file 9-page prototype with all pages, modals, and mock data. Drag into a browser to see the design intent |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `_archive/` | Untransformed JSX sources (V2 + V3) and `tokens-v3.css` — the porting reference for primitives and charts |
| `assets/` | Original logo + prototype assets (live copies are now in `/public/`) |
| `uploads/` | Sketches and image references shared during design |

## For AI Agents

### Working In This Directory
- **Do not modify these files** — they are a frozen design snapshot. The Phase 2 port is done; further visual changes should land in `app/`, `components/`, or `app/globals.css`.
- **Don't import from `prototypes/` anywhere in app code** — `tsconfig.json` excludes the directory.
- If you need to look at how a chart was originally drawn, open `_archive/components/v3/v3-charts.jsx`. If you need a token's original value, open `_archive/styles/tokens-v3.css`.

<!-- MANUAL: -->
