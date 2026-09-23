# AI Customer Support Agent

A MERN-based customer support platform where a LangGraph agent decides whether to search a private knowledge base using RAG, call authenticated backend tools for customer/order data, create support tickets, or escalate conversations to human support.

> **Status: Day 1 + Day 2 complete.** Auth, RBAC, data models, core REST APIs, the React UI (with Redux Toolkit, light/dark theme, and a collapsible sidebar), the RAG pipeline, and the LangGraph agent with real tool-calling are all implemented and manually verified end-to-end. Human escalation UI polish on the support dashboard and a broader automated test suite remain for Day 3 — see [Agent.md](Agent.md).

## Problem

Customer support teams get repetitive questions (order status, refund/shipping policy) mixed in with genuinely novel issues that need a human. This project demonstrates an agent that can triage automatically: answer policy questions from real documentation, look up real order/customer data through authenticated tools, and escalate to a human when it should.

## Features

- Email/password auth with JWT, bcrypt-hashed passwords
- Role-based access control (`CUSTOMER`, `SUPPORT_AGENT`) enforced in middleware and at the query level (customers can only ever see their own orders/tickets/conversations)
- Orders, conversations, and support tickets backed by MongoDB
- **LangGraph agent** with real tool-calling: `searchKnowledgeBase`, `getCustomer`, `getOrder`, `createSupportTicket`, `escalateToHuman` (see [docs/agent-flow.md](docs/agent-flow.md))
- **RAG** over the `knowledge-base/` markdown docs, embedded into Pinecone and retrieved per query
- Safe "agent activity" chips in the chat UI (e.g. "Searching knowledge base...", "Checking order...") without exposing the model's reasoning
- Human escalation: the agent can mark a conversation `ESCALATED` and open/update a real ticket
- Redux Toolkit for app state, a persisted light/dark theme, and a responsive collapsible sidebar
- Support dashboard (overview stats, kanban-style ticket board, ticket detail/status-update view, customers list)
- Centralized error handling (including a graceful LLM/RAG failure fallback), request validation (Zod), rate limiting, Helmet, CORS

## Stack

**Frontend:** React, Vite, TypeScript, React Router, Redux Toolkit, Axios, Tailwind CSS, lucide-react
**Backend:** Node.js, Express, TypeScript, MongoDB + Mongoose, JWT, bcrypt, Zod, Helmet, CORS, express-rate-limit
**AI:** LangChain, LangGraph, Google Gemini (chat + embeddings), Pinecone (vector DB)

## Architecture

See [docs/architecture.md](docs/architecture.md) for the request flow, auth/RBAC model, and data model, and [docs/agent-flow.md](docs/agent-flow.md) for the agent graph, tools, and RAG pipeline in detail.

```text
Client (React)  →  Express API  →  MongoDB
                       │
                       └── LangGraph agent (StateGraph: agent ⇄ tools)
                              ├── searchKnowledgeBase → Pinecone (RAG)
                              ├── getCustomer / getOrder → MongoDB (scoped to req.user)
                              └── createSupportTicket / escalateToHuman → MongoDB
```

## Why RAG / Vector DB / LangGraph?

- **RAG**: policy answers must be grounded in the company's actual documents, not invented by the model. The `knowledge-base/` markdown files are the single source of truth; the agent is instructed to say so when nothing relevant is retrieved.
- **Vector DB (Pinecone)**: enables semantic similarity search over policy chunks so the agent finds the relevant passage regardless of exact wording.
- **LangGraph**: the agent needs to *decide* between several distinct actions (RAG search, tool call, direct answer, escalation) per turn, and can chain multiple tool calls before answering. A `StateGraph` with an `agent ⇄ tools` loop (via `toolsCondition`) models that branching explicitly, rather than a single fixed prompt chain.
- **Tool calling + authorization**: tools are built per-request, closed over the authenticated user's own id — the model is never given a `customerId` parameter to fill in, so it cannot read or act on another customer's data.
- **Reducing hallucination**: the system prompt ([server/src/agents/systemPrompt.ts](server/src/agents/systemPrompt.ts), per Agent.md §12) instructs the agent to say when it can't verify something rather than invent policy, order, or ticket details; tool results are the only source of truth it's allowed to draw from for anything account-specific.

## Agent tools

| Tool | Purpose | Authorization |
|---|---|---|
| `searchKnowledgeBase(query)` | Semantic search over company policy docs (Pinecone) | N/A — public docs |
| `getCustomer()` | Authenticated customer's own profile | Scoped to `req.user.id`, no id argument accepted |
| `getOrder(orderNumber)` | Order lookup, scoped to the authenticated customer | `{ orderNumber, customerId: req.user.id }` query |
| `createSupportTicket(subject, description, priority?)` | Creates a real MongoDB ticket linked to the customer + conversation | `customerId`/`conversationId` from server context |
| `escalateToHuman(reason)` | Marks the conversation `ESCALATED` and creates/updates a ticket | Same |

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
GET    /api/support/customers
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
   - `LLM_API_KEY` — a Google AI Studio (Gemini) API key, used for both chat and embeddings
   - `VECTOR_DB_API_KEY` — a Pinecone API key
   - `VECTOR_DB_INDEX` — a Pinecone index name (lowercase alphanumeric + hyphens only); created automatically on first ingest if it doesn't exist
3. Install, seed the database, and ingest the knowledge base into Pinecone:
   ```bash
   cd server && npm install && npm run seed && npm run ingest && npm run dev
   ```
   ```bash
   cd client && npm install && npm run dev
   ```
4. Open the client at `http://localhost:5173`.

Re-run `npm run ingest` in `server/` any time the `knowledge-base/*.md` files change — it re-embeds and replaces the index contents.

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
- **RAG**: in `/chat`, ask "What is your refund policy?" — the agent calls `searchKnowledgeBase` and answers from `knowledge-base/refund-policy.md`.
- **Tool calling**: ask "Where is my order ORD-1001?" — the agent calls `getOrder` and answers from MongoDB.
- **Ticket + escalation workflow**: say "I have a billing problem, open a ticket" (creates a ticket), or "I want to speak to a human" (escalates the conversation and ticket to `ESCALATED`, visible on the support dashboard).
- **Out-of-scope**: ask something unrelated (e.g. "what's the capital of France?") — the agent declines and redirects to support topics instead of answering.
- **Graceful degradation**: if the LLM/RAG call fails (e.g. rate limit), the chat still responds with a truthful fallback message and an offer to escalate, instead of erroring out.

## Future Improvements

- Streaming responses in the chat UI
- Pagination on tickets/conversations lists
- Automated test suite (unit + integration)
- Persist per-message tool activity so it survives a conversation reload, not just the live turn
