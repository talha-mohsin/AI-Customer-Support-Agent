import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchAllTickets } from "../store/slices/ticketSlice";
import type { Ticket, TicketStatus } from "../types";
import { PageHeader } from "../components/ui/PageHeader";
import { Skeleton } from "../components/ui/Skeleton";
import { ErrorBanner } from "../components/ui/ErrorState";
import { Badge } from "../components/ui/Badge";
import { priorityTone } from "../utils/statusTone";

const columns: { status: TicketStatus; label: string; dot: string }[] = [
  { status: "OPEN", label: "Open", dot: "bg-info" },
  { status: "ESCALATED", label: "Escalated", dot: "bg-warning" },
  { status: "IN_PROGRESS", label: "In progress", dot: "bg-accent" },
  { status: "RESOLVED", label: "Resolved", dot: "bg-success" },
];

export function SupportTicketsPage() {
  const dispatch = useAppDispatch();
  const { allTickets, status, error } = useAppSelector((s) => s.tickets);

  useEffect(() => {
    dispatch(fetchAllTickets());
  }, [dispatch]);

  const grouped = useMemo(() => {
    const map: Record<TicketStatus, Ticket[]> = {
      OPEN: [],
      IN_PROGRESS: [],
      ESCALATED: [],
      RESOLVED: [],
      CLOSED: [],
    };
    for (const t of allTickets) map[t.status].push(t);
    return map;
  }, [allTickets]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader title="Support Tickets" description="All customer tickets, grouped by status." />

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => (
          <div key={col.status} className="rounded-lg border border-border bg-surface p-3">
            <div className="mb-3 flex items-center gap-2 px-1">
              <span className={`h-2 w-2 rounded-full ${col.dot}`} />
              <h2 className="text-sm font-semibold text-text">{col.label}</h2>
              <span className="ml-auto text-xs font-medium text-muted">{grouped[col.status].length}</span>
            </div>

            <div className="flex flex-col gap-2">
              {status === "loading" ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : grouped[col.status].length === 0 ? (
                <div className="flex flex-col items-center gap-1 rounded-md border border-dashed border-border px-3 py-6 text-center">
                  <Inbox size={16} className="text-muted" />
                  <p className="text-xs text-muted">No tickets</p>
                </div>
              ) : (
                grouped[col.status].map((t) => {
                  const customer = typeof t.customerId === "object" ? t.customerId : null;
                  return (
                    <Link
                      key={t._id}
                      to={`/support/tickets/${t._id}`}
                      className="block rounded-md border border-border bg-bg p-3 text-sm transition-colors hover:border-accent/40"
                    >
                      <p className="font-medium text-text">{t.subject}</p>
                      {customer && <p className="mt-0.5 text-xs text-muted">{customer.name}</p>}
                      <div className="mt-2">
                        <Badge tone={priorityTone[t.priority]}>{t.priority}</Badge>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
