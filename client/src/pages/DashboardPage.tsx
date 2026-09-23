import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Ticket, History, ArrowRight, Package } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchMyOrders } from "../store/slices/orderSlice";
import { fetchMyTickets } from "../store/slices/ticketSlice";
import { Skeleton } from "../components/ui/Skeleton";
import { Badge } from "../components/ui/Badge";
import { ticketStatusTone } from "../utils/statusTone";

export function DashboardPage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { items: orders, status: orderStatus } = useAppSelector((s) => s.orders);
  const { myTickets, status: ticketStatus } = useAppSelector((s) => s.tickets);

  useEffect(() => {
    dispatch(fetchMyOrders());
    dispatch(fetchMyTickets());
  }, [dispatch]);

  const openTickets = myTickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS" || t.status === "ESCALATED");
  const loading = orderStatus === "loading" || ticketStatus === "loading";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl font-semibold text-text sm:text-2xl">Welcome back, {user?.name?.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-muted">Here's a quick look at your account.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Package} label="Orders" value={orders.length} loading={loading} />
        <StatCard icon={Ticket} label="Open tickets" value={openTickets.length} loading={loading} />
        <StatCard icon={Ticket} label="Total tickets" value={myTickets.length} loading={loading} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ActionCard
          to="/chat"
          icon={MessageSquare}
          title="Chat with support AI"
          description="Ask about orders, policies, or issues."
        />
        <ActionCard
          to="/tickets"
          icon={Ticket}
          title="My tickets"
          description="Track support requests you've raised."
        />
        <ActionCard
          to="/conversations"
          icon={History}
          title="Conversation history"
          description="Revisit past chats with the agent."
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Recent orders</h2>
          <Link to="/chat" className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
            Ask about an order <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : orders.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-muted">
            No orders yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2.5">Order</th>
                  <th className="hidden px-4 py-2.5 sm:table-cell">Status</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-3 font-medium text-text">{order.orderNumber}</td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <Badge tone="info">{order.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-text">${order.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {openTickets.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-text">Open tickets</h2>
          <div className="flex flex-col gap-2">
            {openTickets.slice(0, 3).map((t) => (
              <div key={t._id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
                <span className="text-sm font-medium text-text">{t.subject}</span>
                <Badge tone={ticketStatusTone[t.status]}>{t.status.replace("_", " ")}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Package;
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-6 w-10" />
        ) : (
          <p className="text-xl font-semibold text-text">{value}</p>
        )}
      </div>
    </div>
  );
}

function ActionCard({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: string;
  icon: typeof MessageSquare;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent/40 hover:bg-accent-soft/40"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
        <Icon size={18} />
      </div>
      <h2 className="font-medium text-text">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </Link>
  );
}
