import { type FormEvent, useEffect, useState } from "react";
import { Plus, Ticket as TicketIcon, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createTicket, fetchMyTickets } from "../store/slices/ticketSlice";
import type { TicketPriority } from "../types";
import { PageHeader } from "../components/ui/PageHeader";
import { SkeletonList } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorBanner } from "../components/ui/ErrorState";
import { Badge } from "../components/ui/Badge";
import { priorityTone, ticketStatusTone } from "../utils/statusTone";

export function TicketsPage() {
  const dispatch = useAppDispatch();
  const { myTickets, status, creating, error } = useAppSelector((s) => s.tickets);

  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");

  useEffect(() => {
    dispatch(fetchMyTickets());
  }, [dispatch]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createTicket({ subject, description, priority }));
    if (createTicket.fulfilled.match(result)) {
      setSubject("");
      setDescription("");
      setPriority("MEDIUM");
      setShowForm(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="My Tickets"
        description="Track support requests you've raised."
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex h-9 items-center gap-2 rounded-md bg-accent px-3 text-sm font-medium text-white hover:bg-accent-hover"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "New ticket"}
          </button>
        }
      />

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted">Subject</label>
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted">Description</label>
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent sm:w-auto"
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
            className="h-9 rounded-md bg-accent px-4 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create ticket"}
          </button>
        </form>
      )}

      {error && <ErrorBanner message={error} />}

      {status === "loading" ? (
        <SkeletonList rows={3} />
      ) : myTickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No tickets yet"
          description="Create a ticket if you need help with something specific."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {myTickets.map((t) => (
            <div key={t._id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-text">{t.subject}</p>
                <Badge tone={ticketStatusTone[t.status]}>{t.status.replace("_", " ")}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">{t.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <Badge tone={priorityTone[t.priority]}>{t.priority}</Badge>
                <span className="text-xs text-muted">{new Date(t.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
