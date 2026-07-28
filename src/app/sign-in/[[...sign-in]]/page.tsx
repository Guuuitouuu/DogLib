import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ClerkAuthFallback } from "@/components/auth/clerk-auth-fallback";
import { isClerkConfigured } from "@/lib/clerk-config";
import { authContinueUrl } from "@/lib/safe-redirect";

type SignInPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  if (!isClerkConfigured()) {
    return <ClerkAuthFallback title="Connexion indisponible" />;
  }

  const { redirect_url: redirectUrl } = await searchParams;
  const { userId } = await auth();

  if (userId) {
    redirect(authContinueUrl(redirectUrl));
  }

  const { SignInForm } = await import("@/components/auth/sign-in-form");

  return <SignInForm redirectUrl={redirectUrl} />;
}
