# Agent Flow

## Stack

- **LLM**: Google Gemini (`gemini-flash-lite-latest`) via `@langchain/google-genai`, used for both tool-calling and final response generation. Chosen over a full "flash" model because free-tier request quotas are tracked per model, and the lite alias has separate (and in practice higher) headroom — see `server/src/config/ai.ts`.
- **Embeddings**: Gemini (`gemini-embedding-001`, 768 dimensions) via `@langchain/google-genai`.
- **Vector DB**: Pinecone (serverless, cosine similarity) via `@langchain/pinecone`.
- **Orchestration**: LangGraph (`@langchain/langgraph`) `StateGraph`.

## Graph shape

`server/src/agents/supportAgent.ts` builds a small, classic LangGraph agent loop per request:

```text
START → agent ──(no tool calls)──→ END
          ↑                │
          │           (tool calls)
          │                ↓
          └───────────── tools
```

- **`agent` node**: invokes the Gemini chat model, bound to the five tools below, over `[system prompt, ...conversation history, new user message]`.
- **`tools` node**: a LangGraph `ToolNode` — executes whichever tool(s) the model requested and appends their results as `ToolMessage`s.
- **`toolsCondition`**: routes back to `tools` whenever the latest AI message contains tool calls, otherwise routes to `END`. The loop can chain multiple tool calls in one turn (e.g. look up the order, then create a ticket) before producing a final answer.

Conversation history is reconstructed each request from the persisted `Conversation.messages` (user/assistant turns only — tool-call intermediates are not persisted, only their effect on the final reply and on the database).

## Tools (`server/src/services/tools/agentTools.ts`)

Tools are built **per request** via `createAgentTools({ customerId, conversationId }, activityLog)` — the authenticated customer's id and the active conversation id are closed over in the tool implementations. The model is never given a `customerId` parameter to fill in, so it cannot read or act on another customer's data no matter what it's asked.

| Tool | What it does | Authorization |
|---|---|---|
| `searchKnowledgeBase(query)` | Embeds the query, does a Pinecone similarity search over the ingested `knowledge-base/*.md` chunks, returns the top matches with their source file | N/A (public docs) |
| `getCustomer()` | Returns the authenticated customer's own name/email/role | Scoped to `ctx.customerId`, takes no id argument |
| `getOrder(orderNumber)` | Looks up an order **only if** `customerId` matches the authenticated user | `Order.findOne({ orderNumber, customerId: ctx.customerId })` |
| `createSupportTicket(subject, description, priority?)` | Creates a real `Ticket` document linked to the customer and current conversation | `customerId`/`conversationId` from context, not from the model |
| `escalateToHuman(reason)` | Sets `Conversation.status = "ESCALATED"` and creates/updates a ticket to `ESCALATED` | Same |

Each tool call pushes a `{ tool, label }` entry to an `activityLog` array, which the API returns to the client as `activity` — the UI renders these as small chips (e.g. "Searching knowledge base...") without ever exposing the model's reasoning/chain-of-thought.

## RAG pipeline (`server/src/services/rag/ragService.ts`)

**Ingestion** (`npm run ingest`, or `ragService.ingestDocuments()`):

```text
knowledge-base/*.md
  → read file
  → RecursiveCharacterTextSplitter (chunkSize 800, overlap 100, markdown-aware separators)
  → GoogleGenerativeAIEmbeddings (768-dim)
  → Pinecone upsert (index auto-created if missing, serverless/aws/us-east-1)
```

**Query** (`ragService.searchKnowledgeBase(query)`, exposed as the `searchKnowledgeBase` tool):

```text
question → embed → Pinecone similarity search (top 4) → ranked chunks with source file → LLM grounds its answer in the returned text
```

If no relevant chunks are found, the tool returns an explicit "no relevant documentation found" string, and the system prompt instructs the model to say so rather than invent policy — this is the main hallucination guard for policy questions (see `server/src/agents/systemPrompt.ts`).

## Error handling

`chatController.sendChatMessage` wraps the agent invocation in try/catch. If the LLM, embeddings, or vector DB call fails (rate limit, network, etc.), the user's message is still saved, and a truthful fallback reply is returned ("having trouble processing that right now... ask me to connect you with a human agent") instead of a raw 500 — the chat stays usable and the user is pointed at the escalation path.

## Known limitation

Any Gemini free-tier API key has a daily request quota per model. In production this would use a paid tier; the fallback path above is what a user sees if the quota is hit mid-demo. One subtlety observed while building this: if a tool call (e.g. `escalateToHuman`) succeeds but the *following* LLM call (the one that phrases the final reply) hits the quota, the tool's database side effect still persists — the customer may see the generic fallback text even though the escalation/ticket was actually created. The support dashboard and `/tickets` always reflect the real DB state regardless.
