import { type FormEvent, useEffect, useState } from "react";
import type { Ticket, TicketPriority } from "../types";
import * as ticketService from "../services/ticketService";
import { getErrorMessage } from "../services/api";

const statusStyles: Record<Ticket["status"], string> = {
  OPEN: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-purple-50 text-purple-700",
  ESCALATED: "bg-amber-50 text-amber-700",
  RESOLVED: "bg-green-50 text-green-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    ticketService
      .getMyTickets()
      .then(setTickets)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await ticketService.createTicket(subject, description, priority);
      setSubject("");
      setDescription("");
      setPriority("MEDIUM");
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900">My Tickets</h1>

      <form
        onSubmit={handleCreate}
        className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-700">Subject</label>
          <input
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-700">Description</label>
          <input
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {creating ? "Creating..." : "Create ticket"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-4 text-sm text-slate-500">Loading...</p>}

      <div className="mt-4 flex flex-col gap-2">
        {tickets.map((t) => (
          <div
            key={t._id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-900">{t.subject}</p>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[t.status]}`}>
                {t.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{t.description}</p>
            <p className="mt-2 text-xs text-slate-400">
              Priority: {t.priority} · {new Date(t.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
