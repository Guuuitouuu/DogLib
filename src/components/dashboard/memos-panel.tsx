"use client";

import {
  Archive,
  ArchiveRestore,
  Loader2,
  Pencil,
  Plus,
  StickyNote,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  createEducatorMemo,
  deleteEducatorMemo,
  setEducatorMemoArchived,
  updateEducatorMemo,
} from "@/actions/educator-memos";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { EducatorMemoItem } from "@/types/educator-memo";

type MemosPanelProps = {
  initialMemos: EducatorMemoItem[];
  initialError?: string | null;
};

function formatMemoDate(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function MemosPanel({
  initialMemos,
  initialError = null,
}: MemosPanelProps) {
  const router = useRouter();
  const [memos, setMemos] = useState(initialMemos);
  const [listError, setListError] = useState<string | null>(initialError);
  const [showArchived, setShowArchived] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EducatorMemoItem | null>(null);
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const activeMemos = useMemo(
    () => memos.filter((m) => !m.archivedAt),
    [memos],
  );
  const archivedMemos = useMemo(
    () => memos.filter((m) => m.archivedAt),
    [memos],
  );

  function openCreate() {
    setEditing(null);
    setContent("");
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(memo: EducatorMemoItem) {
    setEditing(memo);
    setContent(memo.content);
    setFormError(null);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setContent("");
    setFormError(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    startTransition(async () => {
      const result = editing
        ? await updateEducatorMemo({ memoId: editing.id, content })
        : await createEducatorMemo({ content });
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      setMemos((prev) => {
        if (editing) {
          return prev.map((m) => (m.id === result.data.id ? result.data : m));
        }
        return [result.data, ...prev];
      });
      closeDialog();
      router.refresh();
    });
  }

  function onDelete(memoId: string) {
    if (!window.confirm("Supprimer ce mémo définitivement ?")) return;
    startTransition(async () => {
      const result = await deleteEducatorMemo({ memoId });
      if (!result.success) {
        setListError(result.error);
        return;
      }
      setMemos((prev) => prev.filter((m) => m.id !== memoId));
      setListError(null);
      router.refresh();
    });
  }

  function onToggleArchive(memo: EducatorMemoItem) {
    const archived = !memo.archivedAt;
    startTransition(async () => {
      const result = await setEducatorMemoArchived({
        memoId: memo.id,
        archived,
      });
      if (!result.success) {
        setListError(result.error);
        return;
      }
      setMemos((prev) =>
        prev.map((m) => (m.id === result.data.id ? result.data : m)),
      );
      setListError(null);
      router.refresh();
    });
  }

  function renderMemoItem(memo: EducatorMemoItem, archived: boolean) {
    return (
      <li key={memo.id}>
        <article
          className={cn(
            "rounded-xl border border-border bg-background/60 p-3 transition-colors",
            !archived && "hover:border-primary/40",
          )}
        >
          <p className="whitespace-pre-wrap text-sm font-medium text-foreground">
            {memo.content}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <time
              className="text-xs text-muted-foreground"
              dateTime={memo.createdAt}
            >
              {formatMemoDate(memo.createdAt)}
            </time>
            <div className="flex flex-wrap gap-1">
              {!archived ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  disabled={pending}
                  onClick={() => openEdit(memo)}
                >
                  <Pencil className="size-3.5" aria-hidden />
                  Modifier
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                disabled={pending}
                onClick={() => onToggleArchive(memo)}
              >
                {archived ? (
                  <>
                    <ArchiveRestore className="size-3.5" aria-hidden />
                    Réactiver
                  </>
                ) : (
                  <>
                    <Archive className="size-3.5" aria-hidden />
                    Archiver
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                disabled={pending}
                onClick={() => onDelete(memo.id)}
              >
                <Trash2 className="size-3.5" aria-hidden />
                Supprimer
              </Button>
            </div>
          </div>
        </article>
      </li>
    );
  }

  return (
    <>
      <section className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Mémos
            </h2>
            <p className="text-sm text-muted-foreground">
              Notes libres — sans lien client, chien ou réservation.
            </p>
          </div>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <StickyNote className="size-5" aria-hidden />
          </span>
        </div>

        {listError ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {listError}
          </p>
        ) : null}

        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={openCreate}
            disabled={pending}
          >
            <Plus className="size-4" aria-hidden />
            Nouveau mémo
          </Button>
        </div>

        <ul className="mt-4 flex max-h-[320px] flex-col gap-2.5 overflow-y-auto">
          {activeMemos.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
              Aucun mémo actif. Ajoutez une note pour vous rappeler d&apos;un
              détail, d&apos;une idée ou d&apos;un suivi interne.
            </li>
          ) : (
            activeMemos.map((memo) => renderMemoItem(memo, false))
          )}
        </ul>

        {archivedMemos.length > 0 ? (
          <div className="mt-4 border-t border-border pt-4">
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
              onClick={() => setShowArchived((v) => !v)}
            >
              {showArchived ? "Masquer" : "Afficher"} les mémos archivés (
              {archivedMemos.length})
            </button>
            {showArchived ? (
              <ul className="mt-3 flex flex-col gap-2.5">
                {archivedMemos.map((memo) => renderMemoItem(memo, true))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </section>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier le mémo" : "Nouveau mémo"}
            </DialogTitle>
            <DialogDescription>
              Texte libre visible uniquement dans votre espace éducateur.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="memo-content">Contenu</Label>
              <textarea
                id="memo-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                maxLength={10_000}
                required
                className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Ex. : Rappeler à Camille d’apporter la longe…"
              />
            </div>
            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={closeDialog}
                disabled={pending}
              >
                Annuler
              </Button>
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
    </>
  );
}
