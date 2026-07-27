"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LayoutDashboard, PawPrint, UserCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const nav = [
  { label: "Accueil", href: "/account", icon: LayoutDashboard, exact: true },
  {
    label: "Trouver un éducateur",
    href: "/account/educateurs",
    icon: GraduationCap,
  },
  { label: "Mes chiens", href: "/account/chiens", icon: PawPrint },
  { label: "Mon profil", href: "/account/profil", icon: UserCircle },
];

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r border-border bg-sidebar px-4 py-6 md:flex">
      <div className="px-2">
        <p className="text-base font-bold tracking-tight">DogLib</p>
        <p className="text-xs text-muted-foreground">Espace propriétaire</p>
      </div>
      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
