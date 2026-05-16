<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# layout

## Purpose
The desktop-first 3-column shell that wraps every dashboard page, plus the trial banner that floats above it.

Layout: `[ LeftRail | (TopBar over scrollable main) | RightRail ]` with widths `${leftWidth}px 1fr 320px`. The left rail toggles between 270 (open) and 72 (collapsed) — driven by the persisted Zustand store `lib/store/sidebar.ts`.

## Key Files

| File | Description |
|------|-------------|
| `shell.tsx` | The 3-column grid. Reads `useSidebar` for collapsed state and animates `grid-template-columns`. Renders `<LeftRail />`, `<TopBar />`, scrollable `<main>` (with `aw3-rise` entry animation), `<RightRail />` |
| `left-rail.tsx` | Logo + nav groups (Overview / Daily / Settings) + collapse toggle. Active route highlighting via `usePathname()` |
| `top-bar.tsx` | Search input, notifications bell, profile dropdown |
| `right-rail.tsx` | Daily summary widgets: progress ring, D30 sparkline, follow-ups list, team avatars |
| `trial-banner.tsx` | Floating banner at the top of the dashboard. Reads `getSubscription` and shows: trial countdown (sky/amber/bad tones based on days left), past-due "update payment" CTA, or nothing when active |

## For AI Agents

### Working In This Directory
- **Mobile is not yet supported** — `Shell` hardcodes the 3-column grid. Phase 5's a11y/responsive pass will add a stacked mobile layout. Don't add `md:` breakpoints piecemeal here without a plan.
- **All layout components are `'use client'`** because they read Zustand stores (`useSidebar`, `useModal`) and use `usePathname()`. Don't try to make `Shell` a server component.
- **The trial banner sits OUTSIDE the `<Shell>`** so it can occupy the full width above the 3 columns. See `app/[locale]/(dashboard)/layout.tsx`.
- **`overflow: hidden` on the column wrappers + `overflow-y: auto` on `<main>`** is intentional — keeps the rails fixed while the content scrolls.

### Common Patterns
- Active-link highlighting in `LeftRail` uses `usePathname()` and strips the locale prefix before comparing.
- Animation entry: `<main className="aw3-rise">` references the `@keyframes aw3-rise` defined in `globals.css`.
- Inline `style={{...}}` is widely used for shell sizing/transitions because the values are dynamic (sidebar width) — Tailwind's arbitrary-value classes would fight strict-mode caching.

## Dependencies

### Internal
- `@/lib/store/sidebar` (collapse persistence)
- `@/lib/store/modal` (profile dropdown opens modals)
- `@/lib/api` (`getSubscription` for the trial banner)
- `@/lib/billing/trial` (`daysLeftInTrial`, `bannerToneForTrial`, `effectiveStatus`)
- `@/i18n/navigation` (locale-aware `Link`)
- `@/components/aw/v3-mark` (logo)

### External
- `lucide-react` icons, `next-intl` (`useTranslations`)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
