import {
  ArrowUpRight,
  CalendarCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import type { MonthlyStatsData } from "@/actions/educator";
import { cn } from "@/lib/utils";

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

type StatCardsProps = {
  stats: MonthlyStatsData | null;
};

export function StatCards({ stats }: StatCardsProps) {
  const completed = stats?.completedSessionsCount ?? 0;
  const dogs = stats?.distinctDogsCount ?? 0;
  const revenue = stats ? euroFormatter.format(stats.revenueCents / 100) : "—";
  const successRate =
    stats && stats.totalBookingsInPeriod > 0
      ? Math.round(
          (stats.completedSessionsCount / stats.totalBookingsInPeriod) * 100,
        )
      : null;

  const cards = [
    {
      label: "Séances terminées",
      value: stats ? String(completed) : "—",
      delta: stats ? `${completed}` : "—",
      hint: "depuis le 1er du mois (Paris)",
      icon: CalendarCheck,
      tone: "primary" as const,
    },
    {
      label: "Chiens suivis",
      value: stats ? String(dogs) : "—",
      delta: stats ? `${dogs}` : "—",
      hint: "chiens distincts ce mois",
      icon: Users,
      tone: "accent" as const,
    },
    {
      label: "Revenus du mois",
      value: revenue,
      delta: stats ? revenue : "—",
      hint: "séances terminées uniquement",
      icon: Wallet,
      tone: "primary" as const,
    },
    {
      label: "Taux de complétion",
      value: successRate !== null ? `${successRate} %` : "—",
      delta: successRate !== null ? `${successRate} %` : "—",
      hint: "terminées / séances du mois",
      icon: TrendingUp,
      tone: "accent" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((stat) => (
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
          <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            {stat.value}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">{stat.label}</p>
          <p className="text-xs text-muted-foreground">{stat.hint}</p>
        </div>
      ))}
    </div>
  );
}
