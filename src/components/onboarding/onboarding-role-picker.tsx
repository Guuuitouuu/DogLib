"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setUserRole } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      router.push(role === "EDUCATOR" ? "/dashboard" : "/");
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Bienvenue sur DogLib</CardTitle>
        <CardDescription>
          Choisissez comment vous utiliserez la plateforme. Vous pourrez ajuster
          votre profil ensuite.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button
          type="button"
          size="lg"
          disabled={pending}
          onClick={() => choose("EDUCATOR")}
        >
          Je suis éducateur canin
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          disabled={pending}
          onClick={() => choose("CLIENT")}
        >
          Je cherche un éducateur
        </Button>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
