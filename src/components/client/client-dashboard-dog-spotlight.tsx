"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera, Heart, Loader2, PawPrint, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateClientDog } from "@/actions/client-dogs";
import { uploadClientDogPhoto } from "@/actions/image-upload";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageFileUpload } from "@/components/ui/image-file-upload";
import { resolveDogPhotoSrc } from "@/lib/dog-photo";
import { cn } from "@/lib/utils";
import type { ClientDogListItem } from "@/types/client-dashboard";

const PRESET_PHOTOS = [
  "/dogs/dog-1.png",
  "/dogs/dog-2.png",
  "/dogs/dog-3.png",
  "/dogs/dog-4.png",
  "/dogs/dog-5.png",
];

type ClientDashboardDogSpotlightProps = {
  dog: ClientDogListItem | null;
  dogsCount: number;
};

export function ClientDashboardDogSpotlight({
  dog,
  dogsCount,
}: ClientDashboardDogSpotlightProps) {
  const router = useRouter();
  const [photoOpen, setPhotoOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!dog) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent/80 via-card to-primary/5 p-8 text-center shadow-sm">
        <PawPrint className="mx-auto size-10 text-primary/70" aria-hidden />
        <h2 className="mt-4 text-lg font-bold text-foreground">
          Ajoutez votre compagnon
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Une fiche chien pour réserver et suivre vos comptes-rendus.
        </p>
        <Link
          href="/account/chiens"
          className={cn(buttonVariants(), "mt-6 rounded-full px-6")}
        >
          Mes chiens
        </Link>
      </section>
    );
  }

  const photoSrc = resolveDogPhotoSrc(dog.id, dog.photoUrl);
  const isExternal = photoSrc.startsWith("http");

  function openPhotoDialog() {
    setPhotoUrl(dog?.photoUrl ?? "");
    setError(null);
    setPhotoOpen(true);
  }

  function savePhoto(url: string) {
    if (!dog) return;
    setError(null);
    startTransition(async () => {
      const result = await updateClientDog({
        dogId: dog.id,
        name: dog.name,
        breed: dog.breed ?? undefined,
        age: dog.age ?? undefined,
        photoUrl: url.trim() || "",
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setPhotoOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent/90 via-card to-primary/10 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-8">
        <Sparkles
          className="absolute right-6 top-6 size-5 text-primary/40"
          aria-hidden
        />
        <Heart
          className="absolute left-6 top-6 size-4 fill-primary/20 text-primary/50"
          aria-hidden
        />

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="relative shrink-0">
            <div className="rounded-full bg-primary/15 p-1.5 ring-4 ring-primary/10">
              <div className="relative size-32 overflow-hidden rounded-full bg-secondary sm:size-36">
                <Image
                  src={photoSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="144px"
                  unoptimized={isExternal}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={openPhotoDialog}
              className="absolute -bottom-1 -right-1 flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-secondary"
              aria-label="Changer la photo"
            >
              <Camera className="size-4" />
            </button>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Mon toutou
            </p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
              {dog.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {[dog.breed, dog.age != null ? `${dog.age} an${dog.age > 1 ? "s" : ""}` : null]
                .filter(Boolean)
                .join(" · ") || "Fiche à compléter dans Mes chiens"}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {dog.reservationsCount} réservation
                {dog.reservationsCount !== 1 ? "s" : ""}
              </span>
              {dog.reportsCount > 0 ? (
                <span className="rounded-full bg-chart-2/15 px-3 py-1 text-xs font-semibold text-chart-2">
                  {dog.reportsCount} compte-rendu
                  {dog.reportsCount !== 1 ? "s" : ""}
                </span>
              ) : null}
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Link
                href={`/account/chiens/${dog.id}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "rounded-full",
                })}
              >
                Voir la fiche
              </Link>
              {dog.reportsCount > 0 ? (
                <Link
                  href={`/account/chiens/${dog.id}/comptes-rendus`}
                  className={buttonVariants({
                    size: "sm",
                    className: "rounded-full",
                  })}
                >
                  Comptes-rendus
                </Link>
              ) : null}
              {dogsCount > 1 ? (
                <Link
                  href="/account/chiens"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: "rounded-full",
                  })}
                >
                  Tous mes chiens ({dogsCount})
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Photo de {dog.name}</DialogTitle>
            <DialogDescription>
              Importez une photo depuis votre ordinateur, choisissez une
              illustration ou collez une URL.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ImageFileUpload
              label="Choisir une photo sur mon PC"
              description="JPEG, PNG, WebP ou GIF · 5 Mo max."
              hiddenFields={{ dogId: dog.id }}
              upload={uploadClientDogPhoto}
              onUploaded={() => {
                setPhotoOpen(false);
                setError(null);
                router.refresh();
              }}
            />
            <div className="flex flex-wrap justify-center gap-2">
              {PRESET_PHOTOS.map((src) => (
                <button
                  key={src}
                  type="button"
                  disabled={pending}
                  onClick={() => savePhoto(src)}
                  className="relative size-14 overflow-hidden rounded-xl border-2 border-transparent ring-offset-background transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dog-photo-url">URL personnalisée</Label>
              <Input
                id="dog-photo-url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://…"
                maxLength={2048}
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="button"
              className="w-full"
              disabled={pending}
              onClick={() => savePhoto(photoUrl)}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Enregistrer la photo"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
