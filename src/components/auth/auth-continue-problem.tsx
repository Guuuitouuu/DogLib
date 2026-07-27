import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthContinueProblemProps = {
  title: string;
  description: string;
  hint?: string;
};

export function AuthContinueProblem({
  title,
  description,
  hint,
}: AuthContinueProblemProps) {
  return (
    <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-6 px-5 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="size-7" aria-hidden />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
          Accueil
        </Link>
        <Link
          href="/sign-in"
          className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
        >
          Reconnexion
        </Link>
      </div>
    </main>
  );
}
