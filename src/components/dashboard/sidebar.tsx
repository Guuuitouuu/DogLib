"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  PawPrint,
  CalendarDays,
  GraduationCap,
  Receipt,
  Settings,
  LifeBuoy,
} from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { label: "Tableau de bord", icon: LayoutDashboard, active: true },
  { label: "Clients", icon: Users, badge: "24" },
  { label: "Chiens", icon: PawPrint, badge: "31" },
  { label: "Agenda", icon: CalendarDays },
  { label: "Séances", icon: GraduationCap },
  { label: "Facturation", icon: Receipt, badge: "3" },
]

const secondary = [
  { label: "Paramètres", icon: Settings },
  { label: "Aide", icon: LifeBuoy },
]

export function Sidebar() {
  const [active, setActive] = useState("Tableau de bord")

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-border bg-sidebar px-4 py-6 lg:flex">
      <div className="flex items-center gap-2.5 px-2">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <PawPrint className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-base font-bold tracking-tight text-foreground">DogLib</p>
          <p className="text-xs text-muted-foreground">Espace éducateur</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Pilotage
        </p>
        {nav.map((item) => {
          const isActive = active === item.label
          return (
            <button
              key={item.label}
              onClick={() => setActive(item.label)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="size-[18px]" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}

        <div className="my-3 h-px bg-border" />

        {secondary.map((item) => (
          <button
            key={item.label}
            onClick={() => setActive(item.label)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active === item.label
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className="size-[18px]" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="rounded-2xl bg-accent p-4 shadow-sm">
        <p className="text-sm font-semibold text-accent-foreground">Forfait Pro</p>
        <p className="mt-1 text-xs text-accent-foreground/80">
          Séances illimitées et rappels automatiques pour vos clients.
        </p>
        <button className="mt-3 w-full rounded-xl bg-accent-foreground px-3 py-2 text-xs font-semibold text-accent transition-opacity hover:opacity-90">
          Gérer mon forfait
        </button>
      </div>
    </aside>
  )
}
