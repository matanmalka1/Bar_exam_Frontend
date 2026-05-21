# CLAUDE.md

## Project

Bar Exam Study frontend: Hebrew RTL, mobile-first React app for practicing Israeli Bar Association exam questions.

Backend repository: `/Users/matanmalka/Desktop/bar_exam_study`.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Axios
- Zod
- Vitest

`@tanstack/react-query` is installed but the current app uses direct feature API clients and local component state.

## Runtime

Default API base URL:

```
http://localhost:8000/api/v1
```

Override with:

```
VITE_API_BASE_URL
```

## Auth

- Login: `POST /auth/login`
- Register: `POST /auth/register`
- Refresh: `POST /auth/refresh`
- Logout: `POST /auth/logout`
- Current user: `GET /auth/me`
- Access token is stored in `localStorage` under `access_token`.
- Refresh token is stored by the backend as an HttpOnly cookie.
- `src/lib/api.ts` attaches the bearer token and retries one 401 with `/auth/refresh`.
- `AuthProvider` bootstraps via refresh, then `/auth/me`.
- Protected routes use `ProtectedRoute`; unauthenticated users go to `/login`.
- The frontend never sends `user_id` for progress APIs. It uses `/users/me/*`.

Password reset is not implemented in the current codebase.

## Routes

Public:

- `/login`
- `/register`

Protected shell routes:

- `/`
- `/practice/new`
- `/practice/new?flow=exam`
- `/session/:id`
- `/session/:id/exam`
- `/session/:id/results`
- `/mistakes`
- `/bookmarks`
- `/more`

## Product Rules

- Be direct.
- Hebrew UI only.
- Do not over-engineer.
- RTL only.
- Mobile-first layouts.
- Do not rewrite imported legal question text.
- Do not add legal explanations.
- Do not reveal answer correctness during exam/simulation sessions before completion.
- Normal practice, mistakes, and bookmarks reveal feedback only after the user submits an answer.
- Use `/users/me/*` endpoints for user-scoped data.

## Architecture

Keep files small.

Use feature folders.

Shared primitives go in src/components.

API clients go in feature api.ts files.

Shared Axios client goes in src/lib/api.ts.

Shared types go near the feature that owns them.

## Commands

Run from `frontend/`:

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
```

After frontend changes, run at least:

```bash
npm run typecheck
npm run lint
npm run build
```
