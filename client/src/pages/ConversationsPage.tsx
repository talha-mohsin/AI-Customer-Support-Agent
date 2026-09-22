import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Conversation } from "../types";
import * as chatService from "../services/chatService";
import { getErrorMessage } from "../services/api";

const statusStyles: Record<Conversation["status"], string> = {
  OPEN: "bg-blue-50 text-blue-700",
  ESCALATED: "bg-amber-50 text-amber-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

export function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    chatService
      .getConversations()
      .then(setConversations)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900">Conversations</h1>

      {loading && <p className="mt-4 text-sm text-slate-500">Loading...</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!loading && conversations.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">
          No conversations yet. <Link to="/chat" className="text-indigo-600 hover:underline">Start one</Link>.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {conversations.map((c) => (
          <Link
            key={c._id}
            to={`/chat?id=${c._id}`}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm hover:shadow-md"
          >
            <div>
              <p className="font-medium text-slate-900">{c.title}</p>
              <p className="text-xs text-slate-500">
                {new Date(c.updatedAt).toLocaleString()}
              </p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[c.status]}`}>
              {c.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
