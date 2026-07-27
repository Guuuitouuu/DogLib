"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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

function sortServices(items: EducatorServiceItem[]): EducatorServiceItem[] {
  return [...items].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return a.title.localeCompare(b.title, "fr");
  });
}

type EducatorServicesPanelProps = {
  initialServices?: EducatorServiceItem[];
  initialListError?: string | null;
};

export function EducatorServicesPanel({
  initialServices = [],
  initialListError = null,
}: EducatorServicesPanelProps) {
  const router = useRouter();
  const [services, setServices] = useState(() =>
    sortServices(initialServices),
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(initialListError);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EducatorServiceItem | null>(null);
  const [form, setForm] = useState<ServiceFormState>(emptyForm);

  const refreshList = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }
    const result = await listEducatorServices();
    if (!options?.silent) {
      setLoading(false);
    }
    if (!result.success) {
      if (!options?.silent) {
        setListError(result.error);
      }
      return false;
    }
    setListError(null);
    setServices(sortServices(result.data));
    return true;
  }, []);

  useEffect(() => {
    setServices(sortServices(initialServices));
    setListError(initialListError);
  }, [initialServices, initialListError]);

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setEditing(null);
      setForm(emptyForm);
    }
  }

  function openCreate() {
    setFormError(null);
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(service: EducatorServiceItem) {
    setFormError(null);
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

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    const priceCents = eurosToCents(form.priceEuros);
    const durationMinutes = Number.parseInt(form.durationMinutes, 10);
    if (priceCents === null || Number.isNaN(durationMinutes)) {
      setFormError("Durée ou prix invalide.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      title: form.title.trim(),
      ...(form.description.trim()
        ? { description: form.description.trim() }
        : {}),
      durationMinutes,
      priceCents,
      isActive: form.isActive,
    };

    const result = editing
      ? await updateEducatorService({ serviceId: editing.id, ...payload })
      : await createEducatorService(payload);

    setSubmitting(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    handleDialogOpenChange(false);
    setFormError(null);
    setServices((prev) =>
      sortServices(
        editing
          ? prev.map((s) => (s.id === result.data.id ? result.data : s))
          : [...prev, result.data],
      ),
    );
    router.refresh();
    void refreshList({ silent: true });
  }

  async function toggleActive(service: EducatorServiceItem) {
    setSubmitting(true);
    const result = await updateEducatorService({
      serviceId: service.id,
      isActive: !service.isActive,
    });
    setSubmitting(false);
    if (!result.success) {
      setListError(result.error);
      return;
    }
    setServices((prev) =>
      sortServices(
        prev.map((s) => (s.id === result.data.id ? result.data : s)),
      ),
    );
    router.refresh();
  }

  async function remove(service: EducatorServiceItem) {
    if (!window.confirm(`Supprimer « ${service.title} » ?`)) return;
    setSubmitting(true);
    const result = await deleteEducatorService({ serviceId: service.id });
    setSubmitting(false);
    if (!result.success) {
      setListError(result.error);
      return;
    }
    setServices((prev) => prev.filter((s) => s.id !== service.id));
    router.refresh();
  }

  const showEmpty = !loading && services.length === 0;

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

      {listError ? (
        <p className="text-sm text-destructive" role="alert">
          {listError}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Chargement…
        </div>
      ) : null}

      {showEmpty ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucun service</CardTitle>
            <CardDescription>
              Créez votre première prestation pour ouvrir les réservations.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {!loading && services.length > 0 ? (
        <ul className="space-y-3">
          {services.map((service) => (
            <li key={service.id}>
              <Card className={cn(!service.isActive && "opacity-70")}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {service.title}
                      </h3>
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
                      >
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
                      onClick={() => void toggleActive(service)}
                      disabled={submitting}
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
                      onClick={() => void remove(service)}
                      disabled={submitting}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier le service" : "Nouveau service"}
            </DialogTitle>
          </DialogHeader>
          {formError ? (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}
          <form onSubmit={(e) => void submitForm(e)} className="space-y-4">
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
              <Button type="submit" disabled={submitting}>
                {submitting ? (
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
