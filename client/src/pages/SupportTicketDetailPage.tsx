import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchAllTickets, updateTicket } from "../store/slices/ticketSlice";
import type { TicketStatus } from "../types";
import { Skeleton } from "../components/ui/Skeleton";
import { ErrorBanner } from "../components/ui/ErrorState";
import { Badge } from "../components/ui/Badge";
import { priorityTone } from "../utils/statusTone";

const statusOptions: TicketStatus[] = ["OPEN", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED"];

export function SupportTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { allTickets, status, error } = useAppSelector((s) => s.tickets);

  useEffect(() => {
    if (allTickets.length === 0) {
      dispatch(fetchAllTickets());
    }
  }, [dispatch, allTickets.length]);

  const ticket = allTickets.find((t) => t._id === id);

  const handleStatusChange = (nextStatus: TicketStatus) => {
    if (!ticket) return;
    dispatch(updateTicket({ id: ticket._id, updates: { status: nextStatus } }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      {error && <ErrorBanner message={error} />}

      {status === "loading" && !ticket ? (
        <div className="max-w-2xl rounded-lg border border-border bg-surface p-6">
          <Skeleton className="mb-3 h-6 w-1/2" />
          <Skeleton className="mb-2 h-4 w-1/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : !ticket ? (
        <p className="text-sm text-muted">Ticket not found.</p>
      ) : (
        <div className="max-w-2xl rounded-lg border border-border bg-surface p-6">
          <h1 className="text-xl font-semibold text-text">{ticket.subject}</h1>
          {typeof ticket.customerId === "object" && (
            <p className="mt-1 text-sm text-muted">
              {ticket.customerId.name} · {ticket.customerId.email}
            </p>
          )}

          <p className="mt-4 whitespace-pre-wrap text-sm text-text">{ticket.description}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              Priority: <Badge tone={priorityTone[ticket.priority]}>{ticket.priority}</Badge>
            </span>
            <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
          </div>

          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-text">Status</label>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
