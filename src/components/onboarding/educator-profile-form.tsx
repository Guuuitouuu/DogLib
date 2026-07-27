"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { completeEducatorProfile } from "@/actions/onboarding";
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

export function EducatorProfileForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await completeEducatorProfile({
        address: String(form.get("address") ?? ""),
        city: String(form.get("city") ?? ""),
        zipCode: String(form.get("zipCode") ?? ""),
        bio: String(form.get("bio") ?? "") || undefined,
        siret: String(form.get("siret") ?? "") || undefined,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.replace("/dashboard");
    });
  }

  return (
    <Card className="w-full max-w-lg shadow-sm">
      <CardHeader>
        <CardTitle>Votre profil éducateur</CardTitle>
        <CardDescription>
          Ces informations apparaîtront sur votre page publique et serviront
          pour vos séances. Vous pourrez les modifier plus tard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="address">Adresse d&apos;exercice</Label>
            <Input
              id="address"
              name="address"
              required
              autoComplete="street-address"
              placeholder="12 rue Example"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                name="city"
                required
                autoComplete="address-level2"
                placeholder="Lyon"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zipCode">Code postal</Label>
              <Input
                id="zipCode"
                name="zipCode"
                required
                inputMode="numeric"
                pattern="\d{5}"
                maxLength={5}
                autoComplete="postal-code"
                placeholder="69001"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="siret">SIRET (optionnel)</Label>
            <Input
              id="siret"
              name="siret"
              inputMode="numeric"
              maxLength={14}
              placeholder="14 chiffres"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Présentation (optionnel)</Label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              maxLength={5000}
              placeholder="Votre approche, vos spécialités…"
              className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Création du profil…
              </>
            ) : (
              "Accéder au tableau de bord"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
