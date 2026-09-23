import { useEffect } from "react";
import { Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCustomers } from "../store/slices/customerSlice";
import { PageHeader } from "../components/ui/PageHeader";
import { SkeletonList } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorBanner } from "../components/ui/ErrorState";
import { Avatar } from "../components/ui/Avatar";

export function SupportCustomersPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.customers);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader title="Customers" description="Everyone with a customer account." />

      {error && <ErrorBanner message={error} />}

      {status === "loading" ? (
        <SkeletonList rows={4} />
      ) : items.length === 0 ? (
        <EmptyState icon={Users} title="No customers yet" />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-2.5">Customer</th>
                <th className="hidden px-4 py-2.5 sm:table-cell">Joined</th>
                <th className="px-4 py-2.5 text-right">Orders</th>
                <th className="px-4 py-2.5 text-right">Tickets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} size={30} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-text">{c.name}</p>
                        <p className="truncate text-xs text-muted">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted sm:table-cell">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right text-text">{c.orderCount}</td>
                  <td className="px-4 py-3 text-right text-text">{c.ticketCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
