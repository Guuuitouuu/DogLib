import {
  CalendarDays,
  CheckCircle2,
  CalendarCheck,
  ArrowUpRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  daysUntilParisDate,
  formatShortParisDate,
} from "@/lib/client-dashboard-home";
import type {
  ClientBookingItem,
  ClientDashboardSummary,
} from "@/types/client-dashboard";

type Tone = "primary" | "chart2" | "chart3";

const toneMap: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  chart2: "bg-chart-2/15 text-chart-2",
  chart3: "bg-chart-3/15 text-chart-3",
};

type ClientStatCardsProps = {
  summary: ClientDashboardSummary;
  nextUpcoming: ClientBookingItem | null;
};

export function ClientStatCards({ summary, nextUpcoming }: ClientStatCardsProps) {
  const daysUntil = nextUpcoming
    ? daysUntilParisDate(nextUpcoming.dateParis)
    : null;
  const trendLabel =
    daysUntil != null && daysUntil >= 0
      ? daysUntil === 0
        ? "Aujourd'hui"
        : `J-${daysUntil}`
      : undefined;

  const stats: {
    icon: React.ComponentType<{ className?: string }>;
    value: string;
    label: string;
    sub: string;
    trend?: string;
    tone: Tone;
  }[] = [
    {
      icon: CalendarDays,
      value: nextUpcoming
        ? formatShortParisDate(nextUpcoming.dateParis)
        : "—",
      label: "Prochaine réservation",
      sub: nextUpcoming
        ? `${nextUpcoming.serviceTitle} · ${nextUpcoming.timeParis}`
        : "Aucune réservation à venir",
      trend: trendLabel,
      tone: "primary",
    },
    {
      icon: CheckCircle2,
      value: String(summary.completedReservations),
      label: "Réservations terminées",
      sub:
        summary.totalReservations > 0
          ? `sur ${summary.totalReservations} au total`
          : "Commencez par réserver un créneau",
      tone: "chart2",
    },
    {
      icon: CalendarCheck,
      value: String(summary.totalReservations),
      label: "Réservations au total",
      sub: `${summary.dogsCount} chien${summary.dogsCount !== 1 ? "s" : ""} enregistré${summary.dogsCount !== 1 ? "s" : ""}`,
      tone: "chart3",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-3xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-2xl",
                  toneMap[stat.tone],
                )}
              >
                <Icon className="size-5" />
              </div>
              {stat.trend ? (
                <span className="flex items-center gap-0.5 rounded-full bg-secondary px-2 py-1 text-xs font-semibold text-foreground">
                  <ArrowUpRight className="size-3" />
                  {stat.trend}
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-2xl font-extrabold tracking-tight text-foreground">
              {stat.value}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {stat.label}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{stat.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
