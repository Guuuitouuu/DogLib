import Link from "next/link";
import { PawPrint } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ClerkAuthFallbackProps = {
  title: string;
};

export function ClerkAuthFallback({ title }: ClerkAuthFallbackProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <PawPrint className="size-6" aria-hidden />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          L’authentification Clerk n’est pas configurée sur cet environnement.
          Ajoutez <code className="text-foreground">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
          et <code className="text-foreground">CLERK_SECRET_KEY</code> (Vercel →
          Environment Variables, ou <code className="text-foreground">.env.local</code>).
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
        Retour à l’accueil
      </Link>
    </main>
  );
}
