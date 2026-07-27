"use client";

import { GraduationCap, PawPrint } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setUserRole } from "@/actions/onboarding";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function OnboardingRolePicker() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function choose(role: "EDUCATOR" | "CLIENT") {
    setError(null);
    startTransition(async () => {
      const result = await setUserRole(role);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.replace(result.data.nextPath);
    });
  }

  return (
    <Card className="w-full max-w-lg shadow-sm">
      <CardHeader>
        <CardTitle>Bienvenue sur DogLib</CardTitle>
        <CardDescription>
          Choisissez votre profil pour personnaliser votre expérience. Vous
          pourrez compléter vos informations juste après.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => choose("EDUCATOR")}
          className={cn(
            "flex items-start gap-4 rounded-xl border border-border p-4 text-left transition-colors hover:bg-muted/50",
            pending && "pointer-events-none opacity-60",
          )}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="size-5" aria-hidden />
          </span>
          <span>
            <span className="block font-semibold text-foreground">
              Je suis éducateur canin
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Gérez vos séances, disponibilités et clients depuis le tableau de
              bord.
            </span>
          </span>
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => choose("CLIENT")}
          className={cn(
            "flex items-start gap-4 rounded-xl border border-border p-4 text-left transition-colors hover:bg-muted/50",
            pending && "pointer-events-none opacity-60",
          )}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <PawPrint className="size-5" aria-hidden />
          </span>
          <span>
            <span className="block font-semibold text-foreground">
              Je cherche un éducateur
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Réservez des séances pour votre chien auprès d&apos;éducateurs
              près de chez vous.
            </span>
          </span>
        </button>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {pending ? (
          <p className="text-center text-sm text-muted-foreground">
            Enregistrement…
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
