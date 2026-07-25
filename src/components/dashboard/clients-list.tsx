import { ChevronRight } from "lucide-react"
import { clients } from "@/lib/data"

export function ClientsList() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Suivi des élèves</h2>
          <p className="text-sm text-muted-foreground">Progression des programmes en cours</p>
        </div>
        <button className="flex items-center gap-1 text-sm font-semibold text-primary transition-opacity hover:opacity-80">
          Tout voir
          <ChevronRight className="size-4" />
        </button>
      </div>

      <ul className="mt-5 flex flex-col divide-y divide-border">
        {clients.map((c) => (
          <li key={c.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <img
              src={c.photo || "/placeholder.svg"}
              alt={`Photo de ${c.dogName}`}
              className="size-12 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {c.dogName}{" "}
                <span className="font-normal text-muted-foreground">· {c.breed}</span>
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {c.ownerName} — {c.program}
              </p>
            </div>

            <div className="hidden w-36 shrink-0 sm:block">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Progression</span>
                <span className="text-xs font-semibold text-foreground">{c.progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-chart-2"
                  style={{ width: `${c.progress}%` }}
                />
              </div>
            </div>

            <div className="hidden w-24 shrink-0 text-right md:block">
              <p className="text-xs text-muted-foreground">Prochaine</p>
              <p className="text-sm font-semibold text-foreground">{c.nextSession}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
