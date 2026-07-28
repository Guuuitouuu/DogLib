"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  updateEducatorPublicProfile,
  type EducatorProfileSettings,
} from "@/actions/educator-profile";
import { EducatorFicheSectionCard } from "@/components/dashboard/educator-fiche-section-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type EducatorPublicFicheBioPanelProps = {
  profile: EducatorProfileSettings;
};

export function EducatorPublicFicheBioPanel({
  profile,
}: EducatorPublicFicheBioPanelProps) {
  const router = useRouter();
  const [bio, setBio] = useState(profile.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const result = await updateEducatorPublicProfile({
      address: profile.address,
      city: profile.city,
      zipCode: profile.zipCode,
      bio: bio.trim() || undefined,
      siret: profile.siret ?? undefined,
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
    <EducatorFicheSectionCard
      title="À propos"
      description="Bloc de présentation affiché sous la vitrine sur votre fiche publique."
    >
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fiche-bio">Bio</Label>
            <textarea
              id="fiche-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              maxLength={5000}
              className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="Votre approche, vos spécialités, votre expérience…"
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {saved ? (
            <p className="text-sm text-primary">Bio enregistrée.</p>
          ) : null}
          <Button type="submit" disabled={saving} className="rounded-xl">
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Enregistrer à propos"
            )}
          </Button>
      </form>
    </EducatorFicheSectionCard>
  );
}
