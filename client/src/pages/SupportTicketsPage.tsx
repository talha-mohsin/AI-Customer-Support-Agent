import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Ticket, TicketStatus } from "../types";
import * as ticketService from "../services/ticketService";
import { getErrorMessage } from "../services/api";

const columns: TicketStatus[] = ["OPEN", "ESCALATED", "IN_PROGRESS", "RESOLVED"];

const columnStyles: Record<TicketStatus, string> = {
  OPEN: "border-blue-200",
  ESCALATED: "border-amber-200",
  IN_PROGRESS: "border-purple-200",
  RESOLVED: "border-green-200",
  CLOSED: "border-slate-200",
};

export function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    ticketService
      .getAllTickets()
      .then(setTickets)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map: Record<TicketStatus, Ticket[]> = {
      OPEN: [],
      IN_PROGRESS: [],
      ESCALATED: [],
      RESOLVED: [],
      CLOSED: [],
    };
    for (const t of tickets) map[t.status].push(t);
    return map;
  }, [tickets]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900">Support Dashboard</h1>

      {loading && <p className="mt-4 text-sm text-slate-500">Loading...</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((status) => (
          <div key={status} className={`rounded-lg border-t-4 bg-white p-4 shadow-sm ${columnStyles[status]}`}>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">
              {status.replace("_", " ")} ({grouped[status].length})
            </h2>
            <div className="flex flex-col gap-2">
              {grouped[status].map((t) => {
                const customer = typeof t.customerId === "object" ? t.customerId : null;
                return (
                  <Link
                    key={t._id}
                    to={`/support/tickets/${t._id}`}
                    className="block rounded-md border border-slate-100 p-3 text-sm hover:bg-slate-50"
                  >
                    <p className="font-medium text-slate-900">{t.subject}</p>
                    {customer && <p className="text-xs text-slate-500">{customer.name}</p>}
                    <p className="mt-1 text-xs text-slate-400">Priority: {t.priority}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
