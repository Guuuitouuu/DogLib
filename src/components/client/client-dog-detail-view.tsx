"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateClientDog } from "@/actions/client-dogs";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  bookingStatusBadgeStyles,
  bookingStatusLabels,
} from "@/lib/booking-ui";
import type { BookingStatusValue } from "@/lib/booking-status";
import { cn } from "@/lib/utils";
import type { ClientDogDetail } from "@/types/client-dashboard";

type ClientDogDetailViewProps = {
  dog: ClientDogDetail;
};

function formatDateLong(dateParis: string): string {
  const [y, m, d] = dateParis.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(utc);
}

export function ClientDogDetailView({ dog }: ClientDogDetailViewProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const form = e.currentTarget;
    const fd = new FormData(form);

    startTransition(async () => {
      const result = await updateClientDog({
        dogId: dog.id,
        name: String(fd.get("name") ?? ""),
        breed: String(fd.get("breed") ?? "") || undefined,
        age: fd.get("age") ? Number(fd.get("age")) : undefined,
        behavioralNotes: String(fd.get("behavioralNotes") ?? "") || undefined,
        medicalNotes: String(fd.get("medicalNotes") ?? "") || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  const sessionsWithReport = dog.sessions.filter(
    (s) => s.postSessionReport && s.postSessionReport.trim().length > 0,
  );

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6">
      <Link
        href="/account/chiens"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        ← Mes chiens
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{dog.name}</CardTitle>
          <CardDescription className="break-words">
            {dog.sessionsCount} séance{dog.sessionsCount !== 1 ? "s" : ""} ·{" "}
            {dog.completedSessionsCount} terminée
            {dog.completedSessionsCount !== 1 ? "s" : ""} ·{" "}
            {sessionsWithReport.length} compte-rendu
            {sessionsWithReport.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="dog-name">Nom</Label>
                <Input
                  id="dog-name"
                  name="name"
                  required
                  defaultValue={dog.name}
                  maxLength={80}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dog-breed">Race</Label>
                <Input
                  id="dog-breed"
                  name="breed"
                  defaultValue={dog.breed ?? ""}
                  maxLength={80}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dog-age">Âge (ans)</Label>
              <Input
                id="dog-age"
                name="age"
                type="number"
                min={0}
                max={30}
                defaultValue={dog.age ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dog-behavior">Notes comportement</Label>
              <textarea
                id="dog-behavior"
                name="behavioralNotes"
                rows={3}
                defaultValue={dog.behavioralNotes ?? ""}
                className="flex min-h-10 w-full min-w-0 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dog-medical">Notes médicales</Label>
              <textarea
                id="dog-medical"
                name="medicalNotes"
                rows={3}
                defaultValue={dog.medicalNotes ?? ""}
                className="flex min-h-10 w-full min-w-0 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {saved ? (
              <p className="text-sm text-primary">Modifications enregistrées.</p>
            ) : null}
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Enregistrer"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des séances</CardTitle>
          <CardDescription className="break-words">
            Comptes-rendus partagés par vos éducateurs après chaque séance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dog.sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune séance pour le moment.
            </p>
          ) : (
            dog.sessions.map((session) => {
              const status = session.status as BookingStatusValue;
              return (
                <article
                  key={session.bookingId}
                  className="min-w-0 rounded-xl border border-border p-4"
                >
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-semibold capitalize text-foreground">
                        {formatDateLong(session.dateParis)}
                      </p>
                      <p className="break-words text-sm text-muted-foreground">
                        {session.timeParis} · {session.serviceTitle} ·{" "}
                        {session.educatorName}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        bookingStatusBadgeStyles[status],
                      )}
                    >
                      {bookingStatusLabels[status]}
                    </span>
                  </div>
                  {session.postSessionReport?.trim() ? (
                    <p className="mt-3 min-w-0 break-words whitespace-pre-wrap text-sm text-foreground">
                      {session.postSessionReport}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm italic text-muted-foreground">
                      Compte-rendu pas encore disponible.
                    </p>
                  )}
                  <Link
                    href={`/educator/${session.educatorProfileId}`}
                    className={buttonVariants({
                      variant: "link",
                      size: "sm",
                      className: "mt-2 h-auto px-0",
                    })}
                  >
                    Voir l&apos;éducateur
                  </Link>
                </article>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
