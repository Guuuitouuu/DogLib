"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

import {
  createEducatorService,
  deleteEducatorService,
  listEducatorServices,
  updateEducatorService,
  type EducatorServiceItem,
} from "@/actions/educator-services";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPriceEurosFromCents } from "@/lib/format-price";
import { cn } from "@/lib/utils";

type ServiceFormState = {
  title: string;
  description: string;
  durationMinutes: string;
  priceEuros: string;
  isActive: boolean;
};

const emptyForm: ServiceFormState = {
  title: "",
  description: "",
  durationMinutes: "60",
  priceEuros: "55",
  isActive: true,
};

function eurosToCents(value: string): number | null {
  const normalized = value.replace(",", ".").trim();
  const euros = Number.parseFloat(normalized);
  if (Number.isNaN(euros) || euros < 0) return null;
  return Math.round(euros * 100);
}

export function EducatorServicesPanel() {
  const [services, setServices] = useState<EducatorServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EducatorServiceItem | null>(null);
  const [form, setForm] = useState<ServiceFormState>(emptyForm);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    setLoading(true);
    const result = await listEducatorServices();
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      setServices([]);
      return;
    }
    setError(null);
    setServices(result.data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(service: EducatorServiceItem) {
    setEditing(service);
    setForm({
      title: service.title,
      description: service.description ?? "",
      durationMinutes: String(service.durationMinutes),
      priceEuros: (service.priceCents / 100).toFixed(2),
      isActive: service.isActive,
    });
    setDialogOpen(true);
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    const priceCents = eurosToCents(form.priceEuros);
    const durationMinutes = Number.parseInt(form.durationMinutes, 10);
    if (priceCents === null || Number.isNaN(durationMinutes)) {
      setError("Durée ou prix invalide.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        durationMinutes,
        priceCents,
        isActive: form.isActive,
      };

      const result = editing
        ? await updateEducatorService({ serviceId: editing.id, ...payload })
        : await createEducatorService(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setDialogOpen(false);
      await load();
    });
  }

  function toggleActive(service: EducatorServiceItem) {
    startTransition(async () => {
      const result = await updateEducatorService({
        serviceId: service.id,
        isActive: !service.isActive,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      await load();
    });
  }

  function remove(service: EducatorServiceItem) {
    if (!window.confirm(`Supprimer « ${service.title} » ?`)) return;
    startTransition(async () => {
      const result = await deleteEducatorService({ serviceId: service.id });
      if (!result.success) {
        setError(result.error);
        return;
      }
      await load();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Les services actifs apparaissent sur votre page publique et au moment
          de la réservation.
        </p>
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          Nouveau service
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Chargement…
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucun service</CardTitle>
            <CardDescription>
              Créez votre première prestation pour ouvrir les réservations.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-3">
          {services.map((service) => (
            <li key={service.id}>
              <Card
                className={cn(
                  !service.isActive && "opacity-70",
                )}
              >
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {service.title}
                      </h3>
                      <Badge variant={service.isActive ? "default" : "secondary"}>
                        {service.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {service.durationMinutes} min ·{" "}
                      {formatPriceEurosFromCents(service.priceCents)}
                    </p>
                    {service.description ? (
                      <p className="text-sm text-foreground/80 line-clamp-2">
                        {service.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(service)}
                      disabled={pending}
                    >
                      {service.isActive ? "Désactiver" : "Activer"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(service)}
                    >
                      <Pencil className="size-4" aria-hidden />
                      Modifier
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(service)}
                      disabled={pending}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier le service" : "Nouveau service"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitForm} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="svc-title">Titre</Label>
              <Input
                id="svc-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
                maxLength={120}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-desc">Description (optionnel)</Label>
              <textarea
                id="svc-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                maxLength={5000}
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="svc-duration">Durée (minutes)</Label>
                <Input
                  id="svc-duration"
                  type="number"
                  min={15}
                  max={480}
                  step={15}
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, durationMinutes: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="svc-price">Prix (€)</Label>
                <Input
                  id="svc-price"
                  inputMode="decimal"
                  value={form.priceEuros}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priceEuros: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
                className="size-4 rounded border-input"
              />
              Visible sur la page publique et réservable
            </label>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : editing ? (
                  "Enregistrer"
                ) : (
                  "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
