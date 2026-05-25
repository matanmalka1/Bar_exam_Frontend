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

The Vite dev server proxies `/api/*` to `http://localhost:8000`. No env var needed for standard local development.

To point at a different backend, set in `.env.local`:

```
VITE_API_BASE_URL=http://other-host:8000/api/v1
```

## Auth

- Login: `POST /auth/login`
- Register: `POST /auth/register`
- Refresh: `POST /auth/refresh`
- Logout: `POST /auth/logout`
- Current user: `GET /auth/me`
- Forgot password: `POST /auth/forgot-password`
- Reset password: `POST /auth/reset-password`
- Access token is stored in memory only (never persisted to localStorage or sessionStorage).
- Refresh token is stored by the backend as an HttpOnly cookie scoped to `/api/v1/auth`.
- All API calls go through the same origin (`/api/v1/*`) which Render proxies to the backend. This makes the refresh cookie same-site and reliable on iOS Safari/WebKit.
- `src/lib/api.ts` attaches the bearer token and retries one 401 with `/auth/refresh`.
- `AuthProvider` bootstraps via refresh, then `/auth/me`.
- Protected routes use `ProtectedRoute`; unauthenticated users go to `/login`.
- The frontend never sends `user_id` for progress APIs. It uses `/users/me/*`.

## API Error Contract

Backend errors use:

```ts
type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

- Display text should come from `error.message`.
- Branching should use `error.code`.
- Validation/domain context can be read from `error.details`.
- Shared parsing lives in `src/lib/api.ts`; user-facing mapping lives in `src/lib/api-errors.ts`.

## Routes

Public:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/terms`

Protected shell routes:

- `/`
- `/practice/new`
- `/practice/new?flow=exam`
- `/session/:id`
- `/session/:id/exam`
- `/session/:id/results`
- `/sessions/active`
- `/mistakes`
- `/bookmarks`
- `/stats`
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
- Invalidated questions must be visually marked as invalidated wherever they appear.
- Invalidated questions are answerable and grant full credit once answered, but UI copy and analytics must distinguish invalidated credit from genuinely correct answers.
- Invalidated-question UI must show the selected answer and invalidated-credit message without saying the answer was correct or incorrect.
- Invalidated questions must not be shown as mistakes.
- Use `/users/me/*` endpoints for user-scoped data.

## Scoring Display

Backend returns `score` and `max_score` (raw points, not percentages). Display scores as `score / max_score` (e.g., `68 / 80`). Do not label the primary score as a percentage. Progress bars may compute `score / max_score * 100` locally but must not label that value as the official score.

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
