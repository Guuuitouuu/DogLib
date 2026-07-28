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
import type { ClientDogDetail } from "@/types/client-dashboard";

type ClientDogDetailViewProps = {
  dog: ClientDogDetail;
};

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

  const reservationsWithReport = dog.reservations.filter(
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
            {dog.reservationsCount} réservation{dog.reservationsCount !== 1 ? "s" : ""} ·{" "}
            {dog.completedReservationsCount} terminée
            {dog.completedReservationsCount !== 1 ? "s" : ""} ·{" "}
            {reservationsWithReport.length} compte-rendu
            {reservationsWithReport.length !== 1 ? "s" : ""}
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
          <CardTitle>Réservations & comptes-rendus</CardTitle>
          <CardDescription className="break-words">
            {dog.reservationsCount} réservation
            {dog.reservationsCount !== 1 ? "s" : ""} ·{" "}
            {reservationsWithReport.length} compte-rendu
            {reservationsWithReport.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/account/reservations"
            className={buttonVariants({ variant: "outline", className: "flex-1" })}
          >
            Mes réservations
          </Link>
          <Link
            href={`/account/chiens/${dog.id}/comptes-rendus`}
            className={buttonVariants({ className: "flex-1" })}
          >
            Voir les comptes-rendus
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
