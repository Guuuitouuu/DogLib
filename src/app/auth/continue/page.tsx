import { redirect } from "next/navigation";

import { AuthContinueProblem } from "@/components/auth/auth-continue-problem";
import { resolveAuthContinueOutcome } from "@/lib/auth-continue";

export const dynamic = "force-dynamic";

type AuthContinuePageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function AuthContinuePage({
  searchParams,
}: AuthContinuePageProps) {
  const { redirect_url: redirectUrl } = await searchParams;
  const outcome = await resolveAuthContinueOutcome(redirectUrl);

  if (outcome.type === "problem") {
    return (
      <AuthContinueProblem
        title={outcome.title}
        description={outcome.description}
        hint={outcome.hint}
      />
    );
  }

  redirect(outcome.href);
}
