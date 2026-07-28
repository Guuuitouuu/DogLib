"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  updateEducatorPublicProfile,
  type EducatorProfileSettings,
} from "@/actions/educator-profile";
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

type EducatorSettingsPanelProps = {
  profile: EducatorProfileSettings;
};

export function EducatorSettingsPanel({ profile }: EducatorSettingsPanelProps) {
  const router = useRouter();
  const [address, setAddress] = useState(profile.address);
  const [city, setCity] = useState(profile.city);
  const [zipCode, setZipCode] = useState(profile.zipCode);
  const [siret, setSiret] = useState(profile.siret ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const result = await updateEducatorPublicProfile({
      address: address.trim(),
      city: city.trim(),
      zipCode: zipCode.trim(),
      bio: profile.bio?.trim() || undefined,
      siret: siret.trim() || undefined,
    });

    setSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Coordonnées professionnelles</CardTitle>
          <CardDescription>
            Adresse utilisée sur la carte publique et pour la recherche par
            proximité. Personnalisez le visuel dans{" "}
            <Link
              href="/dashboard/fiche-publique"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Ma fiche publique
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="settings-address">Adresse d&apos;exercice</Label>
              <Input
                id="settings-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                autoComplete="street-address"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="settings-city">Ville</Label>
                <Input
                  id="settings-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  autoComplete="address-level2"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-zip">Code postal</Label>
                <Input
                  id="settings-zip"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  required
                  inputMode="numeric"
                  pattern="\d{5}"
                  maxLength={5}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-siret">SIRET (optionnel)</Label>
              <Input
                id="settings-siret"
                value={siret}
                onChange={(e) => setSiret(e.target.value)}
                inputMode="numeric"
                maxLength={14}
                placeholder="14 chiffres"
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {saved ? (
              <p className="text-sm text-primary">Profil mis à jour.</p>
            ) : null}
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Enregistrer"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
