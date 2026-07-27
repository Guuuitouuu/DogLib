"use client";

import { ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  updateEducatorPublicProfile,
  type EducatorProfileSettings,
} from "@/actions/educator-profile";
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

type EducatorSettingsPanelProps = {
  profile: EducatorProfileSettings;
};

export function EducatorSettingsPanel({ profile }: EducatorSettingsPanelProps) {
  const router = useRouter();
  const [address, setAddress] = useState(profile.address);
  const [city, setCity] = useState(profile.city);
  const [zipCode, setZipCode] = useState(profile.zipCode);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [siret, setSiret] = useState(profile.siret ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const publicUrl = `/educator/${profile.educatorProfileId}`;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const result = await updateEducatorPublicProfile({
      address: address.trim(),
      city: city.trim(),
      zipCode: zipCode.trim(),
      bio: bio.trim() || undefined,
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
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Page publique</CardTitle>
          <CardDescription>
            C’est ce que voient les propriétaires avant de réserver une séance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            Voir ma page publique
            <ExternalLink className="size-4" aria-hidden />
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profil affiché en ligne</CardTitle>
          <CardDescription>
            Bio, adresse et ville apparaissent sur votre fiche éducateur et
            servent au calcul des séances.
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
              <Label htmlFor="settings-bio">Bio (optionnel)</Label>
              <textarea
                id="settings-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                maxLength={5000}
                className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Votre approche, vos spécialités…"
              />
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
