import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Ticket, TicketStatus } from "../types";
import * as ticketService from "../services/ticketService";
import { getErrorMessage } from "../services/api";

const statusOptions: TicketStatus[] = ["OPEN", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED"];

export function SupportTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ticketService
      .getAllTickets()
      .then((tickets) => {
        const found = tickets.find((t) => t._id === id);
        if (!found) {
          setError("Ticket not found");
          return;
        }
        setTicket(found);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status: TicketStatus) => {
    if (!ticket) return;
    setSaving(true);
    try {
      const updated = await ticketService.updateTicket(ticket._id, { status });
      setTicket({ ...updated, customerId: ticket.customerId });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading...</div>;
  if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;
  if (!ticket) return null;

  const customer = typeof ticket.customerId === "object" ? ticket.customerId : null;

  return (
    <div className="p-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-indigo-600 hover:underline">
        ← Back
      </button>

      <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">{ticket.subject}</h1>
        {customer && (
          <p className="mt-1 text-sm text-slate-500">
            {customer.name} · {customer.email}
          </p>
        )}

        <p className="mt-4 text-sm text-slate-700">{ticket.description}</p>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="text-slate-500">Priority: <span className="font-medium text-slate-900">{ticket.priority}</span></span>
          <span className="text-slate-500">Created: {new Date(ticket.createdAt).toLocaleString()}</span>
        </div>

        <div className="mt-6">
          <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
          <select
            value={ticket.status}
            disabled={saving}
            onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
