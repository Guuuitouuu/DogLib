"use client";

import { Loader2, PawPrint, Plus } from "lucide-react";
import { useState, useTransition } from "react";

import { createDog, type ClientDogItem } from "@/actions/booking";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ClientAccountPanelProps = {
  initialDogs: ClientDogItem[];
};

export function ClientAccountPanel({ initialDogs }: ClientAccountPanelProps) {
  const [dogs, setDogs] = useState<ClientDogItem[]>(initialDogs);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(initialDogs.length === 0);
  const [pending, startTransition] = useTransition();

  function onAddDog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createDog({
        name: String(form.get("name") ?? ""),
        breed: String(form.get("breed") ?? "") || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDogs((prev) => [...prev, result.data]);
      setShowForm(false);
      setError(null);
      e.currentTarget.reset();
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mon compte</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez vos chiens pour réserver des séances chez un éducateur.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="size-5 text-primary" aria-hidden />
              Mes chiens
            </CardTitle>
            <CardDescription>
              Ajoutez au moins un chien avant de réserver une séance.
            </CardDescription>
          </div>
          {!showForm && dogs.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              <Plus className="size-4" aria-hidden />
              Ajouter
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          {dogs.length > 0 ? (
            <ul className="space-y-2">
              {dogs.map((dog) => (
                <li
                  key={dog.id}
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3"
                >
                  <PawPrint className="size-4 text-primary" aria-hidden />
                  <span className="font-medium">{dog.name}</span>
                  {dog.breed ? (
                    <span className="text-sm text-muted-foreground">
                      {dog.breed}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          {dogs.length === 0 && !showForm ? (
            <p className="text-sm text-muted-foreground">
              Aucun chien enregistré pour le moment.
            </p>
          ) : null}

          {showForm ? (
            <form
              onSubmit={onAddDog}
              className="space-y-3 rounded-xl border border-dashed p-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="dog-name">Nom du chien</Label>
                <Input id="dog-name" name="name" required maxLength={80} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dog-breed">Race (optionnel)</Label>
                <Input id="dog-breed" name="breed" maxLength={80} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={pending}>
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
                {dogs.length > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                  >
                    Annuler
                  </Button>
                ) : null}
              </div>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
