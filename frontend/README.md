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
- Password reset is not implemented.
