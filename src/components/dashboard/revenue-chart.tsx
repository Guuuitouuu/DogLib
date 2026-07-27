import { formatPriceEurosFromCents } from "@/lib/format-price";
import type { EducatorRevenueMonth } from "@/types/educator-billing";

type RevenueChartProps = {
  months: EducatorRevenueMonth[];
};

export function RevenueChart({ months }: RevenueChartProps) {
  const max = Math.max(1, ...months.map((r) => r.valueEuros));
  const total = months.reduce((sum, r) => sum + r.valueEuros, 0);

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Revenus
          </h2>
          <p className="text-sm text-muted-foreground">
            6 derniers mois · séances terminées
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {formatPriceEurosFromCents(total * 100)}
          </p>
          <p className="text-xs text-muted-foreground">Total encaissé</p>
        </div>
      </div>

      {months.every((m) => m.valueEuros === 0) ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Aucun revenu enregistré sur la période.
        </p>
      ) : (
        <div className="mt-8 flex h-52 gap-3">
          {months.map((r, i) => {
            const isLast = i === months.length - 1;
            const height = Math.round((r.valueEuros / max) * 100);
            return (
              <div
                key={r.key}
                className="flex flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-xs font-semibold text-foreground">
                  {r.valueEuros >= 1000
                    ? `${(r.valueEuros / 1000).toFixed(1)}k`
                    : r.valueEuros}
                </span>
                <div
                  className={
                    "w-full rounded-t-xl transition-all " +
                    (isLast ? "bg-primary" : "bg-primary/25")
                  }
                  style={{ height: `${Math.max(height, r.valueEuros > 0 ? 4 : 0)}%` }}
                  role="img"
                  aria-label={`${r.month} : ${r.valueEuros} euros`}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {r.month}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-primary" /> Mois en cours
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-primary/25" /> Mois précédents
        </span>
      </div>
    </section>
  );
}
