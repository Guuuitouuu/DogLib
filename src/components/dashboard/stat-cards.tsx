import { CalendarCheck, Users, Wallet, TrendingUp, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
  {
    label: "Séances cette semaine",
    value: "18",
    delta: "+3",
    hint: "vs semaine dernière",
    icon: CalendarCheck,
    tone: "primary" as const,
  },
  {
    label: "Nouveaux clients",
    value: "6",
    delta: "+2",
    hint: "ce mois-ci",
    icon: Users,
    tone: "accent" as const,
  },
  {
    label: "Revenus du mois",
    value: "3 820 €",
    delta: "+17 %",
    hint: "objectif 4 000 €",
    icon: Wallet,
    tone: "primary" as const,
  },
  {
    label: "Taux de réussite",
    value: "92 %",
    delta: "+4 pts",
    hint: "objectifs atteints",
    icon: TrendingUp,
    tone: "accent" as const,
  },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-xl",
                stat.tone === "primary"
                  ? "bg-primary/12 text-primary"
                  : "bg-accent text-accent-foreground",
              )}
            >
              <stat.icon className="size-5" />
            </span>
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
                stat.tone === "primary"
                  ? "bg-primary/12 text-primary"
                  : "bg-accent text-accent-foreground",
              )}
            >
              <ArrowUpRight className="size-3.5" />
              {stat.delta}
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
          <p className="mt-1 text-sm font-medium text-foreground">{stat.label}</p>
          <p className="text-xs text-muted-foreground">{stat.hint}</p>
        </div>
      ))}
    </div>
  )
}
