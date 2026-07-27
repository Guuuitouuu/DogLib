"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Download,
  TrendingUp,
} from "lucide-react";

import { formatPriceEurosFromCents } from "@/lib/format-price";
import { cn } from "@/lib/utils";
import type {
  EducatorBillingOverview,
  EducatorInvoiceStatus,
} from "@/types/educator-billing";

const statusStyles: Record<EducatorInvoiceStatus, string> = {
  payee: "bg-accent text-accent-foreground",
  en_attente: "bg-secondary text-secondary-foreground",
  en_retard: "bg-destructive/10 text-destructive",
};

const statusIcon: Record<EducatorInvoiceStatus, typeof CheckCircle2> = {
  payee: CheckCircle2,
  en_attente: Clock3,
  en_retard: AlertCircle,
};

const statusLabels: Record<EducatorInvoiceStatus, string> = {
  payee: "Encaissée",
  en_attente: "À venir",
  en_retard: "En retard",
};

const filters: { value: EducatorInvoiceStatus | "toutes"; label: string }[] = [
  { value: "toutes", label: "Toutes" },
  { value: "payee", label: "Encaissées" },
  { value: "en_attente", label: "À venir" },
  { value: "en_retard", label: "En retard" },
];

type BillingTableProps = {
  overview: EducatorBillingOverview;
};

export function BillingTable({ overview }: BillingTableProps) {
  const [filter, setFilter] = useState<EducatorInvoiceStatus | "toutes">(
    "toutes",
  );

  const visible = useMemo(
    () =>
      overview.invoices.filter(
        (i) => filter === "toutes" || i.status === filter,
      ),
    [filter, overview.invoices],
  );

  const stats = [
    {
      label: "Facturé ce mois",
      value: formatPriceEurosFromCents(overview.totalCents),
      icon: TrendingUp,
      tone: "text-primary",
    },
    {
      label: "Encaissé",
      value: formatPriceEurosFromCents(overview.paidCents),
      icon: CheckCircle2,
      tone: "text-accent-foreground",
    },
    {
      label: "À venir",
      value: formatPriceEurosFromCents(overview.pendingCents),
      icon: Clock3,
      tone: "text-muted-foreground",
    },
    {
      label: "En retard",
      value: formatPriceEurosFromCents(overview.lateCents),
      icon: AlertCircle,
      tone: "text-destructive",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <s.icon className={cn("size-4", s.tone)} />
            </div>
            <p className="mt-2 text-xl font-bold tracking-tight text-foreground">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Vue basée sur vos séances du mois (Paris). Les paiements Stripe
        Connect arriveront ensuite.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === f.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="hidden grid-cols-12 gap-4 border-b border-border bg-secondary/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <span className="col-span-2">Réf.</span>
          <span className="col-span-3">Client</span>
          <span className="col-span-3">Prestation</span>
          <span className="col-span-2">Statut</span>
          <span className="col-span-2 text-right">Montant</span>
        </div>

        <ul className="divide-y divide-border">
          {visible.map((inv) => {
            const Icon = statusIcon[inv.status];
            return (
              <li
                key={inv.id}
                className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-secondary/40 md:grid-cols-12 md:items-center"
              >
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-foreground">
                    {inv.number}
                  </p>
                  <p className="text-xs text-muted-foreground">{inv.dateLabel}</p>
                </div>

                <div className="col-span-3 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {inv.clientName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {inv.dogName}
                  </p>
                </div>

                <div className="col-span-3">
                  <span className="text-sm text-foreground">{inv.service}</span>
                </div>

                <div className="col-span-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                      statusStyles[inv.status],
                    )}
                  >
                    <Icon className="size-3.5" />
                    {statusLabels[inv.status]}
                  </span>
                </div>

                <div className="col-span-2 flex items-center justify-between gap-2 md:justify-end">
                  <span className="text-sm font-bold text-foreground">
                    {formatPriceEurosFromCents(inv.amountCents)}
                  </span>
                  <Link
                    href={inv.bookingHref}
                    aria-label={`Voir la séance ${inv.number}`}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Download className="size-4" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>

        {visible.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Aucune ligne de facturation ce mois-ci.
          </p>
        ) : null}
      </div>
    </div>
  );
}
