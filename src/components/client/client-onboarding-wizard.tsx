"use client";

import { Loader2, PawPrint } from "lucide-react";
import { useState, useTransition } from "react";

import { createClientDog } from "@/actions/client-dogs";
import { updateClientAddress } from "@/actions/client-profile";
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

type Step = 1 | 2;

export function ClientOnboardingWizard() {
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onAddressSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateClientAddress({
        address: String(fd.get("address") ?? ""),
        city: String(fd.get("city") ?? ""),
        zipCode: String(fd.get("zipCode") ?? ""),
        phone: String(fd.get("phone") ?? "") || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setStep(2);
    });
  }

  function finishOnboarding() {
    window.location.assign("/account");
  }

  function onDogSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    if (!name) {
      setError("Indiquez le nom du chien ou passez cette étape.");
      return;
    }

    startTransition(async () => {
      const result = await createClientDog({
        name,
        breed: String(fd.get("breed") ?? "").trim() || undefined,
        age: fd.get("age") ? Number(fd.get("age")) : undefined,
        behavioralNotes:
          String(fd.get("behavioralNotes") ?? "").trim() || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      finishOnboarding();
    });
  }

  if (step === 1) {
    return (
      <Card className="min-w-0 w-full max-w-lg shadow-sm">
        <CardHeader>
          <CardTitle>Où habitez-vous ?</CardTitle>
          <CardDescription className="break-words">
            Étape 1 sur 2 — adresse et téléphone pour vous proposer les
            éducateurs à proximité.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddressSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="client-address">Adresse</Label>
              <Input
                id="client-address"
                name="address"
                required
                autoComplete="street-address"
                disabled={pending}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="client-city">Ville</Label>
                <Input
                  id="client-city"
                  name="city"
                  required
                  autoComplete="address-level2"
                  disabled={pending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client-zip">Code postal</Label>
                <Input
                  id="client-zip"
                  name="zipCode"
                  required
                  inputMode="numeric"
                  pattern="\d{5}"
                  maxLength={5}
                  disabled={pending}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-phone">Téléphone</Label>
              <Input
                id="client-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="06 12 34 56 78"
                maxLength={30}
                disabled={pending}
              />
              <p className="text-xs text-muted-foreground">
                Optionnel — utile pour que l&apos;éducateur vous joigne si besoin.
              </p>
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {pending ? (
              <p className="text-center text-sm text-muted-foreground">
                Enregistrement et localisation… (quelques secondes)
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                "Continuer"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0 w-full max-w-lg shadow-sm">
      <CardHeader>
        <CardTitle className="flex min-w-0 flex-wrap items-center gap-2">
          <PawPrint className="size-5 text-primary" aria-hidden />
          Votre premier chien ?
        </CardTitle>
        <CardDescription>
          Étape 2 sur 2 — vous pourrez en ajouter d&apos;autres plus tard dans{" "}
          <strong>Mes chiens</strong>. Vous pouvez aussi ignorer cette étape.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onDogSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dog-name">Nom du chien</Label>
            <Input id="dog-name" name="name" maxLength={80} disabled={pending} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dog-breed">Race (optionnel)</Label>
              <Input id="dog-breed" name="breed" maxLength={80} disabled={pending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dog-age">Âge (ans, optionnel)</Label>
              <Input
                id="dog-age"
                name="age"
                type="number"
                min={0}
                max={30}
                disabled={pending}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dog-behavior">Particularités comportementales</Label>
            <textarea
              id="dog-behavior"
              name="behavioralNotes"
              rows={3}
              disabled={pending}
              className="flex min-h-10 w-full min-w-0 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Réactivité, peurs, rappel…"
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex min-w-0 flex-col gap-2">
            <Button
              type="submit"
              className="h-auto min-h-10 w-full whitespace-normal py-2.5 leading-snug"
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <>
                  <span className="sm:hidden">Enregistrer</span>
                  <span className="hidden sm:inline">
                    Enregistrer et accéder à mon espace
                  </span>
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-10 w-full whitespace-normal py-2.5"
              disabled={pending}
              onClick={finishOnboarding}
            >
              Ignorer cette étape
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
