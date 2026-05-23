# Design Guidelines

This document defines the visual language for the Bar Exam Study frontend.
The goal is to keep the product Hebrew, RTL, mobile-first, clean, and consistent for practicing Israeli Bar Association exam questions.

## Principles

- The user interface is Hebrew only.
- RTL only. Use `dir="rtl"` on screen shells and logical direction classes such as `start`, `end`, `ps`, and `pe`.
- Mobile-first. Main screen content usually targets a width around `max-w-[430px]`.
- Keep the interface direct and functional. Do not add unnecessary explanatory text.
- Do not rewrite imported legal question text.
- Do not add legal explanations.
- Do not reveal answer correctness in exam or simulation sessions before completion.
- In normal practice, mistakes, and bookmarks, reveal feedback only after the user submits an answer.

## Visual Language

The visual tone is focused, quiet, and study-oriented:

- Light paper-like background.
- Clear Hebrew typography.
- Strong contrast.
- Touch-friendly buttons and controls.
- Clear hierarchy between title, metadata, question text, and actions.

Avoid decorative clutter. Visual elements should support reading, practice, and decision-making.

## Colors

The source of truth is `frontend/src/index.css`.

```css
--color-black: #000000;
--color-white: #ffffff;
--color-beige: #f4ead8;
--color-beige-strong: #e6d6bc;
```

Usage:

- `--surface`: default surface.
- `--surface-muted`: paper background or secondary area.
- `--text-primary`: primary text.
- `--text-secondary`: secondary text.
- `--border-default`: default border.
- `--border-strong`: emphasized border.
- `--accent`: primary action or highlight.

Avoid adding new colors unless there is a clear product need. For success, warning, or error states, prefer existing components such as `Alert` and keep the visual treatment restrained.

## Typography

Fonts:

- Body text: `Heebo`.
- Display and headings: `Frank Ruhl Libre` through the `font-display` class.

Rules:

- Body text should be readable and reasonably compact.
- Screen titles should be short and clear.
- Prefer `text-primary` and `text-secondary` over hardcoded colors where possible.
- Do not use negative letter spacing.
- Do not scale font size with viewport width.

## Spacing And Radius

Token source:

```css
--radius-sm: 0.5rem;
--radius-md: 1rem;
--radius-lg: 1.25rem;
--radius-xl: 1.5rem;
--radius-2xl: 2rem;

--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-5: 1.25rem;
--space-6: 1.5rem;
--space-7: 1.75rem;
--space-8: 2rem;
--space-10: 2.5rem;
```

Rules:

- Form controls and primary buttons usually use `rounded-2xl`.
- Cards and sections should stay simple. Do not nest cards inside cards.
- Keep spacing consistent between titles, content, and actions.

## Components

Prefer existing components under `frontend/src/components`.

### AppHeader

Use for screen headers:

- `variant="sticky"` for practice screens and long content.
- `variant="inline"` for login and registration screens.
- `titleLayout="stacked"` when the title should sit above the form body.
- Supports back actions, actions, metadata, and progress.

### TextField

Use for input fields:

- Always pass `id` and `label`.
- Use `error` for field-level errors.
- Use `hint` only for short helper text.
- For email fields, use `dir="ltr"` and `className="text-left"`.

### Button

Use for actions:

- One clear primary action per screen.
- Use a full-width primary button on mobile when it is the main action.
- During loading, use `AppLoader` inside the button.

### Alert

Use for errors and system messages:

- Display API messages from `error.message`.
- Branch logic by `error.code`.
- Do not expose technical details to the user.

## Loading States

Loader animations are defined in `index.css`:

- `animate-loader-shimmer`
- `animate-loader-orbit`
- `animate-loader-pulse`
- `animate-loader-dot-1`
- `animate-loader-dot-2`
- `animate-loader-dot-3`

The animations respect `prefers-reduced-motion`.

## Accessibility

- Every button should have the correct `type`.
- Every field should have a visible `label`.
- Field errors should connect through `aria-describedby` and `aria-invalid`.
- Use `focus-ring` for custom interactive controls.
- Keep tap targets comfortable on mobile.

## Screen Patterns

### Auth Screens

- Shell uses `dir="rtl"`.
- Background uses `bg-[var(--paper)]`.
- Content is centered with a width up to `430px`.
- Short title, form, primary action, and secondary link.

### Practice Screens

- Sticky header with progress.
- Do not reveal feedback before answer submission.
- In exam or simulation mode, do not reveal correctness before full completion.
- Actions should be clear, large, and stable in position.

### Lists Such As Mistakes And Bookmarks

- Items should be easy to scan.
- Keep legal text exactly as received from the server.
- Show status and actions without visual overload.

## Tailwind

- Use Tailwind classes directly for local layout.
- Use component classes from `index.css` for repeated patterns:
  - `surface`
  - `surface-muted`
  - `text-primary`
  - `text-secondary`
  - `border-default`
  - `border-strong`
  - `button-primary`
  - `button-secondary`
  - `button-ghost`
  - `badge-default`
  - `badge-strong`
  - `focus-ring`

## Checks Before Finishing UI Changes

After frontend changes, run at least:

```bash
npm run typecheck
npm run lint
npm run build
```

For meaningful UI changes, manually check mobile and desktop:

- Text does not overlap.
- RTL is not broken.
- Buttons are comfortable to tap.
- Loading and error states look correct.
- Exam screens do not reveal correctness too early.
