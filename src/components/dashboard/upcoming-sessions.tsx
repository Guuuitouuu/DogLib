import { MapPin, ChevronRight } from "lucide-react"
import { upcomingSessions, statusLabels, type SessionStatus } from "@/lib/data"
import { cn } from "@/lib/utils"

const statusStyles: Record<SessionStatus, string> = {
  confirmee: "bg-accent text-accent-foreground",
  en_attente: "bg-chart-3/20 text-chart-4",
  a_relancer: "bg-primary/12 text-primary",
}

export function UpcomingSessions() {
  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Séances du jour</h2>
          <p className="text-sm text-muted-foreground">Jeudi 25 juillet</p>
        </div>
        <button className="flex items-center gap-1 text-sm font-semibold text-primary transition-opacity hover:opacity-80">
          Agenda
          <ChevronRight className="size-4" />
        </button>
      </div>

      <ul className="mt-5 flex flex-col gap-3">
        {upcomingSessions.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-4 rounded-xl border border-border bg-background/60 p-3 transition-colors hover:border-primary/40"
          >
            <div className="flex flex-col items-center justify-center rounded-lg bg-secondary px-2.5 py-1.5">
              <span className="text-sm font-bold text-foreground">{s.time}</span>
            </div>
            <img
              src={s.photo || "/placeholder.svg"}
              alt={`Photo de ${s.dogName}`}
              className="size-11 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">{s.dogName}</p>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    statusStyles[s.status],
                  )}
                >
                  {statusLabels[s.status]}
                </span>
              </div>
              <p className="truncate text-sm text-foreground">{s.type}</p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{s.ownerName}</span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{s.location}</span>
                </span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
