"use client";

import Link from "next/link";
import { FileText, Mail, User } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  bookingStatusBadgeStyles,
  bookingStatusLabels,
} from "@/lib/booking-ui";
import { cn } from "@/lib/utils";
import type { EducatorDogDetail } from "@/types/educator-dog";

type DogDetailViewProps = {
  dog: EducatorDogDetail;
};

function formatSessionDateLong(dateParis: string): string {
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

export function DogDetailView({ dog }: DogDetailViewProps) {
  const sessionsWithReport = dog.sessions.filter(
    (s) => s.postSessionReport && s.postSessionReport.trim().length > 0,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/chiens"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        ← Retour aux chiens
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{dog.name}</CardTitle>
          <CardDescription>
            {dog.breed ?? "Race non renseignée"}
            {dog.age != null ? ` · ${dog.age} an${dog.age > 1 ? "s" : ""}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <User className="size-4" aria-hidden />
              <span>
                Propriétaire :{" "}
                <span className="font-medium text-foreground">
                  {dog.ownerName}
                </span>
              </span>
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4" aria-hidden />
              <a
                href={`mailto:${dog.ownerEmail}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {dog.ownerEmail}
              </a>
            </span>
          </div>
          {dog.behavioralNotes ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Notes comportement
              </p>
              <p className="mt-1 whitespace-pre-wrap text-foreground">
                {dog.behavioralNotes}
              </p>
            </div>
          ) : null}
          {dog.medicalNotes ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Notes médicales
              </p>
              <p className="mt-1 whitespace-pre-wrap text-foreground">
                {dog.medicalNotes}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" aria-hidden />
            Historique des comptes-rendus
          </CardTitle>
          <CardDescription>
            {sessionsWithReport.length > 0
              ? `${sessionsWithReport.length} compte-rendu${sessionsWithReport.length !== 1 ? "s" : ""} enregistré${sessionsWithReport.length !== 1 ? "s" : ""}.`
              : "Aucun compte-rendu pour l’instant — rédigez-les depuis la fiche séance."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dog.sessions.map((session) => (
            <article
              key={session.bookingId}
              className="rounded-xl border border-border p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold capitalize text-foreground">
                    {formatSessionDateLong(session.dateParis)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {session.timeParis} · {session.serviceTitle}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    bookingStatusBadgeStyles[session.status],
                  )}
                >
                  {bookingStatusLabels[session.status]}
                </span>
              </div>

              {session.postSessionReport?.trim() ? (
                <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                  {session.postSessionReport}
                </p>
              ) : (
                <p className="mt-3 text-sm italic text-muted-foreground">
                  Pas encore de compte-rendu.
                </p>
              )}

              <Link
                href={`/dashboard/seances/${session.bookingId}`}
                className={buttonVariants({
                  variant: "link",
                  size: "sm",
                  className: "mt-2 h-auto px-0",
                })}
              >
                Ouvrir la séance
              </Link>
            </article>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
