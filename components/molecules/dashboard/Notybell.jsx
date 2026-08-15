// NOT YET WIRED UP: SSE-backed bell built on hooks/useNotificationSSE.js.
// The bell currently rendered in the nav is components/atoms/dashboard/Notybell.jsx.
// Retained deliberately - this is the intended replacement, not dead code.
"use client";

import React, { useState } from "react";
import { Bell, Check, Trash2, RefreshCw } from "lucide-react";
import { useNotificationSSE } from "@/hooks/useNotificationSSE";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    show: false,
    notificationId: null,
  });

  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    reconnect,
  } = useNotificationSSE();

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Handle navigation based on notification type
    if (notification.data?.courseId) {
      window.location.href = `/dashboard/courses/${notification.data.courseId}`;
    } else if (notification.data?.bookId) {
      window.location.href = `/dashboard/library/${notification.data.bookId}`;
    } else if (notification.data?.spaceId) {
      window.location.href = `/dashboard/spaces/${notification.data.spaceId}`;
    } else if (notification.data?.reelId) {
      window.location.href = `/dashboard/reels`;
    }

    setIsOpen(false);
  };

  const handleDeleteNotification = async () => {
    if (deleteDialog.notificationId) {
      await deleteNotification(deleteDialog.notificationId);
      setDeleteDialog({ show: false, notificationId: null });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "follow":
      case "unfollow":
        return "👥";
      case "new_course":
        return "📚";
      case "new_book":
        return "📖";
      case "course_like":
      case "book_like":
        return "❤️";
      case "course_comment":
      case "book_comment":
        return "💬";
      case "system":
        return "⚙️";
      case "welcome":
        return "🎉";
      case "recommendation":
        return "💡";
      default:
        return "🔔";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "medium":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "low":
        return "text-accent bg-secondary/10 border-secondary/20";
      default:
        return "text-ink-muted bg-surface border-accent/15";
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative text-accent">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1.5 w-5 h-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 9999 ? "9+" : unreadCount}
              </Badge>
            )}
            {!isConnected && (
              <div className="absolute -bottom-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-80 max-h-96 overflow-y-auto rounded-2xl border border-accent/10 bg-surface-raised shadow-sm"
        >
          <DropdownMenuLabel
            className={cn(
              poppins_600,
              "flex items-center justify-between text-ink"
            )}
          >
            <span>Notifications</span>
            <div className="flex items-center gap-2">
              {!isConnected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    reconnect();
                  }}
                  className="h-6 w-6 p-0 text-accent"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className={cn(
                    poppins_500,
                    "h-6 text-xs text-secondary hover:text-highlight"
                  )}
                >
                  Mark all read
                </Button>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-accent/10" />

          {isLoading ? (
            <div
              className={cn(
                poppins_400,
                "p-4 text-center text-ink-muted"
              )}
            >
              Loading notifications...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">
              <p className={cn(poppins_400, "text-sm")}>{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  reconnect();
                }}
                className="mt-2 border-accent/15"
              >
                Retry
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div
              className={cn(
                poppins_400,
                "p-4 text-center text-ink-muted"
              )}
            >
              {" "}
              <Bell className="h-8 w-8 mx-auto mb-2 text-accent" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <>
              {notifications.slice(0, 10).map((notification) => (
                <DropdownMenuItem
                  key={notification._id}
                  className={cn(
                    "flex items-start gap-3 p-3 cursor-pointer rounded-xl focus:bg-secondary/5",
                    !notification.isRead && "bg-secondary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0">
                    {notification.sender?.avatar ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={notification.sender.avatar} />
                        <AvatarFallback
                          className={cn(poppins_500, "bg-surface text-ink")}
                        >
                          {notification.sender.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 rounded-full border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10 flex items-center justify-center text-sm">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          poppins_500,
                          "text-sm text-ink line-clamp-1",
                          !notification.isRead && poppins_600
                        )}
                      >
                        {notification.title}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          poppins_500,
                          "text-xs px-1 py-0 h-4",
                          getPriorityColor(notification.priority)
                        )}
                      >
                        {notification.priority}
                      </Badge>
                    </div>

                    <p
                      className={cn(
                        poppins_400,
                        "text-xs text-ink-muted line-clamp-2 mt-1"
                      )}
                    >
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={cn(poppins_400, "text-xs text-ink-muted")}
                      >
                        {formatTime(notification.createdAt)}
                      </span>

                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification._id);
                            }}
                            className="h-6 w-6 p-0 text-secondary hover:text-highlight"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDialog({
                              show: true,
                              notificationId: notification._id,
                            });
                          }}
                          className="h-6 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}

              {notifications.length > 10 && (
                <>
                  <DropdownMenuSeparator className="bg-accent/10" />
                  <DropdownMenuItem
                    className={cn(
                      poppins_500,
                      "text-center text-sm text-secondary hover:text-highlight cursor-pointer"
                    )}
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = "/account/notifications";
                    }}
                  >
                    View all notifications ({notifications.length})
                  </DropdownMenuItem>
                </>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.show}
        onOpenChange={(open) =>
          setDeleteDialog({ show: open, notificationId: null })
        }
      >
        <AlertDialogContent className="rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className={cn(poppins_600, "text-ink")}>
              Delete Notification
            </AlertDialogTitle>
            <AlertDialogDescription
              className={cn(poppins_400, "text-ink-muted")}
            >
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={cn(poppins_500, "border-accent/15")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNotification}
              className={cn(poppins_500, "bg-red-600 text-white hover:bg-red-700")}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NotificationBell;
