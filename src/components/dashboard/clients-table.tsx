"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Mail, MoreHorizontal } from "lucide-react"
import { clients } from "@/lib/data"

export function ClientsTable() {
  const [query, setQuery] = useState("")
  const visible = clients.filter((c) => {
    const q = query.toLowerCase()
    return (
      c.ownerName.toLowerCase().includes(q) ||
      c.dogName.toLowerCase().includes(q) ||
      c.breed.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un client…"
          aria-label="Rechercher un client"
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* En-tête (desktop) */}
        <div className="hidden grid-cols-12 gap-4 border-b border-border bg-secondary/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <span className="col-span-4">Client</span>
          <span className="col-span-3">Programme</span>
          <span className="col-span-3">Progression</span>
          <span className="col-span-2 text-right">Prochaine séance</span>
        </div>

        <ul className="divide-y divide-border">
          {visible.map((c) => (
            <li
              key={c.id}
              className="grid grid-cols-1 gap-4 px-5 py-4 transition-colors hover:bg-secondary/40 md:grid-cols-12 md:items-center"
            >
              <div className="col-span-4 flex items-center gap-3">
                <Image
                  src={c.photo || "/placeholder.svg"}
                  alt={`Chien de ${c.ownerName}`}
                  width={44}
                  height={44}
                  className="size-11 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{c.ownerName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.dogName} · {c.breed}
                  </p>
                </div>
              </div>

              <div className="col-span-3">
                <span className="inline-flex rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                  {c.program}
                </span>
              </div>

              <div className="col-span-3">
                <div className="mb-1 flex items-center justify-between text-xs md:justify-start md:gap-2">
                  <span className="font-semibold text-primary">{c.progress}%</span>
                </div>
                <div className="h-2 w-full max-w-[160px] overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-between gap-2 md:justify-end">
                <span className="text-sm font-medium text-foreground">{c.nextSession}</span>
                <div className="flex items-center gap-1">
                  <button
                    aria-label={`Écrire à ${c.ownerName}`}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Mail className="size-4" />
                  </button>
                  <button
                    aria-label="Plus d'options"
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {visible.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Aucun client ne correspond à votre recherche.
          </p>
        )}
      </div>
    </div>
  )
}
