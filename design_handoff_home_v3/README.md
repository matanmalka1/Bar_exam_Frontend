# Handoff: Home Screen Redesign — V3 "Progress-first"

## Overview

Redesign of the home screen (`/`) of **מבחני לשכה** (*Mivchanei Lishka*) — a Hebrew, RTL, mobile-first PWA for Israeli Bar Association exam prep.

The chosen direction, **V3 · Progress-first**, restructures the home screen so the user's progress context flows naturally into the action routes. The hero shrinks to a compact greeting and a single elevated **Progress composite card** stitches together totals, time, the Part B/C success bars, and the amber mistakes ribbon. The two-section "stats vs routes" split is collapsed: the user reads *"where I am → what to do"* top-to-bottom.

All copy and functionality are preserved verbatim from the current `HomePage`. No new colors, no new icons, no new behaviors.

## About the Design Files

The files in this bundle are **design references created in HTML** — a prototype showing the intended look and behavior. They are **not production code to copy directly**.

The implementation target is the existing React + TypeScript codebase at `Bar_exam_frontend/src/features/dashboard/` — recreate the V3 home in that environment using its existing patterns (Vite + React Router + Tailwind + the design tokens already in `index.css`, the `Button` component, `lucide-react` icons, the `useHomeOverview` / `useSimulationHistory` hooks, etc.). Do not introduce a new component library, a new icon set, or a new styling layer.

## Fidelity

**High-fidelity (hifi).** Pixel-perfect mockup with final colors, typography, spacing, radius, and shadows — all drawn from the project's existing design tokens (`colors_and_type.css`). Recreate exactly using the codebase's Tailwind config and CSS variables.

## Files in this bundle

- `Home & Profile Redesign.html` — the canvas with all six explored variations. **V3 is the third Home artboard**, labeled *"V3 · Progress-first — single composite card stitches stats + parts + amber"*.
- `home-variants.jsx` — the React/JSX source. The `HomeV3` component (and its helpers `PartBar`, `V3Mini`, `SimHistoryV1`) is the spec.
- `shell.jsx` / `shell.css` — phone chrome + the shared `.route-row`, `.amber-band`, `.btn-primary`, `.section-divider` styles used by V3.
- `colors_and_type.css` — the design tokens (CSS custom properties). The implementation should use the equivalent tokens already declared in `Bar_exam_frontend/src/index.css`.
- `icons.jsx` — inline Lucide path data. In the real codebase use `lucide-react` imports of the same icon names.

## File-by-file mapping to the existing codebase

| Existing file | What changes |
| --- | --- |
| `src/features/dashboard/pages/HomePage.tsx` | Restructure the JSX. Drop the white `rounded-[2rem]` hero panel. Render: greeting strip → primary CTA / `ActiveSessionCard` → **new `ProgressCompositeCard`** → `StudyRoutesList` → small "סשנים שהושלמו" mini-row → `SimulationHistoryCard`. |
| `src/features/dashboard/components/HomeStatsHero.tsx` | **Replace** with `ProgressCompositeCard` (see spec below). |
| `src/features/dashboard/components/PartBreakdown.tsx` | **Subsumed** by `ProgressCompositeCard` (Part B/C now render as inline mini-bars inside the composite). Remove the standalone use from `HomePage`. |
| `src/features/dashboard/components/StudyRoutesList.tsx` | Unchanged behavior. Visual treatment of rows is already aligned with the design. |
| `src/features/dashboard/components/ActiveSessionCard.tsx` | Unchanged. |
| `src/features/dashboard/components/SimulationHistoryCard.tsx` | Unchanged. |

## Screen: Home (V3 Progress-first)

### Page frame

- Container: `mx-auto w-full max-w-2xl px-5 pb-12 pt-3 sm:px-6`
- Background: the global cream/paper body gradient (already set in `index.css` — keep as-is). Do **not** wrap the page in a `rounded-[2rem] border bg-surface shadow-sm` panel anymore.
- Direction: `dir="rtl"` (inherits from `<html>`).
- Bottom nav is the existing fixed nav. Page must end with at least `pb-24` of breathing room (already handled by app shell).

### 1. Top strip — Hebrew date + overflow

```
[ יום שלישי, 3 ביוני ]                        [ ⋯ ]
```

- Row: `flex items-center justify-between` at the very top of the content.
- Eyebrow: existing `.eyebrow` utility (or `text-[11px] uppercase tracking-[0.22em] text-secondary`). Text from `formatHebrewDate(now)`.
- Overflow button: 24×24 hit area, `lucide-react`'s `MoreHorizontal`, size 20, color `text-secondary`. Functionality identical to today (overflow menu — preserve whatever was wired).

### 2. Compact greeting

```
בוקר טוב   רוית כהן
יש לך 7 טעויות פתוחות לחזרה.
```

- Replace today's stacked masthead with a single-line, baseline-aligned cluster.
- Greeting: `font-display font-black text-[30px] leading-[1.1] text-[var(--accent-ink)]` (Frank Ruhl Libre 900, 30px). Use `greetingForHour(now.getHours())`.
- Name: inline at the baseline, `font-display font-medium text-[18px] text-secondary` (Frank Ruhl 500, 18px). Only render if `user?.full_name`.
- Use `flex items-baseline gap-2.5 flex-wrap` so the name wraps cleanly on narrow screens.
- Tagline (`<p>`): `mt-2 text-sm leading-6 text-secondary`. Source: existing `tagline` ternary (active session / zero state / mistakes count) — **logic unchanged**.
- Whole block: `pt-3 px-1` (the canvas margin is enough; do not add extra panel padding).

### 3. Primary CTA / ActiveSessionCard

Same logic as today — one or the other, never both.

- Spacing above: `mt-5`.
- If `primarySession`: render `<ActiveSessionCard>` (unchanged). If `activeSessions.length > 1` show the existing "ועוד N תרגולים פתוחים" underline link.
- Else: full-width `<Button>` labeled `התחל תרגול`. Target `min-h-14` (56px), Frank Ruhl off — body font is fine, 17px bold. The existing `Button` component already matches.
- Below the CTA, **the standalone amber mistakes button is REMOVED from here** — it now lives docked inside the Progress card. Do not render it twice.

### 4. Progress composite card (the centerpiece — NEW)

Create `src/features/dashboard/components/ProgressCompositeCard.tsx`.

```
┌────────────────────────────────────────────────────┐
│  סיכום פעילות                       זמן לימוד       │  <- top row
│  248  שאלות נענו                    12:24 שע׳        │
│  198 נכונות · 50 שגויות                              │
├────────────────────────────────────────────────────┤
│  דין דיוני · חלק ב׳                              78% │  <- part bars
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━           │
│  132 שאלות נענו                                      │
│                                                      │
│  דין מהותי · חלק ג׳                              64% │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━                         │
│  116 שאלות נענו                                      │
├────────────────────────────────────────────────────┤
│ ⚠  חזרה על 7 טעויות פתוחות                       ←  │  <- amber footer
└────────────────────────────────────────────────────┘
```

Container:
- `mt-5 overflow-hidden rounded-[2rem] border border-default bg-surface shadow-[0_10px_30px_rgba(0,0,0,0.08)]`
- Three stacked regions separated by `border-b border-default` hairlines.

**Region A — Top row (overall + time)**
- `flex items-baseline justify-between px-5 pt-[18px] pb-[14px]`
- Left column:
  - Eyebrow: `סיכום פעילות` — `.eyebrow` (11px, uppercase, tracking 0.22em, secondary).
  - Number row: `flex items-baseline gap-2 mt-2`
    - Big number: `tabular-nums font-display font-black text-[40px] leading-none text-[var(--accent-ink)]`. Value: `stats?.total_answered ?? 0`.
    - Caption next to it: `שאלות נענו` — `text-[13px] text-secondary font-medium`.
  - Sub-line: `mt-1.5 tabular-nums text-[12px] text-secondary`. Format: `{correct} נכונות · {wrong} שגויות`. Source values from `stats.correct_count` and `stats.wrong_count` (use whatever the existing `StatsOverview` type exposes — match `HomeStatsHero`).
- Right column (`text-left` / `text-end` in RTL):
  - Eyebrow: `זמן לימוד` — `.eyebrow`.
  - Value: `mt-2 tabular-nums font-display font-black text-[24px] text-[var(--accent-ink)]`. Format from existing `formatStudyTime(stats.total_study_seconds)` or whatever helper is used today.

**Region B — Part breakdown bars**
- `px-5 py-4`
- For each part (Part B then Part C), render a `<PartBar>`:
  - Row 1: `flex items-baseline justify-between mb-1.5`
    - Label: `text-[13px] font-semibold text-[var(--accent-ink)]` — `"דין דיוני · חלק ב׳"` / `"דין מהותי · חלק ג׳"`.
    - Percentage: `tabular-nums font-display font-black text-[18px] text-[var(--accent-ink)]` — value from `formatPercent(stats.parts.b.success_rate)`.
  - Bar track: `h-1.5 rounded-full bg-black/8 overflow-hidden`.
  - Bar fill: `h-full rounded-full bg-[var(--accent-ink)]` with `width: ${rate}%`.
  - Caption: `mt-1 tabular-nums text-[11px] text-tertiary` — `{answered} שאלות נענו`.
- Spacing between the two PartBar blocks: `mt-3` on the second.
- If `statsUnavailable`, render a single-line muted notice in this region instead of bars: `text-xs text-secondary` "לא ניתן לטעון פירוט לפי חלקים כרגע."

**Region C — Amber footer**
- Only render if `mistakesCount > 0`.
- Full-bleed button at the bottom of the card. The card has `overflow-hidden`, so the button can touch the edges and inherit the bottom rounded corners.
- Classes: `focus-ring flex w-full items-center gap-2.5 border-t border-amber-300 bg-amber-50 px-4 py-3.5 text-right text-amber-900 transition hover:bg-amber-100 active:scale-[0.995]`
- Left icon (RTL "start"): `lucide-react`'s `CircleAlert`, size 18, stroke width 2.2, `text-amber-800`.
- Label: `font-semibold text-[14px]` — `חזרה על {mistakesCount} טעויות פתוחות`.
- Trailing chevron pushed to end: `lucide-react`'s `ArrowLeft`, size 16, `text-amber-800`, `mr-auto` (RTL: it ends up on the visual left, as a "back/forward" arrow in RTL pointing toward the action target — matches the existing pattern).
- Click handler: `navigate("/mistakes")` (same as today).
- When `mistakesCount === 0`, omit Region C entirely; the card has no amber footer.

### 5. Study routes (unchanged behavior, slight spacing tweak)

- `<StudyRoutesList>` already matches the design. Wrap it with `mt-6` instead of the current larger gap.
- The section-divider header (`בחר כיוון` eyebrow right, `מסלולי לימוד` title left) and the `divide-y divide-black/10` rows are already correct — no change.

### 6. "סשנים שהושלמו" mini-row (NEW, replaces the secondary stats grid)

This is the V3 way of expressing the 2-col grid of `תרגולים / מבחנים / סימולציות` — collapsed to a single horizontal row of three small cells.

- Section eyebrow: `סשנים שהושלמו` — `.eyebrow` with `mb-2.5`.
- Grid: `grid grid-cols-3 gap-2`.
- Each cell:
  ```
  ┌──────────────┐
  │      9       │
  │  תרגולים     │
  └──────────────┘
  ```
  - `rounded-[20px] border border-subtle bg-surface-muted px-3.5 py-3 text-center`
  - Value: `tabular-nums font-display font-black text-[24px] leading-none text-[var(--accent-ink)]`.
  - Label below: `.eyebrow` with `mt-1.5`.
- Three cells, in order: תרגולים, מבחנים, סימולציות. Values from `stats?.completed_practices`, `stats?.completed_exams`, `stats?.completed_simulations` (use the existing field names).
- Wrapper spacing: `mt-6`.

### 7. Simulation history

- `<SimulationHistoryCard simulations={simulations} />` — **unchanged**. Renders only if the user has simulations (already conditional inside the component).
- Wrapper spacing: `mt-6`.

## Interactions & behavior

| Trigger | Behavior |
| --- | --- |
| Top primary CTA `התחל תרגול` | `navigate("/practice/new")` |
| `ActiveSessionCard` resume | `navigate(resumePath(primarySession))` — unchanged helper |
| Amber footer button (inside Progress card) | `navigate("/mistakes")` |
| Any `RouteRow` | Existing handlers from `StudyRoutesList` props — unchanged |
| Overflow `⋯` in top strip | Preserve whatever behavior exists today (if none, omit the button) |

States to handle (all already covered by the existing hook):
- `status === "loading"` → keep returning `<AppLoader variant="page" label="טוען נתונים..." />`.
- `primarySession` exists → render `ActiveSessionCard` instead of CTA. The amber footer in the Progress card is independent of session state — it shows whenever `mistakesCount > 0`.
- `sessionsUnavailable` / `statsUnavailable` / `bookmarksUnavailable` → keep today's muted notices. Inside Progress card, swap PartBars for a single muted line.
- Zero state (`totalAnswered === 0`): the tagline becomes "בחר חלק וצא לדרך." (existing logic). The Progress card still renders, but Region A shows `0`, Region B's PartBars show `0%` and empty bar tracks, and Region C is hidden. This is the inviting zero state.

No new animations. Hover/active states use the existing tokenized transitions (`transition`, `active:scale-[0.99]`).

## State management

No new state. All values come from the existing hooks:

```ts
const {
  status,
  activeSessions,
  stats,
  bookmarks,
  sessionsUnavailable,
  statsUnavailable,
  bookmarksUnavailable,
} = useHomeOverview();

const { simulations } = useSimulationHistory();
```

`ProgressCompositeCard` receives `stats`, `mistakesCount`, `statsUnavailable`, and an `onOpenMistakes` callback. No internal state.

## Design tokens

All values are already defined in `Bar_exam_frontend/src/index.css` / Tailwind config. Use the existing names:

| Role | Token | Value |
| --- | --- | --- |
| Paper background | `--paper` / body gradient | cream → off-white |
| Surface | `--surface` / `bg-surface` | `#ffffff` |
| Surface muted | `--surface-muted` | `#f4ead8` (beige) |
| Ink / text default | `--accent-ink` | `#000000` |
| Secondary text | `text-secondary` | ~`#000` @ 60% |
| Tertiary text | `text-tertiary` | ~`#000` @ 40% |
| Border default | `border-default` | `rgba(0,0,0,0.10)` |
| Border subtle | `border-subtle` | `rgba(0,0,0,0.06)` |
| Amber bg | `amber-50` | `#fffbeb` |
| Amber border | `amber-300` | `#fcd34d` |
| Amber text | `amber-800` / `amber-900` | `#92400e` / `#78350f` |
| Radius default | `rounded-2xl` | `32px` |
| Radius small (mini cells) | custom `rounded-[20px]` | `20px` |
| Shadow default | `shadow-[0_10px_30px_rgba(0,0,0,0.08)]` | as named |
| Display font | `font-display` | `"Frank Ruhl Libre", serif` |
| Body font | default | `"Heebo", sans-serif` |
| Numeric | `tabular-nums` | tabular figures |

**No new colors.** **No new radii.** **No gradients** (the body background is the only allowed gradient — already in place).

## Typography reference

| Element | Family | Weight | Size | Line height |
| --- | --- | --- | --- | --- |
| Greeting (`בוקר טוב`) | Frank Ruhl Libre | 900 | 30px | 1.1 |
| User name | Frank Ruhl Libre | 500 | 18px | inherits |
| Tagline | Heebo | 500 | 14px | 1.5 |
| Eyebrow | Heebo | 700 | 11px | 1.2 (uppercase, tracking 0.22em) |
| Big number (סיכום פעילות) | Frank Ruhl Libre | 900 | 40px | 1 |
| "שאלות נענו" caption | Heebo | 500 | 13px | inherits |
| Sub-line "198 נכונות · 50 שגויות" | Heebo | 500 | 12px | inherits |
| זמן לימוד value | Frank Ruhl Libre | 900 | 24px | 1 |
| PartBar label | Heebo | 600 | 13px | inherits |
| PartBar percentage | Frank Ruhl Libre | 900 | 18px | inherits |
| PartBar caption | Heebo | 500 | 11px | inherits |
| Amber footer label | Heebo | 600 | 14px | inherits |
| Mini-cell value | Frank Ruhl Libre | 900 | 24px | 1 |
| Primary CTA | Heebo | 700 | 17px | inherits |

## Assets

- Icons: `lucide-react` — `MoreHorizontal`, `CircleAlert`, `ArrowLeft`, plus everything `StudyRoutesList` already uses (`PencilLine`, `CalendarDays`, `ClipboardList`, `Bookmark`).
- No new images, no illustrations, no emoji.

## Copy (Hebrew, verbatim)

| Where | Text |
| --- | --- |
| Date eyebrow | `formatHebrewDate(now)` (e.g. `יום שלישי, 3 ביוני`) |
| Greeting | `greetingForHour(...)` (`בוקר טוב` / `צהריים טובים` / `ערב טוב` — unchanged) |
| Tagline (active) | `יש לך תרגול פתוח שמחכה להמשך.` |
| Tagline (zero) | `בחר חלק וצא לדרך.` |
| Tagline (mistakes) | `יש לך {N} טעויות פתוחות לחזרה.` |
| Tagline (clean) | `כל הכבוד — אין טעויות פתוחות.` |
| Primary CTA | `התחל תרגול` |
| Progress card eyebrows | `סיכום פעילות`, `זמן לימוד` |
| Count caption | `שאלות נענו` |
| Sub-line | `{correct} נכונות · {wrong} שגויות` |
| Part labels | `דין דיוני · חלק ב׳`, `דין מהותי · חלק ג׳` |
| Bar caption | `{N} שאלות נענו` |
| Amber footer | `חזרה על {N} טעויות פתוחות` |
| Mini-row eyebrow | `סשנים שהושלמו` |
| Mini labels | `תרגולים`, `מבחנים`, `סימולציות` |
| Stats unavailable | `לא ניתן לטעון פירוט לפי חלקים כרגע.` |
| Sessions unavailable | `לא ניתן לטעון תרגול פעיל כרגע.` |
| More-active link | `ועוד {N} תרגולים פתוחים` |

Every string must match exactly. Don't paraphrase.

## Acceptance checklist

- [ ] White `rounded-[2rem]` hero panel removed; greeting sits on the cream body.
- [ ] Greeting is the compact one-line variant (30px serif + 18px name baseline-aligned).
- [ ] Standalone amber mistakes button is **gone** from the top — it lives only inside the Progress card footer.
- [ ] New `ProgressCompositeCard` renders three regions divided by hairlines, with the amber footer touching the bottom edges of the card (no inner gap).
- [ ] `PartBreakdown` component is no longer rendered standalone; its content lives inside the composite card.
- [ ] PartBars use the existing `formatPercent` helper; show `0%` cleanly in zero state with a thin empty track.
- [ ] Secondary stats collapsed to a 3-col `סשנים שהושלמו` row (תרגולים / מבחנים / סימולציות).
- [ ] `SimulationHistoryCard` still renders only when the user has simulations.
- [ ] All copy strings appear verbatim. Hebrew, RTL, logical direction utilities.
- [ ] No new colors. Only `amber-50/300/800/900` for warnings, black/white/beige for everything else.
- [ ] Loading and `*Unavailable` states still behave as today.
- [ ] All `navigate(...)` targets unchanged from the current `HomePage`.

## Out of scope for this handoff

- The Profile screen redesigns (`/more`) — three variants exist in the same canvas file but are a separate handoff.
- The other two Home variants (V1 Quiet Index, V2 Masthead) — kept in the canvas for reference, not for implementation.
