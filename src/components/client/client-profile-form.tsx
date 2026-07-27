"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateClientProfile } from "@/actions/client-profile";
import { ClientProfileAvatar } from "@/components/client/client-profile-avatar";
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
import type { ClientProfile } from "@/types/client-dashboard";

type ClientProfileFormProps = {
  profile: ClientProfile;
};

export function ClientProfileForm({ profile }: ClientProfileFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateClientProfile({
        firstName: String(fd.get("firstName") ?? ""),
        lastName: String(fd.get("lastName") ?? ""),
        phone: String(fd.get("phone") ?? "") || undefined,
        address: String(fd.get("address") ?? ""),
        city: String(fd.get("city") ?? ""),
        zipCode: String(fd.get("zipCode") ?? ""),
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <div className="min-w-0 space-y-6">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Identité</CardTitle>
          <CardDescription className="break-words">
            Photo, nom et coordonnées associés à votre compte DogLib.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientProfileAvatar
            imageUrl={profile.imageUrl}
            firstName={profile.firstName}
            lastName={profile.lastName}
          />
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription className="break-words">
            Adresse utilisée pour les éducateurs à proximité et vos réservations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="profile-firstName">Prénom</Label>
                <Input
                  id="profile-firstName"
                  name="firstName"
                  required
                  maxLength={80}
                  defaultValue={profile.firstName}
                  autoComplete="given-name"
                  disabled={pending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-lastName">Nom</Label>
                <Input
                  id="profile-lastName"
                  name="lastName"
                  maxLength={80}
                  defaultValue={profile.lastName}
                  autoComplete="family-name"
                  disabled={pending}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-email">E-mail</Label>
              <Input
                id="profile-email"
                name="email"
                type="email"
                value={profile.email}
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Modifiable depuis les paramètres de connexion Clerk (icône
                compte en haut à droite).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-phone">Téléphone</Label>
              <Input
                id="profile-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                defaultValue={profile.phone ?? ""}
                placeholder="06 12 34 56 78"
                disabled={pending}
              />
            </div>

            <div className="border-t border-border pt-4">
              <p className="mb-3 text-sm font-medium text-foreground">
                Adresse postale
              </p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-address">Adresse</Label>
                  <Input
                    id="profile-address"
                    name="address"
                    required
                    defaultValue={profile.address}
                    autoComplete="street-address"
                    disabled={pending}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-city">Ville</Label>
                    <Input
                      id="profile-city"
                      name="city"
                      required
                      defaultValue={profile.city}
                      autoComplete="address-level2"
                      disabled={pending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-zip">Code postal</Label>
                    <Input
                      id="profile-zip"
                      name="zipCode"
                      required
                      inputMode="numeric"
                      pattern="\d{5}"
                      maxLength={5}
                      defaultValue={profile.zipCode}
                      disabled={pending}
                    />
                  </div>
                </div>
              </div>
            </div>

            {error ? (
              <p className="break-words text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="text-sm text-primary" role="status">
                Profil enregistré.
              </p>
            ) : null}
            {pending ? (
              <p className="text-center text-sm text-muted-foreground">
                Enregistrement et géolocalisation…
              </p>
            ) : null}

            <Button
              type="submit"
              className="h-auto min-h-10 w-full whitespace-normal sm:w-auto"
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
