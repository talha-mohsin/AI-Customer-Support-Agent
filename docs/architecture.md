# Architecture

## Overview

The system is a **modular monolith**: a single Express/TypeScript API backed by MongoDB, paired with a React/Vite frontend. It is not microservices — everything lives in one deployable backend and one deployable frontend, organized into clear internal modules.

```text
ai-support-agent/
├── client/            React + Vite + TypeScript SPA
├── server/             Express + TypeScript API
│   └── src/
│       ├── config/     env loading, DB connection
│       ├── controllers/ request handlers
│       ├── middleware/ auth, RBAC, validation, error handling
│       ├── models/     Mongoose schemas
│       ├── routes/     Express routers
│       ├── services/   ai/, rag/, tools/, vector/ (Day 2+)
│       ├── agents/     LangGraph agent definition (Day 2)
│       └── app.ts      app bootstrap
├── knowledge-base/     markdown policy documents used for RAG
└── docs/                architecture + agent-flow docs
```

## Layered request flow

```text
Client (React)
   → Axios (attaches JWT)
   → Express route
   → authMiddleware (verifies JWT)
   → roleMiddleware (RBAC check)
   → validate (Zod schema)
   → controller (thin, delegates to models/services)
   → Mongoose model
   → MongoDB
```

## Authentication & Authorization

- Passwords are hashed with bcrypt before storage; the hash is never returned by the API (`select: false` on the schema field).
- On login/register, a JWT containing `{ id, role }` is issued and stored client-side (`localStorage`).
- `authMiddleware` verifies the JWT signature/expiry and attaches `req.user`.
- `roleMiddleware(...roles)` enforces RBAC per route (e.g. `/api/support/*` requires `SUPPORT_AGENT`).
- Data-isolation is enforced at the query level, not just the route level: every order/ticket/conversation query is scoped to `customerId: req.user.id`, so a customer cannot read another customer's data even if they guess an ID.

## Data model

| Model | Purpose |
|---|---|
| `User` | Account + role (`CUSTOMER` \| `SUPPORT_AGENT`) |
| `Order` | Purchase records scoped to a customer |
| `Conversation` | Chat thread with an embedded message array |
| `Ticket` | Support ticket, optionally linked to a conversation |

## Frontend

- React Router drives navigation; `ProtectedRoute` gates authenticated/role-specific routes.
- `AuthContext` centralizes auth state and exposes `login`/`register`/`logout`.
- Axios instance in `services/api.ts` attaches the JWT to every request and redirects to `/login` on a 401.
- Two distinct shells share `AppLayout`: the customer nav (Dashboard/Chat/Conversations/Tickets/Profile) and the support-agent nav (Support Tickets/Profile).

## Error handling

A centralized `errorHandler` middleware normalizes all errors into `{ message }` JSON responses, maps known error shapes (Zod via `validate`, Mongoose duplicate-key `11000`, Mongoose `ValidationError`, custom `AppError`) to correct status codes, and never leaks stack traces or secrets to the client.
