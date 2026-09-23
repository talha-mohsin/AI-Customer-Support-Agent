import { useEffect } from "react";
import { Link } from "react-router-dom";
import { History, MessageSquarePlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchConversations } from "../store/slices/conversationSlice";
import { PageHeader } from "../components/ui/PageHeader";
import { SkeletonList } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorBanner } from "../components/ui/ErrorState";
import { Badge } from "../components/ui/Badge";
import { conversationStatusTone } from "../utils/statusTone";

export function ConversationsPage() {
  const dispatch = useAppDispatch();
  const { items, listStatus, error } = useAppSelector((s) => s.conversations);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Conversations"
        description="Revisit your past chats with the support agent."
        action={
          <Link
            to="/chat"
            className="flex h-9 items-center gap-2 rounded-md bg-accent px-3 text-sm font-medium text-white hover:bg-accent-hover"
          >
            <MessageSquarePlus size={16} />
            New chat
          </Link>
        }
      />

      {error && <ErrorBanner message={error} />}

      {listStatus === "loading" ? (
        <SkeletonList rows={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={History}
          title="No conversations yet"
          description="Start a chat with the support agent to see it here."
          action={
            <Link to="/chat" className="text-sm font-medium text-accent hover:underline">
              Start a conversation
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((c) => (
            <Link
              key={c._id}
              to={`/chat?id=${c._id}`}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-accent/40"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-text">{c.title}</p>
                <p className="text-xs text-muted">{new Date(c.updatedAt).toLocaleString()}</p>
              </div>
              <Badge tone={conversationStatusTone[c.status]}>{c.status}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
