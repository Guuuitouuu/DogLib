"use client";

import { useEffect } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-16 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Une erreur est survenue
        </h1>
        <p className="max-w-md text-muted-foreground">
          Réessayez, ou revenez à l’accueil. Si le problème continue, contactez
          le support.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Réessayer
        </button>
        <Link
          href="/"
          className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
        >
          Accueil
        </Link>
      </div>
    </main>
  );
}
