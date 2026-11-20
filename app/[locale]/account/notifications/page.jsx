"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MoreHorizontal,
  Bell,
  ArrowRightToLine,
  ArrowLeftToLine,
  CheckCheck,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/lib/actions/notifications";

const Panel = ({ className, children }) => (
  <div
    className={cn(
      "rounded-2xl border border-accent/10 bg-surface-raised shadow-sm",
      className
    )}
  >
    {children}
  </div>
);

const PAGE_SIZE = 10;

const notifTitle = (n) => n.title || n.message || n.body || "Notification";
const notifBody = (n) =>
  n.title ? n.message || n.body || "" : n.title ? "" : n.body || "";
const isUnread = (n) => !(n.read ?? n.isRead ?? false);
const notifTime = (n) => {
  const d = n.createdAt || n.created_at;
  if (!d) return "";
  try {
    return formatDistanceToNow(new Date(d), { addSuffix: true });
  } catch {
    return "";
  }
};

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async (targetPage) => {
    setLoading(true);
    const res = await fetchNotifications(targetPage, PAGE_SIZE);
    if (res.success) {
      setItems(res.notifications);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || res.notifications.length);
      setUnread(res.unread || 0);
      setPage(res.page || targetPage);
    } else {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleMarkRead = async (id) => {
    setItems((prev) =>
      prev.map((n) => ((n._id || n.id) === id ? { ...n, read: true } : n))
    );
    setUnread((u) => Math.max(0, u - 1));
    const res = await markNotificationAsRead(id);
    if (!res.success) toast.error("Couldn't mark as read");
  };

  const handleMarkAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    const res = await markAllNotificationsAsRead();
    if (res.success) toast.success("All marked as read");
    else toast.error("Couldn't mark all as read");
  };

  const handleDelete = async (id) => {
    const prev = items;
    setItems((p) => p.filter((n) => (n._id || n.id) !== id));
    const res = await deleteNotification(id);
    if (!res.success) {
      setItems(prev);
      toast.error("Couldn't delete notification");
    }
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <PageHeader
          icon={Bell}
          title="Notifications"
          subtitle={
            unread > 0 ? `${unread} unread` : "You're all caught up"
          }
          actions={
            unread > 0 && (
              <button
                onClick={handleMarkAll}
                className={cn(
                  poppins_500,
                  "inline-flex items-center gap-1.5 rounded-full border border-accent/15 bg-surface px-4 py-2 text-sm text-ink transition-colors hover:border-secondary/40 hover:text-accent"
                )}
              >
                <CheckCheck className="h-4 w-4 text-accent" />
                Mark all read
              </button>
            )
          }
        />

        {/* List */}
        <Panel className="overflow-hidden">
          <div className="border-b border-accent/10 p-5 sm:p-6">
            <h2 className={cn(poppins_600, "text-lg text-ink")}>
              Recent activity
            </h2>
            <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
              Your latest updates from across DeenBridge
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/15 to-highlight/10">
                <Bell className="h-6 w-6 text-accent" />
              </div>
              <p className={cn(poppins_500, "text-ink")}>No notifications yet</p>
              <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
                Updates about courses, messages, and spaces will show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-accent/10">
              {items.map((n) => {
                const id = n._id || n.id;
                const unreadRow = isUnread(n);
                return (
                  <li
                    key={id}
                    className={cn(
                      "flex items-start gap-3 p-4 transition-colors hover:bg-secondary/5 sm:px-6",
                      unreadRow && "bg-secondary/[0.04]"
                    )}
                  >
                    <div className="relative mt-0.5">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/15 to-highlight/10">
                        <Bell className="h-4 w-4 text-accent" />
                      </div>
                      {unreadRow && (
                        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-surface-raised bg-secondary" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          unreadRow ? poppins_600 : poppins_500,
                          "text-sm text-ink"
                        )}
                      >
                        {notifTitle(n)}
                      </p>
                      {notifBody(n) && (
                        <p
                          className={cn(
                            poppins_400,
                            "mt-0.5 line-clamp-2 text-sm text-ink-muted"
                          )}
                        >
                          {notifBody(n)}
                        </p>
                      )}
                      <p
                        className={cn(
                          poppins_400,
                          "mt-1 text-xs text-ink-muted/80"
                        )}
                      >
                        {notifTime(n)}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          aria-haspopup="true"
                          className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-accent/10 hover:text-ink"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {unreadRow && (
                          <DropdownMenuItem onClick={() => handleMarkRead(id)}>
                            Mark as read
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && items.length > 0 && (
            <div className="flex items-center justify-between gap-3 border-t border-accent/10 p-4 sm:px-6">
              <div className={cn(poppins_400, "text-xs text-ink-muted")}>
                Showing{" "}
                <strong className={cn(poppins_600, "text-ink")}>
                  {rangeStart}-{rangeEnd}
                </strong>{" "}
                of <strong className={cn(poppins_600, "text-ink")}>{total}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={page <= 1}
                  onClick={() => load(page - 1)}
                  className="flex size-8 items-center justify-center rounded-lg border border-accent/15 bg-surface text-ink-muted transition-colors hover:border-secondary/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeftToLine size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={page >= totalPages}
                  onClick={() => load(page + 1)}
                  className="flex size-8 items-center justify-center rounded-lg border border-accent/15 bg-surface text-ink-muted transition-colors hover:border-secondary/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowRightToLine size={16} />
                </button>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
