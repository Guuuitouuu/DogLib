"use client"

import { useState } from "react"
import { Download, CheckCircle2, Clock3, AlertCircle, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { invoices, invoiceStatusLabels, type InvoiceStatus } from "@/lib/data"

const statusStyles: Record<InvoiceStatus, string> = {
  payee: "bg-accent text-accent-foreground",
  en_attente: "bg-secondary text-secondary-foreground",
  en_retard: "bg-destructive/10 text-destructive",
}

const statusIcon: Record<InvoiceStatus, typeof CheckCircle2> = {
  payee: CheckCircle2,
  en_attente: Clock3,
  en_retard: AlertCircle,
}

const filters: { value: InvoiceStatus | "toutes"; label: string }[] = [
  { value: "toutes", label: "Toutes" },
  { value: "payee", label: "Payées" },
  { value: "en_attente", label: "En attente" },
  { value: "en_retard", label: "En retard" },
]

export function BillingTable() {
  const [filter, setFilter] = useState<InvoiceStatus | "toutes">("toutes")
  const visible = invoices.filter((i) => filter === "toutes" || i.status === filter)

  const total = invoices.reduce((s, i) => s + i.amount, 0)
  const paid = invoices.filter((i) => i.status === "payee").reduce((s, i) => s + i.amount, 0)
  const pending = invoices
    .filter((i) => i.status === "en_attente")
    .reduce((s, i) => s + i.amount, 0)
  const late = invoices.filter((i) => i.status === "en_retard").reduce((s, i) => s + i.amount, 0)

  const stats = [
    { label: "Facturé ce mois", value: `${total} €`, icon: TrendingUp, tone: "text-primary" },
    { label: "Encaissé", value: `${paid} €`, icon: CheckCircle2, tone: "text-accent-foreground" },
    { label: "En attente", value: `${pending} €`, icon: Clock3, tone: "text-muted-foreground" },
    { label: "En retard", value: `${late} €`, icon: AlertCircle, tone: "text-destructive" },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <s.icon className={cn("size-4", s.tone)} />
            </div>
            <p className="mt-2 text-xl font-bold tracking-tight text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
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
          <span className="col-span-2">Facture</span>
          <span className="col-span-3">Client</span>
          <span className="col-span-3">Prestation</span>
          <span className="col-span-2">Statut</span>
          <span className="col-span-2 text-right">Montant</span>
        </div>

        <ul className="divide-y divide-border">
          {visible.map((inv) => {
            const Icon = statusIcon[inv.status]
            return (
              <li
                key={inv.id}
                className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-secondary/40 md:grid-cols-12 md:items-center"
              >
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-foreground">{inv.number}</p>
                  <p className="text-xs text-muted-foreground">{inv.date}</p>
                </div>

                <div className="col-span-3 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{inv.clientName}</p>
                  <p className="truncate text-xs text-muted-foreground">{inv.dogName}</p>
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
                    {invoiceStatusLabels[inv.status]}
                  </span>
                </div>

                <div className="col-span-2 flex items-center justify-between gap-2 md:justify-end">
                  <span className="text-sm font-bold text-foreground">{inv.amount} €</span>
                  <button
                    aria-label={`Télécharger la facture ${inv.number}`}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Download className="size-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
