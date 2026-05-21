# Bar Exam Study Frontend

Hebrew RTL React app for practicing Israeli Bar Association exam questions.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Axios
- Zod
- Vitest

## Setup

```bash
npm ci
```

The app expects the backend API at:

```text
http://localhost:8000/api/v1
```

To override it, create `.env.local` in this directory:

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Run

```bash
npm run dev
```

LAN testing:

```bash
npm run dev:lan
```

## Checks

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Current App Routes

Public:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

Protected:

- `/`
- `/practice/new`
- `/practice/new?flow=exam`
- `/session/:id`
- `/session/:id/exam`
- `/session/:id/results`
- `/mistakes`
- `/bookmarks`
- `/more`

## API Notes

- Auth uses bearer access tokens plus a backend-set HttpOnly refresh cookie.
- User-scoped frontend calls use `/users/me/*`; the client does not send `user_id`.
- Error responses are expected to use the backend envelope:

```ts
type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

- UI error text should come from `error.message`.
- UI branching should use `error.code`.
- Validation details, when present, are in `error.details` as normalized field items such as `{ field: "items.0.name", message: "Field required", type: "missing" }`.
- Domain error details, when present, are also read from `error.details` for local message mapping.
- Shared helpers in `src/lib/api.ts` and `src/lib/api-errors.ts` parse this envelope.
