import { type FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Message } from "../types";
import * as chatService from "../services/chatService";
import { getErrorMessage } from "../services/api";

export function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationId = searchParams.get("id") ?? undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(Boolean(conversationId));
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoadingHistory(false);
      return;
    }
    setLoadingHistory(true);
    chatService
      .getConversation(conversationId)
      .then((conversation) => setMessages(conversation.messages))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoadingHistory(false));
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);
    setError("");

    try {
      const res = await chatService.sendMessage(userMessage.content, conversationId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.message, createdAt: new Date().toISOString() },
      ]);
      if (!conversationId) {
        setSearchParams({ id: res.conversationId });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-slate-200 bg-white px-8 py-4">
        <h1 className="text-lg font-semibold text-slate-900">Support Chat</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loadingHistory ? (
          <p className="text-sm text-slate-500">Loading conversation...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-slate-500">
            Ask about order status, refund/shipping policies, or request a human agent.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-xl rounded-lg px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-800"
                }`}
              >
                {m.content}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {error && <p className="px-8 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 bg-white p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
