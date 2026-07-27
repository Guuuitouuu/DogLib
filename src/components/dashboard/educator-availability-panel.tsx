"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  createEducatorAvailability,
  deleteEducatorAvailability,
  listEducatorAvailabilities,
  updateEducatorAvailability,
  type EducatorAvailabilityItem,
} from "@/actions/educator-availability";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { weekdayLabelsFr } from "@/lib/time-hm";

type FormState = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  dayOfWeek: "1",
  startTime: "09:00",
  endTime: "12:00",
  isActive: true,
};

export function EducatorAvailabilityPanel() {
  const router = useRouter();
  const [rows, setRows] = useState<EducatorAvailabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EducatorAvailabilityItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const refreshList = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
    const result = await listEducatorAvailabilities();
    if (!options?.silent) setLoading(false);
    if (!result.success) {
      setError(result.error);
      return false;
    }
    setError(null);
    setRows(result.data);
    return true;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      await refreshList();
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshList]);

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setEditing(null);
      setForm(emptyForm);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(row: EducatorAvailabilityItem) {
    setEditing(row);
    setForm({
      dayOfWeek: String(row.dayOfWeek),
      startTime: row.startTime,
      endTime: row.endTime,
      isActive: row.isActive,
    });
    setDialogOpen(true);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = {
      dayOfWeek: Number.parseInt(form.dayOfWeek, 10),
      startTime: form.startTime,
      endTime: form.endTime,
      isActive: form.isActive,
    };

    const result = editing
      ? await updateEducatorAvailability({
          availabilityId: editing.id,
          ...payload,
        })
      : await createEducatorAvailability(payload);

    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    handleDialogOpenChange(false);
    setRows((prev) =>
      editing
        ? prev.map((r) => (r.id === result.data.id ? result.data : r))
        : [...prev, result.data].sort(
            (a, b) =>
              a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime),
          ),
    );
    router.refresh();
    void refreshList({ silent: true });
  }

  async function toggleActive(row: EducatorAvailabilityItem) {
    setSubmitting(true);
    const result = await updateEducatorAvailability({
      availabilityId: row.id,
      isActive: !row.isActive,
    });
    setSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setRows((prev) =>
      prev.map((r) => (r.id === result.data.id ? result.data : r)),
    );
    router.refresh();
  }

  async function remove(row: EducatorAvailabilityItem) {
    if (!window.confirm("Supprimer cette plage horaire ?")) return;
    setSubmitting(true);
    const result = await deleteEducatorAvailability({
      availabilityId: row.id,
    });
    setSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Fuseau Europe/Paris. Seules les plages actives génèrent des créneaux
          réservables sur votre page publique.
        </p>
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          Ajouter une plage
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
      ) : rows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucune disponibilité</CardTitle>
            <CardDescription>
              Définissez vos jours et horaires d&apos;ouverture pour permettre
              les réservations.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id}>
              <Card className={cn(!row.isActive && "opacity-70")}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {weekdayLabelsFr[row.dayOfWeek]}
                      </span>
                      <Badge variant={row.isActive ? "default" : "secondary"}>
                        {row.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {row.startTime} – {row.endTime}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(row)}
                      disabled={submitting}
                    >
                      {row.isActive ? "Désactiver" : "Activer"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(row)}
                    >
                      <Pencil className="size-4" aria-hidden />
                      Modifier
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(row)}
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
      )}

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier la plage" : "Nouvelle plage horaire"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => void submitForm(e)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Jour</Label>
              <Select
                value={form.dayOfWeek}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, dayOfWeek: value ?? "1" }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un jour" />
                </SelectTrigger>
                <SelectContent>
                  {weekdayLabelsFr.map((label, index) => (
                    <SelectItem key={label} value={String(index)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="av-start">Début</Label>
                <Input
                  id="av-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startTime: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="av-end">Fin</Label>
                <Input
                  id="av-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endTime: e.target.value }))
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
              Plage active (créneaux réservables)
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
