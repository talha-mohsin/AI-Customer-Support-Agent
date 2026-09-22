# AI Customer Support Agent

A MERN-based customer support platform where a LangGraph agent will decide whether to search a private knowledge base using RAG, call authenticated backend tools for customer/order data, create support tickets, or escalate conversations to human support.

> **Status: Day 1 complete.** Auth, RBAC, data models, core REST APIs, and the React UI shell are implemented and manually verified end-to-end. The LangGraph agent, RAG pipeline, and vector DB integration are Day 2 work — see [Agent.md](Agent.md) for the full build plan. `POST /api/chat` currently persists conversation turns with a placeholder reply until the agent is wired in.

## Problem

Customer support teams get repetitive questions (order status, refund/shipping policy) mixed in with genuinely novel issues that need a human. This project demonstrates an agent that can triage automatically: answer policy questions from real documentation, look up real order/customer data through authenticated tools, and escalate to a human when it should.

## Features (current)

- Email/password auth with JWT, bcrypt-hashed passwords
- Role-based access control (`CUSTOMER`, `SUPPORT_AGENT`) enforced in middleware and at the query level (customers can only ever see their own orders/tickets/conversations)
- Orders, conversations, and support tickets backed by MongoDB
- Customer chat UI that persists conversation history
- Support dashboard (kanban-style ticket board + detail/status-update view)
- Centralized error handling, request validation (Zod), rate limiting, Helmet, CORS

## Features (planned — Day 2/3)

- LangGraph agent with tool-calling: `searchKnowledgeBase`, `getCustomer`, `getOrder`, `createSupportTicket`, `escalateToHuman`
- RAG over the `knowledge-base/` markdown docs using a vector DB (Pinecone/Chroma)
- Safe "agent activity" indicators in the chat UI (e.g. "Searching knowledge base...")
- Human escalation flow reflected in the support dashboard

## Stack

**Frontend:** React, Vite, TypeScript, React Router, Axios, Tailwind CSS
**Backend:** Node.js, Express, TypeScript, MongoDB + Mongoose, JWT, bcrypt, Zod, Helmet, CORS, express-rate-limit
**AI (Day 2):** LangChain, LangGraph, an LLM provider, embeddings, a vector DB

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full breakdown of the request flow, auth/RBAC model, and data model.

```text
Client (React)  →  Express API  →  MongoDB
                       │
                       └── (Day 2) LangGraph agent → RAG (vector DB) + backend tools
```

## Why RAG / Vector DB / LangGraph? (see also docs/agent-flow.md, Day 2)

- **RAG**: policy answers must be grounded in the company's actual documents, not invented by the model. The `knowledge-base/` markdown files are the single source of truth.
- **Vector DB**: enables semantic similarity search over policy chunks so the agent finds the relevant passage regardless of exact wording.
- **LangGraph**: the agent needs to *decide* between several distinct actions (RAG search, tool call, direct answer, escalation) per turn — a graph-based agent runtime models that branching more explicitly than a single prompt chain.
- **Tool calling + authorization**: tools like `getOrder` run against the authenticated user's own ID server-side; the model can never pass an arbitrary customer ID and get someone else's data.
- **Reducing hallucination**: the system prompt (Agent.md §12) instructs the agent to say when it can't verify something rather than invent policy, order, or ticket details.

## Agent tools (Day 2)

| Tool | Purpose |
|---|---|
| `searchKnowledgeBase(query)` | Semantic search over company policy docs |
| `getCustomer()` | Authenticated customer's own profile |
| `getOrder(orderNumber)` | Order lookup, scoped to the authenticated customer |
| `createSupportTicket(subject, description, priority, conversationId)` | Creates a real MongoDB ticket |
| `escalateToHuman(reason, conversationId)` | Marks conversation/ticket ESCALATED |

## API Endpoints

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/users/me

GET    /api/conversations
GET    /api/conversations/:id

POST   /api/chat

GET    /api/orders
GET    /api/orders/:orderNumber

GET    /api/tickets
POST   /api/tickets

GET    /api/support/tickets
PATCH  /api/support/tickets/:id
```

All routes above (except `/auth/*`) require `Authorization: Bearer <token>`. `/support/*` routes additionally require the `SUPPORT_AGENT` role.

## Environment Setup

1. Copy env files:
   ```bash
   cp .env.example server/.env
   cp client/.env.example client/.env
   ```
2. Fill in `server/.env`:
   - `MONGODB_URI` — a local MongoDB instance or a MongoDB Atlas connection string
   - `JWT_SECRET` — any long random string
3. Install and run:
   ```bash
   cd server && npm install && npm run seed && npm run dev
   ```
   ```bash
   cd client && npm install && npm run dev
   ```
4. Open the client at `http://localhost:5173`.

## Demo Credentials

Seeded by `npm run seed` in `server/`:

```text
customer@example.com / Password123!
support@example.com  / Password123!
```

Seeded orders for the customer account: `ORD-1001` (SHIPPED), `ORD-1002` (DELIVERED), `ORD-1003` (PROCESSING).

## Demo Scenarios

- **Auth & RBAC**: log in as `customer@example.com`, confirm you only see your own orders/tickets; log in as `support@example.com`, confirm you land on the support dashboard and cannot reach `/dashboard` or `/chat`.
- **Orders**: as the customer, `GET /api/orders/ORD-1001` returns the order; `GET /api/orders/ORD-9999` returns 404.
- **Tickets**: create a ticket as the customer, then update its status as the support agent and see it move columns on the kanban board.
- **Chat (Day 1)**: send a message in `/chat`; it's persisted to a `Conversation` and appears under `/conversations`.
- **RAG / tool calling / escalation** (Day 2/3): see [Agent.md](Agent.md) §13 and §23 for the target scenarios.

## Future Improvements

- Streaming responses in the chat UI
- Pagination on tickets/conversations lists
- Automated test suite (unit + integration)
- Rich agent activity indicators surfaced from LangGraph node transitions
