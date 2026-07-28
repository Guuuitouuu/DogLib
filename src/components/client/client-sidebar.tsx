"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PawPrint,
  LayoutDashboard,
  Dog,
  CalendarDays,
  Settings,
  LifeBuoy,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  exact?: boolean;
  badge?: number | null;
};

const pilotage: Omit<NavItem, "badge">[] = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/account", exact: true },
  { label: "Mes chiens", icon: Dog, href: "/account/chiens" },
  { label: "Réservations", icon: CalendarDays, href: "/account/reservations" },
];

const secondary: Omit<NavItem, "badge">[] = [
  { label: "Paramètres", icon: Settings, href: "/account/profil" },
  { label: "Aide", icon: LifeBuoy, href: "/" },
];

type ClientSidebarProps = {
  dogsCount?: number;
  upcomingCount?: number;
};

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const pathOnly = item.href.split("#")[0] ?? item.href;
  const isHashLink = item.href.includes("#");
  const active = item.exact
    ? pathname === pathOnly
    : isHashLink
      ? false
      : pathname.startsWith(item.href);

  const Icon = item.icon;
  const showBadge = item.badge != null && item.badge > 0;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <Icon className="size-[18px] shrink-0" />
      <span className="flex-1 text-left">{item.label}</span>
      {showBadge ? (
        <span
          className={cn(
            "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
            active
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-secondary text-secondary-foreground",
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

export function ClientSidebar({
  dogsCount = 0,
  upcomingCount = 0,
}: ClientSidebarProps) {
  const navItems: NavItem[] = pilotage.map((item) => {
    if (item.href === "/account/chiens") {
      return { ...item, badge: dogsCount };
    }
    if (item.href === "/account/reservations") {
      return { ...item, badge: upcomingCount };
    }
    return item;
  });

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-sidebar">
      <Link href="/account" className="flex items-center gap-3 px-5 py-6">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <PawPrint className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-lg font-extrabold tracking-tight text-foreground">
            DogLib
          </p>
          <p className="text-xs text-muted-foreground">Espace client</p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Navigation
        </p>
        {navItems.map((item) => (
          <NavLink key={item.label} item={item} />
        ))}

        <div className="mx-3 my-4 h-px bg-border" />

        {secondary.map((item) => (
          <NavLink key={item.label} item={item} />
        ))}
      </nav>

      <div className="p-3">
        <div className="rounded-2xl bg-accent p-4 shadow-sm">
          <p className="text-sm font-semibold text-accent-foreground">
            Nouvelle réservation ?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-accent-foreground/80">
            Parcourez les éducateurs près de chez vous et réservez un créneau
            en ligne.
          </p>
          <Link
            href="/account/educateurs"
            className="mt-3 flex w-full items-center justify-center rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Trouver un éducateur
          </Link>
        </div>
      </div>
    </aside>
  );
}
