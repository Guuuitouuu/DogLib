"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

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

type ClientAddressFormProps = {
  title?: string;
  description?: string;
  submitLabel?: string;
  defaultAddress?: string;
  defaultCity?: string;
  defaultZipCode?: string;
  afterSubmitPath?: string;
};

export function ClientAddressForm({
  title = "Votre adresse",
  description = "Nous localisons les éducateurs canins près de chez vous.",
  submitLabel = "Continuer",
  defaultAddress = "",
  defaultCity = "",
  defaultZipCode = "",
  afterSubmitPath = "/account",
}: ClientAddressFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await updateClientAddress({
          address: String(fd.get("address") ?? ""),
          city: String(fd.get("city") ?? ""),
          zipCode: String(fd.get("zipCode") ?? ""),
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        // Rechargement complet : évite cache layout + boucle onboarding ↔ account
        window.location.assign(afterSubmitPath);
      } catch {
        setError("Erreur inattendue. Réessayez dans un instant.");
      }
    });
  }

  return (
    <Card className="min-w-0 w-full max-w-lg shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="client-address">Adresse</Label>
            <Input
              id="client-address"
              name="address"
              required
              defaultValue={defaultAddress}
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
                defaultValue={defaultCity}
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
                defaultValue={defaultZipCode}
                disabled={pending}
              />
            </div>
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
              submitLabel
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
