"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Plus, Search } from "lucide-react";

import { ClientTopbarUserMenu } from "@/components/client/client-topbar-user-menu";
import { splitPersonName } from "@/lib/person-name";

type ClientAccountTopbarProps = {
  featuredDogName?: string | null;
};

function titleForPath(pathname: string, featuredDogName: string | null): string {
  if (pathname === "/account") {
    return featuredDogName
      ? `Voici le suivi de ${featuredDogName}`
      : "Votre espace propriétaire";
  }
  if (pathname.startsWith("/account/chiens")) {
    return "Mes chiens";
  }
  if (pathname.startsWith("/account/reservations")) {
    return "Réservations";
  }
  if (pathname.startsWith("/account/educateurs")) {
    return "Éducateurs à proximité";
  }
  if (pathname.startsWith("/account/profil")) {
    return "Paramètres";
  }
  if (pathname.startsWith("/account/adresse")) {
    return "Mon adresse";
  }
  return "Espace client";
}

export function ClientAccountTopbar({
  featuredDogName = null,
}: ClientAccountTopbarProps) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const firstName = isLoaded
    ? user?.firstName?.trim() ||
      splitPersonName(user?.fullName ?? "").firstName ||
      null
    : null;
  const eyebrow = firstName ? `Bonjour ${firstName} 👋` : "Bonjour 👋";
  const title = titleForPath(pathname, featuredDogName);

  const actionClassName =
    "flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90";

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-border bg-background/85 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-8">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{eyebrow}</p>
          <h1 className="text-balance text-xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher un éducateur, une ville…"
            aria-label="Rechercher"
            className="w-56 rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 lg:w-72"
          />
        </div>

        <Link href="/account/educateurs" className={actionClassName}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">Réserver</span>
          <span className="sm:hidden">Réserver</span>
        </Link>

        <ClientTopbarUserMenu />
      </div>
    </header>
  );
}
