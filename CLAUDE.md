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
- Do not add admin.
- Do not add timer.
- Do not add offline support.
- Hebrew UI only.
- RTL only.
- Mobile-first.

## Auth

- Email + password against backend `/auth/login`. JWT bearer.
- Token stored in `localStorage` key `access_token` (`features/auth/authStorage.ts`).
- Axios request interceptor in `src/lib/api.ts` attaches `Authorization: Bearer <token>`.
- 401 (except `/auth/login`) clears token and fires `on401` handler set by `AuthProvider`.
- `AuthProvider` (`features/auth/AuthProvider.tsx`) bootstraps user via `/auth/me`, exposes `login`, `logout`, `refreshMe`, `user`, `status`.
- All app routes wrapped in `ProtectedRoute`; unauth → `/login`. `LoginPage` redirects to `/` when authenticated.
- Backend resolves current user from token. Frontend never sends `userId`. Use `/users/me/*` endpoints.
- Logout: `POST /auth/logout` + clear local token. Surfaced in `MorePage`.

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
