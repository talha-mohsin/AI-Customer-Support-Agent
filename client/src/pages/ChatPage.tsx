import { type FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, Bot, MessageSquare, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  appendLocalMessage,
  clearCurrentConversation,
  fetchConversationById,
  fetchConversations,
  sendChatMessage,
} from "../store/slices/conversationSlice";
import { Avatar } from "../components/ui/Avatar";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorBanner } from "../components/ui/ErrorState";
import { useAuth } from "../hooks/useAuth";

export function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationId = searchParams.get("id") ?? undefined;
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { current, currentStatus, sending, lastActivity, error } = useAppSelector(
    (s) => s.conversations
  );

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) {
      dispatch(clearCurrentConversation());
      return;
    }
    dispatch(fetchConversationById(conversationId));
  }, [conversationId, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [current?.messages.length, sending]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    dispatch(appendLocalMessage({ role: "user", content: trimmed, createdAt: new Date().toISOString() }));
    setInput("");

    const result = await dispatch(sendChatMessage({ message: trimmed, conversationId }));
    if (sendChatMessage.fulfilled.match(result) && !conversationId) {
      setSearchParams({ id: result.payload.conversationId });
      dispatch(fetchConversations());
    }
  };

  const messages = current?.messages ?? [];

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col md:h-screen">
      <header className="hidden shrink-0 border-b border-border bg-surface px-6 py-4 md:block">
        <h1 className="text-lg font-semibold text-text">Support Chat</h1>
        <p className="text-sm text-muted">Ask about order status, policies, or request a human agent.</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {currentStatus === "loading" ? (
          <p className="text-sm text-muted">Loading conversation...</p>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Start a conversation"
            description="Ask about order status, refund/shipping policies, or request a human agent."
          />
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {messages.map((m, i) => {
              const isLast = i === messages.length - 1;
              return (
                <div key={i} className="flex flex-col gap-1.5">
                  <div
                    className={`flex items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {m.role === "assistant" ? (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                        <Bot size={14} />
                      </div>
                    ) : (
                      <Avatar name={user?.name ?? "?"} size={28} />
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        m.role === "user"
                          ? "rounded-br-sm bg-accent text-white"
                          : "rounded-bl-sm border border-border bg-surface text-text"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>

                  {isLast && !sending && m.role === "assistant" && lastActivity.length > 0 && (
                    <div className="ml-9 flex flex-wrap gap-1.5">
                      {lastActivity.map((a, j) => (
                        <span
                          key={j}
                          className="rounded-full bg-surface-alt px-2.5 py-1 text-xs text-muted"
                        >
                          {a.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {sending && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Bot size={14} />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-2 text-sm text-muted">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {error && (
        <div className="px-4 sm:px-6">
          <ErrorBanner message={error} />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 gap-2 border-t border-border bg-surface p-3 sm:p-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          <Send size={15} />
          <span className="hidden sm:inline">{sending ? "Sending..." : "Send"}</span>
        </button>
      </form>
    </div>
  );
}
