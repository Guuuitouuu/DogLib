"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { tasks as initialTasks, type Task } from "@/lib/data"
import { cn } from "@/lib/utils"

const tagStyles: Record<Task["tag"], string> = {
  relance: "bg-primary/12 text-primary",
  "compte-rendu": "bg-accent text-accent-foreground",
  facture: "bg-chart-3/20 text-chart-4",
}

const tagLabels: Record<Task["tag"], string> = {
  relance: "Relance",
  "compte-rendu": "Compte-rendu",
  facture: "Facture",
}

export function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const remaining = tasks.filter((t) => !t.done).length

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">À faire</h2>
          <p className="text-sm text-muted-foreground">{remaining} tâche(s) en attente</p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
          {remaining}
        </span>
      </div>

      <ul className="mt-5 flex flex-col gap-2.5">
        {tasks.map((t) => (
          <li key={t.id}>
            <button
              onClick={() => toggle(t.id)}
              className="flex w-full items-start gap-3 rounded-xl border border-border bg-background/60 p-3 text-left transition-colors hover:border-primary/40"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                  t.done
                    ? "border-chart-2 bg-chart-2 text-card"
                    : "border-border bg-card",
                )}
              >
                {t.done && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm font-medium",
                    t.done ? "text-muted-foreground line-through" : "text-foreground",
                  )}
                >
                  {t.label}
                </span>
                <span className="text-xs text-muted-foreground">{t.detail}</span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  tagStyles[t.tag],
                )}
              >
                {tagLabels[t.tag]}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
