"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  updateEducatorProfileAppearance,
  type EducatorProfileSettings,
} from "@/actions/educator-profile";
import { uploadEducatorProfileImage } from "@/actions/image-upload";
import { EducatorFicheSectionCard } from "@/components/dashboard/educator-fiche-section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageFileUpload } from "@/components/ui/image-file-upload";
import { EDUCATOR_BANNER_PRESETS } from "@/lib/media-url";

type Props = {
  profile: EducatorProfileSettings;
};

export function EducatorProfileAppearancePanel({ profile }: Props) {
  const router = useRouter();
  const [bannerUrl, setBannerUrl] = useState(profile.bannerUrl ?? "");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    profile.profilePhotoUrl ?? "",
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>(() => {
    const base = [...profile.galleryUrls];
    while (base.length < 3) base.push("");
    return base.slice(0, 6);
  });
  const [showLocationMap, setShowLocationMap] = useState(
    profile.showLocationMap,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function setGallerySlot(index: number, value: string) {
    setGalleryUrls((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function addGallerySlot() {
    setGalleryUrls((prev) =>
      prev.length >= 6 ? prev : [...prev, ""],
    );
  }

  function appendGalleryUrl(url: string) {
    setGalleryUrls((prev) => {
      const filled = prev.filter((u) => u.trim().length > 0);
      if (filled.length >= 6) return prev;
      const next = [...filled, url];
      while (next.length < 3) next.push("");
      return next.slice(0, 6);
    });
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const result = await updateEducatorProfileAppearance({
      bannerUrl,
      profilePhotoUrl,
      galleryUrls: galleryUrls.filter((u) => u.trim().length > 0),
      showLocationMap,
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
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
      <EducatorFicheSectionCard
        title="Vitrine"
        description="Bannière et photo de profil en haut de votre fiche publique."
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Bannière de couverture</Label>
            <div className="flex flex-wrap gap-2">
              {EDUCATOR_BANNER_PRESETS.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => setBannerUrl(preset.url)}
                  className="relative h-16 w-24 overflow-hidden rounded-lg border border-border ring-offset-background transition hover:ring-2 hover:ring-primary/30"
                >
                  <Image
                    src={preset.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-background/80 py-0.5 text-[10px] font-medium">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
            <Input
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="URL bannière (https://… ou /…)"
              maxLength={2048}
            />
            <ImageFileUpload
              label="Importer depuis mon PC"
              description="JPEG, PNG, WebP ou GIF · 5 Mo max."
              hiddenFields={{ slot: "banner" }}
              upload={uploadEducatorProfileImage}
              onUploaded={(url) => {
                setBannerUrl(url);
                router.refresh();
              }}
            />
          </div>

          <div className="space-y-3 border-t border-border pt-6">
            <Label htmlFor="profile-photo-url">Photo de profil</Label>
            <Input
              id="profile-photo-url"
              value={profilePhotoUrl}
              onChange={(e) => setProfilePhotoUrl(e.target.value)}
              placeholder="URL photo (laissez vide pour l’avatar Clerk)"
              maxLength={2048}
            />
            <ImageFileUpload
              label="Importer depuis mon PC"
              description="Affichée sous la bannière, au-dessus de votre nom."
              hiddenFields={{ slot: "profile" }}
              upload={uploadEducatorProfileImage}
              onUploaded={(url) => {
                setProfilePhotoUrl(url);
                router.refresh();
              }}
            />
          </div>
        </div>
      </EducatorFicheSectionCard>

      <EducatorFicheSectionCard
        title="En images"
        description="Carrousel « En images » sur votre fiche (6 photos max.)."
      >
        <div className="space-y-3">
          <ImageFileUpload
            label="Ajouter une photo depuis mon PC"
            description="Ajoutée à la galerie (6 images max.)."
            hiddenFields={{ slot: "gallery" }}
            upload={uploadEducatorProfileImage}
            onUploaded={appendGalleryUrl}
            disabled={galleryUrls.filter((u) => u.trim()).length >= 6}
          />
          {galleryUrls.map((url, index) => (
            <Input
              key={index}
              value={url}
              onChange={(e) => setGallerySlot(index, e.target.value)}
              placeholder={`Image ${index + 1} — URL`}
              maxLength={2048}
            />
          ))}
          {galleryUrls.length < 6 ? (
            <Button type="button" variant="outline" size="sm" onClick={addGallerySlot}>
              Ajouter une image
            </Button>
          ) : null}
        </div>
      </EducatorFicheSectionCard>

      <EducatorFicheSectionCard
        title="Zone d'intervention"
        description="Carte affichée en bas de la fiche publique."
      >
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3">
          <input
            type="checkbox"
            checked={showLocationMap}
            onChange={(e) => setShowLocationMap(e.target.checked)}
            className="size-4 rounded border-input"
          />
          <span className="text-sm">
            Afficher la carte avec ma position sur ma page publique
          </span>
        </label>
        <p className="mt-3 text-xs text-muted-foreground">
          L&apos;adresse utilisée pour la carte se modifie dans{" "}
          <Link
            href="/dashboard/parametres"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Paramètres
          </Link>
          .
        </p>
      </EducatorFicheSectionCard>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm text-primary">Modifications enregistrées.</p>
      ) : null}

      <Button type="submit" disabled={saving} className="rounded-xl">
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Enregistrer la vitrine et les médias"
        )}
      </Button>
    </form>
  );
}
