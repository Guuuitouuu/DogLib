import type { Metadata } from "next";
import Link from "next/link";
import { PawPrint } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Page introuvable",
};

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <PawPrint className="size-6" aria-hidden />
      </span>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Page introuvable
        </h1>
        <p className="max-w-md text-muted-foreground">
          Cette page n’existe pas ou a été déplacée.
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
        Retour à l’accueil
      </Link>
    </main>
  );
}
