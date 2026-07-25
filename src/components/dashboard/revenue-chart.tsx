import { revenue } from "@/lib/data"

export function RevenueChart() {
  const max = Math.max(...revenue.map((r) => r.value))
  const total = revenue.reduce((sum, r) => sum + r.value, 0)

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Revenus</h2>
          <p className="text-sm text-muted-foreground">6 derniers mois</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {total.toLocaleString("fr-FR")} €
          </p>
          <p className="text-xs text-muted-foreground">Total encaissé</p>
        </div>
      </div>

      <div className="mt-8 flex h-52 gap-3">
        {revenue.map((r, i) => {
          const isLast = i === revenue.length - 1
          const height = Math.round((r.value / max) * 100)
          return (
            <div
              key={r.month}
              className="flex flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="text-xs font-semibold text-foreground">
                {(r.value / 1000).toFixed(1)}k
              </span>
              <div
                className={
                  "w-full rounded-t-xl transition-all " +
                  (isLast ? "bg-primary" : "bg-primary/25")
                }
                style={{ height: `${height}%` }}
                role="img"
                aria-label={`${r.month} : ${r.value} euros`}
              />
              <span className="text-xs font-medium text-muted-foreground">{r.month}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-primary" /> Mois en cours
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-primary/25" /> Mois précédents
        </span>
      </div>
    </section>
  )
}
