import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900">Welcome, {user?.name}</h1>
      <p className="mt-1 text-slate-500">What would you like to do today?</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          to="/chat"
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <h2 className="font-medium text-slate-900">Chat with support AI</h2>
          <p className="mt-1 text-sm text-slate-500">Ask about orders, policies, or issues.</p>
        </Link>
        <Link
          to="/tickets"
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <h2 className="font-medium text-slate-900">My tickets</h2>
          <p className="mt-1 text-sm text-slate-500">Track support requests you've raised.</p>
        </Link>
        <Link
          to="/conversations"
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <h2 className="font-medium text-slate-900">Conversation history</h2>
          <p className="mt-1 text-sm text-slate-500">Revisit past chats with the agent.</p>
        </Link>
      </div>
    </div>
  );
}
