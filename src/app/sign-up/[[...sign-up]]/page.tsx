import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ClerkAuthFallback } from "@/components/auth/clerk-auth-fallback";
import { isClerkConfigured } from "@/lib/clerk-config";
import { authContinueUrl } from "@/lib/safe-redirect";

type SignUpPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  if (!isClerkConfigured()) {
    return <ClerkAuthFallback title="Inscription indisponible" />;
  }

  const { redirect_url: redirectUrl } = await searchParams;
  const { userId } = await auth();

  if (userId) {
    redirect(authContinueUrl(redirectUrl));
  }

  const { SignUpForm } = await import("@/components/auth/sign-up-form");

  return <SignUpForm redirectUrl={redirectUrl} />;
}
