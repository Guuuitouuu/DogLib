import Link from "next/link";
import { GraduationCap, PawPrint } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-5 py-4 md:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-tight"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PawPrint className="size-4" aria-hidden />
          </span>
          DogLib
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Connexion
          </Link>
          <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
            Inscription
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-10 px-5 py-16 md:px-8">
        <div className="space-y-4 text-center md:text-left">
          <p className="text-sm font-medium text-primary">
            Éducation canine, simplifiée
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Trouvez un éducateur ou gérez votre activité au même endroit.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Inscrivez-vous en quelques minutes : propriétaires et éducateurs
            disposent chacun d’un parcours dédié, avec réservation en ligne et
            tableau de bord pour les professionnels.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
            Créer un compte
          </Link>
          <Link
            href="/recherche"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Trouver un éducateur
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <GraduationCap className="size-8 text-primary" aria-hidden />
            <h2 className="mt-4 font-semibold">Éducateurs</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Agenda, clients, séances et revenus — après inscription, complétez
              votre profil professionnel pour accéder au dashboard.
            </p>
            <Link
              href="/sign-up"
              className={cn(buttonVariants({ variant: "link" }), "mt-3 px-0")}
            >
              S&apos;inscrire comme éducateur →
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <PawPrint className="size-8 text-accent-foreground" aria-hidden />
            <h2 className="mt-4 font-semibold">Propriétaires</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Parcourez les éducateurs près de chez vous et réservez une séance
              en ligne.
            </p>
            <div className="mt-3 flex flex-col items-start gap-1">
              <Link
                href="/recherche"
                className={cn(buttonVariants({ variant: "link" }), "px-0")}
              >
                Trouver un éducateur →
              </Link>
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ variant: "link" }), "px-0")}
              >
                S&apos;inscrire comme propriétaire →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
