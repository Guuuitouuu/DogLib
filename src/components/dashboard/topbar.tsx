import { Search, Bell, Plus, PawPrint } from "lucide-react"

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-border bg-background/85 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-8">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm lg:hidden">
          <PawPrint className="size-4" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">Bonjour Julie 👋</p>
          <h1 className="text-xl font-bold tracking-tight text-foreground text-balance">
            Voici votre journée
          </h1>
        </div>
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

        <button
          aria-label="Notifications"
          className="relative flex size-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
        >
          <Bell className="size-5" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary ring-2 ring-card" />
        </button>

        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nouvelle séance</span>
          <span className="sm:hidden">Séance</span>
        </button>

        <button
          aria-label="Mon profil"
          className="flex size-11 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground shadow-sm"
        >
          JM
        </button>
      </div>
    </header>
  )
}
