"use client";

import { Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { personInitials } from "@/lib/person-name";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type ClientProfileAvatarProps = {
  imageUrl: string | null;
  firstName: string;
  lastName: string;
};

export function ClientProfileAvatar({
  imageUrl,
  firstName,
  lastName,
}: ClientProfileAvatarProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setError("Choisissez une image (JPEG, PNG, WebP…).");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image trop lourde (maximum 5 Mo).");
      return;
    }

    setError(null);
    setPending(true);
    try {
      await user.setProfileImage({ file });
      router.refresh();
    } catch {
      setError("Impossible de mettre à jour la photo. Réessayez.");
    } finally {
      setPending(false);
    }
  }

  async function removePhoto() {
    if (!user) return;
    setError(null);
    setPending(true);
    try {
      await user.setProfileImage({ file: null });
      router.refresh();
    } catch {
      setError("Impossible de supprimer la photo.");
    } finally {
      setPending(false);
    }
  }

  const displayUrl = user?.imageUrl ?? imageUrl;
  const initials = personInitials(firstName, lastName);

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
      <Avatar className="size-20" data-size="lg">
        {displayUrl ? (
          <AvatarImage src={displayUrl} alt="" />
        ) : null}
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 space-y-2">
        <p className="text-sm font-medium text-foreground">Photo de profil</p>
        <p className="break-words text-xs text-muted-foreground">
          Visible par les éducateurs lorsque vous réservez une réservation.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={!isLoaded || pending}
            onChange={onPickFile}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-auto min-h-9 whitespace-normal"
            disabled={!isLoaded || pending}
            onClick={() => inputRef.current?.click()}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Camera className="size-4" aria-hidden />
            )}
            Changer la photo
          </Button>
          {displayUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto min-h-9"
              disabled={pending}
              onClick={removePhoto}
            >
              Supprimer
            </Button>
          ) : null}
        </div>
        {error ? (
          <p className="break-words text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
