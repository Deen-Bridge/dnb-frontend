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
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
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
          <Button variant="ghost" size="icon" className="relative">
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
          className="w-80 max-h-96 overflow-y-auto"
        >
          <DropdownMenuLabel className="flex items-center justify-between">
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
                  className="h-6 w-6 p-0"
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
                  className="h-6 text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">
              <p className="text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  reconnect();
                }}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {" "}
              <Bell className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <>
              {notifications.slice(0, 10).map((notification) => (
                <DropdownMenuItem
                  key={notification._id}
                  className={cn(
                    "flex items-start gap-3 p-3 cursor-pointer",
                    !notification.isRead && "bg-muted/50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0">
                    {notification.sender?.avatar ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={notification.sender.avatar} />
                        <AvatarFallback>
                          {notification.sender.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm font-medium line-clamp-1",
                          !notification.isRead && "font-semibold"
                        )}
                      >
                        {notification.title}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs px-1 py-0 h-4",
                          getPriorityColor(notification.priority)
                        )}
                      >
                        {notification.priority}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
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
                            className="h-6 w-6 p-0"
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
                          className="h-6 text-red-50 hover:text-red-700"
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-center text-sm text-muted-foreground cursor-pointer"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNotification}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NotificationBell;
