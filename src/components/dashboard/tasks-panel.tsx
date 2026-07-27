"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { EducatorTaskItem, EducatorTaskTag } from "@/types/educator-task";

const tagStyles: Record<EducatorTaskTag, string> = {
  relance: "bg-primary/12 text-primary",
  "compte-rendu": "bg-accent text-accent-foreground",
};

const tagLabels: Record<EducatorTaskTag, string> = {
  relance: "Relance",
  "compte-rendu": "Compte-rendu",
};

type TasksPanelProps = {
  tasks: EducatorTaskItem[];
};

export function TasksPanel({ tasks: initialTasks }: TasksPanelProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());

  const tasks = initialTasks.filter((t) => !dismissed.has(t.id));
  const remaining = tasks.length;

  const dismiss = (id: string) =>
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            À faire
          </h2>
          <p className="text-sm text-muted-foreground">
            {remaining} tâche(s) en attente
          </p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
          {remaining}
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          Rien à traiter pour le moment.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-2.5">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label={`Marquer « ${t.label} » comme fait`}
                className="mt-3 flex size-5 shrink-0 items-center justify-center rounded-md border-2 border-border bg-card transition-colors hover:border-primary"
              >
                <Check className="size-3.5 opacity-0" strokeWidth={3} />
              </button>
              <Link
                href={t.href}
                className="flex min-w-0 flex-1 items-start gap-3 rounded-xl border border-border bg-background/60 p-3 text-left transition-colors hover:border-primary/40"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {t.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t.detail}
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    tagStyles[t.tag],
                  )}
                >
                  {tagLabels[t.tag]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
