"use client";

import Link from "next/link";
import { ChevronRight, Loader2, PawPrint, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createClientDog } from "@/actions/client-dogs";
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
import type { ClientDogListItem } from "@/types/client-dashboard";

type ClientDogsPanelProps = {
  initialDogs: ClientDogListItem[];
};

export function ClientDogsPanel({ initialDogs }: ClientDogsPanelProps) {
  const router = useRouter();
  const [dogs, setDogs] = useState(initialDogs);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onAddDog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const breed = String(fd.get("breed") ?? "").trim();

    startTransition(async () => {
      const result = await createClientDog({
        name,
        breed: breed || undefined,
        age: fd.get("age") ? Number(fd.get("age")) : undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      const newDog: ClientDogListItem = {
        id: result.data.id,
        name: result.data.name,
        breed: result.data.breed,
        age: null,
        photoUrl: null,
        reservationsCount: 0,
        reportsCount: 0,
      };
      setDogs((prev) => [...prev, newDog].sort((a, b) => a.name.localeCompare(b.name, "fr")));
      setShowForm(false);
      setSuccess(`${result.data.name} a été enregistré.`);
      form.reset();
      router.refresh();
    });
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mes chiens</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fiches, réservations et comptes-rendus par chien.
          </p>
        </div>
        {!showForm ? (
          <Button type="button" variant="outline" onClick={() => setShowForm(true)}>
            <Plus className="size-4" aria-hidden />
            Ajouter un chien
          </Button>
        ) : null}
      </div>

      {success ? (
        <p className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Nouveau chien</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onAddDog} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="dog-name">Nom</Label>
                <Input id="dog-name" name="name" required maxLength={80} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="dog-breed">Race (optionnel)</Label>
                  <Input id="dog-breed" name="breed" maxLength={80} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dog-age">Âge (ans, optionnel)</Label>
                  <Input
                    id="dog-age"
                    name="age"
                    type="number"
                    min={0}
                    max={30}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={pending}>
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {dogs.length === 0 && !showForm ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Aucun chien enregistré. Ajoutez-en un pour réserver une réservation.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {dogs.map((dog) => (
            <Card key={dog.id} className="min-w-0">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PawPrint className="size-5 text-primary" aria-hidden />
                  {dog.name}
                </CardTitle>
                <CardDescription className="break-words">
                  {dog.breed ?? "Race non renseignée"}
                  {dog.age != null ? ` · ${dog.age} an${dog.age > 1 ? "s" : ""}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  {dog.reservationsCount} réservation{dog.reservationsCount !== 1 ? "s" : ""} ·{" "}
                  {dog.reportsCount} compte-rendu
                  {dog.reportsCount !== 1 ? "s" : ""}
                </p>
                <Link
                  href={`/account/chiens/${dog.id}`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "w-full justify-between",
                  })}
                >
                  Voir la fiche
                  <ChevronRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href={`/account/chiens/${dog.id}/comptes-rendus`}
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                    className: "w-full justify-between",
                  })}
                >
                  Voir les comptes-rendus
                  <ChevronRight className="size-4" aria-hidden />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
