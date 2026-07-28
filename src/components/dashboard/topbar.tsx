import Link from "next/link"
import { Search, Plus } from "lucide-react"

import { EducatorNotificationsBell } from "@/components/dashboard/educator-notifications-bell"
import { EducatorTopbarUserMenu } from "@/components/dashboard/educator-topbar-user-menu"

type TopbarProps = {
  title: string
  eyebrow?: string
  actionLabel?: string
  actionShortLabel?: string
  /** When set, the primary action is a navigation link. */
  actionHref?: string
}

export function Topbar({
  title,
  eyebrow = "Bonjour 👋",
  actionLabel = "Nouvelle réservation",
  actionShortLabel = "Réservation",
  actionHref,
}: TopbarProps) {
  const actionClassName =
    "flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-border bg-background/85 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-8">
      <div>
        <p className="text-sm text-muted-foreground">{eyebrow}</p>
        <h1 className="text-xl font-bold tracking-tight text-foreground text-balance">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher un client, un chien…"
            aria-label="Rechercher"
            className="w-56 rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 lg:w-72"
          />
        </div>

        <EducatorNotificationsBell />

        {actionHref ? (
          <Link href={actionHref} className={actionClassName}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">{actionLabel}</span>
            <span className="sm:hidden">{actionShortLabel}</span>
          </Link>
        ) : (
          <button type="button" className={actionClassName}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">{actionLabel}</span>
            <span className="sm:hidden">{actionShortLabel}</span>
          </button>
        )}

        <EducatorTopbarUserMenu />
      </div>
    </header>
  )
}
