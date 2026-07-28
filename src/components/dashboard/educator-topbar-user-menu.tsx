"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { personInitials, splitPersonName } from "@/lib/person-name";
import { cn } from "@/lib/utils";

const menuItemClass =
  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground";

export function EducatorTopbarUserMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!isLoaded) {
    return (
      <span
        className="flex size-11 shrink-0 animate-pulse rounded-xl bg-muted"
        aria-hidden
      />
    );
  }

  if (!user) {
    return null;
  }

  const { firstName, lastName } = splitPersonName(user.fullName ?? "");
  const initials = personInitials(
    firstName || user.firstName || "",
    lastName || user.lastName || "",
  );
  const displayName =
    user.fullName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "Mon compte";
  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-label="Menu compte"
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent shadow-sm outline-none",
          "ring-offset-background transition-opacity hover:opacity-90",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        <Avatar className="size-11 rounded-xl after:rounded-xl">
          <AvatarImage
            src={user.imageUrl}
            alt=""
            className="rounded-xl object-cover"
          />
          <AvatarFallback className="rounded-xl bg-accent text-sm font-bold text-accent-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" sideOffset={8} className="w-60 p-1">
        <div className="border-b border-border px-2 py-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {displayName}
          </p>
          {email ? (
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          ) : null}
        </div>
        <nav className="flex flex-col p-1" aria-label="Compte">
          <Link
            href="/dashboard/parametres"
            className={menuItemClass}
            onClick={() => setOpen(false)}
          >
            <Settings className="size-4 shrink-0" aria-hidden />
            Paramètres
          </Link>
          <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
            <button type="button" className={menuItemClass}>
              <LogOut className="size-4 shrink-0" aria-hidden />
              Déconnexion
            </button>
          </SignOutButton>
        </nav>
      </PopoverContent>
    </Popover>
  );
}
