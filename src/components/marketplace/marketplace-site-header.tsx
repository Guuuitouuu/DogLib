import Link from "next/link";
import { PawPrint } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

type MarketplaceSiteHeaderProps = {
  userId: string | null;
  spaceHref?: string;
  spaceLabel?: string;
};

export function MarketplaceSiteHeader({
  userId,
  spaceHref = "/onboarding",
  spaceLabel = "Mon espace",
}: MarketplaceSiteHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-5 py-4 md:px-10">
      <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <PawPrint className="size-4" aria-hidden />
        </span>
        DogLib
      </Link>
      <nav className="flex items-center gap-2">
        <Link
          href="/recherche"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Éducateurs
        </Link>
        {userId ? (
          <Link
            href={spaceHref}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {spaceLabel}
          </Link>
        ) : (
          <Link href="/sign-in" className={buttonVariants({ size: "sm" })}>
            Connexion
          </Link>
        )}
      </nav>
    </header>
  );
}
