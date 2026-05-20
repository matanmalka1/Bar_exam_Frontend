# CLAUDE.md

## Project

Bar Exam Study — Hebrew RTL PWA for Israeli bar exam practice.

Backend is FastAPI.

Frontend is React + TypeScript + Vite + Tailwind + Axios.

Current focus: frontend MVP.

## Rules

- Be direct.
- Do not over-engineer.
- Do not redesign the product.
- Do not add auth.
- Do not add admin.
- Do not add timer.
- Do not add offline support.
- Hebrew UI only.
- RTL only.
- Mobile-first.
- Dev user only, fixed userId = 1 for now.

## Frontend

Use:

- React
- TypeScript
- Vite
- Tailwind
- Axios
- React Router
- clsx
- tailwind-merge

Avoid for now:

- Redux
- Zustand
- TanStack Query
- shadcn
- i18n libraries
- React Compiler

## Architecture

Keep files small.

Use feature folders.

Shared primitives go in src/components.

API clients go in feature api.ts files.

Shared Axios client goes in src/lib/api.ts.

Shared types go near the feature that owns them.

## Backend URL

Default:

http://localhost:8000/api/v1

Can be overridden with:

VITE_API_BASE_URL

## Frontend invariants

- Never show correctness in exam/simulation before completion.
- Exam OptionCard must ignore correctness props.
- Never submit answer without selected option.
- Never navigate after failed answer save.
- Server answer wins over local draft.
- Resume opens first unanswered question.
- Do not complete practice/mistakes/bookmarks before all questions are answered.
- Disabled CTA must explain why.

## Commands

After frontend changes:

npm run build

After backend changes:

pytest

If a command fails, fix the real cause.
