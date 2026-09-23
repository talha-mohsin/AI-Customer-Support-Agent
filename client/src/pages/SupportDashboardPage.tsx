import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, Clock, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchAllTickets } from "../store/slices/ticketSlice";
import { fetchCustomers } from "../store/slices/customerSlice";
import { PageHeader } from "../components/ui/PageHeader";
import { Skeleton } from "../components/ui/Skeleton";
import { Badge } from "../components/ui/Badge";
import { priorityTone, ticketStatusTone } from "../utils/statusTone";
import { useAuth } from "../hooks/useAuth";

export function SupportDashboardPage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { allTickets, status } = useAppSelector((s) => s.tickets);
  const { items: customers, status: customerStatus } = useAppSelector((s) => s.customers);

  useEffect(() => {
    dispatch(fetchAllTickets());
    dispatch(fetchCustomers());
  }, [dispatch]);

  const loading = status === "loading" || customerStatus === "loading";

  const counts = useMemo(
    () => ({
      open: allTickets.filter((t) => t.status === "OPEN").length,
      escalated: allTickets.filter((t) => t.status === "ESCALATED").length,
      inProgress: allTickets.filter((t) => t.status === "IN_PROGRESS").length,
      resolved: allTickets.filter((t) => t.status === "RESOLVED").length,
    }),
    [allTickets]
  );

  const recentTickets = [...allTickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader title={`Welcome, ${user?.name?.split(" ")[0]}`} description="Here's what's happening with support today." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={Clock} label="Open" value={counts.open} tone="info" loading={loading} />
        <StatCard icon={AlertCircle} label="Escalated" value={counts.escalated} tone="warning" loading={loading} />
        <StatCard icon={Clock} label="In progress" value={counts.inProgress} tone="accent" loading={loading} />
        <StatCard icon={CheckCircle2} label="Resolved" value={counts.resolved} tone="success" loading={loading} />
        <StatCard icon={Users} label="Customers" value={customers.length} tone="neutral" loading={loading} />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Recent tickets</h2>
          <Link to="/support/tickets" className="text-sm font-medium text-accent hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : recentTickets.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-muted">
            No tickets yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2.5">Subject</th>
                  <th className="hidden px-4 py-2.5 sm:table-cell">Customer</th>
                  <th className="px-4 py-2.5">Priority</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTickets.map((t) => {
                  const customer = typeof t.customerId === "object" ? t.customerId : null;
                  return (
                    <tr key={t._id} className="cursor-default">
                      <td className="px-4 py-3">
                        <Link to={`/support/tickets/${t._id}`} className="font-medium text-text hover:text-accent">
                          {t.subject}
                        </Link>
                      </td>
                      <td className="hidden px-4 py-3 text-muted sm:table-cell">{customer?.name ?? "-"}</td>
                      <td className="px-4 py-3">
                        <Badge tone={priorityTone[t.priority]}>{t.priority}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={ticketStatusTone[t.status]}>{t.status.replace("_", " ")}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  loading,
}: {
  icon: typeof Clock;
  label: string;
  value: number;
  tone: "info" | "warning" | "accent" | "success" | "neutral";
  loading: boolean;
}) {
  const toneClasses: Record<typeof tone, string> = {
    info: "bg-info-soft text-info",
    warning: "bg-warning-soft text-warning",
    accent: "bg-accent-soft text-accent",
    success: "bg-success-soft text-success",
    neutral: "bg-surface-alt text-muted",
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
        <Icon size={16} />
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      {loading ? (
        <Skeleton className="mt-1 h-6 w-8" />
      ) : (
        <p className="text-xl font-semibold text-text">{value}</p>
      )}
    </div>
  );
}
