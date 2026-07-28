"use client";

import Image from "next/image";
import { Dog, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createEducatorPersonalDog } from "@/actions/educator-personal-dogs";
import { uploadEducatorPersonalDogPhoto } from "@/actions/image-upload";
import { EducatorFicheSectionCard } from "@/components/dashboard/educator-fiche-section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageFileUpload } from "@/components/ui/image-file-upload";
import { resolveDogPhotoSrc } from "@/lib/dog-photo";
import type { EducatorPersonalDogListItem } from "@/types/educator-personal-dog";

type Props = {
  initialDogs: EducatorPersonalDogListItem[];
  /** Section intégrée à la fiche publique (sans titre de page). */
  embedded?: boolean;
};

export function EducatorPersonalDogsPanel({
  initialDogs,
  embedded = false,
}: Props) {
  const router = useRouter();
  const [dogs, setDogs] = useState(initialDogs);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onAddDog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const breed = String(fd.get("breed") ?? "").trim();

    startTransition(async () => {
      const result = await createEducatorPersonalDog({
        name,
        breed: breed || undefined,
        age: fd.get("age") ? Number(fd.get("age")) : undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      const newDog: EducatorPersonalDogListItem = {
        id: result.data.id,
        name: result.data.name,
        breed: result.data.breed,
        age: fd.get("age") ? Number(fd.get("age")) : null,
        photoUrl: null,
      };
      setDogs((prev) =>
        [...prev, newDog].sort((a, b) => a.name.localeCompare(b.name, "fr")),
      );
      setShowForm(false);
      setSuccess(`${result.data.name} a été ajouté à votre fiche.`);
      form.reset();
      router.refresh();
    });
  }

  const content = (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Ces chiens apparaissent dans la section « Mes chiens » de votre fiche
        publique.
      </p>

      {success ? (
        <p className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {!showForm ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => setShowForm(true)}
        >
          <Plus className="size-4" aria-hidden />
          Ajouter un chien
        </Button>
      ) : (
        <form
          onSubmit={onAddDog}
          className="space-y-3 rounded-2xl border border-border p-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="personal-dog-name">Nom</Label>
            <Input id="personal-dog-name" name="name" required maxLength={80} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="personal-dog-breed">Race (optionnel)</Label>
              <Input id="personal-dog-breed" name="breed" maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="personal-dog-age">Âge (ans, optionnel)</Label>
              <Input
                id="personal-dog-age"
                name="age"
                type="number"
                min={0}
                max={30}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending} className="rounded-xl">
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Enregistrer"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Annuler
            </Button>
          </div>
        </form>
      )}

      {dogs.length === 0 && !showForm ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Aucun chien personnel. Ajoutez le vôtre pour enrichir votre vitrine.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {dogs.map((dog) => {
            const photoSrc = resolveDogPhotoSrc(dog.id, dog.photoUrl);
            const external = photoSrc.startsWith("http");

            return (
              <li
                key={dog.id}
                className="flex flex-col items-center rounded-2xl border border-border p-4 text-center"
              >
                <div className="size-20 overflow-hidden rounded-full border-2 border-card ring-1 ring-border">
                  <Image
                    src={photoSrc}
                    alt=""
                    width={80}
                    height={80}
                    className="size-full object-cover"
                    unoptimized={external}
                  />
                </div>
                <p className="mt-3 text-sm font-bold text-foreground">
                  {dog.name}
                </p>
                {dog.breed ? (
                  <p className="mt-0.5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Dog className="size-3 text-primary" aria-hidden />
                    {dog.breed}
                  </p>
                ) : null}
                <ImageFileUpload
                  label="Photo"
                  description="5 Mo max."
                  className="mt-3 w-full"
                  hiddenFields={{ dogId: dog.id }}
                  upload={uploadEducatorPersonalDogPhoto}
                  onUploaded={(url) => {
                    setDogs((prev) =>
                      prev.map((d) =>
                        d.id === dog.id ? { ...d, photoUrl: url } : d,
                      ),
                    );
                    router.refresh();
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  if (embedded) {
    return (
      <EducatorFicheSectionCard
        title="Mes chiens"
        description="Vos compagnons affichés sur la fiche publique."
      >
        {content}
      </EducatorFicheSectionCard>
    );
  }

  return content;
}
