"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Bell, Loader2 } from "lucide-react";

import {
  getEducatorNotifications,
  markAllEducatorNotificationsRead,
  markEducatorNotificationRead,
} from "@/actions/educator-notifications";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EDUCATOR_DASHBOARD_POLL_MS } from "@/lib/educator-dashboard-poll";
import { cn } from "@/lib/utils";
import type { EducatorNotificationItem } from "@/types/educator-notification";

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function EducatorNotificationsBell() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<EducatorNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    const result = await getEducatorNotifications();
    if (!result.success) {
      setError(result.error);
      return;
    }
    setError(null);
    setItems(result.data.items);
    setUnreadCount(result.data.unreadCount);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void load();
      }
    }, EDUCATOR_DASHBOARD_POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  function onMarkAllRead() {
    startTransition(async () => {
      const result = await markAllEducatorNotificationsRead();
      if (!result.success) {
        setError(result.error);
        return;
      }
      await load();
    });
  }

  function onOpenNotification(item: EducatorNotificationItem) {
    if (item.readAt) return;
    startTransition(async () => {
      await markEducatorNotificationRead({ notificationId: item.id });
      await load();
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-label={
          unreadCount > 0
            ? `Notifications (${unreadCount} non lues)`
            : "Notifications"
        }
        className="relative flex size-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
      >
        <Bell className="size-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-card">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[min(100vw-2rem,22rem)] p-0"
      >
        <PopoverHeader className="flex flex-row items-center justify-between gap-2 border-b border-border px-3 py-2.5">
          <PopoverTitle>Notifications</PopoverTitle>
          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              disabled={pending}
              onClick={onMarkAllRead}
            >
              Tout marquer lu
            </Button>
          ) : null}
        </PopoverHeader>
        <div className="max-h-80 overflow-y-auto">
          {error ? (
            <p className="px-3 py-4 text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {items.length === 0 && !error ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Aucune notification pour le moment.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id}>
                  <div
                    className={cn(
                      "px-3 py-3 text-left transition-colors hover:bg-muted/50",
                      !item.readAt && "bg-primary/5",
                    )}
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => onOpenNotification(item)}
                    >
                      <p className="text-xs font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 break-words text-xs text-muted-foreground">
                        {item.body}
                      </p>
                      <p className="mt-1.5 text-[10px] text-muted-foreground">
                        {formatRelative(item.createdAt)}
                      </p>
                    </button>
                    {item.bookingId ? (
                      <Link
                        href={`/dashboard/reservations/${item.bookingId}`}
                        className={buttonVariants({
                          variant: "link",
                          size: "sm",
                          className: "mt-1 h-auto px-0 text-xs",
                        })}
                        onClick={() => {
                          setOpen(false);
                          onOpenNotification(item);
                        }}
                      >
                        Voir la réservation
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {pending ? (
          <div className="flex justify-center border-t border-border py-2">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
